#!/bin/sh
# Regenerates /usr/share/nginx/html/config.js from container environment
# variables at startup, so a single pre-built image can point at any
# WireMock instance without a rebuild. Runs automatically because the base
# nginx image executes every script in /docker-entrypoint.d/ before nginx
# starts.
#
# Under Kubernetes the pod runs with a read-only root filesystem, so this
# script cannot write here; config.js is instead rendered by an init
# container onto a mounted volume before the main container starts (see
# k8s/wiremock-uix/deployment.yaml). We detect that case below and become a
# harmless no-op instead of failing the container.
set -eu

CONFIG_FILE="/usr/share/nginx/html/config.js"
BASE_URL="${WIREMOCK_BASE_URL:-http://localhost:8080}"

# Only host[:port] is expected — reject anything else (path, query,
# fragment, quotes, etc.) before it ever reaches a file the browser
# executes as JavaScript, to prevent a stored-XSS via this env var.
case "$BASE_URL" in
  http://*|https://*) ;;
  *)
    echo "[wiremock-ui] ERROR: WIREMOCK_BASE_URL '${BASE_URL}' must start with http:// or https://" >&2
    exit 1
    ;;
esac
if ! printf '%s' "$BASE_URL" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?/?$'; then
  echo "[wiremock-ui] ERROR: WIREMOCK_BASE_URL '${BASE_URL}' failed validation; refusing to write config.js" >&2
  exit 1
fi

if [ ! -w "$(dirname "$CONFIG_FILE")" ]; then
  echo "[wiremock-ui] $(dirname "$CONFIG_FILE") is read-only; assuming config.js was already rendered by an init container. Skipping."
  exit 0
fi

cat > "$CONFIG_FILE" <<EOF
window.__WIREMOCK_UI_CONFIG__ = {
  wiremockBaseUrl: "${BASE_URL}"
};
EOF

echo "[wiremock-ui] config.js written with wiremockBaseUrl=${BASE_URL}"
