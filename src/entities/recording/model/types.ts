export type RecordingStatus = {
  status: "NeverStarted" | "Recording" | "Stopped";
};

export type RecordSpec = {
  targetBaseUrl: string;
  filters?: {
    urlPathPattern?: string;
    method?: string;
  };
  captureHeaders?: Record<string, { equalTo?: string }>;
  requestBodyPattern?: unknown;
  extractBodyCriteria?: unknown;
  persist?: boolean;
  repeatsAsScenarios?: boolean;
  transformers?: string[];
  transformerParameters?: Record<string, unknown>;
};

export type RecordingSnapshotResult = {
  mappings: unknown[];
};
