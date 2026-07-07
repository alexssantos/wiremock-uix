import type { RecordingSnapshotResult, RecordingStatus } from "@/entities/recording";
import { useStopRecording, useTakeSnapshot } from "@/entities/recording";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

type RecordingControlsProps = {
  status?: RecordingStatus["status"];
  isLoading?: boolean;
  onStartRequested: () => void;
  onSnapshotReady: (result: RecordingSnapshotResult) => void;
  onStopReady: (result: RecordingSnapshotResult) => void;
};

export function RecordingControls({
  status,
  isLoading = false,
  onStartRequested,
  onSnapshotReady,
  onStopReady,
}: RecordingControlsProps) {
  const stopRecordingMutation = useStopRecording();
  const snapshotMutation = useTakeSnapshot();

  const isRecording = status === "Recording";
  const isBusy = isLoading || stopRecordingMutation.isPending || snapshotMutation.isPending;

  const handleStop = async () => {
    const result = await stopRecordingMutation.mutateAsync();
    onStopReady(result);
  };

  const handleSnapshot = async () => {
    const result = await snapshotMutation.mutateAsync({ persist: false });
    onSnapshotReady(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
        <CardDescription>Start, stop, or snapshot the current recording session.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button disabled={isBusy || isRecording} onClick={onStartRequested}>
          Start recording
        </Button>
        <Button disabled={isBusy || !isRecording} onClick={() => void handleStop()} variant="outline">
          {stopRecordingMutation.isPending ? "Stopping..." : "Stop recording"}
        </Button>
        <Button disabled={isBusy || !isRecording} onClick={() => void handleSnapshot()} variant="secondary">
          {snapshotMutation.isPending ? "Capturing..." : "Take snapshot"}
        </Button>
      </CardContent>
    </Card>
  );
}
