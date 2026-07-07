import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { fetchStubMapping, fetchStubMappings } from "@/entities/stub-mapping/api/stub-mapping-api";
import type { StubMappingFilters } from "@/entities/stub-mapping/model/types";

export function useStubMappings(filters: StubMappingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.stubMappings.list(filters),
    queryFn: ({ signal }) => fetchStubMappings(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useStubMapping(id?: string) {
  return useQuery({
    queryKey: queryKeys.stubMappings.detail(id ?? ""),
    queryFn: ({ signal }) => fetchStubMapping(id ?? "", signal),
    enabled: Boolean(id),
  });
}
