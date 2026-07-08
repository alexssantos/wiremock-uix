#!/usr/bin/env bash
# Updates an existing wiremock-uix deployment: re-applies the manifests under
# ../wiremock and ../wiremock-uix (picking up any manifest edits, e.g. a new
# image tag committed to deployment.yaml), optionally overrides the
# wiremock-uix image tag on the fly, and waits for the rollout to finish.
#
# Usage:
#   ./update.sh [-c|--context <kube-context>] [-n|--namespace <namespace>]
#               [-i|--image-tag <tag>] [--dry-run] [--skip-wait] [-h|--help]
#
# Examples:
#   ./update.sh
#   ./update.sh --namespace wiremock-staging --image-tag 1.1.2
#   ./update.sh --context my-cluster --dry-run
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEFAULT_NAMESPACE="wiremock-dashboard"
DEFAULT_IMAGE_REPO="alexssantos/wiremock-uix"
NAMESPACE=""
CONTEXT=""
IMAGE_TAG=""
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
    -i|--image-tag)
      IMAGE_TAG="$2"; shift 2 ;;
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
[[ "$DRY_RUN" == "true" ]] && echo "==> Mode: dry-run (no changes will be applied)"

# 1. Re-apply the current manifests (same overlay approach as deploy.sh) so
#    any committed changes — resource limits, env vars, replica counts, a new
#    pinned image tag in deployment.yaml, etc. — are picked up.
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

# 2. Optionally override the wiremock-uix image tag without having to edit
#    deployment.yaml first (handy for quickly rolling out a freshly published
#    Docker Hub tag, e.g. after a fix — see docs/13-deployment-operations.md §5.4).
if [[ -n "$IMAGE_TAG" ]]; then
  echo "==> Setting wiremock-uix image to ${DEFAULT_IMAGE_REPO}:${IMAGE_TAG}"
  SET_IMAGE_ARGS=(-n "${NAMESPACE}" set image "deployment/wiremock-uix" "wiremock-uix=${DEFAULT_IMAGE_REPO}:${IMAGE_TAG}")
  [[ "$DRY_RUN" == "true" ]] && SET_IMAGE_ARGS+=(--dry-run=client)
  "${KUBECTL[@]}" "${SET_IMAGE_ARGS[@]}"
fi

if [[ "$DRY_RUN" == "true" || "$SKIP_WAIT" == "true" ]]; then
  echo "==> Skipping rollout wait"
  exit 0
fi

echo "==> Waiting for rollout to complete"
"${KUBECTL[@]}" -n "${NAMESPACE}" rollout status deployment/wiremock-uix --timeout=180s
"${KUBECTL[@]}" -n "${NAMESPACE}" rollout status statefulset/wiremock --timeout=180s

echo "==> Done. Current resources:"
"${KUBECTL[@]}" -n "${NAMESPACE}" get pods,svc,ingress
