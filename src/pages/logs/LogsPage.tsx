import { AlertCircleIcon, ScrollTextIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useLogEntries } from "@/entities/log-entry";
import { defaultLogsFilters, LogsFilterSidebar, LogsTimeline, type LogsFilters } from "@/widgets/logs-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The operation could not be completed. Please try again.";
}

function hasDefaultFilters(filters: LogsFilters) {
  return (
    filters.method === defaultLogsFilters.method &&
    filters.status === defaultLogsFilters.status &&
    filters.matchState === defaultLogsFilters.matchState &&
    filters.timeRange === defaultLogsFilters.timeRange
  );
}

function matchesStatus(status: number | undefined, filter: LogsFilters["status"]) {
  if (filter === "all") {
    return true;
  }

  if (filter === "na") {
    return status === undefined;
  }

  if (status === undefined) {
    return false;
  }

  const range = Math.floor(status / 100);
  return `${range}xx` === filter;
}

function matchesTimeRange(timestamp: string, timeRange: LogsFilters["timeRange"]) {
  if (timeRange === "all") {
    return true;
  }

  const parsedTimestamp = Date.parse(timestamp);
  if (Number.isNaN(parsedTimestamp)) {
    return false;
  }

  const now = Date.now();
  const rangeInMilliseconds = {
    "15m": 15 * 60_000,
    "1h": 60 * 60_000,
    "24h": 24 * 60 * 60_000,
    all: Number.POSITIVE_INFINITY,
  }[timeRange];

  return now - parsedTimestamp <= rangeInMilliseconds;
}

export function LogsPage() {
  const logEntriesQuery = useLogEntries();
  const [filters, setFilters] = useState<LogsFilters>(defaultLogsFilters);

  const availableMethods = useMemo(() => {
    const methods = new Set((logEntriesQuery.data ?? []).map((entry) => entry.method));
    return [...methods].sort((left, right) => left.localeCompare(right));
  }, [logEntriesQuery.data]);

  const filteredEntries = useMemo(() => {
    return [...(logEntriesQuery.data ?? [])]
      .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
      .filter((entry) => {
        if (filters.method !== "all" && entry.method !== filters.method) {
          return false;
        }

        if (!matchesStatus(entry.status, filters.status)) {
          return false;
        }

        if (filters.matchState === "matched" && !entry.matched) {
          return false;
        }

        if (filters.matchState === "unmatched" && entry.matched) {
          return false;
        }

        return matchesTimeRange(entry.timestamp, filters.timeRange);
      });
  }, [filters, logEntriesQuery.data]);

  const noActiveFilters = hasDefaultFilters(filters);
  const showEmptyState = !logEntriesQuery.isLoading && !logEntriesQuery.isError && filteredEntries.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Logs" description="Review recent WireMock request journal activity in a timeline view." />

      {logEntriesQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Could not load the logs.</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(logEntriesQuery.error)}</p>
            <Button className="mt-2" type="button" variant="outline" onClick={() => void logEntriesQuery.refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <LogsFilterSidebar availableMethods={availableMethods} filters={filters} onChange={setFilters} onClear={() => setFilters(defaultLogsFilters)} />

          {logEntriesQuery.isLoading ? (
            <Card className="h-[32rem] animate-pulse bg-muted" />
          ) : showEmptyState ? (
            <EmptyState
              action={
                noActiveFilters ? undefined : (
                  <Button type="button" variant="outline" onClick={() => setFilters(defaultLogsFilters)}>
                    Clear filters
                  </Button>
                )
              }
              description={
                logEntriesQuery.data && logEntriesQuery.data.length > 0
                  ? "Try adjusting or clearing the filters to reveal more events."
                  : "The request journal is empty right now."
              }
              icon={ScrollTextIcon}
              title="No events found for the applied filters."
            />
          ) : (
            <LogsTimeline entries={filteredEntries} />
          )}
        </div>
      )}
    </div>
  );
}
