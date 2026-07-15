# syntax=docker/dockerfile:1

# ---- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----------------------------------------------------------
# nginx-unprivileged runs its master process as UID 101 (never root), which
# lets the Kubernetes Deployment enforce runAsNonRoot and
# readOnlyRootFilesystem for this workload. See k8s/wiremock-uix/deployment.yaml
# for how config.js is rendered in that read-only scenario.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Static assets produced by the Vite build. The base image already runs as
# UID 101 (see USER 101 below), so files must be explicitly chowned to it —
# COPY otherwise defaults to root ownership, which UID 101 can't chmod/write.
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

# SPA-aware nginx config (client-side routing fallback to index.html).
COPY --chown=101:101 docker/nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint that renders /config.js from the WIREMOCK_BASE_URL env var at
# container startup (used for `docker run` / Compose). Under Kubernetes with
# a read-only root filesystem this script detects it cannot write and
# becomes a no-op, relying instead on an init container to render config.js
# onto a mounted volume.
COPY --chown=101:101 docker/docker-entrypoint.sh /docker-entrypoint.d/50-wiremock-ui-config.sh
RUN chmod +x /docker-entrypoint.d/50-wiremock-ui-config.sh

ENV WIREMOCK_BASE_URL=http://localhost:8080
ENV PORT=8081

EXPOSE 8081

USER 101

# Uses the base nginx image's built-in entrypoint, which runs every
# executable script found in /docker-entrypoint.d/ before starting nginx.
CMD ["nginx", "-g", "daemon off;"]
