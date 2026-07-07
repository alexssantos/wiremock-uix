# 13. Deployment & Operations Guide

> Companion to [`../CHANGELOG.md`](../CHANGELOG.md) (what changed and when) and [`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) (what was built). This document is the operational reference for **running** `wiremock-uix` — locally, via Docker, and on Kubernetes.

## 1. Overview

`wiremock-uix` is a static, client-side React SPA. It has **no backend or database of its own** — every screen talks directly to a WireMock server's admin REST API (`/__admin/*`) from the end user's browser. This has two direct operational consequences:

1. **The dashboard itself is fully stateless.** Any number of replicas can serve traffic interchangeably; there is nothing to synchronize between them. This is why it is deployed as a Kubernetes **Deployment**, not a StatefulSet.
2. **`WIREMOCK_BASE_URL` must be reachable from the browser**, not just from whatever host/pod/container runs the dashboard. If WireMock lives inside a private network (e.g. a Kubernetes cluster's internal service network), you need a browser-reachable Ingress/reverse-proxy/NodePort in front of it, or the app will show a "server unreachable" state.

## 2. Release Artifacts

| Artifact | Reference |
|---|---|
| Docker image | [`alexssantos/wiremock-uix`](https://hub.docker.com/r/alexssantos/wiremock-uix) — tags `latest`, `1.0.0` |
| Source repository | [`github.com/alexssantos/wiremock-uix`](https://github.com/alexssantos/wiremock-uix) |
| Changelog | [`../CHANGELOG.md`](../CHANGELOG.md) |
| Kubernetes manifests | [`../k8s/`](../k8s) |

Every tagged release should have a matching `CHANGELOG.md` entry and, where applicable, an updated `image:` tag in `k8s/wiremock-uix/deployment.yaml`.

## 3. Local Development

```powershell
npm install
copy .env.example .env.local   # VITE_WIREMOCK_BASE_URL, build-time default
npm run dev
```

`VITE_WIREMOCK_BASE_URL` (build-time, Vite env var) only matters for `npm run dev`/`npm run build` run outside Docker. In the Docker image and in Kubernetes, the equivalent setting is the **runtime** `WIREMOCK_BASE_URL` environment variable (see §4.2) — this takes precedence over the build-time value, per the resolution order in `src/shared/config/env.ts`.

## 4. Docker

### 4.1 Image build

Multi-stage `Dockerfile`:

1. **`build` stage** (`node:22-alpine`) — `npm ci`, then `npm run build` (`tsc -b && vite build`) → static assets in `/app/dist`.
2. **`runtime` stage** (`nginx:1.27-alpine`) — serves `/app/dist` on port `8081` using `docker/nginx.conf`, which:
   - Falls back to `index.html` for any non-file path (`try_files $uri $uri/ /index.html`), required for React Router's client-side routes.
   - Disables caching on `index.html` and `config.js` so deploys/config changes are picked up immediately.
   - Aggressively caches fingerprinted files under `/assets/`.

```powershell
docker build -t wiremock-uix:local .
```

### 4.2 Runtime configuration (no rebuild required)

`docker/docker-entrypoint.sh` is registered as an nginx `/docker-entrypoint.d/` startup hook. On container start, it renders `/usr/share/nginx/html/config.js` from the `WIREMOCK_BASE_URL` environment variable:

```js
window.__WIREMOCK_UI_CONFIG__ = { wiremockBaseUrl: "<WIREMOCK_BASE_URL>" };
```

`index.html` loads `config.js` before the app bundle, and `src/shared/config/env.ts` reads `window.__WIREMOCK_UI_CONFIG__.wiremockBaseUrl` first (falling back to the build-time Vite value, then `http://localhost:8080`). This means **one image works against any WireMock instance** — just change the environment variable per environment/deployment.

```powershell
docker run -d -p 8081:8081 -e WIREMOCK_BASE_URL=http://localhost:8080 alexssantos/wiremock-uix:1.0.0
```

### 4.3 docker-compose

[`docker-compose.yml`](../docker-compose.yml) starts both WireMock and the dashboard for local end-to-end testing, with WireMock automatically seeded with 30 example stub mappings (see [§8](#8-example-stub-mappings)):

```powershell
docker compose up
```

> **Updating to a newer release**: `docker-compose.yml` pins `wiremock-ui` to the `:latest` tag with `pull_policy: always`, so `docker compose up` re-checks Docker Hub for a newer digest on every run. If you're on an older Compose version that ignores `pull_policy`, force it explicitly:
> ```powershell
> docker compose pull wiremock-ui
> docker compose up -d
> ```
> Without either of these, Compose reuses whichever `wiremock-ui:latest` image is already cached locally and silently skips new releases — this bit us right after publishing v1.1.1.

### 4.4 Publishing a new image

**Automated (preferred)**: [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml) builds and pushes `alexssantos/wiremock-uix:<version>` + `:latest` to Docker Hub whenever a `vX.Y.Z` git tag is pushed:

```powershell
git tag vX.Y.Z
git push origin vX.Y.Z
# Watch the run:
gh run watch --repo alexssantos/wiremock-uix
```

It can also be triggered manually from the Actions tab (or `gh workflow run docker-publish.yml -f version=X.Y.Z`) without needing a new tag. Requires the repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (Settings → Secrets and variables → Actions) — use a long-lived Docker Hub access token, since short-lived/temporary tokens will stop working once they expire.

**Manual (fallback)**:

```powershell
docker build -t alexssantos/wiremock-uix:latest -t alexssantos/wiremock-uix:<version> .
docker login -u alexssantos --password-stdin   # pipe the PAT/password via stdin, never as a CLI flag
docker push alexssantos/wiremock-uix:latest
docker push alexssantos/wiremock-uix:<version>
docker logout
```

Bump `<version>` to match the `package.json` `version` field and the new `CHANGELOG.md` entry (semantic versioning). Never commit or store the registry password/PAT in any file.

## 5. Kubernetes

Manifests live under [`../k8s/`](../k8s), organized with [Kustomize](https://kustomize.io/):

```
k8s/
  namespace.yaml            # wiremock-dashboard namespace
  kustomization.yaml        # top-level, references both components below
  wiremock-uix/             # the dashboard — Deployment (stateless)
    configmap.yaml           # WIREMOCK_BASE_URL
    deployment.yaml
    service.yaml
    hpa.yaml
    ingress.yaml
    kustomization.yaml
  wiremock/                 # optional companion WireMock server — StatefulSet
    statefulset.yaml         # includes an initContainer that seeds example stubs (see §8)
    service.yaml
    kustomization.yaml       # also declares the wiremock-seed-mappings ConfigMap
    seed-mappings/           # generated: one JSON file per example stub (do not edit by hand)
```

### 5.1 Why Deployment for `wiremock-uix` and StatefulSet for `wiremock`

| Workload | Kind | Why |
|---|---|---|
| `wiremock-uix` (this dashboard) | **Deployment** | Fully stateless — pods share no local state, any replica can serve any request, and pods are interchangeable/disposable. Scaled horizontally via `hpa.yaml`. |
| `wiremock` (backend, optional) | **StatefulSet** | WireMock can persist stub mappings (`persistent: true`) and `__files` uploads to local disk (`/home/wiremock`). A StatefulSet gives it a stable identity and a durable `PersistentVolumeClaim` (via `volumeClaimTemplates`) that survives pod restarts/rescheduling, so that data isn't lost. **WireMock's in-memory state (scenarios, request journal, non-persistent stubs) is not shared across replicas**, so this manifest intentionally runs a single replica — do not scale `wiremock` horizontally without an external/shared-state strategy. |

If you already run WireMock elsewhere (a separate team's cluster, a managed service, bare metal, etc.), skip the `k8s/wiremock/` component entirely and just point `wiremock-uix`'s `WIREMOCK_BASE_URL` ConfigMap at that address.

### 5.2 Deploying

```powershell
# Review/adjust first:
#  - k8s/wiremock-uix/configmap.yaml   -> WIREMOCK_BASE_URL (must be browser-reachable)
#  - k8s/wiremock-uix/ingress.yaml     -> host, ingressClassName, TLS
#  - k8s/wiremock-uix/deployment.yaml  -> image tag, replicas, resources
#  - k8s/wiremock/statefulset.yaml     -> storageClassName, resources (only if using the bundled WireMock)

kubectl apply -k k8s/
kubectl -n wiremock-dashboard get pods,svc,ingress
```

To deploy only the dashboard against an already-running external WireMock instance:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -k k8s/wiremock-uix/
```

### 5.3 Configuration reference

| Setting | Where | Notes |
|---|---|---|
| `WIREMOCK_BASE_URL` | `k8s/wiremock-uix/configmap.yaml` | Must be reachable from the **end user's browser** — a public Ingress/NodePort/LoadBalancer address for WireMock, not an internal cluster DNS name, unless the dashboard is only ever accessed from inside the same private network as WireMock. |
| Image tag | `k8s/wiremock-uix/deployment.yaml` (`spec.template.spec.containers[0].image`) | Pin to a specific version (e.g. `alexssantos/wiremock-uix:1.0.0`); avoid `latest` in production for reproducible rollbacks. |
| Replicas / autoscaling | `deployment.yaml` (`spec.replicas`), `hpa.yaml` | Default: 2 replicas, HPA scales 2–6 on 70% CPU / 80% memory. |
| Resource requests/limits | `deployment.yaml` | Defaults are intentionally small (nginx serving static files): 50m/64Mi requests, 250m/128Mi limits. |
| Probes | `deployment.yaml` | Both liveness and readiness hit `GET /` on port `8081` (nginx serving `index.html`). |
| Ingress host/TLS | `ingress.yaml` | Placeholder host `wiremock-dashboard.example.com`; uncomment the `tls` block once a certificate/secret exists. |
| WireMock persistent storage | `k8s/wiremock/statefulset.yaml` (`volumeClaimTemplates`) | 2Gi `ReadWriteOnce` PVC mounted at `/home/wiremock` (mappings + `__files`); set `storageClassName` to match your cluster. |
| Example stub seeding | `k8s/wiremock/statefulset.yaml` (`initContainers`), `k8s/wiremock/kustomization.yaml` (`configMapGenerator`) | Seeds 30 example stubs onto a fresh PVC only; see §8. |

### 5.4 Rolling updates & rollback

The Deployment uses `RollingUpdate` with `maxUnavailable: 0` / `maxSurge: 1`, so updates are zero-downtime as long as at least 2 replicas are configured.

```powershell
# Roll out a new version
kubectl -n wiremock-dashboard set image deployment/wiremock-uix wiremock-uix=alexssantos/wiremock-uix:<new-version>
kubectl -n wiremock-dashboard rollout status deployment/wiremock-uix

# Roll back if something goes wrong
kubectl -n wiremock-dashboard rollout undo deployment/wiremock-uix
```

Always update `CHANGELOG.md` and the `image:` tag in `k8s/wiremock-uix/deployment.yaml` together, so the deployed version and the documented version never drift apart.

### 5.5 Multi-environment strategy

For multiple environments (dev/staging/prod), layer environment-specific Kustomize overlays on top of `k8s/` (not included in this repo yet — add as needed):

```
k8s/
  base/            # (rename current k8s/wiremock-uix, k8s/wiremock, namespace.yaml here)
  overlays/
    dev/
      kustomization.yaml   # patches: lower resources, dev WIREMOCK_BASE_URL, dev ingress host
    prod/
      kustomization.yaml   # patches: higher replicas/resources, prod ingress host + TLS
```

This is a straightforward Kustomize refactor once a second environment is actually needed — kept out of v1.0.0 to avoid over-engineering a single-environment deployment.

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| App loads but shows "server unreachable" / health indicator red | `WIREMOCK_BASE_URL` not reachable from the browser, or CORS blocked | Confirm the URL works from a browser on the same network as end users; enable WireMock's `--enable-browser-proxying` or front it with a CORS-friendly reverse proxy/Ingress |
| Changing `WIREMOCK_BASE_URL` has no effect | Browser cached `config.js` | Confirm `docker/nginx.conf`'s no-cache rule for `/config.js` is present in the running image; hard-refresh the browser |
| 404 on a deep link (e.g. `/stub-mappings/edit/123`) refresh | SPA fallback routing not applied | Confirm `try_files $uri $uri/ /index.html` in the nginx config actually being served (`kubectl exec` into the pod and check `/etc/nginx/conf.d/default.conf`) |
| WireMock `StatefulSet` pod restarts and loses stub mappings | PVC not bound, or mappings created with `persistent: false` | Check `kubectl get pvc -n wiremock-dashboard`; only `persistent: true` stub mappings are written to disk by WireMock |
| `docker-entrypoint.d` script fails with "not found" | CRLF line endings in a shell script copied from a Windows checkout | This repo enforces LF via `.gitattributes`; if you fork/modify `docker/docker-entrypoint.sh`, keep LF endings |

## 7. Release Checklist

1. Update `CHANGELOG.md` (`[Unreleased]` → new version section with date).
2. Bump `package.json` `version`.
3. `npm run build` locally to confirm a clean build.
4. Commit, then tag the release in git (`git tag vX.Y.Z && git push origin vX.Y.Z`) — this automatically triggers `.github/workflows/docker-publish.yml`, which builds and pushes `alexssantos/wiremock-uix:X.Y.Z` + `:latest` (§4.4). Watch it with `gh run watch`.
5. Update `k8s/wiremock-uix/deployment.yaml`'s image tag to the new version.
6. If desired, create a GitHub Release referencing the changelog entry (`gh release create vX.Y.Z --notes "..."`).
7. Apply the updated manifests to each environment (§5.4) and monitor the rollout (§5.4).

### 7.1 Automated image publishing

Every `vX.Y.Z` tag push builds and publishes the Docker image via GitHub Actions — no manual `docker build`/`docker push` needed for routine releases (§4.4 documents the manual fallback). The workflow requires two repository secrets:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | `alexssantos` |
| `DOCKERHUB_TOKEN` | A Docker Hub access token (Docker Hub → Account Settings → Security → Personal access tokens). Prefer a non-expiring or long-lived token — a short-lived/temporary token will silently stop working once it expires, and the workflow will fail at the `docker/login-action` step until the secret is rotated. |

Rotate the token with: `gh secret set DOCKERHUB_TOKEN --repo alexssantos/wiremock-uix` (paste the new token when prompted, or pipe it via stdin).


## 8. Example Stub Mappings

[`examples/sample-stub-mappings.json`](../examples/sample-stub-mappings.json) is the **single source of truth** for 30 example stub mappings across 3 sample REST APIs, meant both as a ready-to-explore default dataset and as a reference for the dashboard's bulk-import format (`{ "mappings": [...] }`, the same shape WireMock's `/__admin/mappings/import` endpoint accepts).

| API | Base path | Routes (10 each) |
|---|---|---|
| Users | `/api/users` | list, get by id, 404, filter by `role`, search, create, validation error (400), update, delete, unauthorized (401, missing `Authorization`) |
| Products | `/api/products` | list, get by id, 404, filter by `category`, create, update, delete, nested reviews, patch stock, simulated latency (`fixedDelayMilliseconds`) |
| Orders | `/api/orders` | list, get by id, 404, filter by `status`, create, conflict (409, header-triggered), cancel, nested items, invoice, simulated fault (`EMPTY_RESPONSE`) |

### 8.1 Two ways to get the examples loaded

1. **Manual import (any environment)** — dashboard → *Stub Mappings* → *Import* → select `examples/sample-stub-mappings.json`. Works against any WireMock instance, including ones you don't control the startup of.
2. **Automatic on startup (local dev / self-hosted stack)** — `docker compose up` (§4.3) and `kubectl apply -k k8s/` (§5.2) both seed a fresh WireMock instance with the same 30 stubs automatically, using two different native mechanisms:
   - **Docker Compose**: [`docker/wiremock-seed/mappings/`](../docker/wiremock-seed/mappings) (one JSON file per stub mapping — WireMock's native `mappings` folder format) is bind-mounted read-only into the `wiremock` container at `/home/wiremock/mappings`. WireMock auto-loads every `*.json` file there on boot — no custom code involved.
   - **Kubernetes**: the same per-file mappings, copied to [`k8s/wiremock/seed-mappings/`](../k8s/wiremock/seed-mappings) (required to live under `k8s/wiremock/` because Kustomize's `configMapGenerator` refuses file references outside the kustomization root), are packaged into a `wiremock-seed-mappings` ConfigMap. The StatefulSet's `seed-example-mappings` initContainer copies them onto the PersistentVolumeClaim **only if `/home/wiremock/mappings` is still empty** — so a pod restart, or a PVC that already has user-created/edited mappings, is never overwritten.

### 8.2 Regenerating the per-file copies

Both per-file copies are generated from `examples/sample-stub-mappings.json` — never edit the generated files directly:

```powershell
npm run seed:generate
```

This re-splits the bulk file into `docker/wiremock-seed/mappings/*.json` and `k8s/wiremock/seed-mappings/*.json` (see [`scripts/generate-wiremock-seed.mjs`](../scripts/generate-wiremock-seed.mjs)). Re-run it, then re-apply/rebuild, whenever you add, remove, or edit an example stub.

