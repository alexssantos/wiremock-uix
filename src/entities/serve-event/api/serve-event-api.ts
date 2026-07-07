import { wireMockClient } from "@/shared/api/wiremock-client";
import type {
  CountRequestsResponse,
  HeaderMap,
  LoggedRequest,
  LoggedRequestListResponse,
  LoggedResponse,
  RequestJournalCriteria,
  RequestJournalListResponse,
  ResponseDefinition,
  ServeEvent,
  ServeEventTiming,
  ServeEventStubMapping,
} from "@/entities/serve-event/model/types";

function normalizeStringRecord(value: unknown): HeaderMap {
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

      if (entry && typeof entry === "object" && "value" in entry) {
        return [key, String((entry as { value: unknown }).value)];
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

function normalizeLoggedResponse(response: Partial<LoggedResponse> | undefined): LoggedResponse | undefined {
  if (!response) {
    return undefined;
  }

  return {
    status: response.status,
    headers: normalizeStringRecord(response.headers),
    body: response.body,
    bodyAsBase64: response.bodyAsBase64,
    fault: response.fault,
  };
}

function normalizeResponseDefinition(responseDefinition: Partial<ResponseDefinition> | undefined): ResponseDefinition | undefined {
  if (!responseDefinition) {
    return undefined;
  }

  return {
    status: responseDefinition.status,
    headers: normalizeStringRecord(responseDefinition.headers),
    body: responseDefinition.body,
    bodyAsBase64: responseDefinition.bodyAsBase64,
    jsonBody: responseDefinition.jsonBody,
    fault: responseDefinition.fault,
    fromConfiguredStub: responseDefinition.fromConfiguredStub,
    transformerParameters: responseDefinition.transformerParameters,
  };
}

function normalizeStubMapping(stubMapping: Partial<ServeEventStubMapping> | undefined): ServeEventStubMapping | undefined {
  if (!stubMapping) {
    return undefined;
  }

  return {
    id: stubMapping.id,
    name: stubMapping.name,
  };
}

function normalizeTiming(timing: Partial<ServeEventTiming> | undefined): ServeEventTiming | undefined {
  if (!timing) {
    return undefined;
  }

  return {
    addedDelay: timing.addedDelay,
    processTime: timing.processTime,
    responseSendTime: timing.responseSendTime,
    serveTime: timing.serveTime,
    totalTime: timing.totalTime,
  };
}

function buildServeEventId(event: Partial<ServeEvent> & { request?: Partial<LoggedRequest> }): string {
  if (typeof event.id === "string" && event.id.length > 0) {
    return event.id;
  }

  const request = event.request;
  return [request?.method ?? "REQUEST", request?.url ?? "/", request?.loggedDate ?? "0"].join(":");
}

function normalizeServeEvent(event: Partial<ServeEvent> & { request?: Partial<LoggedRequest> }): ServeEvent {
  const responseDefinition = normalizeResponseDefinition(event.responseDefinition);

  return {
    id: buildServeEventId(event),
    request: normalizeLoggedRequest(event.request),
    responseDefinition,
    response: normalizeLoggedResponse(event.response),
    wasMatched: event.wasMatched ?? Boolean(responseDefinition?.fromConfiguredStub) ?? false,
    stubMapping: normalizeStubMapping(event.stubMapping),
    timing: normalizeTiming(event.timing),
  };
}

function normalizeLoggedRequestListResponse(response: Partial<LoggedRequestListResponse> | undefined): LoggedRequestListResponse {
  const requests = (response?.requests ?? []).map((request) => normalizeLoggedRequest(request));

  return {
    requests,
    meta: {
      total: response?.meta?.total ?? requests.length,
    },
  };
}

function normalizeRequestJournalResponse(response: Partial<RequestJournalListResponse> | undefined): RequestJournalListResponse {
  const requests = (response?.requests ?? []).map((request) => normalizeServeEvent(request));

  return {
    requests,
    meta: {
      total: response?.meta?.total ?? requests.length,
    },
    requestJournalDisabled: response?.requestJournalDisabled ?? false,
  };
}

export function fetchAllRequests(signal?: AbortSignal) {
  return wireMockClient.get<RequestJournalListResponse>("/__admin/requests", signal).then(normalizeRequestJournalResponse);
}

export function fetchRequestById(id: string, signal?: AbortSignal) {
  return wireMockClient.get<ServeEvent>(`/__admin/requests/${id}`, signal).then(normalizeServeEvent);
}

export function fetchUnmatchedRequests(signal?: AbortSignal) {
  return wireMockClient.get<LoggedRequestListResponse>("/__admin/requests/unmatched", signal).then(normalizeLoggedRequestListResponse);
}

export function findRequestsByCriteria(criteria: RequestJournalCriteria, signal?: AbortSignal) {
  return wireMockClient.post<LoggedRequestListResponse>("/__admin/requests/find", criteria, signal).then(normalizeLoggedRequestListResponse);
}

export function countRequestsByCriteria(criteria: RequestJournalCriteria, signal?: AbortSignal) {
  return wireMockClient.post<CountRequestsResponse>("/__admin/requests/count", criteria, signal).then((response) => ({
    count: response.count ?? 0,
  }));
}

export function deleteRequestById(id: string, signal?: AbortSignal) {
  return wireMockClient.delete<void>(`/__admin/requests/${id}`, signal);
}

export function deleteAllRequests(signal?: AbortSignal) {
  return wireMockClient.delete<void>("/__admin/requests", signal);
}
