# 06 - TypeScript models derived from the WireMock OpenAPI

> Primary source: `components.schemas` from the official WireMock Admin API OpenAPI.  
> Controlled additions: when the OpenAPI only uses **inline schemas** or **examples** (cases such as `ServeEvent`, `NearMiss`, `StubImport`, `GlobalSettings`, and request journal responses), the types below normalize the contract for front-end implementation while preserving the administrative API names and JSON shapes.

## `src/shared/api/wiremock-admin/model/primitives.ts`

```typescript
/** UUID serialized by the WireMock administrative API. */
export type Uuid = string;

/** HTTP methods accepted by WireMock; the front end may accept custom extensions. */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | (string & {});

/** Primitive values accepted in metadata, parameters, and arbitrary payloads. */
export type JsonPrimitive = string | number | boolean | null;

/** Generic JSON object. */
export interface JsonObject {
  [key: string]: JsonValue;
}

/** Generic JSON array. */
export interface JsonArray extends Array<JsonValue> {}

/** Full union of JSON values. */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/** Shortcut for string maps. */
export type StringMap<T = string> = Record<string, T>;
```

## `src/entities/request-pattern/model/matchers.ts`

```typescript
import type { JsonObject } from '../../../shared/api/wiremock-admin/model/primitives';

/** Date/time expression accepted by WireMock temporal matchers. */
export type DateTimeExpression = string;

/** Mask used to convert the actual received value before temporal comparison. */
export type DateTimeFormat = string;

/** Official temporal truncation strategies exposed in the OpenAPI. */
export type Truncation =
  | 'first second of minute'
  | 'first minute of hour'
  | 'first hour of day'
  | 'first day of month'
  | 'first day of next month'
  | 'last day of month'
  | 'first day of year'
  | 'first day of next year'
  | 'last day of year';

/** Exact textual equality matcher. */
export interface EqualToPattern {
  /** Expected text value. */
  equalTo: string;
  /** When true, ignores case differences. */
  caseInsensitive?: boolean;
}

/** Binary equality matcher using base64. */
export interface BinaryEqualToPattern {
  /** Expected content encoded as base64. */
  binaryEqualTo: string;
}

/** Substring matcher. */
export interface ContainsPattern {
  /** Fragment that must exist in the actual value. */
  contains: string;
}

/** Negative substring matcher. */
export interface DoesNotContainPattern {
  /** Fragment that must not exist in the actual value. */
  doesNotContain: string;
}

/** Positive regex matcher. */
export interface MatchesPattern {
  /** Regular expression applied to the actual value. */
  matches: string;
}

/** Negative regex matcher. */
export interface DoesNotMatchPattern {
  /** Regular expression that must not match the actual value. */
  doesNotMatch: string;
}

/** Absence matcher. */
export interface AbsentPattern {
  /** When true, requires the attribute not to exist. */
  absent: boolean;
}

/** Temporal "before" matcher. */
export interface BeforePattern {
  /** Expected cutoff date/time. */
  before: DateTimeExpression;
  /** Format of the actual received value. */
  actualFormat?: DateTimeFormat;
  /** Truncation applied to the expected value. */
  truncateExpected?: Truncation;
  /** Truncation applied to the actual value. */
  truncateActual?: Truncation;
}

/** Temporal "after" matcher. */
export interface AfterPattern {
  /** Expected cutoff date/time. */
  after: DateTimeExpression;
  /** Format of the actual received value. */
  actualFormat?: DateTimeFormat;
  /** Truncation applied to the expected value. */
  truncateExpected?: Truncation;
  /** Truncation applied to the actual value. */
  truncateActual?: Truncation;
}

/** Temporal equality matcher. */
export interface EqualToDateTimePattern {
  /** Expected date/time. */
  equalToDateTime: DateTimeExpression;
  /** Format of the actual received value. */
  actualFormat?: DateTimeFormat;
  /** Truncation applied to the expected value. */
  truncateExpected?: Truncation;
  /** Truncation applied to the actual value. */
  truncateActual?: Truncation;
}

/** Structural equality matcher for JSON. */
export interface EqualToJsonPattern {
  /** Expected JSON document serialized as a string. */
  equalToJson: string;
  /** Ignores extra object properties. */
  ignoreExtraElements?: boolean;
  /** Ignores array ordering. */
  ignoreArrayOrder?: boolean;
}

/** Structural equality matcher for XML. */
export interface EqualToXmlPattern {
  /** Expected XML serialized as a string. */
  equalToXml: string;
  /** Enables placeholders in the expected XML. */
  enablePlaceholders?: boolean;
  /** Placeholder opening regex. */
  placeholderOpeningDelimiterRegex?: string;
  /** Placeholder closing regex. */
  placeholderClosingDelimiterRegex?: string;
}

/** Submatcher applicable to a JSONPath result. */
export type JsonPathNestedPattern = {
  /** JSONPath expression applied to the actual payload. */
  expression: string;
} & ContentPattern;

/** Simple or composite JSONPath matcher. */
export interface MatchesJsonPathPattern {
  /** Raw JSONPath or JSONPath followed by a submatcher. */
  matchesJsonPath: string | JsonPathNestedPattern;
}

/** Submatcher applicable to an XPath result. */
export type XPathNestedPattern = {
  /** XPath expression applied to the actual payload. */
  expression: string;
} & ContentPattern;

/** Simple or composite XPath matcher. */
export interface MatchesXPathPattern {
  /** Raw XPath or XPath followed by a submatcher. */
  matchesXPath: string | XPathNestedPattern;
  /** Namespaces used when evaluating the XPath. */
  xPathNamespaces?: Record<string, string>;
}

/** Submatcher applicable to a composite JSON Schema matcher result. */
export type JsonSchemaNestedPattern = {
  /** Expression associated with the composite schema. */
  expression: string;
} & ContentPattern;

/**
 * JSON Schema matcher.
 * The `xPathNamespaces` field is preserved exactly as it appears in the official OpenAPI,
 * even though it looks like an inherited artifact from the XPath matcher.
 */
export interface MatchesJsonSchemaPattern {
  /** Simple JSON Schema or composite form with `expression`. */
  matchesJsonSchema: string | JsonSchemaNestedPattern;
  /** Field kept to mirror the current OpenAPI exactly. */
  xPathNamespaces?: Record<string, string>;
}

/** Logical NOT matcher. */
export interface NotPattern {
  /** Nested matcher whose result will be inverted. */
  not: ContentPattern;
}

/** Logical AND matcher. */
export interface AndPattern {
  /** Every matcher in the list must match. */
  and: ContentPattern[];
}

/** Logical OR matcher. */
export interface OrPattern {
  /** At least one matcher in the list must match. */
  or: ContentPattern[];
}

/** Multivalue matcher with exact set equality. */
export interface HasExactlyPattern {
  /** List of matchers that must match the received values exactly. */
  hasExactly: ContentPattern[];
}

/** Inclusion-based multivalue matcher. */
export interface IncludesPattern {
  /** List of matchers that must be contained in the received values. */
  includes: ContentPattern[];
}

/** Official content matcher union exposed by the OpenAPI. */
export type ContentPattern =
  | EqualToPattern
  | BinaryEqualToPattern
  | ContainsPattern
  | DoesNotContainPattern
  | MatchesPattern
  | DoesNotMatchPattern
  | NotPattern
  | BeforePattern
  | AfterPattern
  | EqualToDateTimePattern
  | EqualToJsonPattern
  | MatchesJsonPathPattern
  | EqualToXmlPattern
  | MatchesXPathPattern
  | MatchesJsonSchemaPattern
  | AbsentPattern
  | AndPattern
  | OrPattern
  | HasExactlyPattern
  | IncludesPattern;

/** Convenient extension for arbitrary parameters passed to custom matchers. */
export type MatcherParameters = JsonObject;
```

## `src/entities/request-pattern/model/types.ts`

```typescript
import type { HttpMethod, JsonObject } from '../../../shared/api/wiremock-admin/model/primitives';
import type { ContentPattern, MatcherParameters } from './matchers';

/** Basic Auth credentials required by the matcher. */
export interface BasicAuthCredentials {
  /** Expected username. */
  username: string;
  /** Expected password. */
  password: string;
}

/** Custom matcher registered on the server. */
export interface CustomMatcherDefinition {
  /** Name of the custom matcher on the WireMock side. */
  name?: string;
  /** Arbitrary parameters consumed by the extension. */
  parameters?: MatcherParameters;
}

/** Evaluation strategy for multipart parts. */
export type MultipartMatchingType = 'ALL' | 'ANY';

/** Matching criterion for a single multipart part. */
export interface MultipartPattern {
  /** Multipart part name. */
  name?: string;
  /** Defines whether all or any conditions must match. */
  matchingType?: MultipartMatchingType;
  /** Matchers for multipart part headers. */
  headers?: Record<string, ContentPattern>;
  /** Matchers for the multipart part body. */
  bodyPatterns?: ContentPattern[];
}

/**
 * Main WireMock request matching DSL.
 * The `url`, `urlPattern`, `urlPath`, and `urlPathPattern` fields are mutually exclusive.
 */
export interface RequestPattern {
  /** Protocol of the received URL. */
  scheme?: 'http' | 'https';
  /** Expected hostname. */
  host?: string;
  /** Expected HTTP port. */
  port?: number;
  /** Expected HTTP method. */
  method?: HttpMethod;
  /** Full URL (path + query) with exact match. */
  url?: string;
  /** Path only with exact match. */
  urlPath?: string;
  /** Path only with regex. */
  urlPathPattern?: string;
  /** Full URL with regex. */
  urlPattern?: string;
  /** Matchers for named path parameters. */
  pathParameters?: Record<string, ContentPattern>;
  /** Matchers for query string parameters. */
  queryParameters?: Record<string, ContentPattern>;
  /** Matchers for `application/x-www-form-urlencoded` form fields. */
  formParameters?: Record<string, ContentPattern>;
  /** Matchers for headers. */
  headers?: Record<string, ContentPattern>;
  /** Expected Basic Auth credentials. */
  basicAuthCredentials?: BasicAuthCredentials;
  /** Matchers for cookies. */
  cookies?: Record<string, ContentPattern>;
  /** Matchers applied to the body. */
  bodyPatterns?: ContentPattern[];
  /** Custom request matcher. */
  customMatcher?: CustomMatcherDefinition;
  /** Multipart matchers. */
  multipartPatterns?: MultipartPattern[];
}

/** Useful alias for criteria reused in search, count, and removal. */
export type RequestCriteria = RequestPattern;

/** Generic metadata used by matchers and extensions. */
export type ArbitraryMetadata = JsonObject;
```

## `src/entities/response-definition/model/types.ts`

```typescript
import type { JsonObject, JsonValue, StringMap } from '../../../shared/api/wiremock-admin/model/primitives';

/** Low-level faults that WireMock can simulate instead of a valid HTTP response. */
export const Fault = {
  CONNECTION_RESET_BY_PEER: 'CONNECTION_RESET_BY_PEER',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
  MALFORMED_RESPONSE_CHUNK: 'MALFORMED_RESPONSE_CHUNK',
  RANDOM_DATA_THEN_CLOSE: 'RANDOM_DATA_THEN_CLOSE',
} as const;

/** Union of WireMock fault literals. */
export type Fault = (typeof Fault)[keyof typeof Fault];

/** Random delay with lognormal distribution. */
export interface LogNormalDelayDistribution {
  /** WireMock discriminator value. */
  type?: 'lognormal';
  /** Delay median in milliseconds. */
  median: number;
  /** Distribution sigma. */
  sigma: number;
}

/** Random delay with uniform distribution. */
export interface UniformDelayDistribution {
  /** WireMock discriminator value. */
  type?: 'uniform';
  /** Lower bound in milliseconds. */
  lower: number;
  /** Upper bound in milliseconds. */
  upper: number;
}

/** Fixed delay exposed as a distribution object. */
export interface FixedDelayDistribution {
  /** WireMock discriminator value. */
  type?: 'fixed';
  /** Fixed delay in milliseconds. */
  milliseconds: number;
}

/** Union of delay distributions accepted by the OpenAPI. */
export type DelayDistribution =
  | LogNormalDelayDistribution
  | UniformDelayDistribution
  | FixedDelayDistribution;

/** Configuration for chunked response streaming. */
export interface ChunkedDribbleDelay {
  /** Number of chunks sent. */
  numberOfChunks: number;
  /** Total stream duration in milliseconds. */
  totalDuration: number;
}

/**
 * WireMock response definition.
 * Only one of `body`, `base64Body`, `jsonBody`, and `bodyFileName` should be used.
 */
export interface ResponseDefinition {
  /** HTTP status returned to the client. */
  status?: number;
  /** Custom reason phrase. */
  statusMessage?: string;
  /** Mocked response headers. */
  headers?: StringMap<string>;
  /** Additional headers used during proxying. */
  additionalProxyRequestHeaders?: StringMap<string>;
  /** Headers removed before forwarding to the proxy. */
  removeProxyRequestHeaders?: string[];
  /** Inline text body. */
  body?: string;
  /** Inline binary body in base64. */
  base64Body?: string;
  /** Inline JSON body. */
  jsonBody?: JsonObject | JsonValue[];
  /** File name inside `__files`. */
  bodyFileName?: string;
  /** Simulated low-level fault. */
  fault?: Fault;
  /** Simple fixed delay in milliseconds. */
  fixedDelayMilliseconds?: number;
  /** Structured random delay. */
  delayDistribution?: DelayDistribution;
  /** Chunked dribble delay configuration. */
  chunkedDribbleDelay?: ChunkedDribbleDelay;
  /** Readonly flag indicating a default/unmatched response. */
  fromConfiguredStub?: boolean;
  /** Reverse proxy base URL. */
  proxyBaseUrl?: string;
  /** Path prefix removed before proxying. */
  proxyUrlPrefixToRemove?: string;
  /** Parameters passed to response transformers. */
  transformerParameters?: JsonObject;
  /** List of transformers applied to the response. */
  transformers?: string[];
}
```

## `src/entities/stub-mapping/model/types.ts`

```typescript
import type { JsonObject, Uuid } from '../../../shared/api/wiremock-admin/model/primitives';
import type { RequestPattern } from '../../request-pattern/model/types';
import type { ResponseDefinition } from '../../response-definition/model/types';

/** Request lifecycle phases observable by serve event listeners. */
export const RequestPhase = {
  BEFORE_MATCH: 'BEFORE_MATCH',
  AFTER_MATCH: 'AFTER_MATCH',
  BEFORE_RESPONSE_SENT: 'BEFORE_RESPONSE_SENT',
  AFTER_COMPLETE: 'AFTER_COMPLETE',
} as const;

/** Union of request-phase literals. */
export type RequestPhase = (typeof RequestPhase)[keyof typeof RequestPhase];

/** Configuration for a serve event listener attached to the stub. */
export interface ServeEventListenerDefinition {
  /** Name of the extension/listener registered on the server. */
  name?: string;
  /** Phases in which the listener should fire. */
  requestPhases?: RequestPhase[];
  /** Arbitrary parameters for the extension. */
  parameters?: JsonObject;
}

/** Post-serve action mapped by name. */
export type PostServeActions = Record<string, JsonObject>;

/** Core WireMock entity for defining stubs. */
export interface StubMapping {
  /** Canonical stub identifier. */
  id?: Uuid;
  /** Historical alias for `id`. */
  uuid?: Uuid;
  /** Human-friendly stub name. */
  name?: string;
  /** Request matching criteria. */
  request?: RequestPattern;
  /** Response returned when there is a match. */
  response?: ResponseDefinition;
  /** Persists immediately to the backing store when true. */
  persistent?: boolean;
  /** Relative priority; 1 is the highest. */
  priority?: number;
  /** Name of the scenario to which the stub belongs. */
  scenarioName?: string;
  /** Scenario state required for this stub to match. */
  requiredScenarioState?: string;
  /** Next scenario state after serving the response. */
  newScenarioState?: string;
  /** Post-serve actions by name. */
  postServeActions?: PostServeActions;
  /** Listeners attached to the serve event. */
  serveEventListeners?: ServeEventListenerDefinition[];
  /** Arbitrary stub metadata. */
  metadata?: JsonObject;
}

/** Paginated stub envelope returned by the administrative API. */
export interface StubMappingsResponse {
  /** Returned list of mappings. */
  mappings?: StubMapping[];
  /** Pagination metadata. */
  meta?: {
    /** Total number of records on the server. */
    total: number;
  };
}

/** Error item returned by `422` validations. */
export interface BadRequestErrorItem {
  /** Numeric error code. */
  code?: number;
  /** Field/source related to the error. */
  source?: string;
  /** Short error title. */
  title?: string;
  /** Descriptive problem detail. */
  detail?: string;
}

/** Standard WireMock validation error payload. */
export interface BadRequestEntity {
  /** Collection of errors found in the request. */
  errors?: BadRequestErrorItem[];
}
```

## `src/entities/serve-event/model/types.ts`

```typescript
import type { JsonObject, JsonValue, StringMap, Uuid } from '../../../shared/api/wiremock-admin/model/primitives';
import type { Fault, ResponseDefinition } from '../../response-definition/model/types';
import type { RequestPattern } from '../../request-pattern/model/types';
import type { StubMapping } from '../../stub-mapping/model/types';

/** Allowed value shape in serialized journal header maps. */
export type LoggedHeaderValue = string | string[] | JsonValue;

/** Flexible structure used by serialized journal cookies. */
export type LoggedCookieValue = string | JsonObject;

/** Multivalue representation used by serialized query/form params. */
export interface LoggedParameter {
  /** Logical parameter name. */
  key?: string;
  /** List of received values. */
  values?: string[];
}

/** Multipart part recorded in the journal. */
export interface LoggedMultipartPart {
  /** Multipart part name. */
  name?: string;
  /** Part headers. */
  headers?: Record<string, LoggedHeaderValue>;
  /** Text body of the part. */
  body?: string;
  /** Base64 body of the part. */
  bodyAsBase64?: string;
}

/**
 * Request recorded in the journal.
 * The official OpenAPI names only a few fields in `components.schemas.logged-request`,
 * so this contract combines the named schema with inline examples and the server's Published API.
 */
export interface LoggedRequest {
  /** Internal request ID in the journal. */
  id?: Uuid;
  /** Resolved request scheme. */
  scheme?: string;
  /** Resolved request host. */
  host?: string;
  /** Resolved request port. */
  port?: number;
  /** Original path + query. */
  url: string;
  /** Full absolute URL, when available. */
  absoluteUrl?: string | null;
  /** Received HTTP method. */
  method?: string;
  /** Client IP that originated the request. */
  clientIp?: string;
  /** Received headers. */
  headers?: Record<string, LoggedHeaderValue>;
  /** Server-decorated path parameters. */
  pathParams?: Record<string, string>;
  /** Received cookies. */
  cookies?: Record<string, LoggedCookieValue>;
  /** Query params serialized by the server. */
  queryParams?: Record<string, LoggedParameter>;
  /** Form params serialized by the server. */
  formParams?: Record<string, LoggedParameter>;
  /** Text body. */
  body?: string;
  /** Binary body in base64. */
  bodyAsBase64?: string;
  /** Indicates whether the request came from the browser proxy. */
  browserProxyRequest?: boolean;
  /** Record timestamp in epoch millis. */
  loggedDate?: number;
  /** ISO timestamp produced by WireMock. */
  loggedDateString?: string;
  /** Recorded multipart parts. */
  multiparts?: LoggedMultipartPart[];
  /** HTTP protocol (`HTTP/1.1`, `HTTP/2`, etc.). */
  protocol?: string;
}

/** Response effectively sent and logged by WireMock. */
export interface LoggedResponse {
  /** HTTP status sent to the client. */
  status?: number;
  /** Headers observed in the final response. */
  headers?: StringMap<string>;
  /** Serialized text body. */
  body?: string;
  /** Serialized binary body in base64. */
  bodyAsBase64?: string;
  /** Fault effectively applied, if any. */
  fault?: Fault;
  /** Indicates whether the response came from a proxy. */
  fromProxy?: boolean;
}

/** Timing metrics for a serve event. */
export interface ServeEventTiming {
  /** Delay added by a stub or global configuration. */
  addedDelay?: number | null;
  /** Time spent in internal processing. */
  processTime?: number | null;
  /** Time spent sending the response. */
  responseSendTime?: number | null;
  /** Total handling time without artificial delay. */
  serveTime?: number | null;
  /** Total handling time including artificial delay. */
  totalTime?: number | null;
}

/** Standard subevent types published by WireMock. */
export type ServeEventSubEventType =
  | 'REQUEST_NOT_MATCHED'
  | 'JSON_ERROR'
  | 'XML'
  | 'INFO'
  | 'WARNING'
  | 'ERROR'
  | (string & {});

/** Subevent serialized alongside the serve event. */
export interface ServeEventSubEvent {
  /** Subevent category. */
  type: ServeEventSubEventType;
  /** Time offset in nanos since processing started. */
  timeOffsetNanos?: number | null;
  /** Arbitrary subevent payload. */
  data?: JsonObject;
}

/** Matching/near-miss result returned by the server. */
export interface MatchResult {
  /** Matching distance; the lower, the closer to the ideal match. */
  distance: number;
  /** Some serializers may expose the exact-match flag. */
  exactMatch?: boolean;
}

/** Full WireMock journal event. */
export interface ServeEvent {
  /** Event ID. */
  id?: Uuid;
  /** Received request. */
  request: LoggedRequest;
  /** Associated stub; some older serializations may expose `mapping`. */
  stubMapping?: StubMapping;
  /** Defensive alias for legacy versions/serializations. */
  mapping?: StubMapping;
  /** ResponseDefinition resolved for the event. */
  responseDefinition?: ResponseDefinition;
  /** Response effectively sent. */
  response?: LoggedResponse;
  /** Indicates whether the event found a configured stub. */
  wasMatched?: boolean;
  /** Timing metrics. */
  timing?: ServeEventTiming;
  /** List of subevents generated during processing. */
  subEvents?: ServeEventSubEvent[];
}

/** Envelope used by `GET /__admin/requests`. */
export interface ServeEventsPage {
  /** Journal events returned on the current page. */
  requests?: ServeEvent[];
  /** Query metadata. */
  meta?: {
    /** Total number of records known by the server. */
    total?: number;
  };
  /** Indicates whether the journal is disabled. */
  requestJournalDisabled?: boolean;
}

/** Response used by searches that return only serialized requests. */
export interface LoggedRequestsResponse {
  /** Requests found for the criterion. */
  requests?: LoggedRequest[];
}

/** Near-miss structure used by similarity endpoints. */
export interface NearMiss {
  /** Actual request analyzed. */
  request?: LoggedRequest;
  /** Nearest stub when the comparison starts from an actual request. */
  stubMapping?: StubMapping;
  /** Nearest request pattern when the comparison starts from the journal. */
  requestPattern?: RequestPattern;
  /** Matching/distance result. */
  matchResult: MatchResult;
  /** Scenario state considered during the calculation. */
  scenarioState?: string | null;
}

/** Standard near-miss response envelope. */
export interface NearMissesResponse {
  /** Near-miss list ordered by proximity. */
  nearMisses?: NearMiss[];
}
```

## `src/entities/scenario/model/types.ts`

```typescript
import type { Uuid } from '../../../shared/api/wiremock-admin/model/primitives';

/** Scenario state maintained by WireMock. */
export interface Scenario {
  /** Scenario ID. */
  id?: Uuid;
  /** Scenario name. */
  name?: string;
  /** All known possible states. */
  possibleStates?: string[];
  /** Current state. */
  state?: string;
}

/** Response envelope for `/__admin/scenarios`. */
export interface ScenariosResponse {
  /** List of available scenarios. */
  scenarios?: Scenario[];
}
```

## `src/entities/recording/model/types.ts`

```typescript
import type { JsonObject, Uuid } from '../../../shared/api/wiremock-admin/model/primitives';
import type { RequestPattern } from '../../request-pattern/model/types';
import type { StubMapping, StubMappingsResponse } from '../../stub-mapping/model/types';

/** Configuration for selective header capture during recording/snapshot. */
export interface CaptureHeadersSpec {
  /** When true, compares the header case-insensitively. */
  caseInsensitive?: boolean;
}

/** Body extraction criteria for `__files`. */
export interface ExtractBodyCriteria {
  /** Threshold for binary bodies; accepts numbers and human-readable sizes. */
  binarySizeThreshold?: string;
  /** Threshold for text bodies; accepts numbers and human-readable sizes. */
  textSizeThreshold?: string;
}

/** Automatic body matcher configuration for recordings. */
export interface AutomaticRequestBodyPatternConfig {
  /** Automatic matcher discriminator. */
  matcher?: 'auto';
  /** Ignores array ordering when it falls back to `equalToJson`. */
  ignoreArrayOrder?: boolean;
  /** Ignores extra properties when it falls back to `equalToJson`. */
  ignoreExtraElements?: boolean;
  /** Ignores case when it falls back to `equalTo`. */
  caseInsensitive?: boolean;
}

/** Recording configuration that forces `equalTo`. */
export interface EqualToRequestBodyPatternConfig {
  /** Plain string matcher discriminator. */
  matcher: 'equalTo';
  /** Enables case-insensitive comparison. */
  caseInsensitive?: boolean;
}

/** Recording configuration that forces `equalToJson`. */
export interface EqualToJsonRequestBodyPatternConfig {
  /** JSON matcher discriminator. */
  matcher: 'equalToJson';
  /** Ignores array ordering. */
  ignoreArrayOrder?: boolean;
  /** Ignores extra elements. */
  ignoreExtraElements?: boolean;
}

/** Recording configuration that forces `equalToXml`. */
export interface EqualToXmlRequestBodyPatternConfig {
  /** XML matcher discriminator. */
  matcher: 'equalToXml';
}

/** Union of body matcher strategies during recording/snapshot. */
export type RecordingRequestBodyPatternConfig =
  | AutomaticRequestBodyPatternConfig
  | EqualToRequestBodyPatternConfig
  | EqualToJsonRequestBodyPatternConfig
  | EqualToXmlRequestBodyPatternConfig;

/** Filters used by recording and snapshot. */
export interface RecordingFilters extends RequestPattern {
  /** Specific serve event IDs to consider in the snapshot. */
  ids?: Uuid[];
  /** When true, allows including non-proxied events. */
  allowNonProxied?: boolean;
}

/** Output formats accepted by the snapshot formatter. */
export type SnapshotOutputFormat = 'FULL' | 'IDS';

/** Base options for generating stubs through recording/snapshot. */
export interface RecordSpec {
  /** Request/event filters to consider. */
  filters?: RecordingFilters;
  /** Request headers to capture in the generated stub. */
  captureHeaders?: Record<string, CaptureHeadersSpec>;
  /** Matcher strategy for the generated body. */
  requestBodyPattern?: RecordingRequestBodyPatternConfig;
  /** Criteria for moving bodies to `__files`. */
  extractBodyCriteria?: ExtractBodyCriteria;
  /** Snapshot response format. */
  outputFormat?: SnapshotOutputFormat;
  /** When true, persists the generated stubs to the backing store. */
  persist?: boolean;
  /** When true, repeated patterns become scenarios. */
  repeatsAsScenarios?: boolean;
  /** Transformers applied to the generated stubs. */
  transformers?: string[];
  /** Transformer parameters. */
  transformerParameters?: JsonObject;
}

/** Payload for starting proxy recording. */
export interface StartRecordingRequest extends RecordSpec {
  /** Target base URL to proxy/record. */
  targetBaseUrl: string;
}

/** Payload for taking a snapshot of the current journal. */
export interface SnapshotRecordingRequest extends RecordSpec {}

/** OpenAPI-documented states for the recording subsystem. */
export type RecordingStatus = 'NeverStarted' | 'Recording' | 'Stopped';

/** Response from `/__admin/recordings/status`. */
export interface RecordingStatusResponse {
  /** Current recording state. */
  status: RecordingStatus;
}

/** Generic error structure returned in enriched snapshots. */
export interface RecordError {
  /** Error type/category. */
  type?: string;
  /** UI-readable message. */
  message?: string;
  /** Additional details serialized by the server. */
  detail?: JsonObject;
}

/** Full snapshot response containing generated stubs. */
export interface SnapshotRecordResultFull {
  /** Full generated mappings. */
  mappings: StubMapping[];
  /** Possible transformation/recording errors. */
  errors?: RecordError[];
}

/** Compact snapshot response containing only IDs. */
export interface SnapshotRecordResultIds {
  /** IDs of the generated stubs. */
  ids: Uuid[];
  /** Possible transformation/recording errors. */
  errors?: RecordError[];
}

/** Union of the possible return formats in server snapshots. */
export type SnapshotRecordResult = SnapshotRecordResultFull | SnapshotRecordResultIds;

/** Useful alias for endpoints that return a stub list after recording. */
export type RecordingGeneratedMappingsResponse = StubMappingsResponse;
```

## `src/entities/settings/model/types.ts`

```typescript
import type { JsonObject } from '../../../shared/api/wiremock-admin/model/primitives';
import type { DelayDistribution } from '../../response-definition/model/types';

/**
 * Global server configuration.
 * `fixedDelay` and `delayDistribution` come from the official OpenAPI; `extended` and
 * `proxyPassThrough` reflect the server's Published API model to cover real-world scenarios.
 */
export interface GlobalSettings {
  /** Global fixed delay applied to responses. */
  fixedDelay?: number;
  /** Global random delay applied to responses. */
  delayDistribution?: DelayDistribution;
  /** Extra extensions/flags serialized by the server. */
  extended?: JsonObject;
  /** Enables proxy pass-through when supported/configured. */
  proxyPassThrough?: boolean;
}

/** Simple response from the version endpoint. */
export interface VersionResponse {
  /** Current WireMock Server version. */
  version: string;
}

/** Health states exposed by the OpenAPI. */
export type HealthStatus = 'healthy' | 'unhealthy';

/** Health endpoint response. */
export interface HealthResponse {
  /** High-level instance status. */
  status: HealthStatus;
  /** Detailed operator-facing message. */
  message?: string;
  /** Version of the running instance. */
  version?: string;
  /** Uptime in seconds. */
  uptimeInSeconds?: number;
  /** Current server timestamp. */
  timestamp?: string;
}
```

## `src/entities/files/model/types.ts`

```typescript
/** Relative name/path returned by `/__admin/files`. */
export type WireMockFileId = string;

/** File listing response. */
export type FilesListResponse = WireMockFileId[];

/** Raw content of a file in `__files`. */
export type FileContent = string;
```

## `src/features/stub-mappings/api/contracts.ts`

```typescript
import type { Uuid } from '../../../shared/api/wiremock-admin/model/primitives';
import type { ContentPattern } from '../../../entities/request-pattern/model/matchers';
import type { StubMapping, StubMappingsResponse, BadRequestEntity } from '../../../entities/stub-mapping/model/types';

/** Query string used to paginate the stub listing. */
export interface ListStubMappingsQuery {
  /** Maximum number of stubs returned by the server. */
  limit?: number;
  /** Initial offset for server-side pagination. */
  offset?: number;
}

/** Stub listing response. */
export type ListStubMappingsResponse = StubMappingsResponse;

/** Payload for creating a new stub. */
export type CreateStubMappingRequest = StubMapping;

/** Successful stub creation response. */
export type CreateStubMappingResponse = StubMapping;

/** Validation error for stub creation/editing. */
export type CreateOrUpdateStubMappingError = BadRequestEntity;

/** Bulk deletion response. */
export type DeleteAllStubMappingsResponse = void;

/** Stub reset response. */
export type ResetStubMappingsResponse = void;

/** Stub save/persist response. */
export type SaveStubMappingsResponse = void;

/** Official duplicate-handling literals used during import. */
export const DuplicatePolicy = {
  OVERWRITE: 'OVERWRITE',
  IGNORE: 'IGNORE',
} as const;

/** Union of duplicate-policy literals. */
export type DuplicatePolicy = (typeof DuplicatePolicy)[keyof typeof DuplicatePolicy];

/** Bulk import options. */
export interface ImportMappingsOptions {
  /** Strategy used when a duplicate stub is found. */
  duplicatePolicy?: DuplicatePolicy;
  /** Removes stubs that are missing from the imported package when true. */
  deleteAllNotInImport?: boolean;
}

/** Actual payload used by mapping import. */
export interface ImportMappingsRequest {
  /** List of stubs to import. */
  mappings: StubMapping[];
  /** Merge/overwrite options. */
  importOptions?: ImportMappingsOptions;
}

/** Mapping import response. */
export type ImportMappingsResponse = void;

/** Route parameter for fetching/editing/removing a specific stub. */
export interface StubMappingByIdParams {
  /** Stub mapping UUID. */
  stubMappingId: Uuid;
}

/** Single-stub read response. */
export type GetStubMappingByIdResponse = StubMapping;

/** Payload for single-stub update. */
export type UpdateStubMappingRequest = StubMapping;

/** Response for single-stub update. */
export type UpdateStubMappingResponse = StubMapping;

/** Response for single-stub deletion. */
export type DeleteStubMappingResponse = void;

/** Metadata search criterion. */
export type FindStubMappingsByMetadataRequest = ContentPattern;

/** Metadata-based stub search response. */
export type FindStubMappingsByMetadataResponse = StubMappingsResponse;

/** Metadata-based removal criterion. */
export type RemoveStubMappingsByMetadataRequest = ContentPattern;

/** Metadata-based removal response. */
export type RemoveStubMappingsByMetadataResponse = void;

/** Response for listing never-matched stubs. */
export type FindUnmatchedStubMappingsResponse = StubMappingsResponse;

/** Response for clearing never-matched stubs. */
export type RemoveUnmatchedStubMappingsResponse = void;
```

## `src/features/requests/api/contracts.ts`

```typescript
import type { Uuid } from '../../../shared/api/wiremock-admin/model/primitives';
import type { ContentPattern } from '../../../entities/request-pattern/model/matchers';
import type { RequestPattern } from '../../../entities/request-pattern/model/types';
import type { LoggedRequest, LoggedRequestsResponse, ServeEvent, ServeEventsPage } from '../../../entities/serve-event/model/types';

/** Query string for the main journal listing. */
export interface ListRequestsQuery {
  /** Maximum number of records returned. */
  limit?: number;
  /** Returns only requests after this ISO date/timestamp. */
  since?: string;
}

/** Response from `GET /__admin/requests`. */
export type ListRequestsResponse = ServeEventsPage;

/** Global journal deletion response. */
export type DeleteAllRequestsResponse = void;

/** Route parameter for fetching a journal item. */
export interface RequestByIdParams {
  /** UUID of the recorded request. */
  requestId: Uuid;
}

/** Detailed response for a journal request. */
export type GetRequestByIdResponse = ServeEvent;

/** Single journal entry deletion response. */
export type DeleteRequestByIdResponse = void;

/** Journal reset response. */
export type ResetRequestsResponse = void;

/** Shared criterion used by count/find/remove in the journal. */
export type RequestJournalCriteria = RequestPattern;

/** Payload for counting requests. */
export type CountRequestsRequest = RequestJournalCriteria;

/** Count response. */
export interface CountRequestsResponse {
  /** Number of requests matching the criterion. */
  count: number;
}

/** Payload for removing requests by criterion. */
export type RemoveRequestsByCriteriaRequest = RequestJournalCriteria;

/** Criterion-based removal response. */
export type RemoveRequestsByCriteriaResponse = LoggedRequestsResponse;

/** Payload for removing requests associated with metadata. */
export type RemoveRequestsByMetadataRequest = ContentPattern;

/** Metadata-based removal response. */
export type RemoveRequestsByMetadataResponse = LoggedRequestsResponse;

/** Payload for searching requests by criterion. */
export type FindRequestsRequest = RequestJournalCriteria;

/** Criterion-based search response. */
export type FindRequestsResponse = LoggedRequestsResponse;

/** Response for listing unmatched requests. */
export type FindUnmatchedRequestsResponse = LoggedRequestsResponse;
```

## `src/features/near-misses/api/contracts.ts`

```typescript
import type { RequestPattern } from '../../../entities/request-pattern/model/types';
import type { LoggedRequest, NearMissesResponse } from '../../../entities/serve-event/model/types';

/** Aggregated near-miss response for all unmatched requests. */
export type GetUnmatchedNearMissesResponse = NearMissesResponse;

/** Payload for comparing a concrete request against existing stubs. */
export type FindNearMissesByRequestRequest = LoggedRequest;

/** Response for request -> stubs comparison. */
export type FindNearMissesByRequestResponse = NearMissesResponse;

/** Payload for comparing a request pattern against actual journal requests. */
export type FindNearMissesByRequestPatternRequest = RequestPattern;

/** Response for request pattern -> journal comparison. */
export type FindNearMissesByRequestPatternResponse = NearMissesResponse;
```

## `src/features/recording/api/contracts.ts`

```typescript
import type {
  RecordingGeneratedMappingsResponse,
  RecordingStatusResponse,
  SnapshotRecordResult,
  SnapshotRecordingRequest,
  StartRecordingRequest,
} from '../../../entities/recording/model/types';

/** Payload for starting recording mode. */
export type StartRecordingApiRequest = StartRecordingRequest;

/** Response for starting recording mode. */
export type StartRecordingApiResponse = void;

/** Response for stopping the recording session. */
export type StopRecordingApiResponse = RecordingGeneratedMappingsResponse;

/** Response from the recording status endpoint. */
export type GetRecordingStatusApiResponse = RecordingStatusResponse;

/** Journal snapshot payload. */
export type SnapshotRecordingApiRequest = SnapshotRecordingRequest;

/**
 * The current OpenAPI exemplifies `mappings`, while the Published API model also accepts
 * the `ids` format; for that reason, the front end can support both.
 */
export type SnapshotRecordingApiResponse =
  | RecordingGeneratedMappingsResponse
  | SnapshotRecordResult;
```

## `src/features/scenarios/api/contracts.ts`

```typescript
import type { ScenariosResponse } from '../../../entities/scenario/model/types';

/** Scenario listing response. */
export type GetScenariosResponse = ScenariosResponse;

/** Global scenario reset response. */
export type ResetScenariosResponse = void;
```

## `src/features/files/api/contracts.ts`

```typescript
import type { FileContent, FilesListResponse, WireMockFileId } from '../../../entities/files/model/types';

/** Response for listing files in `__files`. */
export type ListFilesResponse = FilesListResponse;

/** Route parameters for operations on a specific file. */
export interface FileByIdParams {
  /** Relative file name/path. */
  fileId: WireMockFileId;
}

/** Single-file read response. */
export type GetFileByIdResponse = FileContent;

/** Payload for updating/creating a file. */
export type UpdateFileByIdRequest = string | ArrayBuffer | Uint8Array;

/** Response for updating/creating a file. */
export type UpdateFileByIdResponse = string;

/** Response for deleting a file. */
export type DeleteFileByIdResponse = void;
```

## `src/features/settings/api/contracts.ts`

```typescript
import type { GlobalSettings, HealthResponse, VersionResponse } from '../../../entities/settings/model/types';

/** Payload for updating global settings. */
export type UpdateGlobalSettingsRequest = GlobalSettings;

/** Response for updating settings. */
export type UpdateGlobalSettingsResponse = void;

/** Response for broad mappings + journal reset. */
export type ResetMappingsAndJournalResponse = void;

/** Response for administrative server shutdown. */
export type ShutdownServerResponse = void;

/** Response from the version endpoint. */
export type GetVersionResponse = VersionResponse;

/** Response from the health endpoint. */
export type GetHealthResponse = HealthResponse;
```

## Adopted naming convention

- **Interfaces and aliases** use **PascalCase** (`StubMapping`, `FindRequestsResponse`, `RecordingStatusResponse`).
- **No `I` prefix** for interfaces.
- **Fields use camelCase**, mirroring the administrative API JSON exactly (`requestJournalDisabled`, `newScenarioState`, `fixedDelayMilliseconds`).
- **String literal unions and `as const` objects** preserve the official WireMock literals (`Fault`, `RequestPhase`, `RecordingStatus`, `DuplicatePolicy`).
- Supplementary types created for inline schemas use explicit domain names (`ServeEventsPage`, `LoggedRequestsResponse`, `SnapshotRecordResult`) to make consumption easier in React Query and forms.
