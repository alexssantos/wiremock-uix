import type { ReactNode } from "react";
import { useMemo } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { env } from "@/shared/config/env";
import { useDashboardMetrics } from "@/entities/dashboard-metrics";
import { useServerHealth, useServerVersion } from "@/entities/server";
import {
  HttpMethodsChart,
  RequestsPerMinuteChart,
  StatusCodesChart,
  TopUrlsChart,
} from "@/widgets/dashboard-charts";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardPage() {
  const dashboardQuery = useDashboardMetrics();
  const healthQuery = useServerHealth();
  const versionQuery = useServerVersion();

  const handleRefresh = () => {
    void Promise.all([dashboardQuery.refetch(), healthQuery.refetch(), versionQuery.refetch()]);
  };

  const isInitialLoading = dashboardQuery.isPending && !dashboardQuery.data;
  const isServerUnreachable = !dashboardQuery.data && (dashboardQuery.isError || healthQuery.isError);
  const runtimeLabel = useMemo(
    () => formatUptime(healthQuery.data?.uptimeInSeconds),
    [healthQuery.data?.uptimeInSeconds]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Live metrics from ${env.wiremockBaseUrl}`}
        actions={
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw />
            Refresh
          </Button>
        }
      />

      {isInitialLoading ? <DashboardLoadingState /> : null}

      {isServerUnreachable ? (
        <>
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>WireMock is unreachable</AlertTitle>
            <AlertDescription>
              <p>We could not connect to the configured WireMock server.</p>
              <Button className="mt-2" onClick={handleRefresh} size="sm" variant="outline">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
          <EmptyState
            icon={TriangleAlert}
            title="No dashboard data is available"
            description="Start the WireMock server or verify the configured base URL, then refresh the page."
            action={
              <Button onClick={handleRefresh}>
                <RefreshCw />
                Retry connection
              </Button>
            }
          />
        </>
      ) : null}

      {!isInitialLoading && !isServerUnreachable && dashboardQuery.data ? (
        <>
          {healthQuery.data?.status && healthQuery.data.status !== "healthy" ? (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>WireMock reported an unhealthy status</AlertTitle>
              <AlertDescription>{healthQuery.data.message ?? "The server is reachable but reported a degraded state."}</AlertDescription>
            </Alert>
          ) : null}

          {dashboardQuery.data.requestJournalDisabled ? (
            <Alert>
              <TriangleAlert />
              <AlertTitle>Request journal is disabled</AlertTitle>
              <AlertDescription>
                Request-based charts may be incomplete until the WireMock request journal is enabled again.
              </AlertDescription>
            </Alert>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Stubs" value={dashboardQuery.data.metrics.totalStubMappings} />
            <MetricCard label="Total Requests" value={dashboardQuery.data.metrics.totalRequests} />
            <MetricCard label="Unmatched Requests" value={dashboardQuery.data.metrics.unmatchedRequests} />
            <MetricCard label="Near Misses" value={dashboardQuery.data.metrics.nearMissesCount} />
            <MetricCard label="Scenarios" value={dashboardQuery.data.metrics.scenariosCount} />
            <MetricCard
              label="Recording Status"
              value={
                <span className="flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      dashboardQuery.data.metrics.recordingActive ? "animate-pulse bg-destructive" : "bg-muted-foreground"
                    }`}
                  />
                  {dashboardQuery.data.metrics.recordingActive ? "Recording" : "Idle"}
                </span>
              }
              description={dashboardQuery.data.metrics.recordingActive ? "Traffic is being captured now." : "Recording is not active."}
            />
            <MetricCard
              label="Server Version"
              value={versionQuery.data?.version ?? "Unavailable"}
              description={versionQuery.isError ? "Unable to load the version endpoint." : undefined}
            />
            <MetricCard
              label="Server Runtime"
              value={runtimeLabel}
              description={`Memory usage: N/A${healthQuery.data?.timestamp ? ` • Last health check: ${healthQuery.data.timestamp}` : ""}`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <RequestsPerMinuteChart data={dashboardQuery.data.requestsPerMinute} />
            <HttpMethodsChart data={dashboardQuery.data.httpMethods} />
            <StatusCodesChart data={dashboardQuery.data.statusCodes} />
            <TopUrlsChart data={dashboardQuery.data.topUrls} />
          </section>
        </>
      ) : null}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
};

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {description ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

function DashboardLoadingState() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={`metric-skeleton-${index}`} className="gap-4">
            <CardHeader className="gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`chart-skeleton-${index}`}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-72 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}

function formatUptime(uptimeInSeconds: number | undefined): string {
  if (typeof uptimeInSeconds !== "number") {
    return "N/A";
  }

  if (uptimeInSeconds < 60) {
    return `${uptimeInSeconds}s`;
  }

  const hours = Math.floor(uptimeInSeconds / 3600);
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}
