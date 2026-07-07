import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchAllRequests,
  fetchRequestById,
  fetchUnmatchedRequests,
} from "@/entities/serve-event/api/serve-event-api";
import type {
  LoggedRequest,
  RequestJournalCriteria,
  RequestJournalListResponse,
  ServeEvent,
} from "@/entities/serve-event/model/types";
import { queryKeys } from "@/shared/api/query-keys";

const LIVE_REFETCH_INTERVAL = 5_000;

type RequestJournalQueryOptions = {
  live?: boolean;
};

function parseSince(since: string | undefined): number | undefined {
  if (!since) {
    return undefined;
  }

  const timestamp = Date.parse(since);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function matchesText(request: LoggedRequest, value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const needle = value.toLowerCase();
  return request.url.toLowerCase().includes(needle) || request.method.toLowerCase().includes(needle);
}

function matchesCriteria(event: ServeEvent, criteria: RequestJournalCriteria): boolean {
  if (criteria.method && event.request.method.toUpperCase() !== criteria.method.toUpperCase()) {
    return false;
  }

  if (!matchesText(event.request, criteria.urlPathPattern)) {
    return false;
  }

  if (typeof criteria.matched === "boolean" && event.wasMatched !== criteria.matched) {
    return false;
  }

  const since = parseSince(criteria.since);
  if (since !== undefined) {
    const loggedDate = event.request.loggedDate ?? 0;
    if (loggedDate < since) {
      return false;
    }
  }

  return true;
}

function normalizeListResponse(data: RequestJournalListResponse, criteria: RequestJournalCriteria): RequestJournalListResponse {
  const filteredRequests = [...data.requests]
    .filter((event) => matchesCriteria(event, criteria))
    .sort((left, right) => (right.request.loggedDate ?? 0) - (left.request.loggedDate ?? 0));

  const requests = typeof criteria.limit === "number" ? filteredRequests.slice(0, criteria.limit) : filteredRequests;

  return {
    ...data,
    requests,
    meta: {
      total: requests.length,
    },
  };
}

export function useRequestJournal(criteria: RequestJournalCriteria = {}, options: RequestJournalQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.requests.journal(criteria),
    queryFn: ({ signal }) => fetchAllRequests(signal),
    placeholderData: keepPreviousData,
    select: (data) => normalizeListResponse(data, criteria),
    refetchInterval: options.live ? LIVE_REFETCH_INTERVAL : false,
    refetchIntervalInBackground: false,
  });
}

export function useRequest(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.requests.detail(id ?? ""),
    queryFn: ({ signal }) => fetchRequestById(id ?? "", signal),
    enabled: Boolean(id),
  });
}

export function useUnmatchedRequests() {
  return useQuery({
    queryKey: queryKeys.requests.unmatched(),
    queryFn: ({ signal }) => fetchUnmatchedRequests(signal),
    select: (data) => ({
      ...data,
      requests: [...data.requests].sort((left, right) => (right.loggedDate ?? 0) - (left.loggedDate ?? 0)),
    }),
  });
}
