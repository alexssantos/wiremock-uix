/**
 * Runtime configuration injected by the Docker entrypoint (see `docker/docker-entrypoint.sh`)
 * via a `<script src="/config.js">` tag loaded before the app bundle. This allows a single
 * pre-built Docker image to point at any WireMock instance by setting the `WIREMOCK_BASE_URL`
 * container environment variable, without requiring a rebuild.
 */
declare global {
  interface Window {
    __WIREMOCK_UI_CONFIG__?: {
      wiremockBaseUrl?: string;
    };
  }
}

/**
 * Centralized environment configuration.
 * All Vite env vars consumed by the app must be re-exported from here,
 * so the rest of the codebase never touches `import.meta.env` directly.
 *
 * Resolution order: runtime config (Docker) > build-time Vite env var > localhost default.
 */
export const env = {
  /** Base URL of the WireMock server whose /__admin API this dashboard manages. */
  wiremockBaseUrl:
    (typeof window !== "undefined" ? window.__WIREMOCK_UI_CONFIG__?.wiremockBaseUrl : undefined) ??
    (import.meta.env.VITE_WIREMOCK_BASE_URL as string | undefined) ??
    "http://localhost:8080",
} as const;
