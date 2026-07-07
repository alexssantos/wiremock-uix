# 05 - Complete mapping of WireMock administrative endpoints

> Scope: WireMock Server **3.9.1** as the UI target version, validated against the official OpenAPI currently published in **3.12.2** (`https://wiremock.org/js/wiremock-admin-api.json`). The structure of the 41 endpoints below remains stable across versions 3.9.x–3.12.x.

## Assumptions and source of truth

- The endpoint inventory was extracted from the official OpenAPI downloaded at runtime.
- When the OpenAPI provides only an **inline schema**, an **example**, or omits a known `requestBody` (as in the import case), the specification below normalizes the contract for dashboard consumption without inventing new endpoints.
- The **Logs** feature does not have an exclusive endpoint in the official administrative API; in practice, it reuses the request journal (`/__admin/requests*`).

## Summary table

Total mapped: **41 operations** across **32 paths**.

| Method | Path | OperationId | Consuming feature |
|---|---|---|---|
| `DELETE` | `/__admin/mappings` | `deleteAllStubMappings` | Stub Mappings |
| `GET` | `/__admin/mappings` | `getAllStubMappings` | Stub Mappings / Dashboard |
| `POST` | `/__admin/mappings` | `createNewStubMapping` | Stub Mappings |
| `POST` | `/__admin/mappings/find-by-metadata` | `findStubMappingsByMetadata` | Stub Mappings |
| `POST` | `/__admin/mappings/import` | `importStubMappings` | Stub Mappings |
| `POST` | `/__admin/mappings/remove-by-metadata` | `removeStubMappingsByMetadata` | Stub Mappings |
| `POST` | `/__admin/mappings/reset` | `resetStubMappings` | Stub Mappings |
| `POST` | `/__admin/mappings/save` | `persistStubMappings` | Stub Mappings |
| `DELETE` | `/__admin/mappings/unmatched` | `removeUnmatchedStubMappings` | Stub Mappings |
| `GET` | `/__admin/mappings/unmatched` | `findUnmatchedStubMappings` | Stub Mappings / Dashboard |
| `DELETE` | `/__admin/mappings/{stubMappingId}` | `deleteStubMapping` | Stub Mappings |
| `GET` | `/__admin/mappings/{stubMappingId}` | `getStubMappingById` | Stub Mappings |
| `PUT` | `/__admin/mappings/{stubMappingId}` | `updateStubMapping` | Stub Mappings |
| `DELETE` | `/__admin/requests` | `deleteAllRequestsInJournal` | Requests / Logs |
| `GET` | `/__admin/requests` | `getAllRequestsInJournal` | Requests / Logs / Dashboard |
| `POST` | `/__admin/requests/count` | `countRequestsByCriteria` | Requests / Dashboard |
| `POST` | `/__admin/requests/find` | `findRequestsByCriteria` | Requests / Logs |
| `POST` | `/__admin/requests/remove` | `removeRequestsByCriteria` | Requests / Logs |
| `POST` | `/__admin/requests/remove-by-metadata` | `removeRequestsByMetadata` | Requests / Logs |
| `POST` | `/__admin/requests/reset` | `emptyRequestJournal` | Requests / Logs |
| `GET` | `/__admin/requests/unmatched` | `findUnmatchedRequests` | Requests / Near Misses / Dashboard |
| `DELETE` | `/__admin/requests/{requestId}` | `deleteRequestById` | Requests / Logs |
| `GET` | `/__admin/requests/{requestId}` | `getRequestById` | Requests / Logs |
| `POST` | `/__admin/near-misses/request` | `findNearMissesForRequest` | Near Misses |
| `POST` | `/__admin/near-misses/request-pattern` | `findNearMissesForRequestPattern` | Near Misses |
| `GET` | `/__admin/requests/unmatched/near-misses` | `retrieveNearMissesForUnmatchedRequests` | Near Misses |
| `POST` | `/__admin/recordings/snapshot` | `takeRecordingSnapshot` | Recording |
| `POST` | `/__admin/recordings/start` | `startRecording` | Recording |
| `GET` | `/__admin/recordings/status` | `getRecordingStatus` | Recording / Dashboard |
| `POST` | `/__admin/recordings/stop` | `stopRecording` | Recording |
| `GET` | `/__admin/scenarios` | `getAllScenarios` | Scenarios / Dashboard |
| `POST` | `/__admin/scenarios/reset` | `resetAllScenarios` | Scenarios |
| `GET` | `/__admin/files` | `getAllFileNames` | Files |
| `DELETE` | `/__admin/files/{fileId}` | `deleteFileById` | Files |
| `GET` | `/__admin/files/{fileId}` | `getFileById` | Files |
| `PUT` | `/__admin/files/{fileId}` | `updateFileById` | Files |
| `POST` | `/__admin/reset` | `resetMappingsAndJournal` | Settings / Dashboard |
| `POST` | `/__admin/settings` | `updateGlobalSettings` | Settings |
| `POST` | `/__admin/shutdown` | `shutdownServer` | Settings |
| `GET` | `/__admin/health` | `getHealth` | Dashboard / Settings |
| `GET` | `/__admin/version` | `getVersion` | Dashboard / Settings |

## Stub Mappings

### DELETE /__admin/mappings

- **OperationId:** `deleteAllStubMappings`
- **Description/purpose:** Delete all stub mappings.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully deleted | no body |

#### Implementation notes

- This is a destructive bulk operation; require explicit confirmation in the UI and refetch the listing immediately afterward.

### GET /__admin/mappings

- **OperationId:** `getAllStubMappings`
- **Description/purpose:** Get all stub mappings.
- **Consuming screen/feature:** Stub Mappings / Dashboard
- **Request schema:** Not applicable.
- **Primary response schema:** stub-mappings

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `limit` | `query` | `integer` | No | The maximum number of results to return |
| `offset` | `query` | `integer` | No | The start index of the results to return |

#### Example response body

```json
{
  "meta": {
    "total": 2
  },
  "mappings": [
    {
      "id": "76ada7b0-49ae-4229-91c4-396a36f18e09",
      "uuid": "76ada7b0-49ae-4229-91c4-396a36f18e09",
      "request": {
        "method": "GET",
        "url": "/search?q=things",
        "headers": {
          "Accept": {
            "equalTo": "application/json"
          }
        }
      },
      "response": {
        "status": 200,
        "jsonBody": [
          "thing1",
          "thing2"
        ],
        "headers": {
          "Content-Type": "application/json"
        }
      }
    },
    {
      "request": {
        "method": "POST",
        "urlPath": "/some/things",
        "bodyPatterns": [
          {
            "equalToXml": "<stuff />"
          }
        ]
      },
      "response": {
        "status": 201
      }
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | All stub mappings | stub-mappings |

#### Implementation notes

- Use `limit` + `offset` for server-side pagination and derive the total row count from `meta.total`.
- Ideal for populating the main stubs grid and Dashboard cards without loading every detail into memory at once.

### POST /__admin/mappings

- **OperationId:** `createNewStubMapping`
- **Description/purpose:** Create a new stub mapping.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** stub-mapping
- **Primary response schema:** stub-mapping

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "request": {
    "method": "GET",
    "url": "/some/thing"
  },
  "response": {
    "body": "Hello world!",
    "headers": {
      "Content-Type": "text/plain"
    },
    "status": 200
  }
}
```

#### Example response body

```json
{
  "id": "76ada7b0-49ae-4229-91c4-396a36f18e09",
  "priority": 3,
  "request": {
    "headers": {
      "Accept": {
        "equalTo": "text/plain"
      }
    },
    "method": "GET",
    "url": "/some/thing"
  },
  "response": {
    "body": "Hello world!",
    "headers": {
      "Content-Type": "text/plain"
    },
    "status": 200
  }
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `201` | The stub mapping | stub-mapping |
| `422` | Bad request body | bad-request-entity |

#### Implementation notes

- The UI should invalidate the list after `201 Created` and handle `422` with user-friendly rendering of the `bad-request-entity` payload.
- For Monaco/JSON editing, preserve `metadata`, `scenario*`, and `serveEventListeners` even if the simplified screen does not expose every field.

### POST /__admin/mappings/find-by-metadata

- **OperationId:** `findStubMappingsByMetadata`
- **Description/purpose:** Find stubs by matching on their metadata.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** content-pattern
- **Primary response schema:** stub-mappings

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "matchesJsonPath": {
    "expression": "$.outer",
    "equalToJson": "{ \"inner\": 42 }"
  }
}
```

#### Example response body

```json
{
  "meta": {
    "total": 2
  },
  "mappings": [
    {
      "id": "76ada7b0-49ae-4229-91c4-396a36f18e09",
      "uuid": "76ada7b0-49ae-4229-91c4-396a36f18e09",
      "request": {
        "method": "GET",
        "url": "/search?q=things",
        "headers": {
          "Accept": {
            "equalTo": "application/json"
          }
        }
      },
      "response": {
        "status": 200,
        "jsonBody": [
          "thing1",
          "thing2"
        ],
        "headers": {
          "Content-Type": "application/json"
        }
      }
    },
    {
      "request": {
        "method": "POST",
        "urlPath": "/some/things",
        "bodyPatterns": [
          {
            "equalToXml": "<stuff />"
          }
        ]
      },
      "response": {
        "status": 201
      }
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Matched stub mappings | stub-mappings |

#### Implementation notes

- The filter uses `content-pattern`, so the UI can offer advanced matchers such as `matchesJsonPath`, `equalToJson`, `and`, and `or` over `metadata`.

### POST /__admin/mappings/import

- **OperationId:** `importStubMappings`
- **Description/purpose:** Import stub mappings. Import given stub mappings to the backing store.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** StubImport (supplemental: the OpenAPI operation does not expose a requestBody, but the server's public model uses `mappings[]` + `importOptions`)
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "mappings": [
    {
      "request": {
        "method": "GET",
        "url": "/some/thing"
      },
      "response": {
        "body": "Hello world!",
        "headers": {
          "Content-Type": "text/plain"
        },
        "status": 200
      }
    },
    {
      "request": {
        "method": "POST",
        "urlPath": "/api/orders",
        "bodyPatterns": [
          {
            "matchesJsonPath": "$.customerId"
          }
        ]
      },
      "response": {
        "status": 201,
        "jsonBody": {
          "result": "created"
        }
      }
    }
  ],
  "importOptions": {
    "duplicatePolicy": "OVERWRITE",
    "deleteAllNotInImport": false
  }
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully imported | no body |

#### Implementation notes

- The official OpenAPI does not type the body of this operation, but WireMock's public contract uses `StubImport` (`mappings` + `importOptions`).
- For bulk import, expose a preview, JSON validation, and a duplicate-policy option (`OVERWRITE` or `IGNORE`).

### POST /__admin/mappings/remove-by-metadata

- **OperationId:** `removeStubMappingsByMetadata`
- **Description/purpose:** Delete stub mappings matching metadata.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** content-pattern
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "matchesJsonPath": {
    "expression": "$.outer",
    "equalToJson": "{ \"inner\": 42 }"
  }
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | The stub mappings were successfully removed | no body |

#### Implementation notes

- Excellent for bulk actions by tag, domain, or stub owner; combine it with metadata chips in the grid.

### POST /__admin/mappings/reset

- **OperationId:** `resetStubMappings`
- **Description/purpose:** Reset stub mappings. Restores stub mappings to the defaults defined back in the backing store.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully reset | no body |

#### Implementation notes

- Resets only the stub mappings (returning to the persisted/default state), without clearing the request journal or the entire global scenario state.

### POST /__admin/mappings/save

- **OperationId:** `persistStubMappings`
- **Description/purpose:** Persist stub mappings. Save all persistent stub mappings to the backing store.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully saved | no body |

#### Implementation notes

- Useful when the application allows temporary drafts and the user wants to persist them to WireMock's backing store.

### DELETE /__admin/mappings/unmatched

- **OperationId:** `removeUnmatchedStubMappings`
- **Description/purpose:** Remove unmatched stub mappings. Remove stub mappings that haven't matched any requests in the journal.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | OK | no body |

#### Implementation notes

- This can be exposed as a cleanup/housekeeping action; keep a safety confirmation.

### GET /__admin/mappings/unmatched

- **OperationId:** `findUnmatchedStubMappings`
- **Description/purpose:** Find unmatched stub mappings. Find stub mappings that haven't matched any requests in the journal.
- **Consuming screen/feature:** Stub Mappings / Dashboard
- **Request schema:** Not applicable.
- **Primary response schema:** stub-mappings

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

```json
{
  "meta": {
    "total": 2
  },
  "mappings": [
    {
      "id": "76ada7b0-49ae-4229-91c4-396a36f18e09",
      "uuid": "76ada7b0-49ae-4229-91c4-396a36f18e09",
      "request": {
        "method": "GET",
        "url": "/search?q=things",
        "headers": {
          "Accept": {
            "equalTo": "application/json"
          }
        }
      },
      "response": {
        "status": 200,
        "jsonBody": [
          "thing1",
          "thing2"
        ],
        "headers": {
          "Content-Type": "application/json"
        }
      }
    },
    {
      "request": {
        "method": "POST",
        "urlPath": "/some/things",
        "bodyPatterns": [
          {
            "equalToXml": "<stuff />"
          }
        ]
      },
      "response": {
        "status": 201
      }
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Unmatched stub mappings | stub-mappings |

#### Implementation notes

- Helps find orphaned stubs and feed coverage indicators on the Dashboard.

### DELETE /__admin/mappings/{stubMappingId}

- **OperationId:** `deleteStubMapping`
- **Description/purpose:** Delete a stub mapping.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `stubMappingId` | `path` | `string` | Yes | The UUID of stub mapping |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | OK | no body |
| `404` | Stub mapping not found | no body |

#### Implementation notes

- After an individual removal, invalidate the listing, scenarios, and any derived screen that shows aggregated counts.

### GET /__admin/mappings/{stubMappingId}

- **OperationId:** `getStubMappingById`
- **Description/purpose:** Get stub mapping by ID.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** Not applicable.
- **Primary response schema:** stub-mapping

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `stubMappingId` | `path` | `string` | Yes | The UUID of stub mapping |

#### Example response body

```json
{
  "id": "76ada7b0-49ae-4229-91c4-396a36f18e09",
  "priority": 3,
  "request": {
    "headers": {
      "Accept": {
        "equalTo": "text/plain"
      }
    },
    "method": "GET",
    "url": "/some/thing"
  },
  "response": {
    "body": "Hello world!",
    "headers": {
      "Content-Type": "text/plain"
    },
    "status": 200
  }
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | The stub mapping | stub-mapping |
| `404` | Stub mapping not found | no body |

#### Implementation notes

- Use this call to open the detail/edit page without depending on the item already being in cache.

### PUT /__admin/mappings/{stubMappingId}

- **OperationId:** `updateStubMapping`
- **Description/purpose:** Update a stub mapping.
- **Consuming screen/feature:** Stub Mappings
- **Request schema:** stub-mapping
- **Primary response schema:** stub-mapping

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `stubMappingId` | `path` | `string` | Yes | The UUID of stub mapping |

#### Example request body

```json
{
  "request": {
    "method": "GET",
    "url": "/some/thing"
  },
  "response": {
    "body": "Hello world!",
    "headers": {
      "Content-Type": "text/plain"
    },
    "status": 200
  }
}
```

#### Example response body

```json
{
  "id": "76ada7b0-49ae-4229-91c4-396a36f18e09",
  "priority": 3,
  "request": {
    "headers": {
      "Accept": {
        "equalTo": "text/plain"
      }
    },
    "method": "GET",
    "url": "/some/thing"
  },
  "response": {
    "body": "Hello world!",
    "headers": {
      "Content-Type": "text/plain"
    },
    "status": 200
  }
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | The stub mapping | stub-mapping |
| `404` | Stub mapping not found | no body |

#### Implementation notes

- The API uses the path ID as the update key; ensure consistency between the item edited in the UI and the UUID sent in the route.


## Request Journal

### DELETE /__admin/requests

- **OperationId:** `deleteAllRequestsInJournal`
- **Description/purpose:** Delete all requests in journal.
- **Consuming screen/feature:** Requests / Logs
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully deleted | no body |

#### Implementation notes

- Quickly clears the entire journal; useful for hygiene actions in Requests/Logs.

### GET /__admin/requests

- **OperationId:** `getAllRequestsInJournal`
- **Description/purpose:** Get all requests in journal.
- **Consuming screen/feature:** Requests / Logs / Dashboard
- **Request schema:** Not applicable.
- **Primary response schema:** ServeEventsPage (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `limit` | `query` | `string` | No | The maximum number of results to return |
| `since` | `query` | `string` | No | Only return logged requests after this date |

#### Example response body

```json
{
  "requests": [
    {
      "id": "45760a03-eebb-4387-ad0d-bb89b5d3d662",
      "request": {
        "url": "/received-request/9",
        "absoluteUrl": "http://localhost:56715/received-request/9",
        "method": "GET",
        "clientIp": "127.0.0.1",
        "headers": {
          "Connection": "keep-alive",
          "Host": "localhost:56715",
          "User-Agent": "Apache-HttpClient/4.5.1 (Java/1.7.0_51)"
        },
        "cookies": {},
        "browserProxyRequest": false,
        "loggedDate": 1471442494809,
        "bodyAsBase64": "",
        "body": "",
        "loggedDateString": "2016-08-17T14:01:34Z"
      },
      "responseDefinition": {
        "status": 404,
        "transformers": [],
        "fromConfiguredStub": false,
        "transformerParameters": {}
      }
    },
    {
      "id": "6ae78311-0178-46c9-987a-fbfc528d54d8",
      "request": {
        "url": "/received-request/8",
        "absoluteUrl": "http://localhost:56715/received-request/8",
        "method": "GET",
        "clientIp": "127.0.0.1",
        "headers": {
          "Connection": "keep-alive",
          "Host": "localhost:56715",
          "User-Agent": "Apache-HttpClient/4.5.1 (Java/1.7.0_51)"
        },
        "cookies": {},
        "browserProxyRequest": false,
        "loggedDate": 1471442494802,
        "bodyAsBase64": "",
        "body": "",
        "loggedDateString": "2016-08-17T14:01:34Z"
      },
      "responseDefinition": {
        "status": 404,
        "transformers": [],
        "fromConfiguredStub": false,
        "transformerParameters": {}
      }
    },
    {
      "id": "aba8e4ad-1b5b-4518-8f05-b2170a24de35",
      "request": {
        "url": "/received-request/7",
        "absoluteUrl": "http://localhost:56715/received-request/7",
        "method": "GET",
        "clientIp": "127.0.0.1",
        "headers": {
          "Connection": "keep-alive",
          "Host": "localhost:56715",
          "User-Agent": "Apache-HttpClient/4.5.1 (Java/1.7.0_51)"
        },
        "cookies": {},
        "browserProxyRequest": false,
        "loggedDate": 1471442494795,
        "bodyAsBase64": "",
        "body": "",
        "loggedDateString": "2016-08-17T14:01:34Z"
      },
      "responseDefinition": {
        "status": 404,
        "transformers": [],
        "fromConfiguredStub": false,
        "transformerParameters": {}
      }
    }
  ],
  "meta": {
    "total": 9
  },
  "requestJournalDisabled": false
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | List of received requests | no body |

#### Implementation notes

- Use `limit` for incremental pagination and `since` for lightweight real-time polling.
- The response includes `requestJournalDisabled`; when `true`, the UI should disable filters and display a configuration warning.

### POST /__admin/requests/count

- **OperationId:** `countRequestsByCriteria`
- **Description/purpose:** Count requests by criteria. Count requests logged in the journal matching the specified criteria.
- **Consuming screen/feature:** Requests / Dashboard
- **Request schema:** request-pattern
- **Primary response schema:** CountRequestsResponse (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "method": "POST",
  "url": "/resource",
  "headers": {
    "Content-Type": {
      "matches": ".*/xml"
    }
  }
}
```

#### Example response body

_The official OpenAPI does not publish an example for this response._

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Number of matching requests | objeto inline |

#### Implementation notes

- Reuses the same `RequestPattern` as the detailed searches; great for quick Dashboard metrics and saved filters.

### POST /__admin/requests/find

- **OperationId:** `findRequestsByCriteria`
- **Description/purpose:** Find requests by criteria. Retrieve details of requests logged in the journal matching the specified criteria.
- **Consuming screen/feature:** Requests / Logs
- **Request schema:** request-pattern
- **Primary response schema:** FindRequestsResponse (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "method": "POST",
  "url": "/resource",
  "headers": {
    "Content-Type": {
      "matches": ".*/xml"
    }
  }
}
```

#### Example response body

```json
{
  "requests": [
    {
      "url": "/my/url",
      "absoluteUrl": "http://mydomain.com/my/url",
      "method": "GET",
      "headers": {
        "Accept-Language": "en-us,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:9.0) Gecko/20100101 Firefox/9.0",
        "Accept": "image/png,image/*;q=0.8,*/*;q=0.5"
      },
      "body": "",
      "browserProxyRequest": true,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    },
    {
      "url": "/my/other/url",
      "absoluteUrl": "http://my.other.domain.com/my/other/url",
      "method": "POST",
      "headers": {
        "Accept": "text/plain",
        "Content-Type": "text/plain"
      },
      "body": "My text",
      "browserProxyRequest": false,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Matching request details | no body |

#### Implementation notes

- Criteria-based search is the ideal foundation for advanced filters, quick filters, and themed exports in the Logs screen.

### POST /__admin/requests/remove

- **OperationId:** `removeRequestsByCriteria`
- **Description/purpose:** Remove requests by criteria. Removed requests logged in the journal matching the specified criteria.
- **Consuming screen/feature:** Requests / Logs
- **Request schema:** request-pattern
- **Primary response schema:** RemoveRequestsResponse (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "method": "POST",
  "url": "/resource",
  "headers": {
    "Content-Type": {
      "matches": ".*/xml"
    }
  }
}
```

#### Example response body

```json
{
  "requests": [
    {
      "url": "/my/url",
      "absoluteUrl": "http://mydomain.com/my/url",
      "method": "GET",
      "headers": {
        "Accept-Language": "en-us,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:9.0) Gecko/20100101 Firefox/9.0",
        "Accept": "image/png,image/*;q=0.8,*/*;q=0.5"
      },
      "body": "",
      "browserProxyRequest": true,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    },
    {
      "url": "/my/other/url",
      "absoluteUrl": "http://my.other.domain.com/my/other/url",
      "method": "POST",
      "headers": {
        "Accept": "text/plain",
        "Content-Type": "text/plain"
      },
      "body": "My text",
      "browserProxyRequest": false,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Removed request details | no body |

#### Implementation notes

- Criteria-based removal uses the same matching DSL as stubs (`method`, `url*`, headers, bodyPatterns, etc.).

### POST /__admin/requests/remove-by-metadata

- **OperationId:** `removeRequestsByMetadata`
- **Description/purpose:** Delete requests mappings matching metadata.
- **Consuming screen/feature:** Requests / Logs
- **Request schema:** content-pattern
- **Primary response schema:** schema inline

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "matchesJsonPath": {
    "expression": "$.outer",
    "equalToJson": "{ \"inner\": 42 }"
  }
}
```

#### Example response body

```json
{
  "requests": [
    {
      "url": "/my/url",
      "absoluteUrl": "http://mydomain.com/my/url",
      "method": "GET",
      "headers": {
        "Accept-Language": "en-us,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:9.0) Gecko/20100101 Firefox/9.0",
        "Accept": "image/png,image/*;q=0.8,*/*;q=0.5"
      },
      "body": "",
      "browserProxyRequest": true,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    },
    {
      "url": "/my/other/url",
      "absoluteUrl": "http://my.other.domain.com/my/other/url",
      "method": "POST",
      "headers": {
        "Accept": "text/plain",
        "Content-Type": "text/plain"
      },
      "body": "My text",
      "browserProxyRequest": false,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Removed request details | no body |

#### Implementation notes

- Useful when the UI associates serve events with the `metadata` of the stub that served them; treat it as a specialized bulk action.

### POST /__admin/requests/reset

- **OperationId:** `emptyRequestJournal`
- **Description/purpose:** Empty the request journal.
- **Consuming screen/feature:** Requests / Logs
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully reset | no body |

#### Implementation notes

- It is semantically equivalent to emptying the journal; use it as a dedicated action in the Requests screen toolbar.

### GET /__admin/requests/unmatched

- **OperationId:** `findUnmatchedRequests`
- **Description/purpose:** Find unmatched requests. Get details of logged requests that weren't matched by any stub mapping.
- **Consuming screen/feature:** Requests / Near Misses / Dashboard
- **Request schema:** Not applicable.
- **Primary response schema:** FindRequestsResponse (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

```json
{
  "requests": [
    {
      "url": "/my/url",
      "absoluteUrl": "http://mydomain.com/my/url",
      "method": "GET",
      "headers": {
        "Accept-Language": "en-us,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:9.0) Gecko/20100101 Firefox/9.0",
        "Accept": "image/png,image/*;q=0.8,*/*;q=0.5"
      },
      "body": "",
      "browserProxyRequest": true,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    },
    {
      "url": "/my/other/url",
      "absoluteUrl": "http://my.other.domain.com/my/other/url",
      "method": "POST",
      "headers": {
        "Accept": "text/plain",
        "Content-Type": "text/plain"
      },
      "body": "My text",
      "browserProxyRequest": false,
      "loggedDate": 1339083581823,
      "loggedDateString": "2012-06-07 16:39:41"
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Unmatched request details | no body |

#### Implementation notes

- It underpins the list of matching failures and the troubleshooting funnel before opening Near Misses.

### DELETE /__admin/requests/{requestId}

- **OperationId:** `deleteRequestById`
- **Description/purpose:** Delete request by ID.
- **Consuming screen/feature:** Requests / Logs
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `requestId` | `path` | `string` | Yes | The UUID of the logged request |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully deleted | no body |

#### Implementation notes

- Allows surgical cleanup of journal events without affecting the rest of the session.

### GET /__admin/requests/{requestId}

- **OperationId:** `getRequestById`
- **Description/purpose:** Get request by ID.
- **Consuming screen/feature:** Requests / Logs
- **Request schema:** Not applicable.
- **Primary response schema:** ServeEvent (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `requestId` | `path` | `string` | Yes | The UUID of the logged request |

#### Example response body

```json
{
  "id": "12fb14bb-600e-4bfa-bd8d-be7f12562c99",
  "request": {
    "url": "/received-request/2",
    "absoluteUrl": "http://localhost:56738/received-request/2",
    "method": "GET",
    "clientIp": "127.0.0.1",
    "headers": {
      "Connection": "keep-alive",
      "Host": "localhost:56738",
      "User-Agent": "Apache-HttpClient/4.5.1 (Java/1.7.0_51)"
    },
    "cookies": {},
    "browserProxyRequest": false,
    "loggedDate": 1471442557047,
    "bodyAsBase64": "",
    "body": "",
    "loggedDateString": "2016-08-17T14:02:37Z"
  },
  "responseDefinition": {
    "status": 404,
    "transformers": [],
    "fromConfiguredStub": false,
    "transformerParameters": {}
  }
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | OK | no body |
| `404` | Request not found | no body |

#### Implementation notes

- Ideal for a drawer/modal with full details, preserving `responseDefinition` and the original request.


## Near Misses

### POST /__admin/near-misses/request

- **OperationId:** `findNearMissesForRequest`
- **Description/purpose:** Find near misses matching specific request. Find at most 3 near misses for closest stub mappings to the specified request.
- **Consuming screen/feature:** Near Misses
- **Request schema:** logged-request
- **Primary response schema:** NearMissesResponse (components.responses.nearMisses)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "url": "/actual",
  "absoluteUrl": "http://localhost:8080/actual",
  "method": "GET",
  "clientIp": "0:0:0:0:0:0:0:1",
  "headers": {
    "User-Agent": "curl/7.30.0",
    "Accept": "*/*",
    "Host": "localhost:8080"
  },
  "cookies": {},
  "browserProxyRequest": false,
  "loggedDate": 1467402464520,
  "bodyAsBase64": "",
  "body": "",
  "loggedDateString": "2016-07-01T19:47:44Z"
}
```

#### Example response body

```json
{
  "nearMisses": [
    {
      "request": {
        "url": "/nomatch",
        "absoluteUrl": "http://localhost:8080/nomatch",
        "method": "GET",
        "clientIp": "0:0:0:0:0:0:0:1",
        "headers": {
          "User-Agent": "curl/7.30.0",
          "Accept": "*/*",
          "Host": "localhost:8080"
        },
        "cookies": {},
        "browserProxyRequest": false,
        "loggedDate": 1467402464520,
        "bodyAsBase64": "",
        "body": "",
        "loggedDateString": "2016-07-01T19:47:44Z"
      },
      "requestPattern": {
        "url": "/almostmatch",
        "method": "GET"
      },
      "matchResult": {
        "distance": 0.06944444444444445
      }
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Near misses matching criteria | objeto inline |

#### Implementation notes

- Use this when the UI should allow a captured request to be pasted/edited and compared directly against existing stubs.
- WireMock returns at most the 3 closest near misses.

### POST /__admin/near-misses/request-pattern

- **OperationId:** `findNearMissesForRequestPattern`
- **Description/purpose:** Find near misses matching request pattern. Find at most 3 near misses for closest logged requests to the specified request pattern.
- **Consuming screen/feature:** Near Misses
- **Request schema:** request-pattern
- **Primary response schema:** NearMissesResponse (components.responses.nearMisses)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "method": "POST",
  "url": "/resource",
  "headers": {
    "Content-Type": {
      "matches": ".*/xml"
    }
  }
}
```

#### Example response body

```json
{
  "nearMisses": [
    {
      "request": {
        "url": "/nomatch",
        "absoluteUrl": "http://localhost:8080/nomatch",
        "method": "GET",
        "clientIp": "0:0:0:0:0:0:0:1",
        "headers": {
          "User-Agent": "curl/7.30.0",
          "Accept": "*/*",
          "Host": "localhost:8080"
        },
        "cookies": {},
        "browserProxyRequest": false,
        "loggedDate": 1467402464520,
        "bodyAsBase64": "",
        "body": "",
        "loggedDateString": "2016-07-01T19:47:44Z"
      },
      "requestPattern": {
        "url": "/almostmatch",
        "method": "GET"
      },
      "matchResult": {
        "distance": 0.06944444444444445
      }
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Near misses matching criteria | objeto inline |

#### Implementation notes

- This is the inverse flow of the previous endpoint: it starts from a `RequestPattern` and looks for the closest real requests in the journal.

### GET /__admin/requests/unmatched/near-misses

- **OperationId:** `retrieveNearMissesForUnmatchedRequests`
- **Description/purpose:** Retrieve near-misses for all unmatched requests.
- **Consuming screen/feature:** Near Misses
- **Request schema:** Not applicable.
- **Primary response schema:** NearMissesResponse (components.responses.nearMisses)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

```json
{
  "nearMisses": [
    {
      "request": {
        "url": "/nomatch",
        "absoluteUrl": "http://localhost:8080/nomatch",
        "method": "GET",
        "clientIp": "0:0:0:0:0:0:0:1",
        "headers": {
          "User-Agent": "curl/7.30.0",
          "Accept": "*/*",
          "Host": "localhost:8080"
        },
        "cookies": {},
        "browserProxyRequest": false,
        "loggedDate": 1467402464520,
        "bodyAsBase64": "",
        "body": "",
        "loggedDateString": "2016-07-01T19:47:44Z"
      },
      "requestPattern": {
        "url": "/almostmatch",
        "method": "GET"
      },
      "matchResult": {
        "distance": 0.06944444444444445
      }
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Near misses matching criteria | objeto inline |

#### Implementation notes

- Returns ready-to-use near misses for all unmatched requests; it is the best option for the initial 'Near Misses' page.
- Each item includes `matchResult.distance`; the smaller the distance, the closer it is to the ideal stub.


## Recording

### POST /__admin/recordings/snapshot

- **OperationId:** `takeRecordingSnapshot`
- **Description/purpose:** Take a snapshot recording.
- **Consuming screen/feature:** Recording
- **Request schema:** SnapshotRecordingRequest (record-spec + optional `filters.ids`)
- **Primary response schema:** stub-mappings

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "filters": {
    "urlPathPattern": "/api/.*",
    "method": "GET",
    "ids": [
      "40a93c4a-d378-4e07-8321-6158d5dbcb29"
    ]
  },
  "captureHeaders": {
    "Accept": {},
    "Content-Type": {
      "caseInsensitive": true
    }
  },
  "requestBodyPattern": {
    "matcher": "equalToJson",
    "ignoreArrayOrder": false,
    "ignoreExtraElements": true
  },
  "extractBodyCriteria": {
    "textSizeThreshold": "2 kb",
    "binarySizeThreshold": "1 Mb"
  },
  "outputFormat": "FULL",
  "persist": false,
  "repeatsAsScenarios": false,
  "transformers": [
    "modify-response-header"
  ],
  "transformerParameters": {
    "headerValue": "123"
  }
}
```

#### Example response body

```json
{
  "mappings": [
    {
      "id": "093f1027-e5e0-4921-9e6d-e619dfd5d2c7",
      "name": "recordables_123",
      "request": {
        "url": "/recordables/123",
        "method": "GET"
      },
      "response": {
        "status": 200,
        "body": "{\n  \"message\": \"Congratulations on your first recording!\"\n}",
        "headers": {
          "Content-Type": "application/json"
        }
      },
      "uuid": "093f1027-e5e0-4921-9e6d-e619dfd5d2c7",
      "persistent": true
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully took a snapshot recording | stub-mappings |

#### Implementation notes

- Supports `filters.ids` to generate stubs only from selected requests and `outputFormat` (FULL/IDS) in the server's public model.
- Excellent for the 'Generate stubs from selected requests' button in the Requests screen.

### POST /__admin/recordings/start

- **OperationId:** `startRecording`
- **Description/purpose:** Start recording. Begin recording stub mappings.
- **Consuming screen/feature:** Recording
- **Request schema:** StartRecordingRequest (allOf(record-spec + `targetBaseUrl` + `filters`))
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "targetBaseUrl": "http://example.mocklab.io",
  "filters": {
    "urlPathPattern": "/api/.*",
    "method": "GET"
  },
  "captureHeaders": {
    "Accept": {},
    "Content-Type": {
      "caseInsensitive": true
    }
  },
  "requestBodyPattern": {
    "matcher": "equalToJson",
    "ignoreArrayOrder": false,
    "ignoreExtraElements": true
  },
  "extractBodyCriteria": {
    "textSizeThreshold": "2048",
    "binarySizeThreshold": "10240"
  },
  "persist": false,
  "repeatsAsScenarios": false,
  "transformers": [
    "modify-response-header"
  ],
  "transformerParameters": {
    "headerValue": "123"
  }
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully started recording | no body |

#### Implementation notes

- `targetBaseUrl` is required for proxy recording. Expose the status via polling using `/__admin/recordings/status`.
- The `filters` object is 'unwrapped' onto the request pattern contract, so the same matchers from the stubs screen can be reused.

### GET /__admin/recordings/status

- **OperationId:** `getRecordingStatus`
- **Description/purpose:** Get recording status.
- **Consuming screen/feature:** Recording / Dashboard
- **Request schema:** Not applicable.
- **Primary response schema:** RecordingStatusResponse (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

_The official OpenAPI does not publish an example for this response._

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully got the record status | objeto inline |

#### Implementation notes

- Possible states in the current OpenAPI: `NeverStarted`, `Recording`, and `Stopped`.

### POST /__admin/recordings/stop

- **OperationId:** `stopRecording`
- **Description/purpose:** Stop recording. End recording of stub mappings.
- **Consuming screen/feature:** Recording
- **Request schema:** Not applicable.
- **Primary response schema:** stub-mappings

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

```json
{
  "mappings": [
    {
      "id": "093f1027-e5e0-4921-9e6d-e619dfd5d2c7",
      "name": "recordables_123",
      "request": {
        "url": "/recordables/123",
        "method": "GET"
      },
      "response": {
        "status": 200,
        "body": "{\n  \"message\": \"Congratulations on your first recording!\"\n}",
        "headers": {
          "Content-Type": "application/json"
        }
      },
      "uuid": "093f1027-e5e0-4921-9e6d-e619dfd5d2c7",
      "persistent": true
    }
  ]
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully stopped recording | stub-mappings |

#### Implementation notes

- When recording stops, the API already returns the generated stubs; open review/import immediately after success.


## Scenarios

### GET /__admin/scenarios

- **OperationId:** `getAllScenarios`
- **Description/purpose:** Get all scenarios.
- **Consuming screen/feature:** Scenarios / Dashboard
- **Request schema:** Not applicable.
- **Primary response schema:** ScenariosResponse (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

_The official OpenAPI does not publish an example for this response._

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | All scenarios | objeto inline |

#### Implementation notes

- There is no pagination. The payload is already sufficient to build a graph/React Flow view with possible states and the current state.

### POST /__admin/scenarios/reset

- **OperationId:** `resetAllScenarios`
- **Description/purpose:** Reset the state of all scenarios.
- **Consuming screen/feature:** Scenarios
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully reset | no body |

#### Implementation notes

- Use this after manual tests to return all scenarios to `Started` and immediately refresh the flow visualization.


## Files

### GET /__admin/files

- **OperationId:** `getAllFileNames`
- **Description/purpose:** Get all file names.
- **Consuming screen/feature:** Files
- **Request schema:** Not applicable.
- **Primary response schema:** string[]

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

_The official OpenAPI does not publish an example for this response._

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | All scenarios | array<string> |

#### Implementation notes

- Returns only relative names/paths. Combine it with client-side search and lazy loading of file contents.

### DELETE /__admin/files/{fileId}

- **OperationId:** `deleteFileById`
- **Description/purpose:** Delete a file if it exists.
- **Consuming screen/feature:** Files
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `fileId` | `path` | `string` | Yes | The name of the file |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | OK | no body |

#### Implementation notes

- Silent removal (always `200 OK` in the current OpenAPI); after deleting, refresh the file tree/list.

### GET /__admin/files/{fileId}

- **OperationId:** `getFileById`
- **Description/purpose:** Get file by ID.
- **Consuming screen/feature:** Files
- **Request schema:** Not applicable.
- **Primary response schema:** string | bytes (raw file content)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `fileId` | `path` | `string` | Yes | The name of the file |

#### Example response body

```text
{
  "message": "raw content of the requested file"
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | The contents of the file | no body |
| `404` | File not found | no body |

#### Implementation notes

- The response is raw content (text or bytes), not a JSON envelope. In HTTP clients, handle `responseType`/`text` according to the file type.
- If `fileId` can contain subfolders, URL-encode the separators when building the route.

### PUT /__admin/files/{fileId}

- **OperationId:** `updateFileById`
- **Description/purpose:** Update or create a file.
- **Consuming screen/feature:** Files
- **Request schema:** string
- **Primary response schema:** string

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| `fileId` | `path` | `string` | Yes | The name of the file |

#### Example request body

```text
{
  "message": "new content saved in __files"
}
```

#### Example response body

```text
{
  "message": "new content saved in __files"
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | OK - contents of the request body as a string | no body |

#### Implementation notes

- The body is sent as `application/octet-stream`. To edit JSON/text in the dashboard, serialize the string exactly as it should be written to `__files`.


## Settings / System

### POST /__admin/reset

- **OperationId:** `resetMappingsAndJournal`
- **Description/purpose:** Reset mappings and request journal. Reset mappings to the default state and reset the request journal.
- **Consuming screen/feature:** Settings / Dashboard
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully reset | no body |

#### Implementation notes

- Broad reset: clears dynamic stubs and the request journal in a single call. Ideal for a 'Reset server state' button in Settings.

### POST /__admin/settings

- **OperationId:** `updateGlobalSettings`
- **Description/purpose:** Update global settings.
- **Consuming screen/feature:** Settings
- **Request schema:** GlobalSettings (inline schema: `fixedDelay` or `delayDistribution`)
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example request body

```json
{
  "fixedDelay": 500
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Settings successfully updated | no body |

#### Implementation notes

- The OpenAPI explicitly defines `fixedDelay` and `delayDistribution`; the UI should treat them as mutually coherent global settings.
- Good UX options include presets for uniform/lognormal distributions and a preview of the impact of the global delay.

### POST /__admin/shutdown

- **OperationId:** `shutdownServer`
- **Description/purpose:** Shutdown the WireMock server.
- **Consuming screen/feature:** Settings
- **Request schema:** Not applicable.
- **Primary response schema:** no body

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Server will be shut down | no body |

#### Implementation notes

- Protect this action with strong confirmation, permissions, and clear feedback, as the instance becomes unavailable immediately afterward.


## Health / Version

### GET /__admin/health

- **OperationId:** `getHealth`
- **Description/purpose:** Return the health of the WireMock server. Returns the health of the WireMock server.
- **Consuming screen/feature:** Dashboard / Settings
- **Request schema:** Not applicable.
- **Primary response schema:** health

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

```json
{
  "status": "healthy",
  "message": "Wiremock is ok",
  "version": "3.8.0",
  "uptimeInSeconds": 14355,
  "timestamp": "2024-07-03T13:16:06.172362Z"
}
```

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successful health and uptime data | health |

#### Implementation notes

- This can be polled at short intervals for an availability badge, uptime, and quick troubleshooting.

### GET /__admin/version

- **OperationId:** `getVersion`
- **Description/purpose:** Return the version of the WireMock server. Returns the version of the WireMock server.
- **Consuming screen/feature:** Dashboard / Settings
- **Request schema:** Not applicable.
- **Primary response schema:** VersionResponse (schema inline)

#### Path/query parameters

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| — | — | — | — | No documented parameters. |

#### Example response body

_The official OpenAPI does not publish an example for this response._

#### Possible status codes

| Status | Description | Primary schema |
|---|---|---|
| `200` | Successfully returned the version of the WireMock server | objeto inline |

#### Implementation notes

- Use it in the header and on the Dashboard to display UI compatibility with the target WireMock server.
