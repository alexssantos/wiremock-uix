import { wireMockClient } from "@/shared/api/wiremock-client";
import type { ServerHealth, ServerVersion } from "@/entities/server/model/types";

export function fetchServerHealth(signal?: AbortSignal) {
  return wireMockClient.get<ServerHealth>("/__admin/health", signal);
}

export function fetchServerVersion(signal?: AbortSignal) {
  return wireMockClient.get<ServerVersion>("/__admin/version", signal);
}
