import { useQuery } from "@tanstack/react-query";
import { fetchLogEntries } from "@/entities/log-entry/api/log-entry-api";
import { queryKeys } from "@/shared/api/query-keys";

export function useLogEntries() {
  return useQuery({
    queryKey: queryKeys.requests.journal({ source: "logs" }),
    queryFn: ({ signal }) => fetchLogEntries(signal),
  });
}
