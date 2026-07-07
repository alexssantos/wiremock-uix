import type {
  DashboardMetrics,
  HttpMethodCount,
  RequestsPerMinutePoint,
  StatusCodeCount,
  TopUrlCount,
} from "@/entities/dashboard-metrics/model/types";
import { wireMockClient } from "@/shared/api/wiremock-client";

type DashboardStubMapping = {
  request?: {
    method?: string;
    url?: string;
    urlPath?: string;
    urlPattern?: string;
    urlPathPattern?: string;
  };
};

type DashboardStubMappingsResponse = {
  meta?: {
    total?: number;
  };
  mappings?: DashboardStubMapping[];
};

type DashboardLoggedRequest = {
  method?: string;
  url?: string;
  loggedDate?: number;
  loggedDateString?: string;
};

type DashboardServeEvent = {
  request: DashboardLoggedRequest;
  response?: {
    status?: number;
  };
  responseDefinition?: {
    status?: number;
  };
};

type DashboardRequestsResponse = {
  requests?: DashboardServeEvent[];
  meta?: {
    total?: number;
  };
  requestJournalDisabled?: boolean;
};

type CountRequestsResponse = {
  count?: number;
  total?: number;
  requests?: number;
};

type DashboardUnmatchedRequestsResponse = {
  requests?: DashboardLoggedRequest[];
};

type DashboardNearMissesResponse = {
  nearMisses?: unknown[];
};

type DashboardScenariosResponse = {
  scenarios?: unknown[];
};

type DashboardRecordingStatusResponse = {
  status?: "NeverStarted" | "Recording" | "Stopped" | string;
};

export type DashboardAggregationSource = {
  method?: string;
  url?: string;
};

type BuildDashboardMetricsArgs = {
  mappings: DashboardStubMappingsResponse;
  requestCount: CountRequestsResponse;
  unmatchedRequests: DashboardUnmatchedRequestsResponse;
  nearMisses: DashboardNearMissesResponse;
  scenarios: DashboardScenariosResponse;
  recordingStatus: DashboardRecordingStatusResponse;
};

export async function fetchDashboardStubMappings(signal?: AbortSignal) {
  return wireMockClient.get<DashboardStubMappingsResponse>("/__admin/mappings", signal);
}

export async function fetchDashboardRequests(signal?: AbortSignal) {
  return wireMockClient.get<DashboardRequestsResponse>("/__admin/requests", signal);
}

export async function fetchDashboardRequestCount(signal?: AbortSignal) {
  return wireMockClient.post<CountRequestsResponse>("/__admin/requests/count", {}, signal);
}

export async function fetchDashboardUnmatchedRequests(signal?: AbortSignal) {
  return wireMockClient.get<DashboardUnmatchedRequestsResponse>("/__admin/requests/unmatched", signal);
}

export async function fetchDashboardNearMisses(signal?: AbortSignal) {
  return wireMockClient.get<DashboardNearMissesResponse>("/__admin/requests/unmatched/near-misses", signal);
}

export async function fetchDashboardScenarios(signal?: AbortSignal) {
  return wireMockClient.get<DashboardScenariosResponse>("/__admin/scenarios", signal);
}

export async function fetchDashboardRecordingStatus(signal?: AbortSignal) {
  return wireMockClient.get<DashboardRecordingStatusResponse>("/__admin/recordings/status", signal);
}

export function buildDashboardMetrics({
  mappings,
  requestCount,
  unmatchedRequests,
  nearMisses,
  scenarios,
  recordingStatus,
}: BuildDashboardMetricsArgs): DashboardMetrics {
  return {
    totalStubMappings: mappings.meta?.total ?? mappings.mappings?.length ?? 0,
    totalRequests: extractTotalRequestCount(requestCount),
    unmatchedRequests: unmatchedRequests.requests?.length ?? 0,
    nearMissesCount: nearMisses.nearMisses?.length ?? 0,
    scenariosCount: scenarios.scenarios?.length ?? 0,
    recordingActive: recordingStatus.status === "Recording",
    serverVersion: undefined,
  };
}

export function normalizeRequestsForAggregation(requests: DashboardServeEvent[]): DashboardAggregationSource[] {
  return requests.map((request) => ({
    method: request.request.method,
    url: request.request.url,
  }));
}

export function normalizeMappingsForAggregation(mappings: DashboardStubMapping[]): DashboardAggregationSource[] {
  return mappings.map((mapping) => ({
    method: mapping.request?.method,
    url: resolveMappingUrl(mapping.request),
  }));
}

export function groupRequestsByMethod(entries: DashboardAggregationSource[]): HttpMethodCount[] {
  const methodCounts = new Map<string, number>();

  for (const entry of entries) {
    const method = normalizeMethod(entry.method);
    methodCounts.set(method, (methodCounts.get(method) ?? 0) + 1);
  }

  return Array.from(methodCounts.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((left, right) => right.count - left.count || left.method.localeCompare(right.method));
}

export function groupRequestsByStatusRange(requests: DashboardServeEvent[]): StatusCodeCount[] {
  const counts = new Map<string, number>([
    ["2xx", 0],
    ["3xx", 0],
    ["4xx", 0],
    ["5xx", 0],
    ["N/A", 0],
  ]);

  for (const request of requests) {
    const status = request.response?.status ?? request.responseDefinition?.status;
    const range = getStatusRange(status);
    counts.set(range, (counts.get(range) ?? 0) + 1);
  }

  return ["2xx", "3xx", "4xx", "5xx", "N/A"]
    .map((status) => ({ status, count: counts.get(status) ?? 0 }))
    .filter((item) => item.count > 0);
}

export function groupRequestsByMinuteBucket(requests: DashboardServeEvent[]): RequestsPerMinutePoint[] {
  const minuteCounts = new Map<string, number>();

  for (const request of requests) {
    const timestamp = getRequestTimestamp(request);
    if (timestamp === undefined) {
      continue;
    }

    const bucket = formatMinuteBucket(timestamp);
    minuteCounts.set(bucket, (minuteCounts.get(bucket) ?? 0) + 1);
  }

  return Array.from(minuteCounts.entries())
    .sort(([leftMinute], [rightMinute]) => leftMinute.localeCompare(rightMinute))
    .map(([minute, count]) => ({ minute, count }));
}

export function getTopUrlsByFrequency(entries: DashboardAggregationSource[]): TopUrlCount[] {
  const urlCounts = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.url) {
      continue;
    }

    urlCounts.set(entry.url, (urlCounts.get(entry.url) ?? 0) + 1);
  }

  return Array.from(urlCounts.entries())
    .map(([url, count]) => ({ url, count }))
    .sort((left, right) => right.count - left.count || left.url.localeCompare(right.url))
    .slice(0, 5);
}

function extractTotalRequestCount(response: CountRequestsResponse): number {
  if (typeof response.count === "number") {
    return response.count;
  }

  if (typeof response.total === "number") {
    return response.total;
  }

  if (typeof response.requests === "number") {
    return response.requests;
  }

  return 0;
}

function resolveMappingUrl(request: DashboardStubMapping["request"]): string | undefined {
  if (!request) {
    return undefined;
  }

  return request.url ?? request.urlPath ?? request.urlPattern ?? request.urlPathPattern;
}

function normalizeMethod(method: string | undefined): string {
  const normalizedMethod = method?.trim().toUpperCase();
  return normalizedMethod && normalizedMethod.length > 0 ? normalizedMethod : "UNKNOWN";
}

function getStatusRange(status: number | undefined): string {
  if (status === undefined) {
    return "N/A";
  }

  if (status >= 200 && status < 300) {
    return "2xx";
  }

  if (status >= 300 && status < 400) {
    return "3xx";
  }

  if (status >= 400 && status < 500) {
    return "4xx";
  }

  if (status >= 500) {
    return "5xx";
  }

  return "N/A";
}

function getRequestTimestamp(request: DashboardServeEvent): number | undefined {
  if (typeof request.request.loggedDate === "number") {
    return request.request.loggedDate;
  }

  if (request.request.loggedDateString) {
    const parsedTimestamp = Date.parse(request.request.loggedDateString);
    if (!Number.isNaN(parsedTimestamp)) {
      return parsedTimestamp;
    }
  }

  return undefined;
}

function formatMinuteBucket(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
