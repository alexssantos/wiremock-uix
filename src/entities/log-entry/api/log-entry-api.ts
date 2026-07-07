import type { LogEntry } from "@/entities/log-entry/model/types";
import { wireMockClient } from "@/shared/api/wiremock-client";

type WireMockServeEvent = {
  id?: string;
  wasMatched?: boolean;
  request?: {
    loggedDate?: number;
    loggedDateString?: string;
    method?: string;
    url?: string;
  };
  responseDefinition?: {
    fromConfiguredStub?: boolean;
    status?: number;
  };
};

type WireMockJournalResponse = {
  requests?: WireMockServeEvent[];
};

function toTimestamp(event: WireMockServeEvent) {
  if (event.request?.loggedDateString) {
    return event.request.loggedDateString;
  }

  if (typeof event.request?.loggedDate === "number") {
    return new Date(event.request.loggedDate).toISOString();
  }

  return new Date().toISOString();
}

function toMatched(event: WireMockServeEvent) {
  if (typeof event.wasMatched === "boolean") {
    return event.wasMatched;
  }

  if (typeof event.responseDefinition?.fromConfiguredStub === "boolean") {
    return event.responseDefinition.fromConfiguredStub;
  }

  return false;
}

export async function fetchLogEntries(signal?: AbortSignal) {
  const response = await wireMockClient.get<WireMockJournalResponse>("/__admin/requests", signal);
  const requests = Array.isArray(response.requests) ? response.requests : [];

  return requests.map<LogEntry>((request, index) => ({
    id: request.id ?? `${request.request?.method ?? "UNKNOWN"}-${request.request?.url ?? "/"}-${index}`,
    timestamp: toTimestamp(request),
    method: String(request.request?.method ?? "UNKNOWN").toUpperCase(),
    url: request.request?.url ?? "/",
    status: typeof request.responseDefinition?.status === "number" ? request.responseDefinition.status : undefined,
    matched: toMatched(request),
  }));
}
