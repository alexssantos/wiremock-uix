import type { WireMockFile } from "@/entities/file/model/types";
import { env } from "@/shared/config/env";
import { wireMockClient, WireMockApiError } from "@/shared/api/wiremock-client";

function encodeFileId(fileId: string) {
  return encodeURIComponent(fileId);
}

function inferContentType(fileId: string) {
  const normalized = fileId.toLowerCase();

  if (normalized.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }

  if (normalized.endsWith(".xml")) {
    return "application/xml; charset=utf-8";
  }

  if (normalized.endsWith(".html") || normalized.endsWith(".htm")) {
    return "text/html; charset=utf-8";
  }

  if (normalized.endsWith(".svg")) {
    return "image/svg+xml; charset=utf-8";
  }

  if (normalized.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }

  if (normalized.endsWith(".js") || normalized.endsWith(".mjs")) {
    return "text/javascript; charset=utf-8";
  }

  if (
    normalized.endsWith(".txt") ||
    normalized.endsWith(".md") ||
    normalized.endsWith(".yaml") ||
    normalized.endsWith(".yml")
  ) {
    return "text/plain; charset=utf-8";
  }

  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (normalized.endsWith(".gif")) {
    return "image/gif";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  return "text/plain; charset=utf-8";
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(body: unknown, status: number) {
  if (body && typeof body === "object" && "message" in body) {
    return String((body as { message: unknown }).message);
  }

  if (typeof body === "string" && body.trim()) {
    return body;
  }

  return `WireMock API request failed with status ${status}`;
}

async function requestRawText(
  fileId: string,
  options: {
    method?: "GET" | "PUT";
    body?: string;
    contentType?: string;
    signal?: AbortSignal;
  } = {}
) {
  const { body, contentType, method = "GET", signal } = options;

  let response: Response;
  try {
    response = await fetch(`${env.wiremockBaseUrl}/__admin/files/${encodeFileId(fileId)}`, {
      method,
      headers: body !== undefined ? { "Content-Type": contentType ?? "text/plain; charset=utf-8" } : undefined,
      body,
      signal,
    });
  } catch (cause) {
    throw new WireMockApiError(0, "Could not connect to the WireMock server.", cause);
  }

  const text = await response.text();
  if (!response.ok) {
    const parsedBody = text ? safeJsonParse(text) : undefined;
    throw new WireMockApiError(response.status, extractErrorMessage(parsedBody, response.status), parsedBody);
  }

  return text;
}

export async function fetchAllFileNames(signal?: AbortSignal) {
  const response = await wireMockClient.get<string[]>("/__admin/files", signal);

  if (!Array.isArray(response)) {
    return [] satisfies WireMockFile[];
  }

  return response.map((name) => ({ name }));
}

export function fetchFileContent(fileId: string, signal?: AbortSignal) {
  return requestRawText(fileId, { signal });
}

export function saveFileContent(fileId: string, content: string) {
  return requestRawText(fileId, {
    method: "PUT",
    body: content,
    contentType: inferContentType(fileId),
  });
}

export function deleteFile(fileId: string) {
  return wireMockClient.delete<void>(`/__admin/files/${encodeFileId(fileId)}`);
}
