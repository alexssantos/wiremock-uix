import type { RecordingSnapshotResult, RecordingStatus, RecordSpec } from "@/entities/recording/model/types";
import { wireMockClient } from "@/shared/api/wiremock-client";

export async function startRecording(spec: RecordSpec) {
  await wireMockClient.post<void>("/__admin/recordings/start", spec);
}

export async function stopRecording(signal?: AbortSignal): Promise<RecordingSnapshotResult> {
  const response = await wireMockClient.post<RecordingSnapshotResult>("/__admin/recordings/stop", undefined, signal);
  return {
    mappings: response.mappings ?? [],
  };
}

export async function fetchRecordingStatus(signal?: AbortSignal): Promise<RecordingStatus> {
  const response = await wireMockClient.get<Partial<RecordingStatus>>("/__admin/recordings/status", signal);

  return {
    status: response.status ?? "NeverStarted",
  };
}

export async function takeSnapshot(spec?: Partial<RecordSpec>, signal?: AbortSignal): Promise<RecordingSnapshotResult> {
  const response = await wireMockClient.post<RecordingSnapshotResult>("/__admin/recordings/snapshot", spec, signal);
  return {
    mappings: response.mappings ?? [],
  };
}
