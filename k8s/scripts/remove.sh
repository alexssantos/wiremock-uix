#!/usr/bin/env bash
# Removes the wiremock-uix and wiremock resources from a cluster/namespace.
# By default the namespace itself (and any PersistentVolumeClaim created by
# the wiremock StatefulSet) is left in place — pass --delete-namespace to
# also delete it and everything in it, including stub mapping data on disk.
#
# Usage:
#   ./remove.sh [-c|--context <kube-context>] [-n|--namespace <namespace>]
#               [--delete-namespace] [-y|--yes] [--dry-run] [-h|--help]
#
# Examples:
#   ./remove.sh --namespace wiremock-staging
#   ./remove.sh --delete-namespace --yes
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEFAULT_NAMESPACE="wiremock-dashboard"
NAMESPACE=""
CONTEXT=""
DELETE_NAMESPACE="false"
ASSUME_YES="false"
DRY_RUN="false"

usage() {
  awk '/^set -euo pipefail/{exit} NR>1{print}' "$0" | sed -e 's/^#\s\{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--context)
      CONTEXT="$2"; shift 2 ;;
    -n|--namespace)
      NAMESPACE="$2"; shift 2 ;;
    --delete-namespace)
      DELETE_NAMESPACE="true"; shift ;;
    -y|--yes)
      ASSUME_YES="true"; shift ;;
    --dry-run)
      DRY_RUN="true"; shift ;;
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

if [[ "$ASSUME_YES" != "true" && "$DRY_RUN" != "true" ]]; then
  WARNING="This will delete wiremock-uix and wiremock resources in namespace '${NAMESPACE}'."
  if [[ "$DELETE_NAMESPACE" == "true" ]]; then
    WARNING="${WARNING} The namespace itself and its PersistentVolumeClaim(s) (WireMock stub mappings/__files on disk) will ALSO be permanently deleted."
  fi
  read -r -p "${WARNING} Continue? [y/N] " REPLY
  case "$REPLY" in
    [yY][eE][sS]|[yY]) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

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

DELETE_ARGS=(delete -k "${TMP_OVERLAY}" --ignore-not-found)
[[ "$DRY_RUN" == "true" ]] && DELETE_ARGS+=(--dry-run=client)

echo "==> Deleting wiremock-uix and wiremock resources"
"${KUBECTL[@]}" "${DELETE_ARGS[@]}"

if [[ "$DELETE_NAMESPACE" == "true" ]]; then
  echo "==> Deleting namespace '${NAMESPACE}' (and any remaining PVCs in it)"
  NS_DELETE_ARGS=(delete namespace "${NAMESPACE}" --ignore-not-found)
  [[ "$DRY_RUN" == "true" ]] && NS_DELETE_ARGS+=(--dry-run=client)
  "${KUBECTL[@]}" "${NS_DELETE_ARGS[@]}"
else
  echo "==> Namespace '${NAMESPACE}' left in place (pass --delete-namespace to remove it too)"
fi

echo "==> Done."
