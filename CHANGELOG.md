# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `examples/sample-stub-mappings.json` — 30 example stub mappings across 3 sample REST APIs (Users, Products, Orders), usable both as a manual import file and as the source of the automatic startup seed for Docker Compose and Kubernetes
- `docker/wiremock-seed/mappings/` — the same 30 stubs split into WireMock's native one-file-per-mapping format, bind-mounted into the `wiremock` service in `docker-compose.yml` so a fresh WireMock container is always pre-seeded
- Kubernetes: `wiremock-seed-mappings` ConfigMap + `seed-example-mappings` initContainer on the `wiremock` StatefulSet, seeding a fresh PersistentVolumeClaim with the same 30 stubs without ever overwriting existing/edited mappings
- `scripts/generate-wiremock-seed.mjs` (`npm run seed:generate`) — regenerates both per-file copies from `examples/sample-stub-mappings.json`

### Planned
- Sprint 7 — polish, UX refinements, automated test coverage (Vitest + Testing Library + MSW), accessibility/performance audit (see `docs/07-plano-sprints.md`)
- CI pipeline (lint + typecheck + test + Docker build) on pull requests
- Code-splitting for the production bundle (Monaco/React Flow/Recharts currently ship in a single >1.4 MB chunk)
- Richer scenario transition graph inferred from stub mappings' `requiredScenarioState`/`newScenarioState` (see `docs/12-roadmap.md`, v2)

## [1.0.0] - 2026-07-07

### Added
- Initial public implementation of the WireMock Dashboard SPA, covering Sprints 0–6 of `IMPLEMENTATION_PLAN.md`:
  - **Stub Mappings**: list (search, pagination, filters), multi-tab create/edit wizard (Request/Response/Metadata/Preview) with React Hook Form + Zod, duplicate, delete, import/export, favorites
  - **Requests** (journal): filterable table, detail drawer, replay, generate-stub-from-request, clear journal
  - **Near Misses**: list with similarity scoring, side-by-side diff viewer, generate-stub-from-near-miss
  - **Dashboard**: aggregate metric cards and four Recharts widgets (requests/minute, HTTP methods, status codes, top URLs)
  - **Scenarios**: state visualization via React Flow, reset-all-scenarios
  - **Recording**: start/stop/snapshot proxy recording, review and persist captured stubs
  - **Settings**: global WireMock settings form (fixed delay, delay distribution, proxy pass-through, bad request behavior)
  - **Files**: `__files` tree browser, Monaco-based editor, image preview, upload/delete
  - **Logs**: timeline view over the request journal with combined client-side filters
- Application shell: header (global search with Cmd/Ctrl+K, live server status indicator, theme toggle), sidebar navigation, Light/Dark/System theme persisted to LocalStorage
- Shared layer: typed WireMock admin API client (`shared/api/wiremock-client.ts`), central query-key factory, custom UI primitives (`HttpMethodBadge`, `StatusCodeBadge`, `JsonEditor`, `EmptyState`, `PageHeader`)
- Full English technical specification in `docs/` (architecture, design system, endpoint mapping, TypeScript models, sprint plan, acceptance criteria, roadmap)
- Multi-stage `Dockerfile` (Node 22 build → nginx 1.27 runtime) with **runtime-configurable** `WIREMOCK_BASE_URL` (injected into `public/config.js` at container startup, no rebuild required)
- `docker-compose.yml` for a local dashboard + WireMock stack
- Published Docker image: [`alexssantos/wiremock-uix`](https://hub.docker.com/r/alexssantos/wiremock-uix) (`latest`, `1.0.0`)
- Public GitHub repository: [`alexssantos/wiremock-uix`](https://github.com/alexssantos/wiremock-uix)

### Fixed
- Missing barrel exports (`StubMappingBodyPatternDraft`, `StubMappingRequestMatcherDraft`, `StubMappingResponseHeaderDraft`) from the `entities/stub-mapping` public API
- TypeScript "type instantiation is excessively deep" errors in the Stub Mapping wizard, caused by react-hook-form's `Path<T>`/`FieldErrors<T>` recursing through the self-referential `ContentPattern` union (`AndPattern`/`OrPattern`/`NotPattern`) — resolved by typing the form's `baseStub` field as `unknown` and casting to `StubMappingFormDraft`/`StubMapping` at the few read sites that need it
- CRLF line endings in `docker/docker-entrypoint.sh` breaking the shebang inside the Alpine-based nginx runtime image (added `.gitattributes` to enforce LF for shell scripts)

### Stack
React 19 · TypeScript 6 (strict, `verbatimModuleSyntax`, `erasableSyntaxOnly` — no `enum`) · Vite 8 · Tailwind CSS v4 · shadcn/ui · TanStack Query v5 · React Router v7 · React Hook Form + Zod · Monaco Editor · React Flow · Recharts · oxlint · npm. Architecture follows Feature-Sliced Design (`app > pages > widgets > features > entities > shared`).

[Unreleased]: https://github.com/alexssantos/wiremock-uix/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/alexssantos/wiremock-uix/releases/tag/v1.0.0
