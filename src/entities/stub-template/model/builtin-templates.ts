import type { StubMapping } from "@/entities/stub-mapping";
import type { StubTemplate } from "@/entities/stub-template/model/types";

function builtInTemplate(input: Omit<StubTemplate, "builtIn" | "createdAt" | "updatedAt">): StubTemplate {
  return {
    ...input,
    builtIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const restListStub: StubMapping = {
  name: "REST - List resources (200)",
  request: {
    method: "GET",
    urlPath: "/api/resources",
  },
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    jsonBody: [
      { id: "1", name: "Example resource 1" },
      { id: "2", name: "Example resource 2" },
    ],
  },
};

const restGetByIdStub: StubMapping = {
  name: "REST - Get resource by id (200)",
  request: {
    method: "GET",
    urlPathPattern: "/api/resources/[^/]+",
  },
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    jsonBody: { id: "{{request.pathSegments.[2]}}", name: "Example resource" },
    transformers: ["response-template"],
  },
};

const restCreateStub: StubMapping = {
  name: "REST - Create resource (201)",
  request: {
    method: "POST",
    urlPath: "/api/resources",
    headers: { "Content-Type": { equalTo: "application/json" } },
  },
  response: {
    status: 201,
    headers: { "Content-Type": "application/json", Location: "/api/resources/{{randomValue type='UUID'}}" },
    jsonBody: { id: "{{randomValue type='UUID'}}", status: "created" },
    transformers: ["response-template"],
  },
};

const restUpdateStub: StubMapping = {
  name: "REST - Update resource (200)",
  request: {
    method: "PUT",
    urlPathPattern: "/api/resources/[^/]+",
    headers: { "Content-Type": { equalTo: "application/json" } },
  },
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    jsonBody: { status: "updated" },
  },
};

const restDeleteStub: StubMapping = {
  name: "REST - Delete resource (204)",
  request: {
    method: "DELETE",
    urlPathPattern: "/api/resources/[^/]+",
  },
  response: {
    status: 204,
  },
};

const notFoundStub: StubMapping = {
  name: "Error - 404 Not Found",
  request: {
    method: "GET",
    urlPathPattern: "/api/.*",
  },
  response: {
    status: 404,
    headers: { "Content-Type": "application/json" },
    jsonBody: { error: "Not Found", message: "The requested resource does not exist." },
  },
};

const unauthorizedStub: StubMapping = {
  name: "Error - 401 Unauthorized",
  request: {
    method: "ANY",
    urlPathPattern: "/api/.*",
    headers: { Authorization: { absent: true } },
  },
  response: {
    status: 401,
    headers: { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" },
    jsonBody: { error: "Unauthorized", message: "A valid Authorization header is required." },
  },
};

const serverErrorStub: StubMapping = {
  name: "Error - 500 Internal Server Error",
  request: {
    method: "ANY",
    urlPathPattern: "/api/.*",
  },
  response: {
    status: 500,
    headers: { "Content-Type": "application/json" },
    jsonBody: { error: "Internal Server Error", message: "Something went wrong while processing the request." },
  },
};

const latencyStub: StubMapping = {
  name: "Latency - Slow response (2s fixed delay)",
  request: {
    method: "GET",
    urlPath: "/api/slow-resource",
  },
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    jsonBody: { status: "ok" },
    fixedDelayMilliseconds: 2000,
  },
};

const faultStub: StubMapping = {
  name: "Fault - Simulated connection reset",
  request: {
    method: "GET",
    urlPath: "/api/unstable-resource",
  },
  response: {
    fault: "CONNECTION_RESET_BY_PEER",
  },
};

/**
 * Curated set of ready-to-use stub templates shipped with the app, covering
 * common REST CRUD shapes plus the error/latency/fault scenarios most
 * frequently needed when mocking an API. Always available regardless of
 * what the user has stored locally - see model/use-stub-templates.ts.
 */
export const builtInStubTemplates: StubTemplate[] = [
  builtInTemplate({
    id: "builtin-rest-list",
    name: "REST: List resources",
    description: "GET collection endpoint returning a JSON array with a 200 status.",
    category: "rest",
    stubMapping: restListStub,
  }),
  builtInTemplate({
    id: "builtin-rest-get-by-id",
    name: "REST: Get resource by id",
    description: "GET single-resource endpoint matched by a urlPathPattern, echoing the id back via response templating.",
    category: "rest",
    stubMapping: restGetByIdStub,
  }),
  builtInTemplate({
    id: "builtin-rest-create",
    name: "REST: Create resource",
    description: "POST endpoint returning 201 Created with a generated id and Location header.",
    category: "rest",
    stubMapping: restCreateStub,
  }),
  builtInTemplate({
    id: "builtin-rest-update",
    name: "REST: Update resource",
    description: "PUT endpoint returning 200 OK for an existing resource.",
    category: "rest",
    stubMapping: restUpdateStub,
  }),
  builtInTemplate({
    id: "builtin-rest-delete",
    name: "REST: Delete resource",
    description: "DELETE endpoint returning 204 No Content.",
    category: "rest",
    stubMapping: restDeleteStub,
  }),
  builtInTemplate({
    id: "builtin-error-404",
    name: "Error: 404 Not Found",
    description: "Generic not-found JSON error response for any unmatched resource path.",
    category: "errors",
    stubMapping: notFoundStub,
  }),
  builtInTemplate({
    id: "builtin-error-401",
    name: "Error: 401 Unauthorized",
    description: "Rejects requests missing an Authorization header with a 401 JSON error.",
    category: "auth",
    stubMapping: unauthorizedStub,
  }),
  builtInTemplate({
    id: "builtin-error-500",
    name: "Error: 500 Internal Server Error",
    description: "Generic server-error JSON response, useful for testing client error handling.",
    category: "errors",
    stubMapping: serverErrorStub,
  }),
  builtInTemplate({
    id: "builtin-latency-fixed-delay",
    name: "Latency: Fixed delay (2s)",
    description: "Simulates a slow backend with a 2-second fixed response delay.",
    category: "latency",
    stubMapping: latencyStub,
  }),
  builtInTemplate({
    id: "builtin-fault-connection-reset",
    name: "Fault: Connection reset",
    description: "Simulates an unstable dependency that resets the connection instead of responding.",
    category: "latency",
    stubMapping: faultStub,
  }),
];
