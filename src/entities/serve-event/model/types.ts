import type { HttpMethod } from "@/shared/types/common";

export type HeaderMap = Record<string, string>;
export type CookieMap = Record<string, string>;

export type LoggedRequest = {
  id?: string;
  method: HttpMethod | string;
  url: string;
  absoluteUrl?: string | null;
  headers?: HeaderMap;
  cookies?: CookieMap;
  body?: string;
  bodyAsBase64?: string;
  browserProxyRequest?: boolean;
  loggedDate?: number;
  loggedDateString?: string;
  clientIp?: string;
};

export type LoggedResponse = {
  status?: number;
  headers?: HeaderMap;
  body?: string;
  bodyAsBase64?: string;
  fault?: string;
};

export type ResponseDefinition = {
  status?: number;
  headers?: HeaderMap;
  body?: string;
  bodyAsBase64?: string;
  jsonBody?: unknown;
  fault?: string;
  fromConfiguredStub?: boolean;
  transformerParameters?: Record<string, unknown>;
};

export type ServeEventStubMapping = {
  id?: string;
  name?: string;
};

export type ServeEventTiming = {
  addedDelay?: number | null;
  processTime?: number | null;
  responseSendTime?: number | null;
  serveTime?: number | null;
  totalTime?: number | null;
};

export type ServeEvent = {
  id: string;
  request: LoggedRequest;
  responseDefinition?: ResponseDefinition;
  response?: LoggedResponse;
  wasMatched: boolean;
  stubMapping?: ServeEventStubMapping;
  timing?: ServeEventTiming;
};

export type RequestJournalCriteria = {
  method?: HttpMethod | string;
  urlPathPattern?: string;
  matched?: boolean;
  limit?: number;
  since?: string;
};

export type RequestJournalListResponse = {
  requests: ServeEvent[];
  meta: {
    total: number;
  };
  requestJournalDisabled?: boolean;
};

export type LoggedRequestListResponse = {
  requests: LoggedRequest[];
  meta?: {
    total: number;
  };
};

export type CountRequestsResponse = {
  count: number;
};
