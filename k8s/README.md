# Kubernetes Deployment Scripts

This directory contains the Kustomize manifests for `wiremock-uix` (see [`../README` in `docs/13-deployment-operations.md`](../../docs/13-deployment-operations.md) for the full deployment/operations reference) plus a small set of convenience scripts under [`scripts/`](scripts) to deploy, update, and remove the application from any cluster/namespace without having to remember the underlying `kubectl`/`kustomize` incantations.

Every script is provided in two equivalent forms:

| Script | Bash (Linux/macOS/WSL/Git Bash) | PowerShell (Windows/pwsh) |
|---|---|---|
| Deploy (first install or re-apply) | [`scripts/deploy.sh`](scripts/deploy.sh) | [`scripts/deploy.ps1`](scripts/deploy.ps1) |
| Update (roll out manifest/image changes) | [`scripts/update.sh`](scripts/update.sh) | [`scripts/update.ps1`](scripts/update.ps1) |
| Remove (uninstall) | [`scripts/remove.sh`](scripts/remove.sh) | [`scripts/remove.ps1`](scripts/remove.ps1) |

All three accept an optional cluster (`kubectl` context) and an optional namespace — if you don't pass either, they target your current `kubectl` context and the default namespace, **`wiremock-dashboard`**.

## Prerequisites

- `kubectl` v1.21+ on `PATH` (no standalone `kustomize` binary needed — these scripts use `kubectl apply -k` / `kubectl delete -k`, which has Kustomize built in).
- A working `kubeconfig` with a context pointing at the target cluster (`kubectl config get-contexts`).
- Cluster-admin or namespace-admin RBAC permissions to create namespaces, ConfigMaps, Deployments, StatefulSets, Services, Ingresses, and PersistentVolumeClaims.

## 1. Deploy

```bash
# Bash / WSL / Git Bash
./scripts/deploy.sh
./scripts/deploy.sh --context my-cluster --namespace wiremock-staging
./scripts/deploy.sh --dry-run   # render/validate only, no changes applied
```

```powershell
# PowerShell / pwsh
./scripts/deploy.ps1
./scripts/deploy.ps1 -Context my-cluster -Namespace wiremock-staging
./scripts/deploy.ps1 -DryRun
```

What it does, in order:
1. Ensures the target namespace exists (`kubectl create namespace ... --dry-run=client -o yaml | kubectl apply -f -`) — safe to run even if it already exists.
2. Applies the `wiremock` (StatefulSet + Service + seed ConfigMap) and `wiremock-uix` (Deployment + Service + ConfigMap + HPA + Ingress) components via a throwaway Kustomize overlay that forces the requested namespace, regardless of what's hardcoded in `wiremock/kustomization.yaml` / `wiremock-uix/kustomization.yaml` (see [§4](#4-how-namespace-overriding-works) below).
3. Waits for `deployment/wiremock-uix` and `statefulset/wiremock` to finish rolling out (`kubectl rollout status`, 180s timeout each). Pass `--dry-run`/`-DryRun` or `--skip-wait`/`-SkipWait` to skip this.
4. Prints `kubectl get pods,svc,ingress` for a quick sanity check.

Idempotent: re-running `deploy` after editing a manifest (image tag, replicas, resource limits, ingress host, etc.) simply applies the diff — this is functionally identical to running `update` without `--image-tag`/`-ImageTag`.

> Before your first deploy to a real environment, review and adjust:
> - `wiremock-uix/configmap.yaml` → `WIREMOCK_BASE_URL` (must be reachable from the **browser**, not just from inside the cluster)
> - `wiremock-uix/ingress.yaml` → `host`, `ingressClassName`, TLS
> - `wiremock-uix/deployment.yaml` → image tag, `replicas`, resource requests/limits
> - `wiremock/statefulset.yaml` → `storageClassName`, resource requests/limits (only if you're using the bundled WireMock StatefulSet)

## 2. Update

Use this after publishing a new Docker image (see [`docs/13-deployment-operations.md` §4.4](../../docs/13-deployment-operations.md#44-publishing-a-new-image)) or after editing any manifest under `wiremock/` or `wiremock-uix/`.

```bash
./scripts/update.sh
./scripts/update.sh --namespace wiremock-staging --image-tag 1.1.2
./scripts/update.sh --context my-cluster --dry-run
```

```powershell
./scripts/update.ps1
./scripts/update.ps1 -Namespace wiremock-staging -ImageTag 1.1.2
./scripts/update.ps1 -Context my-cluster -DryRun
```

What it does:
1. Re-applies the current manifests (same overlay mechanism as `deploy`), picking up any committed changes.
2. If `--image-tag`/`-ImageTag` is given, runs `kubectl set image deployment/wiremock-uix wiremock-uix=alexssantos/wiremock-uix:<tag>` immediately afterwards — handy for rolling out a freshly published tag without editing `deployment.yaml` first (remember to also commit that change to `deployment.yaml` afterwards so the next `deploy`/`update` doesn't roll it back).
3. Waits for the rollout to complete, same as `deploy`.

To roll back if an update goes wrong:

```bash
kubectl -n wiremock-dashboard rollout undo deployment/wiremock-uix
```

## 3. Remove

```bash
./scripts/remove.sh
./scripts/remove.sh --namespace wiremock-staging
./scripts/remove.sh --delete-namespace --yes   # also deletes the namespace + PVC(s), no prompt
```

```powershell
./scripts/remove.ps1
./scripts/remove.ps1 -Namespace wiremock-staging
./scripts/remove.ps1 -DeleteNamespace -Yes
```

What it does:
1. Deletes the `wiremock` and `wiremock-uix` resources (Deployment, StatefulSet, Services, ConfigMaps, HPA, Ingress) via the same overlay mechanism, with `--ignore-not-found` so it's safe to run twice.
2. By default **leaves the namespace and its PersistentVolumeClaim(s) in place** — WireMock's stub mappings/`__files` persisted to disk survive a `remove` + later `deploy`.
3. Only if `--delete-namespace`/`-DeleteNamespace` is passed, also deletes the namespace itself (and, with it, any PVC left inside — **this permanently destroys any persisted stub mappings/files**).
4. Prompts for interactive confirmation unless `-y`/`--yes`/`-Yes` is passed (skipped automatically in `--dry-run`/`-DryRun` mode).

## 4. How namespace overriding works

`wiremock/kustomization.yaml` and `wiremock-uix/kustomization.yaml` each hardcode `namespace: wiremock-dashboard`. To support deploying into an arbitrary namespace without editing those files, each script generates a throwaway parent Kustomization (in a temp directory, cleaned up automatically on exit) that looks like this:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: <requested-namespace>
resources:
  - <path>/k8s/wiremock
  - <path>/k8s/wiremock-uix
```

Kustomize's namespace transformer is hierarchical: when an outer Kustomization sets `namespace:`, it overrides whatever namespace a referenced component already declares. This lets every script target any namespace without ever touching the checked-in manifests.

The namespace itself (`k8s/namespace.yaml`) is deliberately **not** included in that overlay — instead, `deploy`/`update` create the target namespace directly with `kubectl create namespace ... --dry-run=client -o yaml | kubectl apply -f -`. This sidesteps a subtler Kustomize behavior (the namespace transformer also renaming any `kind: Namespace` resource's `metadata.name` to match) that would otherwise make the intent harder to follow.

## 5. Multi-cluster / multi-environment tips

- All three scripts accept `--context`/`-Context` so you never have to run `kubectl config use-context` (and risk leaving your global kubeconfig pointed at the wrong cluster). If omitted, they use whatever context is currently active.
- Combine `--namespace`/`-Namespace` with `--context`/`-Context` to run the same script against multiple environments on the same or different clusters, e.g.:
  ```bash
  ./scripts/deploy.sh --context prod-cluster --namespace wiremock-prod
  ./scripts/deploy.sh --context staging-cluster --namespace wiremock-staging
  ```
- For a longer-lived multi-environment setup (persistent dev/staging/prod overlays with patches, not just a namespace override), see the Kustomize overlay pattern described in [`docs/13-deployment-operations.md` §5.5](../../docs/13-deployment-operations.md#55-multi-environment-strategy).

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `kubectl not found on PATH` | `kubectl` isn't installed or not on `PATH` | Install `kubectl` and confirm with `kubectl version --client` |
| Script hangs on "Waiting for rollout to complete" | Pod stuck in `ImagePullBackOff`/`CrashLoopBackOff`, or PVC stuck `Pending` | `kubectl -n <namespace> get pods`, `kubectl -n <namespace> describe pod <pod>`; see also `docs/13-deployment-operations.md` §6 |
| `deploy`/`update` succeeds but the app still shows the old version | Deployment's `imagePullPolicy: IfNotPresent` and the image tag in `deployment.yaml` didn't change | Use `--image-tag`/`-ImageTag` on `update`, or bump the tag in `wiremock-uix/deployment.yaml` and re-run `deploy`/`update` |
| `remove --delete-namespace` didn't clean up a PVC | The PVC was created outside the StatefulSet's `volumeClaimTemplates` (e.g. manually) | Check for orphaned PVCs with `kubectl get pvc --all-namespaces` and delete them explicitly if intended |
