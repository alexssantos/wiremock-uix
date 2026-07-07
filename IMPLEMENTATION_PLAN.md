# Implementation Plan — WireMock Dashboard

> Based on `WireMock_Dashboard_UI_Specification.md` | Target: **WireMock Server 3.9.1**
> This document is the **practical, actionable** plan for getting the project built. The full expanded technical specification (FSD architecture, design system, wireframes, 100% API mapping, TypeScript models, acceptance criteria, roadmap) lives in [`docs/`](./docs).
>
> **Implementation Status:** Sprints 0–6 are implemented (Stub Mappings, Requests, Near Misses, Dashboard, Scenarios, Recording, Settings, Files, and Logs are all functional against a live WireMock admin API). Sprint 7 (polish, automated tests, a11y/perf audit) remains open. A Docker image is published — see [Section 9](#9-docker).

---

## 1. Project Overview

| Item | Definition |
|---|---|
| Name | WireMock Dashboard (working title: *WireMock Studio OSS*) |
| Type | Client-side SPA (Single Page Application), with no dedicated backend |
| Consumes | The WireMock administrative API (`/__admin/*`) directly from the browser |
| Authentication | None built into WireMock itself (optionally Basic Auth or a reverse proxy) |
| Distribution | Static Vite build that can be served by any HTTP server, Docker image, or an embedded plugin inside WireMock itself |

**Out of scope for v1**: multi-tenancy, first-party authentication, an intermediary backend, and persistence outside WireMock itself (LocalStorage is used only for UI preferences and light client-side cache/state).

---

## 2. Technical Stack and Rationale

| Layer | Choice | Rationale |
|---|---|---|
| Build | Vite 8 | Fast dev server, HMR, and optimized production builds |
| Language | TypeScript 6 (`strict`, `verbatimModuleSyntax`, `erasableSyntaxOnly`) | Strong typing for WireMock API payloads, explicit module semantics, and predictable emitted JavaScript |
| Domain modeling | String literal unions / `as const` (no `enum`) | Matches the current TypeScript guidance and keeps API contracts simple and serializable |
| UI Kit | shadcn/ui (new-york) + Tailwind CSS v4 | Copyable components, no vendor lock-in, CSS-first theming, and easy integration with FSD aliases such as `@/shared/ui` and `@/shared/lib` |
| Server state | TanStack Query v5 | Cache, invalidation, polling (server status, dashboard), and optimistic updates |
| Local/UI state | React 19 Context + `useState`/`useReducer` | Theme, sidebar, persisted filters, and small UI state without Redux overhead |
| Routing | React Router (feature-based nested routes) | Clear route composition and room for incremental route-level data loading |
| Forms | React Hook Form + Zod | Schema validation for Stub Mappings before sending data to WireMock |
| Code editor | Monaco Editor | JSON/body/file editing with syntax highlighting and validation |
| Graph visualization | React Flow | Scenario state-transition diagrams |
| Charts | Recharts | Dashboard cards and charts |
| Icons | Lucide Icons | Standard fit for shadcn/ui |
| Testing | Vitest + Testing Library + MSW | Installed test stack for UI behavior and `/__admin` API mocking |
| Lint/Format | oxlint + Prettier | Fast linting and consistent formatting for the current toolchain |
| Optional future architecture lint | `steiger` (future evaluation only) | Worth evaluating later for FSD architectural rules, but it targets ESLint-based workflows rather than the current oxlint setup |
| Package manager | npm | Standardized package management and command flow for this repository |

---

## 3. Initial Project Setup

```powershell
# 1. Scaffold Vite + React + TypeScript
npm create vite@latest wiremock-uix -- --template react-ts
cd wiremock-uix

# 2. Runtime dependencies
npm install @tanstack/react-query @tanstack/react-table react-router-dom
npm install react-hook-form zod @hookform/resolvers
npm install @monaco-editor/react reactflow recharts lucide-react
npm install sonner cmdk date-fns clsx tailwind-merge class-variance-authority

# 3. Styling and quality tooling
npm install -D tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom msw
npm install -D oxlint prettier prettier-plugin-tailwindcss

# 4. shadcn/ui initialization (new-york style)
npx shadcn@latest init

# 5. Base shadcn/ui components (repeat as needed)
npx shadcn@latest add button input select dialog sheet tabs table badge card toast tooltip dropdown-menu popover accordion switch checkbox radio-group separator skeleton alert alert-dialog scroll-area breadcrumb command
```

Environment variable used to point at the target WireMock server:

```
# .env.local
VITE_WIREMOCK_BASE_URL=http://localhost:8080
```

Additional setup notes for the current stack:

- Tailwind CSS v4 should be wired through the `@tailwindcss/vite` plugin.
- Theme tokens should live in CSS using the CSS-first approach with `@theme inline`.
- The current setup does **not** require `tailwind.config.js`.
- Configure shadcn/ui aliases to FSD-friendly paths such as `@/shared/ui` and `@/shared/lib`.
- Keep TypeScript in strict mode, enable `verbatimModuleSyntax` and `erasableSyntaxOnly`, and avoid `enum` declarations in favor of unions or `as const` objects.

---

## 4. Folder Structure (summary — full detail in `docs/01-arquitetura-frontend.md`)

```
src/
├── app/            # bootstrap, providers, router, global theme
├── pages/          # route composition (Dashboard, Mappings, Requests, ...)
├── widgets/        # reusable composed blocks across pages (Header, Sidebar, DataTable)
├── features/       # user actions (create-stub, delete-stub, start-recording, ...)
├── entities/       # domain models + query hooks (stub-mapping, serve-event, scenario, ...)
└── shared/         # API client, UI kit (shadcn), utilities, config, global types
```

Dependency rule (Feature-Sliced Design): `app → pages → widgets → features → entities → shared` (a layer may only import from layers below it).

---

## 5. Phases and Sprints (2 weeks each)

### Phase 0 — Foundation (Sprint 0, 1 week — completed)
- Project setup (Section 3), baseline CI (`oxlint` + typecheck + test on PRs)
- HTTP client (`shared/api/wiremock-client.ts`) with a `fetch` wrapper, standardized error handling, and base types
- Root layout: Header + Sidebar + persisted Light/Dark/System theme in LocalStorage
- Initial routing with placeholders for all primary pages
- **Deliverable**: the app is navigable, the theme works, and the project foundation is in place

### Sprint 1 — Stub Mappings: Listing and Basic CRUD (completed)
- `entities/stub-mapping`: types + hooks `useStubMappings`, `useStubMapping`, `useCreateStubMapping`, `useUpdateStubMapping`, `useDeleteStubMapping`
- TanStack Table listing: search, pagination, filters by method/status/URL
- Actions: create (simple form), edit, delete with confirmation (`AlertDialog`)
- **Deliverable**: fully working CRUD against a real WireMock instance

### Sprint 2 — Stub Mappings: Full Wizard (completed)
- Multi-tab wizard (Request / Response / Metadata / Preview) with React Hook Form + Zod
- Advanced matcher editor (URL pattern, headers, query params, body patterns)
- Preview with Monaco Editor (JSON generated in real time) + validation before saving
- Duplicate/Clone, Import (JSON upload), Export
- **Deliverable**: functional parity with native WireMock stub creation flows

### Sprint 3 — Requests (Request Journal) (completed)
- Listing with filters (method, status, matched/unmatched, free text), pagination/infinite scroll
- Detail drawer (headers, cookies, query, body, response, raw JSON)
- Actions: Replay, Generate Stub from request, Export, Delete
- **Deliverable**: a complete traffic investigation module

### Sprint 4 — Near Misses + Dashboard (completed)
- Near Misses: list with similarity score, diff viewer (expected vs. received), generate stub
- Dashboard: metric cards (client-side aggregation from existing endpoints) + 4 charts (Recharts)
- **Deliverable**: executive visibility into the mock server state

### Sprint 5 — Scenarios + Recording (completed)
- Scenarios: graph visualization (React Flow) for states and transitions, scenario reset
- Recording: start/pause/stop/snapshot, proxy configuration, review captured stubs before persistence
- **Deliverable**: advanced stub-generation workflows

### Sprint 6 — Settings + Files + Logs (completed)
- Settings: global settings form (delay, proxy, journal, extensions)
- Files: `__files` explorer with tree view + Monaco Editor + image preview
- Logs: timeline with combined filters
- **Deliverable**: 100% coverage of the original specification scope

### Sprint 7 — Polish, UX, Performance, and Testing (not started)
- Skeleton loading, optimistic updates, toasts, undo, keyboard shortcuts, global search (Cmd/Ctrl+K)
- Unit tests (hooks, critical components) + integration tests using MSW to mock `/__admin`
- Accessibility (a11y) and responsive design audit
- **Deliverable**: v1.0 ready for internal production use

---

## 6. Milestones

| Milestone | Sprints | Completion criterion |
|---|---|---|
| M1 — Stub Mappings MVP | 0–2 | Create, list, edit, and delete stubs through the UI, validated against a real WireMock instance |
| M2 — Observability | 3–4 | Requests, Near Misses, and Dashboard fully working |
| M3 — Advanced Capabilities | 5–6 | Scenarios, Recording, Settings, Files, and Logs complete |
| M4 — v1.0 Release | 7 | Tests, a11y, performance, and UX polished; usage documentation published |

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| CORS when accessing `/__admin` from a different origin | High | Document `--enable-browser-proxying` / reverse proxy guidance (including Vite dev proxy) or run the dashboard served by WireMock itself |
| Behavioral differences across WireMock versions (3.9.1 vs. newer releases) | Medium | Base endpoint coverage on the official OpenAPI mapping (`docs/05-mapeamento-endpoints.md`) and version compatibility explicitly |
| Complexity of the matcher editor (Scenarios/Recording) | Medium | Prioritize common use cases in the MVP and move advanced flows into the v2 roadmap |
| Large payloads in Request Journal | Medium | Require pagination and use `requests/count` before loading the full dataset |

---

## 8. Immediate Next Steps

1. Review the delivered Sprint 0 foundation and confirm the baseline toolchain/configuration.
2. Validate `shared/api/wiremock-client.ts` against `VITE_WIREMOCK_BASE_URL`.
3. Start Sprint 1 implementation for the Stub Mappings module.
4. Review the full technical specification in `docs/` (see the index in `docs/README.md`) before expanding Sprint 1 delivery, so architecture, design system, and data model details remain aligned across the team.

---

## 9. Docker

A production Docker image is built with a multi-stage `Dockerfile`:

1. **Build stage** (`node:22-alpine`): `npm ci` + `npm run build` (`tsc -b && vite build`) produces static assets in `dist/`.
2. **Runtime stage** (`nginx:1.27-alpine`): serves `dist/` with SPA-aware routing (`docker/nginx.conf`, `try_files ... /index.html`) on port `8081`.

Because this dashboard is a browser-side SPA, the WireMock base URL cannot be baked in at build time if the image should be reusable across environments. Instead, `docker/docker-entrypoint.sh` regenerates `public/config.js` from the `WIREMOCK_BASE_URL` environment variable at **container startup** (via nginx's `/docker-entrypoint.d/` hook mechanism), and `src/shared/config/env.ts` reads `window.__WIREMOCK_UI_CONFIG__.wiremockBaseUrl` first, falling back to the build-time `VITE_WIREMOCK_BASE_URL` and then `http://localhost:8080`.

```powershell
# Pull and run the published image
docker pull alexssantos/wiremock-uix:latest
docker run -d -p 8081:8081 -e WIREMOCK_BASE_URL=http://localhost:8080 alexssantos/wiremock-uix:latest

# Or with docker-compose (also starts a WireMock container)
docker compose up
```

Published image: **`alexssantos/wiremock-uix`** — tags `latest` and `1.0.0` on Docker Hub.

> Note: `WIREMOCK_BASE_URL` must be reachable from the **end user's browser**, not just from inside the Docker network — when running both containers via Compose, point it at the host-published WireMock address (e.g. `http://localhost:8080`), not the internal service name.

---

📄 See the full detailed technical specification in [`docs/`](./docs).
