export type DashboardMetrics = {
  totalStubMappings: number;
  totalRequests: number;
  unmatchedRequests: number;
  nearMissesCount: number;
  scenariosCount: number;
  recordingActive: boolean;
  serverVersion?: string;
};

export type RequestsPerMinutePoint = {
  minute: string;
  count: number;
};

export type HttpMethodCount = {
  method: string;
  count: number;
};

export type StatusCodeCount = {
  status: string;
  count: number;
};

export type TopUrlCount = {
  url: string;
  count: number;
};
