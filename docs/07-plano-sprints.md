# 07 — Detailed Sprint Plan

> Part of the Complete Technical Specification for **WireMock Studio Open Source**
> Full index in [`README.md`](./README.md)
> An executive/summary view is also available in [`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md). This document details sprint tasks at backlog level.
>
> **Implementation status:** the Sprint 0 foundation has already been implemented. It remains in this plan for traceability and planning continuity.

---

## Conventions

- Sprints are **2 weeks** long, except Sprint 0 (1 week).
- Estimates use **story points** (Fibonacci scale: 1, 2, 3, 5, 8, 13) — reference only; adjust to the team’s real velocity.
- **DoR (Definition of Ready):** the story has clear acceptance criteria (see `11-criterios-aceite.md`) and depends only on endpoints already mapped in `05-mapeamento-endpoints.md`.
- **DoD (Definition of Done):** code reviewed (approved PR), tested (unit tests when applicable), no regressions in `oxlint`, formatting, or typecheck, and working against a real WireMock 3.9.1 instance.

---

## Sprint 0 — Foundation (1 week, ~13 pts)

| # | Task | Pts |
|---|---|---|
| 0.1 | Project scaffold (Vite 8 + React 19 + TypeScript 6 + Tailwind CSS v4 + shadcn/ui init) | 2 |
| 0.2 | Configure oxlint + Prettier + CI (GitHub Actions: lint, typecheck, test); keep `steiger` FSD lint as optional future work because it targets ESLint-based workflows | 3 |
| 0.3 | `shared/api/wiremock-client.ts` — fetch wrapper with standardized error handling and base types (`ApiError`, `PaginatedResponse<T>`) | 3 |
| 0.4 | Root layout: `AppHeader` + `AppSidebar` + `Outlet`, initial routing (placeholders) | 3 |
| 0.5 | `ThemeProvider` (Light/Dark/System) persisted in LocalStorage | 2 |

**Deliverable**: the app runs locally, navigates between empty pages, theme switching works, CI is green. **Status:** completed.

---

## Sprint 1 — Stub Mappings: Listing and Basic CRUD (~29 pts)

| # | Task | Pts |
|---|---|---|
| 1.1 | `entities/stub-mapping`: TypeScript types (see `06-modelos-typescript.md`) | 3 |
| 1.2 | `entities/stub-mapping/api`: `fetchStubMappings`, `fetchStubMappingById`, `createStubMapping`, `updateStubMapping`, `deleteStubMapping` | 5 |
| 1.3 | `entities/stub-mapping/model/queries.ts` and `mutations.ts` (TanStack Query hooks) | 5 |
| 1.4 | Generic `shared/ui/data-table.tsx` (TanStack Table: sorting, pagination) | 5 |
| 1.5 | `StubMappingTable` (widget): columns, debounced search, filter by method | 5 |
| 1.6 | `CreateStubMappingButton` + minimal form (no full wizard yet: method, URL, status, body) | 3 |
| 1.7 | `DeleteStubMappingDialog` with optimistic update | 2 |
| 1.8 | Tests: query/mutation hooks using MSW to mock `/__admin/mappings` | 3 |

**Deliverable**: list, create (simple), edit (simple), and delete stubs against a real WireMock instance.

---

## Sprint 2 — Stub Mappings: Full Wizard (~34 pts)

| # | Task | Pts |
|---|---|---|
| 2.1 | `model/schema.ts` — full Zod schemas (request pattern + matchers, response definition) | 8 |
| 2.2 | `RequestTab`: method, URL match mode, dynamic header/query/cookie matchers (RHF array fields) | 8 |
| 2.3 | `ResponseTab`: status, headers, body mode (text/JSON/base64/file), delay, fault, proxy | 8 |
| 2.4 | `MetadataTab`: name, tags, scenario fields, persistent toggle, metadata JSON | 3 |
| 2.5 | `PreviewTab`: read-only `JsonEditor` (Monaco) + Zod validation shown as an error list | 5 |
| 2.6 | `DuplicateStubMappingAction` | 2 |
| 2.7 | `ImportMappingsDialog` (upload + preview + `POST /mappings/import`) | 3 |
| 2.8 | `ExportStubMappingsAction` (JSON download) | 2 |
| 2.9 | `FavoriteToggle` + `useFavoriteStubMappings` (LocalStorage) | 2 |

**Deliverable**: parity for stub creation with the native WireMock editor, including advanced matchers.

---

## Sprint 3 — Requests / Request Journal (~26 pts)

| # | Task | Pts |
|---|---|---|
| 3.1 | `entities/serve-event`: types + API (`findRequestsByCriteria`, `getAllRequestsInJournal`, `countRequestsByCriteria`) | 5 |
| 3.2 | `RequestTable` (widget): columns (time, method, url, matched, status, duration), combined filters via URL params | 8 |
| 3.3 | `RequestDetailDrawer`: tabs Request/Response/Raw JSON | 5 |
| 3.4 | `ReplayRequestButton` (resend stored request to the same host, where supported) | 3 |
| 3.5 | `GenerateStubFromRequestButton` (pre-fills the creation wizard from request data) | 3 |
| 3.6 | `ExportRequestButton` + `DeleteRequestButton` | 2 |

**Deliverable**: a complete traffic investigation module, including stub generation from real traffic.

---

## Sprint 4 — Near Misses + Dashboard (~24 pts)

| # | Task | Pts |
|---|---|---|
| 4.1 | `entities/near-miss`: types + API (`findNearMissesForRequest`, `findNearMissesForRequestPattern`, `unmatched/near-misses`) | 5 |
| 4.2 | `NearMissList` + similarity score calculation/display | 3 |
| 4.3 | Generic `DiffViewer` (shared/ui) + `NearMissDiffPanel` | 5 |
| 4.4 | `GenerateStubFromNearMissButton` | 2 |
| 4.5 | `entities/server`: client-side aggregated metrics for the Dashboard (mapping, request, unmatched, and near-miss counts) | 3 |
| 4.6 | Dashboard cards (`shared/ui/card` + icons) | 2 |
| 4.7 | 4 Recharts charts: requests/minute, HTTP methods, status codes, top URLs (derived from the Request Journal) | 4 |

**Deliverable**: matcher diagnostics (near misses) and an executive Dashboard view.

---

## Sprint 5 — Scenarios + Recording (~31 pts)

| # | Task | Pts |
|---|---|---|
| 5.1 | `entities/scenario`: types + API (`getAllScenarios`, `resetAllScenarios`) | 3 |
| 5.2 | `ScenarioGraph` (React Flow): nodes = states, edges = transitions inferred from stubs (`requiredScenarioState`/`newScenarioState`) | 8 |
| 5.3 | `ResetScenarioButton` + `RelatedStubMappingsList` | 3 |
| 5.4 | `entities/recording`: types + API (`startRecording`, `stopRecording`, `getRecordingStatus`, `takeRecordingSnapshot`) | 5 |
| 5.5 | `StartRecordingDialog` (`targetBaseUrl`, `captureHeaders`, `extractBodyCriteria`, `persist`) | 5 |
| 5.6 | `RecordingControls` + `RecordingStatusCard` (3s polling while the page is active) | 3 |
| 5.7 | `RecordedStubsPreviewList` — review/edit before persisting | 4 |

**Deliverable**: visualization of state machines and assisted stub recording.

---

## Sprint 6 — Settings + Files + Logs (~26 pts)

| # | Task | Pts |
|---|---|---|
| 6.1 | `entities/settings`: types + API (`updateGlobalSettings`) | 3 |
| 6.2 | `SettingsForm` (RHF + Zod): global delay, proxy, journal max size | 5 |
| 6.3 | `entities/file`: types + API (`getAllFileNames`, `getFileById`, `updateFileById`, `deleteFileById`) | 5 |
| 6.4 | `FileTree` + `FileEditorPanel` (Monaco with language detection by extension) + `ImagePreview` | 8 |
| 6.5 | `UploadFileDialog` | 2 |
| 6.6 | `LogsPage`: timeline + combined filters (reusing Request Journal data) | 3 |

**Deliverable**: 100% coverage of the original specification steps.

---

## Sprint 7 — Polish, UX, Performance, and Testing (~29 pts)

| # | Task | Pts |
|---|---|---|
| 7.1 | `GlobalSearch` (cmdk, Cmd/Ctrl+K) indexing stubs/requests/scenarios | 5 |
| 7.2 | Skeleton loading in every listing and drawer | 3 |
| 7.3 | Standardized toasts (success/error) + revised microcopy (`10-guia-ux-ui.md`) | 2 |
| 7.4 | Global keyboard shortcuts (Cmd/Ctrl+N, Esc, etc.) | 3 |
| 7.5 | Accessibility audit (contrast, keyboard navigation, aria-labels) | 5 |
| 7.6 | Responsive behavior (collapsible sidebar, tables with horizontal scroll on mobile) | 5 |
| 7.7 | MSW integration tests covering the main flows (`03-fluxos-navegacao.md`) | 5 |
| 7.8 | `ServerStatusIndicator` with degraded state when WireMock is offline | 2 |

**Deliverable**: v1.0 ready for internal production use / initial open source release.

---

## Total Effort Summary (reference)

| Sprint | Estimated points |
|---|---|
| 0 | 13 |
| 1 | 29 |
| 2 | 34 |
| 3 | 26 |
| 4 | 24 |
| 5 | 31 |
| 6 | 26 |
| 7 | 29 |
| **Total** | **~212 pts** |

At a reference velocity of ~25–30 pts/sprint (team of 2–3 developers), the full project (v1.0) should take approximately **8 sprints (≈ 15 weeks / ~3.5 months)**, including the foundation Sprint 0.
