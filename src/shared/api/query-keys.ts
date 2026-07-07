/**
 * Central factory of TanStack Query keys, organized hierarchically so that
 * invalidation can target the exact granularity needed (see docs/09-state-strategy.md).
 *
 * Filter/criteria objects are intentionally typed as `unknown` here (rather than
 * importing entity types) to respect the Feature-Sliced Design dependency rule:
 * `shared` must not depend on `entities`. Entities import `queryKeys` and pass
 * their own typed filter objects when building query keys.
 */
export const queryKeys = {
  stubMappings: {
    all: ["stub-mappings"] as const,
    lists: () => [...queryKeys.stubMappings.all, "list"] as const,
    list: (filters: unknown) => [...queryKeys.stubMappings.lists(), filters] as const,
    details: () => [...queryKeys.stubMappings.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.stubMappings.details(), id] as const,
    unmatched: () => [...queryKeys.stubMappings.all, "unmatched"] as const,
  },
  requests: {
    all: ["requests"] as const,
    journal: (criteria: unknown) => [...queryKeys.requests.all, "journal", criteria] as const,
    detail: (id: string) => [...queryKeys.requests.all, "detail", id] as const,
    unmatched: () => [...queryKeys.requests.all, "unmatched"] as const,
    count: (criteria: unknown) => [...queryKeys.requests.all, "count", criteria] as const,
  },
  nearMisses: {
    all: ["near-misses"] as const,
    forUnmatched: () => [...queryKeys.nearMisses.all, "unmatched"] as const,
    forRequest: (requestId: string) => [...queryKeys.nearMisses.all, "request", requestId] as const,
  },
  scenarios: {
    all: ["scenarios"] as const,
  },
  recording: {
    all: ["recording"] as const,
    status: () => [...queryKeys.recording.all, "status"] as const,
  },
  settings: {
    all: ["settings"] as const,
    global: () => [...queryKeys.settings.all, "global"] as const,
  },
  files: {
    all: ["files"] as const,
    list: () => [...queryKeys.files.all, "list"] as const,
    detail: (fileId: string) => [...queryKeys.files.all, "detail", fileId] as const,
  },
  server: {
    all: ["server"] as const,
    health: () => [...queryKeys.server.all, "health"] as const,
    version: () => [...queryKeys.server.all, "version"] as const,
  },
} as const;
