import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  ContentPattern,
  JsonValue,
  StubMapping,
  StubMappingBodyPatternDraft,
  StubMappingRequestMatcherDraft,
  StubMappingResponseHeaderDraft,
  StubMappingUrlMatchType,
} from "@/entities/stub-mapping";
import { stubMappingFormSchema, type StubMappingFormValues } from "@/features/create-stub-mapping/model/schema";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatJson(value: JsonValue | undefined) {
  if (value === undefined) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}

function detectUrlMatchType(stubMapping?: StubMapping): StubMappingUrlMatchType {
  if (stubMapping?.request?.urlPath) {
    return "urlPath";
  }

  if (stubMapping?.request?.urlPattern) {
    return "urlPattern";
  }

  if (stubMapping?.request?.urlPathPattern) {
    return "urlPathPattern";
  }

  return "url";
}

function detectUrlValue(stubMapping?: StubMapping) {
  return (
    stubMapping?.request?.url ??
    stubMapping?.request?.urlPath ??
    stubMapping?.request?.urlPattern ??
    stubMapping?.request?.urlPathPattern ??
    ""
  );
}

function toRequestMatcherDrafts(
  value: Record<string, ContentPattern> | undefined,
  prefix: string,
): StubMappingRequestMatcherDraft[] {
  if (!value) {
    return [];
  }

  return Object.entries(value)
    .map(([key, matcher]) => {
      if ("equalTo" in matcher) {
        return {
          id: createId(prefix),
          key,
          operator: "equalTo" as const,
          value: matcher.equalTo,
          caseInsensitive: Boolean(matcher.caseInsensitive),
        };
      }

      if ("contains" in matcher) {
        return {
          id: createId(prefix),
          key,
          operator: "contains" as const,
          value: matcher.contains,
          caseInsensitive: false,
        };
      }

      if ("matches" in matcher) {
        return {
          id: createId(prefix),
          key,
          operator: "matches" as const,
          value: matcher.matches,
          caseInsensitive: false,
        };
      }

      if ("matchesJsonPath" in matcher) {
        return {
          id: createId(prefix),
          key,
          operator: "matchesJsonPath" as const,
          value: typeof matcher.matchesJsonPath === "string" ? matcher.matchesJsonPath : matcher.matchesJsonPath.expression,
          caseInsensitive: false,
        };
      }

      if ("absent" in matcher) {
        return {
          id: createId(prefix),
          key,
          operator: "absent" as const,
          value: "",
          caseInsensitive: false,
        };
      }

      return null;
    })
    .filter((matcher): matcher is StubMappingRequestMatcherDraft => matcher !== null);
}

function toBodyPatternDrafts(value: ContentPattern[] | undefined): StubMappingBodyPatternDraft[] {
  if (!value) {
    return [];
  }

  return value
    .map((matcher) => {
      if ("equalTo" in matcher) {
        return {
          id: createId("body-pattern"),
          matcher: "equalTo" as const,
          value: matcher.equalTo,
          ignoreArrayOrder: false,
          ignoreExtraElements: false,
        };
      }

      if ("contains" in matcher) {
        return {
          id: createId("body-pattern"),
          matcher: "contains" as const,
          value: matcher.contains,
          ignoreArrayOrder: false,
          ignoreExtraElements: false,
        };
      }

      if ("matchesJsonPath" in matcher) {
        return {
          id: createId("body-pattern"),
          matcher: "matchesJsonPath" as const,
          value: typeof matcher.matchesJsonPath === "string" ? matcher.matchesJsonPath : matcher.matchesJsonPath.expression,
          ignoreArrayOrder: false,
          ignoreExtraElements: false,
        };
      }

      if ("equalToJson" in matcher) {
        return {
          id: createId("body-pattern"),
          matcher: "equalToJson" as const,
          value: matcher.equalToJson,
          ignoreArrayOrder: Boolean(matcher.ignoreArrayOrder),
          ignoreExtraElements: Boolean(matcher.ignoreExtraElements),
        };
      }

      return null;
    })
    .filter((matcher): matcher is StubMappingBodyPatternDraft => matcher !== null);
}

function toResponseHeaderDrafts(headers: Record<string, string> | undefined): StubMappingResponseHeaderDraft[] {
  if (!headers) {
    return [];
  }

  return Object.entries(headers).map(([key, value]) => ({
    id: createId("response-header"),
    key,
    value,
  }));
}

function detectBodyMode(stubMapping?: StubMapping) {
  if (stubMapping?.response?.bodyFileName) {
    return "file" as const;
  }

  if (stubMapping?.response?.jsonBody !== undefined) {
    return "json" as const;
  }

  if (stubMapping?.response?.base64Body) {
    return "base64" as const;
  }

  return "text" as const;
}

function buildStubMappingFormValues(stubMapping?: StubMapping): StubMappingFormValues {
  return {
    id: stubMapping?.id,
    uuid: stubMapping?.uuid,
    baseStub: stubMapping,
    name: stubMapping?.name ?? "",
    persistent: Boolean(stubMapping?.persistent),
    priority: stubMapping?.priority ?? null,
    scenarioName: stubMapping?.scenarioName ?? "",
    requiredScenarioState: stubMapping?.requiredScenarioState ?? "",
    newScenarioState: stubMapping?.newScenarioState ?? "",
    metadataText: stubMapping?.metadata ? JSON.stringify(stubMapping.metadata, null, 2) : "",
    request: {
      method: stubMapping?.request?.method ?? "GET",
      urlMatchType: detectUrlMatchType(stubMapping),
      urlValue: detectUrlValue(stubMapping),
      headers: toRequestMatcherDrafts(stubMapping?.request?.headers, "header"),
      queryParameters: toRequestMatcherDrafts(stubMapping?.request?.queryParameters, "query"),
      cookies: toRequestMatcherDrafts(stubMapping?.request?.cookies, "cookie"),
      bodyPatterns: toBodyPatternDrafts(stubMapping?.request?.bodyPatterns),
    },
    response: {
      status: stubMapping?.response?.status ?? 200,
      statusMessage: stubMapping?.response?.statusMessage ?? "",
      headers: toResponseHeaderDrafts(stubMapping?.response?.headers),
      bodyMode: detectBodyMode(stubMapping),
      bodyText: stubMapping?.response?.body ?? "",
      bodyJsonText: formatJson(stubMapping?.response?.jsonBody),
      bodyBase64: stubMapping?.response?.base64Body ?? "",
      bodyFileName: stubMapping?.response?.bodyFileName ?? "",
      fixedDelayMilliseconds: stubMapping?.response?.fixedDelayMilliseconds ?? null,
      fault: stubMapping?.response?.fault ?? "",
      proxyBaseUrl: stubMapping?.response?.proxyBaseUrl ?? "",
    },
  };
}

export function useStubMappingForm(defaultValues?: StubMapping) {
  const form = useForm<StubMappingFormValues>({
    resolver: zodResolver(stubMappingFormSchema),
    defaultValues: buildStubMappingFormValues(defaultValues),
  });

  useEffect(() => {
    form.reset(buildStubMappingFormValues(defaultValues));
  }, [defaultValues, form]);

  return form;
}
