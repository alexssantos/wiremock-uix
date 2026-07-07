import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { fetchServerHealth, fetchServerVersion } from "@/entities/server/api/server-api";

/**
 * Polls server health every 15s so the header status indicator reflects
 * connectivity/availability changes without manual refresh.
 */
export function useServerHealth() {
  return useQuery({
    queryKey: queryKeys.server.health(),
    queryFn: ({ signal }) => fetchServerHealth(signal),
    refetchInterval: 15_000,
    retry: 0,
  });
}

export function useServerVersion() {
  return useQuery({
    queryKey: queryKeys.server.version(),
    queryFn: ({ signal }) => fetchServerVersion(signal),
    staleTime: 5 * 60_000,
    retry: 0,
  });
}
