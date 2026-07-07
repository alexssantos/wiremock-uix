import { wireMockClient } from "@/shared/api/wiremock-client";
import type {
  FindStubMappingsByMetadataRequest,
  ImportStubMappingsRequest,
  StubMapping,
  StubMappingFilters,
  StubMappingsListResponse,
} from "@/entities/stub-mapping/model/types";

export function fetchStubMappings(filters: StubMappingFilters = {}, signal?: AbortSignal) {
  const searchParams = new URLSearchParams();

  if (typeof filters.page === "number" && typeof filters.pageSize === "number") {
    const page = Math.max(1, filters.page);
    const pageSize = Math.max(1, filters.pageSize);
    searchParams.set("limit", String(pageSize));
    searchParams.set("offset", String((page - 1) * pageSize));
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/__admin/mappings?${queryString}` : "/__admin/mappings";

  return wireMockClient.get<StubMappingsListResponse>(path, signal);
}

export function fetchStubMapping(id: string, signal?: AbortSignal) {
  return wireMockClient.get<StubMapping>(`/__admin/mappings/${id}`, signal);
}

export function createStubMapping(stubMapping: StubMapping) {
  return wireMockClient.post<StubMapping>("/__admin/mappings", stubMapping);
}

export function updateStubMapping(id: string, stubMapping: StubMapping) {
  return wireMockClient.put<StubMapping>(`/__admin/mappings/${id}`, stubMapping);
}

export function deleteStubMapping(id: string) {
  return wireMockClient.delete<void>(`/__admin/mappings/${id}`);
}

export function importStubMappings(payload: ImportStubMappingsRequest) {
  return wireMockClient.post<void>("/__admin/mappings/import", payload);
}

export function findStubMappingsByMetadata(matcher: FindStubMappingsByMetadataRequest, signal?: AbortSignal) {
  return wireMockClient.post<StubMappingsListResponse>("/__admin/mappings/find-by-metadata", matcher, signal);
}
