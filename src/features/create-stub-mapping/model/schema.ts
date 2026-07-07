import { z } from "zod";
import {
  stubMappingBodyMatcherOperatorValues,
  stubMappingFaultValues,
  stubMappingRequestMatcherOperatorValues,
  stubMappingResponseBodyModeValues,
  stubMappingUrlMatchTypeValues,
  type StubMapping,
} from "@/entities/stub-mapping";

const httpMethodValues = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE", "ANY"] as const;

function isJsonValue(text: string) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function isJsonObject(text: string) {
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

const requestMatcherSchema = z.object({
  id: z.string().min(1),
  key: z.string().trim().min(1, "Enter a name for this matcher."),
  operator: z.enum(stubMappingRequestMatcherOperatorValues),
  value: z.string(),
  caseInsensitive: z.boolean(),
}).superRefine((value, context) => {
  if (value.operator !== "absent" && !value.value.trim()) {
    context.addIssue({
      code: "custom",
      message: "Enter a matcher value.",
      path: ["value"],
    });
  }
});

const bodyPatternSchema = z.object({
  id: z.string().min(1),
  matcher: z.enum(stubMappingBodyMatcherOperatorValues),
  value: z.string(),
  ignoreArrayOrder: z.boolean(),
  ignoreExtraElements: z.boolean(),
}).superRefine((value, context) => {
  if (!value.value.trim()) {
    context.addIssue({
      code: "custom",
      message: "Enter a body matcher value.",
      path: ["value"],
    });
  }

  if (value.matcher === "equalToJson" && value.value.trim() && !isJsonValue(value.value)) {
    context.addIssue({
      code: "custom",
      message: "Enter valid JSON for this body matcher.",
      path: ["value"],
    });
  }
});

const responseHeaderSchema = z.object({
  id: z.string().min(1),
  key: z.string().trim().min(1, "Enter a response header name."),
  value: z.string().trim().min(1, "Enter a response header value."),
});

export const stubMappingFormSchema = z.object({
  id: z.string().optional(),
  uuid: z.string().optional(),
  baseStub: z.custom<StubMapping>().optional(),
  name: z.string(),
  persistent: z.boolean(),
  priority: z.number().int().min(1, "Priority must be at least 1.").nullable(),
  scenarioName: z.string(),
  requiredScenarioState: z.string(),
  newScenarioState: z.string(),
  metadataText: z.string(),
  request: z.object({
    method: z.enum(httpMethodValues),
    urlMatchType: z.enum(stubMappingUrlMatchTypeValues),
    urlValue: z.string().trim().min(1, "Enter a request URL or pattern."),
    headers: z.array(requestMatcherSchema),
    queryParameters: z.array(requestMatcherSchema),
    cookies: z.array(requestMatcherSchema),
    bodyPatterns: z.array(bodyPatternSchema),
  }),
  response: z.object({
    status: z.number().int().min(100, "Status code must be at least 100.").max(599, "Status code must be at most 599."),
    statusMessage: z.string(),
    headers: z.array(responseHeaderSchema),
    bodyMode: z.enum(stubMappingResponseBodyModeValues),
    bodyText: z.string(),
    bodyJsonText: z.string(),
    bodyBase64: z.string(),
    bodyFileName: z.string(),
    fixedDelayMilliseconds: z.number().int().min(0, "Delay must be zero or greater.").nullable(),
    fault: z.union([z.enum(stubMappingFaultValues), z.literal("")]),
    proxyBaseUrl: z.string(),
  }),
}).superRefine((value, context) => {
  if (value.response.bodyMode === "json" && value.response.bodyJsonText.trim() && !isJsonValue(value.response.bodyJsonText)) {
    context.addIssue({
      code: "custom",
      message: "Enter valid JSON for the response body.",
      path: ["response", "bodyJsonText"],
    });
  }

  if (value.metadataText.trim() && !isJsonObject(value.metadataText)) {
    context.addIssue({
      code: "custom",
      message: "Metadata must be a valid JSON object.",
      path: ["metadataText"],
    });
  }
});

export type StubMappingFormValues = z.infer<typeof stubMappingFormSchema>;
