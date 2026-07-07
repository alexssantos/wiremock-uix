import { useQuery } from "@tanstack/react-query";
import { fetchAllScenarios } from "@/entities/scenario/api/scenario-api";
import { queryKeys } from "@/shared/api/query-keys";

export function useScenarios() {
  return useQuery({
    queryKey: queryKeys.scenarios.all,
    queryFn: ({ signal }) => fetchAllScenarios(signal),
    retry: 0,
  });
}
