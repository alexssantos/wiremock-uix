# 01 — Frontend Architecture (Feature-Sliced Design)

> Part of the Complete Technical Specification for **WireMock Studio Open Source**
> Full index in [`README.md`](./README.md)

---

## 1. Why Feature-Sliced Design (FSD)

The project has multiple well-defined business domains that are decoupled from one another (Stub Mappings, Requests, Near Misses, Scenarios, Recording, Settings, Files, Logs). FSD organizes code by **business domain and responsibility**, not by technical type (avoiding massive `components/`, `hooks/`, `services/` folders that mix everything together). This promotes:

- Scalability as features are added (v2/v3 roadmap)
- Isolation: changes in "Scenarios" do not affect "Stub Mappings"
- Faster onboarding for new open source contributors
- Testability by layer

## 2. Layers (top to bottom)

```
app        → global bootstrap, providers, routing, theme
pages      → route composition — "assembles" widgets/features for a URL
widgets    → composed UI blocks reusable across pages
features   → a specific user action (create stub, start recording...)
entities   → domain model + data access (query/mutation hooks)
shared     → infrastructure, UI kit, utils, config — knows no domain
```

### Dependency rule (import rule)

> A layer may only import from layers **below** it in the hierarchy. Never the other way around.

```
app → pages → widgets → features → entities → shared
```

Within the same layer, a slice (for example, `features/create-stub-mapping`) **must not import** directly from a sibling slice (`features/delete-stub-mapping`). If something needs to be shared, it belongs in `shared` or should be elevated to `entities`.

## 3. Complete Folder Structure

```
src/
├── app/
│   ├── providers/
│   │   ├── query-provider.tsx        # QueryClientProvider + default config
│   │   ├── theme-provider.tsx        # Light/Dark/System + LocalStorage
│   │   └── router-provider.tsx       # createBrowserRouter
│   ├── routes/
│   │   └── router.tsx                # per-page route definitions
│   ├── styles/
│   │   └── globals.css               # Tailwind v4 entrypoint + shadcn/ui tokens
│   └── App.tsx
│
├── pages/
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── stub-mappings/
│   │   ├── StubMappingsListPage.tsx
│   │   └── StubMappingEditorPage.tsx
│   ├── requests/
│   │   └── RequestsPage.tsx
│   ├── near-misses/
│   │   └── NearMissesPage.tsx
│   ├── scenarios/
│   │   └── ScenariosPage.tsx
│   ├── recording/
│   │   └── RecordingPage.tsx
│   ├── settings/
│   │   └── SettingsPage.tsx
│   ├── files/
│   │   └── FilesPage.tsx
│   └── logs/
│       └── LogsPage.tsx
│
├── widgets/
│   ├── app-header/
│   │   ├── ui/AppHeader.tsx
│   │   ├── ui/GlobalSearch.tsx       # Cmd/Ctrl+K (cmdk)
│   │   └── ui/ServerStatusIndicator.tsx
│   ├── app-sidebar/
│   │   └── ui/AppSidebar.tsx
│   ├── stub-mapping-table/
│   │   └── ui/StubMappingTable.tsx   # TanStack Table + filters + pagination
│   ├── request-table/
│   │   └── ui/RequestTable.tsx
│   ├── request-detail-drawer/
│   │   └── ui/RequestDetailDrawer.tsx
│   ├── near-miss-diff/
│   │   └── ui/NearMissDiffPanel.tsx
│   ├── scenario-graph/
│   │   └── ui/ScenarioGraph.tsx      # React Flow
│   └── dashboard-charts/
│       └── ui/{RequestsPerMinuteChart,HttpMethodsChart,StatusCodesChart,TopUrlsChart}.tsx
│
├── features/
│   ├── create-stub-mapping/
│   │   ├── ui/StubMappingWizard.tsx
│   │   ├── ui/tabs/{RequestTab,ResponseTab,MetadataTab,PreviewTab}.tsx
│   │   ├── model/use-stub-mapping-form.ts   # RHF + Zod
│   │   └── model/schema.ts
│   ├── edit-stub-mapping/
│   ├── delete-stub-mapping/
│   │   └── ui/DeleteStubMappingDialog.tsx
│   ├── duplicate-stub-mapping/
│   ├── import-stub-mappings/
│   │   └── ui/ImportMappingsDialog.tsx
│   ├── export-stub-mappings/
│   ├── favorite-stub-mapping/         # persisted in LocalStorage
│   ├── generate-stub-from-request/
│   ├── replay-request/
│   ├── generate-stub-from-near-miss/
│   ├── reset-scenario/
│   ├── control-recording/
│   │   └── ui/{StartRecordingDialog,RecordingControls}.tsx
│   ├── take-snapshot/
│   ├── update-global-settings/
│   ├── upload-file/
│   ├── edit-file/
│   └── toggle-theme/
│
├── entities/
│   ├── stub-mapping/
│   │   ├── model/types.ts             # StubMapping, RequestPattern, ResponseDefinition
│   │   ├── model/queries.ts           # useStubMappings, useStubMapping (queryKeys)
│   │   ├── model/mutations.ts         # useCreateStubMapping, useUpdateStubMapping...
│   │   └── api/stub-mapping-api.ts    # raw fetch calls to /__admin/mappings
│   ├── serve-event/                   # Request Journal (received requests)
│   │   ├── model/types.ts
│   │   ├── model/queries.ts
│   │   └── api/serve-event-api.ts
│   ├── near-miss/
│   ├── scenario/
│   ├── recording/
│   ├── settings/
│   ├── file/
│   └── server/                        # health, version, status
│       └── model/queries.ts           # useServerHealth (polling)
│
└── shared/
    ├── api/
    │   ├── wiremock-client.ts         # fetch wrapper, base URL, error handling
    │   └── query-keys.ts              # central query key factory
    ├── ui/                            # shadcn/ui components "as-is" + customized pieces
    │   ├── button.tsx, input.tsx, dialog.tsx, ... (generated by the shadcn CLI)
    │   ├── http-method-badge.tsx
    │   ├── status-code-badge.tsx
    │   ├── json-editor.tsx            # wrapper Monaco
    │   ├── diff-viewer.tsx
    │   ├── metadata-editor.tsx
    │   ├── empty-state.tsx
    │   └── page-header.tsx
    ├── lib/
    │   ├── utils.ts                   # cn(), formatBytes, formatDuration...
    │   └── local-storage.ts           # typed persistence helpers
    ├── config/
    │   └── env.ts                     # VITE_WIREMOCK_BASE_URL
    └── types/
        └── common.ts                  # Generic pagination, etc.
```

## 4. Conventions by Slice

Each `features`/`entities` slice follows the segment pattern:

```
<slice>/
├── ui/       # React components
├── model/    # hooks, stores, schemas, domain types
├── api/      # raw HTTP calls (entities only)
└── index.ts  # slice Public API (barrel export) — only external import entrypoint
```

> **Encapsulation rule**: other slices may only import through `index.ts` (the Public API). Never import directly from `features/create-stub-mapping/model/schema.ts` from outside the slice — import from `features/create-stub-mapping`.

## 5. Typical Data Flow (example: creating a Stub Mapping)

```
StubMappingEditorPage (pages)
  └─ uses StubMappingWizard (features/create-stub-mapping/ui)
       ├─ uses useStubMappingForm (model) — RHF + Zod, local form state
       ├─ on submit, calls useCreateStubMapping (entities/stub-mapping/model/mutations.ts)
       │     └─ calls createStubMapping() (entities/stub-mapping/api) → POST /__admin/mappings
       │     └─ onSuccess: invalidates query key ["stub-mappings", "list"]
       └─ shows success/error Toast (shared/ui via sonner)
```

## 6. Routing

React Router v7 with the data router (`createBrowserRouter`), with nested routes under the root layout:

```
/                          → redirect → /dashboard
/dashboard                 → DashboardPage
/mappings                  → StubMappingsListPage
/mappings/new              → StubMappingEditorPage (create mode)
/mappings/:id              → StubMappingEditorPage (edit mode)
/requests                  → RequestsPage
/requests/:id              → RequestsPage (with the drawer open via query param ?detail=:id)
/near-misses                → NearMissesPage
/scenarios                 → ScenariosPage
/recording                 → RecordingPage
/settings                  → SettingsPage
/files                     → FilesPage
/files/*                   → FilesPage (file tree path)
/logs                      → LogsPage
```

## 7. Path Aliases (tsconfig / vite)

```jsonc
// tsconfig.json (paths)
{
  "@/app/*": ["src/app/*"],
  "@/pages/*": ["src/pages/*"],
  "@/widgets/*": ["src/widgets/*"],
  "@/features/*": ["src/features/*"],
  "@/entities/*": ["src/entities/*"],
  "@/shared/*": ["src/shared/*"]
}
```

The [`steiger`](https://github.com/feature-sliced/steiger) FSD linter is an **optional future evaluation**, since it targets ESLint-based workflows while this project currently uses **oxlint + Prettier**.

## 8. Code Style Guidelines

- Components: PascalCase, one main component per file.
- Hooks: `use` prefix, return named objects (not tuples, except in trivial cases).
- No direct fetch logic in `pages`/`widgets` components — always go through `entities`/`features` hooks.
- Use Zod schemas as the single source of validation, with types inferred via `z.infer<typeof schema>` (avoids type duplication).
