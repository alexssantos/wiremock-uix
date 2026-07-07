# WireMock Dashboard

A modern, client-side dashboard for managing a [WireMock](https://wiremock.org/) server (v3.9.1) entirely through its admin REST API (`/__admin/*`) — no backend of its own. Think of it as an open-source alternative to WireMock Studio / WireMock Cloud's UI.

Full technical specification (architecture, design system, endpoint mapping, TypeScript models, sprint plan, roadmap) lives in [`docs/`](./docs) — see [`docs/README.md`](./docs/README.md) for the index. The practical build plan is in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).

## Features

- **Stub Mappings** — list, create (multi-tab wizard), edit, duplicate, delete, import/export, favorites
- **Requests** (journal) — filterable log of all requests WireMock has received, with a detail drawer, replay, and "generate stub from request"
- **Near Misses** — investigate unmatched requests with a side-by-side diff against the closest stub
- **Dashboard** — aggregate metrics and charts (requests/min, HTTP methods, status codes, top URLs)
- **Scenarios** — visualize and reset stateful scenario state machines (React Flow graph)
- **Recording** — start/stop proxy recording sessions and review/persist captured stubs
- **Settings** — global WireMock settings (delay, proxy pass-through, bad request behavior)
- **Files** — browse, edit, upload, and delete files under `__files`
- **Logs** — timeline view over the request journal with combined filters

## Tech Stack

React 19 · TypeScript 6 (strict) · Vite 8 · Tailwind CSS v4 · shadcn/ui · TanStack Query v5 · React Router v7 · React Hook Form + Zod · Monaco Editor · React Flow · Recharts. Architecture follows **Feature-Sliced Design** (`app > pages > widgets > features > entities > shared`).

## Getting Started

```powershell
npm install
copy .env.example .env.local   # set VITE_WIREMOCK_BASE_URL if not http://localhost:8080
npm run dev
```

Requires a running WireMock instance reachable from the browser (start one with `docker run -p 8080:8080 wiremock/wiremock:3.9.1`, and enable CORS/browser proxying as needed).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |
| `npm run test` | Run the Vitest suite |

## Docker

A production image is published on Docker Hub: **`alexssantos/wiremock-uix`** (`latest`, `1.0.0`).

```powershell
docker run -d -p 8081:8081 -e WIREMOCK_BASE_URL=http://localhost:8080 alexssantos/wiremock-uix:latest
```

`WIREMOCK_BASE_URL` is injected at **container startup** (not build time) into `public/config.js`, so a single image can point at any WireMock instance. See [`docker-compose.yml`](./docker-compose.yml) for a full local stack (dashboard + WireMock), and [Section 9 of `IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md#9-docker) for details.

To build the image locally:

```powershell
docker build -t wiremock-uix .
docker run -d -p 8081:8081 wiremock-uix
```

## Project Structure

See [`docs/01-arquitetura-frontend.md`](./docs/01-arquitetura-frontend.md) for the full Feature-Sliced Design layout. In short:

```
src/
  app/        # providers, routing, root layout
  pages/      # route-level components (one per screen)
  widgets/    # composed UI blocks (tables, charts, panels)
  features/   # user actions (create/edit/delete/import/...)
  entities/   # domain models, API calls, TanStack Query hooks
  shared/     # API client, UI kit, config, generic utilities
```

## Linting

This project uses **oxlint** (not ESLint) for fast linting. To enable type-aware rules, install `oxlint-tsgolint` and edit `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
