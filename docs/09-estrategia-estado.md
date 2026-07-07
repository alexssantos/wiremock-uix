# 09 — State Strategy (TanStack Query + Context)

> Part of the Complete Technical Specification for **WireMock Studio Open Source**
> Full index in [`README.md`](./README.md)

---

## 1. General Principle

Two categories of state, handled in **deliberately different** ways:

| State type | Tool | Examples |
|---|---|---|
| **Server state** (comes from the `/__admin` API, can become stale, requires cache/revalidation) | **TanStack Query** | Stub mappings, requests, near misses, scenarios, settings, files |
| **UI/client state** (does not exist on the server, local to the user's session) | **React Context** / local `useState` | Theme, collapsed sidebar, persisted filters, favorites, active wizard tab |

We do not use Redux/Zustand as a generic global state layer — TanStack Query already solves server caching, and UI state is simple enough for Context.

## 2. QueryClient Configuration

```ts
// app/providers/query-provider.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30s — admin data does not change every millisecond
      gcTime: 5 * 60_000,         // 5 min in cache before garbage collection
      retry: 1,                   // local WireMock usually does not have network instability
      refetchOnWindowFocus: true, // relevant: another developer may have changed stubs
    },
    mutations: {
      retry: 0,
    },
  },
})
```

## 3. Query Key Convention

Query keys are centralized in `shared/api/query-keys.ts` as a **hierarchical factory**, enabling granular or cascading invalidation:

```ts
// shared/api/query-keys.ts
export const queryKeys = {
  stubMappings: {
    all: ['stub-mappings'] as const,
    lists: () => [...queryKeys.stubMappings.all, 'list'] as const,
    list: (filters: StubMappingFilters) => [...queryKeys.stubMappings.lists(), filters] as const,
    details: () => [...queryKeys.stubMappings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.stubMappings.details(), id] as const,
  },
  requests: {
    all: ['requests'] as const,
    journal: (criteria: RequestCriteria) => [...queryKeys.requests.all, 'journal', criteria] as const,
    unmatched: () => [...queryKeys.requests.all, 'unmatched'] as const,
    count: (criteria: RequestCriteria) => [...queryKeys.requests.all, 'count', criteria] as const,
  },
  nearMisses: {
    all: ['near-misses'] as const,
    forRequest: (requestId: string) => [...queryKeys.nearMisses.all, 'request', requestId] as const,
  },
  scenarios: {
    all: ['scenarios'] as const,
  },
  recording: {
    status: ['recording', 'status'] as const,
  },
  settings: {
    global: ['settings', 'global'] as const,
  },
  files: {
    all: ['files'] as const,
    detail: (fileId: string) => [...queryKeys.files.all, fileId] as const,
  },
  server: {
    health: ['server', 'health'] as const,
    version: ['server', 'version'] as const,
  },
} as const;
```

**Rule**: always invalidate at the smallest necessary granularity. Example: when editing a specific stub mapping, invalidate `detail(id)` **and** `lists()` (the listing also changes), but not the entire `queryKeys.stubMappings.all` if that is unnecessary.

## 4. Query Hook Pattern (`entities`)

```ts
// entities/stub-mapping/model/queries.ts
export function useStubMappings(filters: StubMappingFilters) {
  return useQuery({
    queryKey: queryKeys.stubMappings.list(filters),
    queryFn: () => fetchStubMappings(filters),
    placeholderData: keepPreviousData, // avoids a loading "flash" when paginating
  });
}

export function useStubMapping(id: string) {
  return useQuery({
    queryKey: queryKeys.stubMappings.detail(id),
    queryFn: () => fetchStubMappingById(id),
    enabled: !!id,
  });
}
```

## 5. Mutation Hook Pattern with Optimistic Update

Example — delete a stub mapping with an optimistic list update:

```ts
// entities/stub-mapping/model/mutations.ts
export function useDeleteStubMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStubMapping(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.stubMappings.lists() });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.stubMappings.lists() });

      queryClient.setQueriesData(
        { queryKey: queryKeys.stubMappings.lists() },
        (old?: StubMappingListResponse) =>
          old && { ...old, mappings: old.mappings.filter((m) => m.id !== id) }
      );

      return { previous }; // context for rollback
    },

    onError: (_err, _id, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Could not delete the stub mapping. Change reverted.');
    },

    onSuccess: () => {
      toast.success('Stub mapping deleted.');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.lists() });
    },
  });
}
```

> Apply the same pattern to: create (optimistically add to the list), edit (update the `detail` cache and the entry in the `list`), and reorder priority.

## 6. Polling ("live" data)

| Data | Suggested interval | Hook |
|---|---|---|
| Server status (health) | 15s | `useServerHealth()` with `refetchInterval: 15_000` |
| Recording status | 3s (only when the Recording page is active) | `useRecordingStatus()` |
| Dashboard (counters) | 10s (pause when the tab is not visible — `refetchIntervalInBackground: false`) | `useDashboardMetrics()` |
| Request Journal (when "live tail" is enabled by the user) | 5s, opt-in via a UI toggle | `useRequestJournal({ live: true })` |

Use TanStack Query's `refetchInterval`; always disable it (`enabled: false` or `refetchInterval: false`) when the corresponding component is not mounted, to avoid unnecessary traffic against WireMock.

## 7. UI State via Context

### 7.1 ThemeContext

```ts
// app/providers/theme-provider.tsx
type Theme = 'light' | 'dark' | 'system';
// Provider exposes { theme, setTheme } — persists to localStorage('wiremock-ui-theme')
// Applies the .dark class to <html> based on matchMedia when theme === 'system'
```

### 7.2 SidebarContext

Controls sidebar collapse/expand state (persisted in LocalStorage), while the active navigation item state is derived from the route via `useLocation()` and not duplicated in state.

### 7.3 Persisted Filter State

Listing filters (Stub Mappings, Requests, Logs) are synchronized with the **URL (query params)** via React Router's `useSearchParams` — not Context. This guarantees:
- Shareable links with filters applied
- The browser "back" button behaves intuitively
- No need for additional Context

### 7.4 Favorites and Local History

Persisted in LocalStorage via `shared/lib/local-storage.ts` (a typed wrapper with `zod` to validate what is read). They do not go through TanStack Query because they do not come from the server. Exposed through a simple hook: `useFavoriteStubMappings()`.

## 8. Global Error Handling

- Mutation errors: `toast.error()` (Sonner) with a user-friendly message (see microcopy in `10-guia-ux-ui.md`).
- Critical query errors (for example, failure to load the main list): `<ErrorState>` component (shared/ui) with a "Try again" button (`refetch()`).
- Total connectivity failure with WireMock (health check fails): fixed global top banner via `ServerStatusIndicator` (widgets/app-header), degrading the application to a "cache read-only" mode when applicable.

## 9. Summary of Decisions (ADR-style)

| Decision | Alternative considered | Reason for the choice |
|---|---|---|
| TanStack Query instead of Redux Toolkit Query | RTK Query | Less boilerplate; we do not need a Redux store for the rest of the app |
| Filters in the URL instead of Context/Store | Zustand filter store | Shareable URLs, less duplicated state |
| No WebSocket in v1 | SSE/WebSocket for live tail | WireMock does not expose native push; polling is sufficient and simpler |
| LocalStorage for favorites/theme | IndexedDB | Small data volume, simpler API |
