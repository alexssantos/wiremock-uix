# 12 — Roadmap v1 → v2 → v3

> Part of the Complete Technical Specification for **WireMock Studio Open Source**
> Full index in [`README.md`](./README.md)
> Expands the "Future Roadmap" section from the original spec (`../WireMock_Dashboard_UI_Specification.md`).

---

## v1.0 — Functional Parity with the Core WireMock Admin Surface (this specification document)

Scope covered by Sprints 0–7 (`07-plano-sprints.md`):

- Modern frontend foundation already delivered in Sprint 0 (React 19, TypeScript 6, Vite 8, Tailwind CSS v4, shadcn/ui new-york)
- Full Stub Mapping CRUD with a guided wizard (Request/Response/Metadata/Preview)
- Request Journal with replay and stub generation from real traffic
- Near Misses with visual diff
- Scenarios (graph visualization + reset)
- Assisted Recording with pre-persistence review
- Settings, Files, Logs
- Dashboard with metrics and charts
- Theme, shortcuts, accessibility, responsiveness

**v1 exit criterion**: 100% of the endpoints in `05-mapeamento-endpoints.md` covered by at least one functional screen, with acceptance criteria (`11-criterios-aceite.md`) validated.

---

## v2.0 — Advanced Productivity and Collaboration

Features that increase productivity for larger teams while preserving the **client-only** architecture:

| Feature | Description | Complexity |
|---|---|---|
| **Visual Matcher Editor** | Drag-and-drop builder for `bodyPatterns` / compound matchers (`and` / `or` / `not`), without requiring manual JSON authoring | High |
| **Collections/Workspaces** | Group stub mappings through `metadata` / tags into named collections, with fast context switching (for example: "Payments Collection", "Auth Collection") | Medium |
| **Advanced Tags** | Colored, filterable tag system in addition to the simple v1 `metadata` field | Low |
| **Local Versioning** | Version history for each stub mapping (diff between versions) stored in IndexedDB, with rollback | Medium |
| **Git Sync (automated export/import)** | Synchronize stub collections with a Git repository (via the GitHub API, client-side) so stubs can be versioned as code | High |
| **Test Runner** | Execute a set of test requests against stubs (simple status/body assertions) directly from the dashboard | High |
| **Environment Comparison** | Compare the stub sets of two different WireMock instances (for example: staging vs. local) | Medium |
| **Support for Multiple WireMock Instances** | Quickly switch among different configured WireMock server `baseUrl` values | Low |
| **Optional FSD architecture lint** | Evaluate `steiger` later if an ESLint-compatible workflow becomes worth adopting specifically for architecture enforcement | Low |

---

## v3.0 — Intelligence and Advanced Observability

| Feature | Description | Complexity |
|---|---|---|
| **AI-assisted Stub Generation** | Generate suggested stub mappings automatically from a natural-language description or an imported OpenAPI/Swagger schema (via LLM, client-side or optional service) | High |
| **Live Monitoring** | Real-time dashboard (WebSocket, if a WireMock extension is adopted, or aggressive polling) with error-rate/latency alerts | High |
| **Analytics** | Historical usage reports (which stubs are hit more/less often, unmatched trends over time) — requires dedicated persistent storage of its own, outside the client-only scope of v1/v2 | High |
| **RBAC / Multi-user** | Access profiles (read/write/admin) — requires a dedicated backend or external IdP integration, breaking the "client-only" principle | High |
| **Plugin marketplace** | Support for third-party extensions for custom transformers/matchers through the UI | High |

---

## Roadmap Prioritization Principles

1. **v1 scope parity is non-negotiable** with WireMock’s native administrative features — without it, the product does not replace the native console.
2. **v2 must not introduce a dedicated backend** — all features (except Git Sync, which uses the GitHub API directly from the client) remain client-only, using LocalStorage/IndexedDB.
3. **v3 may justify breaking the client-only principle** (for example, RBAC and historical Analytics) — it should be treated as a separate architectural initiative (a possible "optional server mode"), documented and community-approved before work begins.
4. Features should be prioritized based on **real usage feedback from v1** (issues/discussions in the open source repository), not only on this specification.

## Suggested Sequencing (high level)

```
v1.0 ─────────────────────────────► Initial release (OSS)
  │
  ├─ v1.1 (patch)   → bug fixes, community-reported UX adjustments
  │
v2.0 ─────────────────────────────► Matcher Editor, Collections, Local Versioning
  │
  ├─ v2.1 (minor)   → Git Sync, Test Runner
  │
v3.0 ─────────────────────────────► AI-assisted Stub Generation, Live Monitoring
  │
  └─ v3.x           → Analytics, RBAC (requires architectural decision on optional backend)
```
