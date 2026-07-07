import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { startRecording, stopRecording, takeSnapshot } from "@/entities/recording/api/recording-api";
import type { RecordSpec } from "@/entities/recording/model/types";
import { queryKeys } from "@/shared/api/query-keys";

export function useStartRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (spec: RecordSpec) => startRecording(spec),
    onSuccess: async () => {
      toast.success("Recording started.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.recording.status() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to start recording."));
    },
  });
}

export function useStopRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => stopRecording(),
    onSuccess: async () => {
      toast.success("Recording stopped. Captured mappings are ready for review.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.recording.status() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to stop recording."));
    },
  });
}

export function useTakeSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (spec?: Partial<RecordSpec>) => takeSnapshot(spec),
    onSuccess: async () => {
      toast.success("Snapshot captured.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.recording.status() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to capture a snapshot."));
    },
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
