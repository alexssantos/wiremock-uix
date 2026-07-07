import { useQuery } from "@tanstack/react-query";
import { fetchNearMissesForUnmatchedRequests } from "@/entities/near-miss/api/near-miss-api";
import { queryKeys } from "@/shared/api/query-keys";

export function useNearMissesForUnmatched() {
  return useQuery({
    queryKey: queryKeys.nearMisses.forUnmatched(),
    queryFn: ({ signal }) => fetchNearMissesForUnmatchedRequests(signal),
    select: (data) => ({
      nearMisses: [...data.nearMisses].sort((left, right) => left.matchResult.distance - right.matchResult.distance),
    }),
  });
}
