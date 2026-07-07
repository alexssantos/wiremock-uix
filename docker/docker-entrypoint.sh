#!/bin/sh
# Regenerates /usr/share/nginx/html/config.js from container environment
# variables at startup, so a single pre-built image can point at any
# WireMock instance without a rebuild. Runs automatically because the base
# nginx image executes every script in /docker-entrypoint.d/ before nginx
# starts.
set -eu

CONFIG_FILE="/usr/share/nginx/html/config.js"
BASE_URL="${WIREMOCK_BASE_URL:-http://localhost:8080}"

cat > "$CONFIG_FILE" <<EOF
window.__WIREMOCK_UI_CONFIG__ = {
  wiremockBaseUrl: "${BASE_URL}"
};
EOF

echo "[wiremock-ui] config.js written with wiremockBaseUrl=${BASE_URL}"
