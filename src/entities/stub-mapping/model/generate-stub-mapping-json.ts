import type {
  ContentPattern,
  EqualToJsonPattern,
  JsonObject,
  JsonValue,
  RequestPattern,
  ResponseDefinition,
  StubMapping,
  StubMappingBodyPatternDraft,
  StubMappingFormDraft,
  StubMappingRequestMatcherDraft,
  StubMappingResponseHeaderDraft,
} from "@/entities/stub-mapping/model/types";

function parseJsonValue(text: string): JsonValue | undefined {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return undefined;
  }

  try {
    return JSON.parse(normalizedText) as JsonValue;
  } catch {
    return undefined;
  }
}

function parseJsonObject(text: string): JsonObject | undefined {
  const parsedValue = parseJsonValue(text);
  if (!parsedValue || Array.isArray(parsedValue) || typeof parsedValue !== "object") {
    return undefined;
  }

  return parsedValue;
}

function buildRequestMatcher(row: StubMappingRequestMatcherDraft): ContentPattern {
  switch (row.operator) {
    case "equalTo":
      return {
        equalTo: row.value,
        caseInsensitive: row.caseInsensitive || undefined,
      };
    case "contains":
      return { contains: row.value };
    case "matches":
      return { matches: row.value };
    case "matchesJsonPath":
      return { matchesJsonPath: row.value };
    case "absent":
      return { absent: true };
    default:
      return { equalTo: row.value };
  }
}

function buildBodyPattern(row: StubMappingBodyPatternDraft): ContentPattern {
  switch (row.matcher) {
    case "equalTo":
      return { equalTo: row.value };
    case "contains":
      return { contains: row.value };
    case "matchesJsonPath":
      return { matchesJsonPath: row.value };
    case "equalToJson": {
      const pattern: EqualToJsonPattern = {
        equalToJson: row.value,
      };

      if (row.ignoreArrayOrder) {
        pattern.ignoreArrayOrder = true;
      }

      if (row.ignoreExtraElements) {
        pattern.ignoreExtraElements = true;
      }

      return pattern;
    }
    default:
      return { equalTo: row.value };
  }
}

function buildMatcherMap(rows: StubMappingRequestMatcherDraft[]): Record<string, ContentPattern> | undefined {
  const entries = rows
    .map((row) => ({
      key: row.key.trim(),
      matcher: buildRequestMatcher(row),
    }))
    .filter((row) => row.key.length > 0);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries.map((entry) => [entry.key, entry.matcher]));
}

function buildResponseHeaders(rows: StubMappingResponseHeaderDraft[]): Record<string, string> | undefined {
  const entries = rows
    .map((row) => ({
      key: row.key.trim(),
      value: row.value,
    }))
    .filter((row) => row.key.length > 0);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
}

function buildRequest(values: StubMappingFormDraft): RequestPattern {
  const request: RequestPattern = {
    ...(values.baseStub?.request ?? {}),
    method: values.request.method,
  };

  delete request.url;
  delete request.urlPath;
  delete request.urlPattern;
  delete request.urlPathPattern;

  const urlValue = values.request.urlValue.trim();
  if (urlValue) {
    request[values.request.urlMatchType] = urlValue;
  }

  const headers = buildMatcherMap(values.request.headers);
  if (headers) {
    request.headers = headers;
  } else {
    delete request.headers;
  }

  const queryParameters = buildMatcherMap(values.request.queryParameters);
  if (queryParameters) {
    request.queryParameters = queryParameters;
  } else {
    delete request.queryParameters;
  }

  const cookies = buildMatcherMap(values.request.cookies);
  if (cookies) {
    request.cookies = cookies;
  } else {
    delete request.cookies;
  }

  const bodyPatterns = values.request.bodyPatterns
    .map((pattern) => ({ matcher: buildBodyPattern(pattern), value: pattern.value.trim() }))
    .filter((pattern) => pattern.value.length > 0)
    .map((pattern) => pattern.matcher);

  if (bodyPatterns.length > 0) {
    request.bodyPatterns = bodyPatterns;
  } else {
    delete request.bodyPatterns;
  }

  return request;
}

function buildResponse(values: StubMappingFormDraft): ResponseDefinition {
  const response: ResponseDefinition = {
    ...(values.baseStub?.response ?? {}),
    status: values.response.status,
  };

  delete response.body;
  delete response.base64Body;
  delete response.jsonBody;
  delete response.bodyFileName;

  const statusMessage = values.response.statusMessage.trim();
  if (statusMessage) {
    response.statusMessage = statusMessage;
  } else {
    delete response.statusMessage;
  }

  const headers = buildResponseHeaders(values.response.headers);
  if (headers) {
    response.headers = headers;
  } else {
    delete response.headers;
  }

  if (typeof values.response.fixedDelayMilliseconds === "number") {
    response.fixedDelayMilliseconds = values.response.fixedDelayMilliseconds;
  } else {
    delete response.fixedDelayMilliseconds;
  }

  if (values.response.fault) {
    response.fault = values.response.fault;
  } else {
    delete response.fault;
  }

  const proxyBaseUrl = values.response.proxyBaseUrl.trim();
  if (proxyBaseUrl) {
    response.proxyBaseUrl = proxyBaseUrl;
  } else {
    delete response.proxyBaseUrl;
  }

  if (values.response.bodyMode === "text" && values.response.bodyText.length > 0) {
    response.body = values.response.bodyText;
  }

  if (values.response.bodyMode === "json") {
    const jsonBody = parseJsonValue(values.response.bodyJsonText);
    if (jsonBody !== undefined) {
      response.jsonBody = jsonBody;
    }
  }

  if (values.response.bodyMode === "base64") {
    const base64Body = values.response.bodyBase64.trim();
    if (base64Body) {
      response.base64Body = base64Body;
    }
  }

  if (values.response.bodyMode === "file") {
    const bodyFileName = values.response.bodyFileName.trim();
    if (bodyFileName) {
      response.bodyFileName = bodyFileName;
    }
  }

  return response;
}

export function generateStubMappingJson(values: StubMappingFormDraft): StubMapping {
  const stubMapping: StubMapping = {
    ...(values.baseStub ?? {}),
    request: buildRequest(values),
    response: buildResponse(values),
    persistent: values.persistent,
  };

  const id = values.id?.trim();
  if (id) {
    stubMapping.id = id;
  } else {
    delete stubMapping.id;
  }

  const uuid = values.uuid?.trim();
  if (uuid) {
    stubMapping.uuid = uuid;
  } else {
    delete stubMapping.uuid;
  }

  const name = values.name.trim();
  if (name) {
    stubMapping.name = name;
  } else {
    delete stubMapping.name;
  }

  if (typeof values.priority === "number") {
    stubMapping.priority = values.priority;
  } else {
    delete stubMapping.priority;
  }

  const scenarioName = values.scenarioName.trim();
  if (scenarioName) {
    stubMapping.scenarioName = scenarioName;
  } else {
    delete stubMapping.scenarioName;
  }

  const requiredScenarioState = values.requiredScenarioState.trim();
  if (requiredScenarioState) {
    stubMapping.requiredScenarioState = requiredScenarioState;
  } else {
    delete stubMapping.requiredScenarioState;
  }

  const newScenarioState = values.newScenarioState.trim();
  if (newScenarioState) {
    stubMapping.newScenarioState = newScenarioState;
  } else {
    delete stubMapping.newScenarioState;
  }

  const metadata = parseJsonObject(values.metadataText);
  if (metadata) {
    stubMapping.metadata = metadata;
  } else {
    delete stubMapping.metadata;
  }

  return stubMapping;
}
