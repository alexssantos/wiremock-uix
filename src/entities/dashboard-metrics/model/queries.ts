import { useQuery } from "@tanstack/react-query";
import {
  buildDashboardMetrics,
  fetchDashboardNearMisses,
  fetchDashboardRecordingStatus,
  fetchDashboardRequestCount,
  fetchDashboardRequests,
  fetchDashboardScenarios,
  fetchDashboardStubMappings,
  fetchDashboardUnmatchedRequests,
  getTopUrlsByFrequency,
  groupRequestsByMethod,
  groupRequestsByMinuteBucket,
  groupRequestsByStatusRange,
  normalizeMappingsForAggregation,
  normalizeRequestsForAggregation,
} from "@/entities/dashboard-metrics/api/dashboard-metrics-api";
import type {
  DashboardMetrics,
  HttpMethodCount,
  RequestsPerMinutePoint,
  StatusCodeCount,
  TopUrlCount,
} from "@/entities/dashboard-metrics/model/types";

const dashboardQueryKeys = {
  all: ["dashboard-metrics"] as const,
  overview: () => [...dashboardQueryKeys.all, "overview"] as const,
};

export type DashboardMetricsQueryData = {
  metrics: DashboardMetrics;
  requestsPerMinute: RequestsPerMinutePoint[];
  httpMethods: HttpMethodCount[];
  statusCodes: StatusCodeCount[];
  topUrls: TopUrlCount[];
  requestJournalDisabled: boolean;
};

async function fetchDashboardMetricsBundle(signal?: AbortSignal): Promise<DashboardMetricsQueryData> {
  const [mappings, requests, requestCount, unmatchedRequests, nearMisses, scenarios, recordingStatus] = await Promise.all([
    fetchDashboardStubMappings(signal),
    fetchDashboardRequests(signal),
    fetchDashboardRequestCount(signal),
    fetchDashboardUnmatchedRequests(signal),
    fetchDashboardNearMisses(signal),
    fetchDashboardScenarios(signal),
    fetchDashboardRecordingStatus(signal),
  ]);

  const requestEntries = normalizeRequestsForAggregation(requests.requests ?? []);
  const mappingEntries = normalizeMappingsForAggregation(mappings.mappings ?? []);
  const chartEntries = requestEntries.length > 0 ? requestEntries : mappingEntries;

  return {
    metrics: buildDashboardMetrics({
      mappings,
      requestCount,
      unmatchedRequests,
      nearMisses,
      scenarios,
      recordingStatus,
    }),
    requestsPerMinute: groupRequestsByMinuteBucket(requests.requests ?? []),
    httpMethods: groupRequestsByMethod(chartEntries),
    statusCodes: groupRequestsByStatusRange(requests.requests ?? []),
    topUrls: getTopUrlsByFrequency(chartEntries),
    requestJournalDisabled: requests.requestJournalDisabled ?? false,
  };
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardQueryKeys.overview(),
    queryFn: ({ signal }) => fetchDashboardMetricsBundle(signal),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    retry: 0,
  });
}
