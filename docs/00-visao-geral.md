# 00 — Overview and Objectives

> Part of the Complete Technical Specification for **WireMock Studio Open Source**
> Full index in [`README.md`](./README.md)

---

## 1. Context and Problem

[WireMock](https://wiremock.org) is one of the most widely used HTTP API mocking tools on the market (5M+ downloads/month), but its native administrative interface is limited to a simple stub and request viewer embedded in the `/__admin` console. Teams that need to:

- Create and maintain hundreds of complex stub mappings,
- Investigate unmatched requests and near misses,
- Orchestrate scenarios with multiple states,
- Record real traffic in a controlled way,

... typically fall back to manual JSON editing, Postman, or the commercial **WireMock Studio** product (part of WireMock Cloud), which is not open source.

## 2. Product Goal

Build an **open source web dashboard**, decoupled from the WireMock server, that consumes only the official administrative API (`/__admin`) over HTTP, delivering a complete visual management experience — close to or better than the commercial WireMock Studio — for:

1. **Stub Mappings**: complete visual CRUD with a guided wizard, import/export, duplication, favorites, local history, and version comparison.
2. **Request Journal**: investigation of received traffic, with replay and stub generation from real requests.
3. **Near Misses**: diagnosis of "almost matches" for fast matcher debugging.
4. **Scenarios**: visualization and editing of state machines as interactive graphs.
5. **Recording**: assisted recording of interactions through a proxy, with review before persisting.
6. **Settings, Files, Logs**: operational administration of the server.

Non-goal: reimplementing the mocking engine (that is the responsibility of the WireMock server). The dashboard is **purely a client/administrator** for the `/__admin` API.

## 3. Personas

| Persona | Primary need | Typical usage |
|---|---|---|
| **Backend/Frontend Developer** | Create/adjust stubs quickly during local development | Creates stubs via the wizard, tests near misses when a request does not match |
| **QA/Test Engineer** | Orchestrate complex test scenarios (multi-state, fault injection) | Uses Scenarios and Recording, manages collections by environment |
| **DevOps/SRE** | Administer a shared WireMock instance (staging) | Uses Settings, Files, Logs, monitors the Dashboard |
| **Tech Lead/Architect** | Audit mocked API contracts, export/version collections | Uses export, history, JSON comparison |

## 4. Comparison with WireMock Studio (Parity Reference)

| Functionality | WireMock Studio (commercial) | WireMock Dashboard (this project) |
|---|---|---|
| Visual stub editor | ✅ | ✅ (wizard with Monaco preview) |
| Request Journal with replay | ✅ | ✅ |
| Near misses with diff | ✅ | ✅ |
| Visual scenarios | Partial | ✅ (React Flow, editable graph) |
| Assisted recording | ✅ | ✅ |
| Multi-environment/teams | ✅ (SaaS) | ❌ (out of scope for v1 — see roadmap) |
| Authentication/RBAC | ✅ (SaaS) | ❌ (depends on an external proxy) |
| Open source / self-hosted | ❌ | ✅ |
| Cost | Paid | Free |

## 5. Architecture Principles

1. **Client-only**: no proprietary business logic beyond UX; all truth comes from the `/__admin` API.
2. **Feature-Sliced Design (FSD)**: organization by business domain, not by technical type — see `01-arquitetura-frontend.md`.
3. **End-to-end typing**: TypeScript models mirror the WireMock OpenAPI schemas exactly — see `06-modelos-typescript.md`.
4. **Cache-first with TanStack Query**: minimize redundant calls and allow configurable polling for "live" data (Dashboard, server status).
5. **Progressive disclosure**: advanced features (complex matchers, fault injection) are hidden behind an "advanced mode" so as not to intimidate new users.
6. **Accessibility and performance are requirements, not extras**.

## 6. Technology Stack

See the setup details in [`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md#2-technical-stack-and-rationale). Summary:

React 19 · TypeScript 6 (strict, with `verbatimModuleSyntax` and `erasableSyntaxOnly`) · Vite 8 · Tailwind CSS v4 via `@tailwindcss/vite` · shadcn/ui (new-york style with FSD aliases) · TanStack Query v5 · TanStack Table · React Router v7 · React Hook Form + Zod · Monaco Editor · React Flow · Recharts · Lucide Icons · Vitest + Testing Library + MSW.

## 7. Out of Scope (v1)

- Proprietary authentication / multi-user support (mitigated by an external reverse proxy, if needed)
- Intermediate backend or proprietary database
- Real-time synchronization via WebSocket (v1 uses polling)
- Support for multiple WireMock instances simultaneously (see v2 roadmap)

## 8. How to Navigate This Specification

See [`README.md`](./README.md) for the complete index of all documents in this specification.
