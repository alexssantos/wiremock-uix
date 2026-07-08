#!/usr/bin/env bash
# Deploys wiremock-uix (+ optionally the bundled WireMock StatefulSet) to a
# Kubernetes cluster/namespace using the manifests under ../wiremock and
# ../wiremock-uix. Safe to re-run: `kubectl apply` is idempotent, so this
# script also works for "first deploy" and "re-apply after editing a
# manifest" use cases alike.
#
# Usage:
#   ./deploy.sh [-c|--context <kube-context>] [-n|--namespace <namespace>]
#               [--dry-run] [--skip-wait] [-h|--help]
#
# Examples:
#   ./deploy.sh
#   ./deploy.sh --context my-cluster --namespace wiremock-staging
#   ./deploy.sh --dry-run
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEFAULT_NAMESPACE="wiremock-dashboard"
NAMESPACE=""
CONTEXT=""
DRY_RUN="false"
SKIP_WAIT="false"

usage() {
  awk '/^set -euo pipefail/{exit} NR>1{print}' "$0" | sed -e 's/^#\s\{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--context)
      CONTEXT="$2"; shift 2 ;;
    -n|--namespace)
      NAMESPACE="$2"; shift 2 ;;
    --dry-run)
      DRY_RUN="true"; shift ;;
    --skip-wait)
      SKIP_WAIT="true"; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

NAMESPACE="${NAMESPACE:-$DEFAULT_NAMESPACE}"

KUBECTL=(kubectl)
if [[ -n "$CONTEXT" ]]; then
  KUBECTL=(kubectl --context "$CONTEXT")
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "error: kubectl not found on PATH" >&2
  exit 1
fi

echo "==> Target cluster: $("${KUBECTL[@]}" config current-context 2>/dev/null || echo "${CONTEXT:-<default context>}")"
echo "==> Target namespace: ${NAMESPACE}"
echo "==> Manifests: ${K8S_DIR}"
[[ "$DRY_RUN" == "true" ]] && echo "==> Mode: dry-run (no changes will be applied)"

# 1. Ensure the namespace exists (created separately from the component
#    kustomizations so we never depend on Kustomize's "rename Namespace
#    resource to match target namespace" behavior — see k8s/README.md).
echo "==> Ensuring namespace '${NAMESPACE}' exists"
"${KUBECTL[@]}" create namespace "${NAMESPACE}" --dry-run=client -o yaml | "${KUBECTL[@]}" apply -f -

# 2. Build a throwaway Kustomize overlay that points at the wiremock and
#    wiremock-uix components with the requested namespace applied on top,
#    overriding whatever namespace their own kustomization.yaml declares.
TMP_OVERLAY="$(mktemp -d)"
trap 'rm -rf "${TMP_OVERLAY}"' EXIT

cat > "${TMP_OVERLAY}/kustomization.yaml" <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: ${NAMESPACE}
resources:
  - ${K8S_DIR}/wiremock
  - ${K8S_DIR}/wiremock-uix
EOF

APPLY_ARGS=(apply -k "${TMP_OVERLAY}")
[[ "$DRY_RUN" == "true" ]] && APPLY_ARGS+=(--dry-run=client)

echo "==> Applying manifests"
"${KUBECTL[@]}" "${APPLY_ARGS[@]}"

if [[ "$DRY_RUN" == "true" || "$SKIP_WAIT" == "true" ]]; then
  echo "==> Skipping rollout wait"
  exit 0
fi

echo "==> Waiting for rollout to complete"
"${KUBECTL[@]}" -n "${NAMESPACE}" rollout status deployment/wiremock-uix --timeout=180s
"${KUBECTL[@]}" -n "${NAMESPACE}" rollout status statefulset/wiremock --timeout=180s

echo "==> Done. Current resources:"
"${KUBECTL[@]}" -n "${NAMESPACE}" get pods,svc,ingress
