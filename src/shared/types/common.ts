/** Generic paginated response shape used across list views (client-side pagination helpers). */
export type Paginated<T> = {
  items: T[];
  total: number;
};

/** Standard HTTP methods supported by WireMock request matching. */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE" | "ANY";

/** Sort direction used by generic table widgets. */
export type SortDirection = "asc" | "desc";
