import type { GlobalSettings } from "@/entities/settings/model/types";
import { wireMockClient } from "@/shared/api/wiremock-client";

/**
 * WireMock exposes POST /__admin/settings to update settings, but there is no
 * documented GET endpoint to retrieve the current state. The UI therefore
 * starts from local defaults and only persists changes when the operator saves.
 */
export function updateGlobalSettings(settings: GlobalSettings) {
  return wireMockClient.post<void>("/__admin/settings", settings);
}
