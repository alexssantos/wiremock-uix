import { useQuery } from "@tanstack/react-query";
import { fetchRecordingStatus } from "@/entities/recording/api/recording-api";
import { queryKeys } from "@/shared/api/query-keys";

export function useRecordingStatus(enabled = true) {
  return useQuery({
    queryKey: queryKeys.recording.status(),
    queryFn: ({ signal }) => fetchRecordingStatus(signal),
    enabled,
    refetchInterval: enabled ? 3_000 : false,
    retry: 0,
  });
}
