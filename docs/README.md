# Complete Technical Specification — WireMock Studio Open Source

> This is the index for the complete technical specification of the **WireMock Dashboard** project, whose goal is to move toward a **WireMock Studio Open Source**: a full web application for visually managing a WireMock server (v3.9.1) through its administrative API (`/__admin`).
>
> For the **practical and actionable implementation plan** (setup, commands, summarized sprints, immediate next steps), see [`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md).
>
> For the **original condensed spec** that initiated this work, see [`../WireMock_Dashboard_UI_Specification.md`](../WireMock_Dashboard_UI_Specification.md).

## Document Index

| # | Document | Content |
|---|---|---|
| 00 | [Overview and Objectives](./00-visao-geral.md) | Context, product goal, personas, comparison with WireMock Studio, architecture principles |
| 01 | [Frontend Architecture (FSD)](./01-arquitetura-frontend.md) | Feature-Sliced Design layers, complete folder structure, dependency rules, routing |
| 02 | [Design System](./02-design-system.md) | Color palette, typography, shadcn/ui components, icons, accessibility |
| 03 | [Navigation Flows](./03-fluxos-navegacao.md) | Detailed user flows for the main usage scenarios |
| 04 | [Wireframes](./04-wireframes.md) | ASCII wireframes for all product screens |
| 05 | [Endpoint Mapping](./05-mapeamento-endpoints.md) | 100% of the WireMock 3.9.1 `/__admin` API endpoints |
| 06 | [TypeScript Models](./06-modelos-typescript.md) | TS interfaces generated from the WireMock OpenAPI specification |
| 07 | [Detailed Sprint Plan](./07-plano-sprints.md) | Sprint backlog with estimates and deliverables |
| 08 | [Component Structure](./08-estrutura-componentes.md) | React component tree by feature |
| 09 | [State Strategy](./09-estrategia-estado.md) | TanStack Query (query keys, cache, optimistic updates) + Context |
| 10 | [UI/UX Guide](./10-guia-ux-ui.md) | UX principles, interface states, microcopy, Figma-ready checklist |
| 11 | [Acceptance Criteria](./11-criterios-aceite.md) | Acceptance criteria (Given/When/Then) by feature |
| 12 | [Roadmap v1 → v2 → v3](./12-roadmap.md) | Product evolution beyond v1.0 |
| 13 | [Deployment & Operations Guide](./13-deployment-operations.md) | Docker image build/config, Kubernetes manifests (Deployment vs. StatefulSet), rollout/rollback, troubleshooting, release checklist |

## How to Use This Specification

- **To start implementing now**: read `../IMPLEMENTATION_PLAN.md`, then `01-arquitetura-frontend.md` and `07-plano-sprints.md` before Sprint 0.
- **For design/UX**: `02-design-system.md`, `04-wireframes.md`, and `10-guia-ux-ui.md`.
- **For WireMock API integration**: `05-mapeamento-endpoints.md` and `06-modelos-typescript.md` are the source of truth (based on the official WireMock OpenAPI specification).
- **For QA / "done" criteria**: `11-criterios-aceite.md`, cross-referenced with `03-fluxos-navegacao.md`.
- **For product/stakeholder vision**: `00-visao-geral.md` and `12-roadmap.md`.
- **For deploying/operating the app**: `13-deployment-operations.md`, cross-referenced with `../CHANGELOG.md` and `../k8s/`.

## Status of This Specification

| Document | Status |
|---|---|
| 00 — Overview | ✅ Complete |
| 01 — Frontend Architecture | ✅ Complete |
| 02 — Design System | ✅ Complete |
| 03 — Navigation Flows | ✅ Complete |
| 04 — Wireframes | ✅ Complete |
| 05 — Endpoint Mapping | ✅ Complete |
| 06 — TypeScript Models | ✅ Complete |
| 07 — Sprint Plan | ✅ Complete |
| 08 — Component Structure | ✅ Complete |
| 09 — State Strategy | ✅ Complete |
| 10 — UI/UX Guide | ✅ Complete |
| 11 — Acceptance Criteria | ✅ Complete |
| 12 — Roadmap | ✅ Complete |
| 13 — Deployment & Operations Guide | ✅ Complete |
