import type { LoggedRequest } from "@/entities/serve-event";

export type NearMissStubMapping = {
  id?: string;
  name?: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
};

export type NearMiss = {
  request: LoggedRequest;
  stubMapping?: NearMissStubMapping;
  requestPattern?: Record<string, unknown>;
  matchResult: {
    distance: number;
  };
};

export type NearMissesResponse = {
  nearMisses: NearMiss[];
};
