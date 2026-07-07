/** Response shape of GET /__admin/health. */
export type ServerHealth = {
  status: "healthy" | "unhealthy" | string;
  message?: string;
  version?: string;
  uptimeInSeconds?: number;
  timestamp?: string;
};

/** Response shape of GET /__admin/version. */
export type ServerVersion = {
  version: string;
};
