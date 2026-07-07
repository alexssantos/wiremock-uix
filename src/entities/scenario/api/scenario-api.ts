import type { Scenario } from "@/entities/scenario/model/types";
import { wireMockClient } from "@/shared/api/wiremock-client";

type ScenariosResponse = {
  scenarios?: Array<{
    id?: string;
    name?: string;
    possibleStates?: string[];
    state?: string;
  }>;
};

export async function fetchAllScenarios(signal?: AbortSignal): Promise<Scenario[]> {
  const response = await wireMockClient.get<ScenariosResponse>("/__admin/scenarios", signal);

  return (response.scenarios ?? []).map((scenario, index) => {
    const state = scenario.state?.trim() || "Started";
    const possibleStates = dedupeStates([...(scenario.possibleStates ?? []), state]);

    return {
      id: scenario.id?.trim() || scenario.name?.trim() || `scenario-${index + 1}`,
      name: scenario.name?.trim() || `Scenario ${index + 1}`,
      possibleStates,
      state,
    };
  });
}

export async function resetAllScenarios() {
  return wireMockClient.post<void>("/__admin/scenarios/reset");
}

function dedupeStates(states: string[]): string[] {
  return Array.from(new Set(states.map((state) => state.trim()).filter((state) => state.length > 0)));
}
