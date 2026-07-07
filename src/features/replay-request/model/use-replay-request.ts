import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LoggedRequest } from "@/entities/serve-event";
import { env } from "@/shared/config/env";

const FORBIDDEN_REQUEST_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "origin",
  "referer",
]);

function toReplayPath(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function toReplayUrl(request: LoggedRequest): string {
  return new URL(toReplayPath(request.absoluteUrl ?? request.url), env.wiremockBaseUrl).toString();
}

function canSendBody(method: string): boolean {
  return !["GET", "HEAD"].includes(method.toUpperCase());
}

function toReplayHeaders(headers: LoggedRequest["headers"]): Headers {
  const replayHeaders = new Headers();

  Object.entries(headers ?? {}).forEach(([key, value]) => {
    if (!value || FORBIDDEN_REQUEST_HEADERS.has(key.toLowerCase())) {
      return;
    }

    replayHeaders.set(key, value);
  });

  return replayHeaders;
}

export function useReplayRequest() {
  return useMutation({
    mutationFn: async (request: LoggedRequest) => {
      const method = request.method || "GET";
      const response = await fetch(toReplayUrl(request), {
        method,
        headers: toReplayHeaders(request.headers),
        body: canSendBody(method) ? request.body : undefined,
      });

      toast.success(`Request replayed with status ${response.status}.`);

      return {
        status: response.status,
      };
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to replay the request.");
    },
  });
}
