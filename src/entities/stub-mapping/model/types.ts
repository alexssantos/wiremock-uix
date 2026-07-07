import type { HttpMethod } from "@/shared/types/common";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type EqualToPattern = {
  equalTo: string;
  caseInsensitive?: boolean;
};

export type ContainsPattern = {
  contains: string;
};

export type MatchesPattern = {
  matches: string;
};

export type MatchesJsonPathPattern = {
  matchesJsonPath: string | ({ expression: string } & ContentPattern);
};

export type MatchesJsonSchemaPattern = {
  matchesJsonSchema: string | ({ expression: string } & ContentPattern);
  xPathNamespaces?: Record<string, string>;
};

export type MatchesXPathPattern = {
  matchesXPath: string | ({ expression: string } & ContentPattern);
  xPathNamespaces?: Record<string, string>;
};

export type EqualToXmlPattern = {
  equalToXml: string;
  enablePlaceholders?: boolean;
  placeholderOpeningDelimiterRegex?: string;
  placeholderClosingDelimiterRegex?: string;
};

export type EqualToJsonPattern = {
  equalToJson: string;
  ignoreArrayOrder?: boolean;
  ignoreExtraElements?: boolean;
};

export type BinaryEqualToPattern = {
  binaryEqualTo: string;
};

export type AbsentPattern = {
  absent: boolean;
};

export type AndPattern = {
  and: ContentPattern[];
};

export type OrPattern = {
  or: ContentPattern[];
};

export type NotPattern = {
  not: ContentPattern;
};

export type ContentPattern =
  | EqualToPattern
  | ContainsPattern
  | MatchesPattern
  | MatchesJsonPathPattern
  | MatchesJsonSchemaPattern
  | MatchesXPathPattern
  | EqualToXmlPattern
  | EqualToJsonPattern
  | BinaryEqualToPattern
  | AbsentPattern
  | AndPattern
  | OrPattern
  | NotPattern;

export type RequestPattern = {
  method?: HttpMethod;
  url?: string;
  urlPath?: string;
  urlPattern?: string;
  urlPathPattern?: string;
  queryParameters?: Record<string, ContentPattern>;
  headers?: Record<string, ContentPattern>;
  cookies?: Record<string, ContentPattern>;
  bodyPatterns?: ContentPattern[];
  pathParameters?: Record<string, ContentPattern>;
  formParameters?: Record<string, ContentPattern>;
  basicAuthCredentials?: {
    username: string;
    password: string;
  };
  host?: string;
  port?: number;
  scheme?: "http" | "https";
  customMatcher?: {
    name?: string;
    parameters?: JsonObject;
  };
  multipartPatterns?: Array<{
    name?: string;
    matchingType?: "ALL" | "ANY";
    headers?: Record<string, ContentPattern>;
    bodyPatterns?: ContentPattern[];
  }>;
};

export const stubMappingFaultValues = [
  "CONNECTION_RESET_BY_PEER",
  "EMPTY_RESPONSE",
  "MALFORMED_RESPONSE_CHUNK",
  "RANDOM_DATA_THEN_CLOSE",
] as const;

export type StubMappingFault = (typeof stubMappingFaultValues)[number];

export type LogNormalDelayDistribution = {
  type?: "lognormal";
  median: number;
  sigma: number;
};

export type UniformDelayDistribution = {
  type?: "uniform";
  lower: number;
  upper: number;
};

export type FixedDelayDistribution = {
  type?: "fixed";
  milliseconds: number;
};

export type DelayDistribution = LogNormalDelayDistribution | UniformDelayDistribution | FixedDelayDistribution;

export type ChunkedDribbleDelay = {
  numberOfChunks: number;
  totalDuration: number;
};

export type ResponseDefinition = {
  status?: number;
  statusMessage?: string;
  headers?: Record<string, string>;
  additionalProxyRequestHeaders?: Record<string, string>;
  removeProxyRequestHeaders?: string[];
  body?: string;
  base64Body?: string;
  jsonBody?: JsonValue;
  bodyFileName?: string;
  fault?: StubMappingFault;
  fixedDelayMilliseconds?: number;
  delayDistribution?: DelayDistribution;
  chunkedDribbleDelay?: ChunkedDribbleDelay;
  proxyBaseUrl?: string;
  proxyUrlPrefixToRemove?: string;
  transformerParameters?: JsonObject;
  transformers?: string[];
  fromConfiguredStub?: boolean;
};

export type ServeEventListenerDefinition = {
  name?: string;
  requestPhases?: Array<"BEFORE_MATCH" | "AFTER_MATCH" | "BEFORE_RESPONSE_SENT" | "AFTER_COMPLETE">;
  parameters?: JsonObject;
};

export type StubMapping = {
  id?: string;
  uuid?: string;
  name?: string;
  request?: RequestPattern;
  response?: ResponseDefinition;
  persistent?: boolean;
  priority?: number;
  scenarioName?: string;
  requiredScenarioState?: string;
  newScenarioState?: string;
  postServeActions?: Record<string, JsonObject>;
  serveEventListeners?: ServeEventListenerDefinition[];
  metadata?: JsonObject;
};

export type StubMappingsListResponse = {
  mappings: StubMapping[];
  meta: {
    total: number;
  };
};

export type StubMappingFilters = {
  method?: HttpMethod;
  urlSearch?: string;
  favoritesOnly?: boolean;
  page?: number;
  pageSize?: number;
};

export const stubMappingDuplicatePolicyValues = ["IGNORE", "OVERWRITE"] as const;

export type StubMappingDuplicatePolicy = (typeof stubMappingDuplicatePolicyValues)[number];

export type ImportStubMappingsRequest = {
  mappings: StubMapping[];
  importOptions?: {
    duplicatePolicy: StubMappingDuplicatePolicy;
    deleteAllNotInImport: boolean;
  };
};

export type FindStubMappingsByMetadataRequest = ContentPattern;

export const stubMappingUrlMatchTypeValues = ["url", "urlPath", "urlPattern", "urlPathPattern"] as const;

export type StubMappingUrlMatchType = (typeof stubMappingUrlMatchTypeValues)[number];

export const stubMappingRequestMatcherOperatorValues = [
  "equalTo",
  "contains",
  "matches",
  "matchesJsonPath",
  "absent",
] as const;

export type StubMappingRequestMatcherOperator = (typeof stubMappingRequestMatcherOperatorValues)[number];

export const stubMappingBodyMatcherOperatorValues = ["equalTo", "contains", "matchesJsonPath", "equalToJson"] as const;

export type StubMappingBodyMatcherOperator = (typeof stubMappingBodyMatcherOperatorValues)[number];

export const stubMappingResponseBodyModeValues = ["text", "json", "base64", "file"] as const;

export type StubMappingResponseBodyMode = (typeof stubMappingResponseBodyModeValues)[number];

export type StubMappingRequestMatcherDraft = {
  id: string;
  key: string;
  operator: StubMappingRequestMatcherOperator;
  value: string;
  caseInsensitive: boolean;
};

export type StubMappingBodyPatternDraft = {
  id: string;
  matcher: StubMappingBodyMatcherOperator;
  value: string;
  ignoreArrayOrder: boolean;
  ignoreExtraElements: boolean;
};

export type StubMappingResponseHeaderDraft = {
  id: string;
  key: string;
  value: string;
};

export type StubMappingFormDraft = {
  id?: string;
  uuid?: string;
  baseStub?: StubMapping;
  name: string;
  persistent: boolean;
  priority: number | null;
  scenarioName: string;
  requiredScenarioState: string;
  newScenarioState: string;
  metadataText: string;
  request: {
    method: HttpMethod;
    urlMatchType: StubMappingUrlMatchType;
    urlValue: string;
    headers: StubMappingRequestMatcherDraft[];
    queryParameters: StubMappingRequestMatcherDraft[];
    cookies: StubMappingRequestMatcherDraft[];
    bodyPatterns: StubMappingBodyPatternDraft[];
  };
  response: {
    status: number;
    statusMessage: string;
    headers: StubMappingResponseHeaderDraft[];
    bodyMode: StubMappingResponseBodyMode;
    bodyText: string;
    bodyJsonText: string;
    bodyBase64: string;
    bodyFileName: string;
    fixedDelayMilliseconds: number | null;
    fault: StubMappingFault | "";
    proxyBaseUrl: string;
  };
};
