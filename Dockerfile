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
FROM nginx:1.27-alpine AS runtime

# Static assets produced by the Vite build.
COPY --from=build /app/dist /usr/share/nginx/html

# SPA-aware nginx config (client-side routing fallback to index.html).
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint that renders /config.js from the WIREMOCK_BASE_URL env var at
# container startup, so a single pre-built image can target any WireMock
# instance without rebuilding.
COPY docker/docker-entrypoint.sh /docker-entrypoint.d/50-wiremock-ui-config.sh
RUN chmod +x /docker-entrypoint.d/50-wiremock-ui-config.sh

ENV WIREMOCK_BASE_URL=http://localhost:8080
ENV PORT=8081

EXPOSE 8081

# Uses the base nginx image's built-in entrypoint, which runs every
# executable script found in /docker-entrypoint.d/ before starting nginx.
CMD ["nginx", "-g", "daemon off;"]
