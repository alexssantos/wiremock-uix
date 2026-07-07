import { useState } from "react";
import { FileJson, RefreshCw, TriangleAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { RecordingSnapshotResult, RecordingStatus } from "@/entities/recording";
import { useRecordingStatus } from "@/entities/recording";
import { RecordingControls, StartRecordingDialog } from "@/features/control-recording";
import { queryKeys } from "@/shared/api/query-keys";
import { wireMockClient } from "@/shared/api/wiremock-client";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { JsonEditor } from "@/shared/ui/json-editor";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";

export function RecordingPage() {
  const queryClient = useQueryClient();
  const recordingStatusQuery = useRecordingStatus();
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [snapshotPreview, setSnapshotPreview] = useState<unknown[]>([]);
  const [previewSource, setPreviewSource] = useState<"snapshot" | "stop" | null>(null);
  const [isPersistingPreview, setIsPersistingPreview] = useState(false);
  const [hasPersistedPreview, setHasPersistedPreview] = useState(false);

  const handleSnapshotReady = (result: RecordingSnapshotResult, source: "snapshot" | "stop") => {
    setSnapshotPreview(result.mappings);
    setPreviewSource(source);
    setHasPersistedPreview(false);
  };

  const handlePersistPreview = async () => {
    if (snapshotPreview.length === 0 || isPersistingPreview) {
      return;
    }

    setIsPersistingPreview(true);
    let persistedCount = 0;

    try {
      for (const mapping of snapshotPreview) {
        await wireMockClient.post("/__admin/mappings", mapping);
        persistedCount += 1;
      }

      setHasPersistedPreview(true);
      toast.success(`Persisted ${persistedCount} mappings to WireMock.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stubMappings.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.all }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to persist the generated mappings.";
      toast.error(
        persistedCount > 0
          ? `Persisted ${persistedCount} mappings before the request failed. ${message}`
          : message
      );
    } finally {
      setIsPersistingPreview(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recording"
        description="Capture real upstream traffic and convert it into WireMock stub mappings."
      />

      {recordingStatusQuery.isPending && !recordingStatusQuery.data ? <RecordingLoadingState /> : null}

      {recordingStatusQuery.isError && !recordingStatusQuery.data ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Unable to load recording status</AlertTitle>
          <AlertDescription>
            <p>{recordingStatusQuery.error instanceof Error ? recordingStatusQuery.error.message : "The recording subsystem is not reachable."}</p>
            <Button className="mt-2" onClick={() => recordingStatusQuery.refetch()} size="sm" variant="outline">
              <RefreshCw />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!recordingStatusQuery.isPending && recordingStatusQuery.data ? (
        <>
          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle>Recording status</CardTitle>
                  <CardDescription>Polled every 3 seconds while this page stays open.</CardDescription>
                </div>
                <Badge
                  className={cn(
                    recordingStatusQuery.data.status === "Recording"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                  variant="secondary"
                >
                  {recordingStatusQuery.data.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-2xl font-semibold">
                <span
                  className={cn(
                    "size-3 rounded-full",
                    recordingStatusQuery.data.status === "Recording"
                      ? "animate-pulse bg-destructive"
                      : "bg-muted-foreground"
                  )}
                />
                {getRecordingStatusCopy(recordingStatusQuery.data.status)}
              </div>
            </CardContent>
          </Card>

          <RecordingControls
            isLoading={recordingStatusQuery.isFetching}
            onSnapshotReady={(result) => handleSnapshotReady(result, "snapshot")}
            onStartRequested={() => setIsStartDialogOpen(true)}
            onStopReady={(result) => handleSnapshotReady(result, "stop")}
            status={recordingStatusQuery.data.status}
          />

          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle>Snapshot preview</CardTitle>
                  <CardDescription>
                    {previewSource
                      ? `Generated from the latest ${previewSource === "snapshot" ? "snapshot" : "stop recording"} action.`
                      : "Review generated mappings before sending them to /__admin/mappings."}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{snapshotPreview.length} mappings</Badge>
                  <Button
                    disabled={snapshotPreview.length === 0 || isPersistingPreview || hasPersistedPreview}
                    onClick={() => void handlePersistPreview()}
                    variant="outline"
                  >
                    {hasPersistedPreview
                      ? "Mappings persisted"
                      : isPersistingPreview
                        ? "Persisting..."
                        : "Persist all mappings"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Persisting the preview sends each generated mapping directly to the WireMock admin API.
              </p>

              {hasPersistedPreview ? (
                <Alert>
                  <FileJson />
                  <AlertTitle>Preview persisted</AlertTitle>
                  <AlertDescription>The generated mappings were already sent to WireMock.</AlertDescription>
                </Alert>
              ) : null}

              {snapshotPreview.length === 0 ? (
                <EmptyState
                  icon={FileJson}
                  title="No snapshot preview yet"
                  description="Start recording, then stop or snapshot the session to inspect generated stub mappings here."
                />
              ) : (
                <div className="space-y-4">
                  {snapshotPreview.map((mapping, index) => (
                    <div key={`snapshot-preview-${index}`} className="overflow-hidden rounded-lg border">
                      <div className="border-b bg-muted/40 px-4 py-2 text-sm font-medium">
                        Mapping {index + 1}
                      </div>
                      <JsonEditor height={220} readOnly value={JSON.stringify(mapping, null, 2)} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      <StartRecordingDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen} />
    </div>
  );
}

function RecordingLoadingState() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-48" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </>
  );
}

function getRecordingStatusCopy(status: RecordingStatus["status"]): string {
  if (status === "Recording") {
    return "Recording is active";
  }

  if (status === "Stopped") {
    return "Recording is stopped";
  }

  return "Recording has not started yet";
}
