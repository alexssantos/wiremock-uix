import { env } from "@/shared/config/env";

/**
 * Error thrown for any non-2xx response from the WireMock admin API.
 * Carries the HTTP status and, when available, the parsed error body
 * (WireMock returns a `{ errors: [...] }` shape for validation failures).
 */
export class WireMockApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "WireMockApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Thin fetch wrapper around the WireMock `/__admin` API.
 * - Prefixes every path with the configured base URL.
 * - Serializes/deserializes JSON automatically.
 * - Normalizes errors into `WireMockApiError`.
 * - Returns `undefined` for empty (204/empty-body) responses.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${env.wiremockBaseUrl}${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (cause) {
    throw new WireMockApiError(0, "Unable to reach the WireMock server. Is it running and reachable?", cause);
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!response.ok) {
    const message = extractErrorMessage(data) ?? `WireMock API request failed with status ${response.status}`;
    throw new WireMockApiError(response.status, message, data);
  }

  return data as T;
}

function extractErrorMessage(data: unknown): string | undefined {
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message: unknown }).message);
  }
  return undefined;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const wireMockClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: "GET", signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>(path, { method: "POST", body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) => request<T>(path, { method: "PUT", body, signal }),
  delete: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: "DELETE", signal }),
};
