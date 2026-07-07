import { wireMockClient } from "@/shared/api/wiremock-client";
import type { LoggedRequest } from "@/entities/serve-event";
import type { NearMiss, NearMissesResponse, NearMissStubMapping } from "@/entities/near-miss/model/types";

function normalizeStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (typeof entry === "string") {
        return [key, entry];
      }

      if (Array.isArray(entry)) {
        return [key, entry.map((item) => String(item)).join(", ")];
      }

      return [key, JSON.stringify(entry)];
    })
  );
}

function normalizeLoggedRequest(request: Partial<LoggedRequest> | undefined): LoggedRequest {
  return {
    id: request?.id,
    method: request?.method ?? "GET",
    url: request?.url ?? "/",
    absoluteUrl: request?.absoluteUrl ?? null,
    headers: normalizeStringRecord(request?.headers),
    cookies: normalizeStringRecord(request?.cookies),
    body: request?.body ?? "",
    bodyAsBase64: request?.bodyAsBase64,
    browserProxyRequest: request?.browserProxyRequest,
    loggedDate: request?.loggedDate,
    loggedDateString: request?.loggedDateString,
    clientIp: request?.clientIp,
  };
}

function normalizeStubMapping(stubMapping: Partial<NearMissStubMapping> | undefined): NearMissStubMapping | undefined {
  if (!stubMapping) {
    return undefined;
  }

  return {
    id: stubMapping.id,
    name: stubMapping.name,
    request: stubMapping.request,
    response: stubMapping.response,
  };
}

function normalizeNearMiss(nearMiss: Partial<NearMiss> | undefined): NearMiss {
  return {
    request: normalizeLoggedRequest(nearMiss?.request),
    stubMapping: normalizeStubMapping(nearMiss?.stubMapping),
    requestPattern: nearMiss?.requestPattern,
    matchResult: {
      distance: nearMiss?.matchResult?.distance ?? 1,
    },
  };
}

function normalizeNearMissesResponse(response: Partial<NearMissesResponse> | undefined): NearMissesResponse {
  return {
    nearMisses: (response?.nearMisses ?? []).map((nearMiss) => normalizeNearMiss(nearMiss)),
  };
}

export function fetchNearMissesForUnmatchedRequests(signal?: AbortSignal) {
  return wireMockClient.get<NearMissesResponse>("/__admin/requests/unmatched/near-misses", signal).then(normalizeNearMissesResponse);
}

export function findNearMissesForRequest(loggedRequest: LoggedRequest, signal?: AbortSignal) {
  return wireMockClient
    .post<NearMissesResponse>("/__admin/near-misses/request", loggedRequest, signal)
    .then(normalizeNearMissesResponse);
}

export function findNearMissesForRequestPattern(requestPattern: Record<string, unknown>, signal?: AbortSignal) {
  return wireMockClient
    .post<NearMissesResponse>("/__admin/near-misses/request-pattern", requestPattern, signal)
    .then(normalizeNearMissesResponse);
}
