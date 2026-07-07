import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import type { ServeEvent } from "@/entities/serve-event";
import { wireMockClient } from "@/shared/api/wiremock-client";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { JsonEditor } from "@/shared/ui/json-editor";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

type CreateStubResponse = {
  id?: string;
};

type GenerateStubFromRequestDialogProps = {
  serveEvent: ServeEvent;
  onCreated?: (id: string) => void;
  trigger?: ReactNode;
};

const IGNORED_REQUEST_HEADERS = new Set(["accept-encoding", "connection", "content-length", "host"]);
const IGNORED_RESPONSE_HEADERS = new Set(["connection", "content-length", "date", "server", "transfer-encoding"]);

function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function toUrlPath(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function toHeaderMatchers(headers: Record<string, string> | undefined) {
  const entries = Object.entries(headers ?? {}).filter(([key, value]) => value && !IGNORED_REQUEST_HEADERS.has(key.toLowerCase()));

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries.map(([key, value]) => [key, { equalTo: value }]));
}

function toResponseHeaders(headers: Record<string, string> | undefined) {
  const filteredEntries = Object.entries(headers ?? {}).filter(([key, value]) => value && !IGNORED_RESPONSE_HEADERS.has(key.toLowerCase()));

  return filteredEntries.length > 0 ? Object.fromEntries(filteredEntries) : undefined;
}

function buildResponse(serveEvent: ServeEvent) {
  const status = serveEvent.response?.status ?? serveEvent.responseDefinition?.status ?? 200;
  const body = serveEvent.response?.body ?? serveEvent.responseDefinition?.body;
  const headers = toResponseHeaders(serveEvent.response?.headers ?? serveEvent.responseDefinition?.headers);

  return {
    status,
    ...(headers ? { headers } : {}),
    ...(body !== undefined ? { body } : {}),
    ...(body === undefined && serveEvent.responseDefinition?.jsonBody !== undefined
      ? { jsonBody: serveEvent.responseDefinition.jsonBody }
      : {}),
  };
}

function buildStubMapping(serveEvent: ServeEvent, includeHeaders: boolean) {
  const requestHeaders = includeHeaders ? toHeaderMatchers(serveEvent.request.headers) : undefined;

  return {
    name: `Generated from ${serveEvent.request.method} ${toUrlPath(serveEvent.request.url)}`,
    request: {
      method: serveEvent.request.method,
      url: toUrlPath(serveEvent.request.url),
      ...(requestHeaders ? { headers: requestHeaders } : {}),
    },
    response: buildResponse(serveEvent),
  };
}

export function GenerateStubFromRequestDialog({
  serveEvent,
  onCreated,
  trigger,
}: GenerateStubFromRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [includeHeaders, setIncludeHeaders] = useState(false);
  const [stubJson, setStubJson] = useState(() => toPrettyJson(buildStubMapping(serveEvent, false)));
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStubJson(toPrettyJson(buildStubMapping(serveEvent, includeHeaders)));
  }, [includeHeaders, open, serveEvent]);

  async function handleCreate() {
    let payload: unknown;

    try {
      payload = JSON.parse(stubJson);
    } catch {
      toast.error("Stub JSON must be valid before creating the stub.");
      return;
    }

    try {
      setIsCreating(true);
      const createdStub = await wireMockClient.post<CreateStubResponse>("/__admin/mappings", payload);

      toast.success("Stub created from request.");

      if (createdStub.id) {
        onCreated?.(createdStub.id);
      }

      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create the stub.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Generate Stub</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generate stub from request</DialogTitle>
          <DialogDescription>
            Review the generated stub mapping before saving it to WireMock.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label htmlFor="request-headers-switch">Include request headers</Label>
            <p className="text-sm text-muted-foreground">
              Add stable request headers as exact matchers in the generated stub.
            </p>
          </div>
          <Switch
            id="request-headers-switch"
            checked={includeHeaders}
            onCheckedChange={setIncludeHeaders}
            aria-label="Include request headers"
          />
        </div>

        <JsonEditor value={stubJson} onChange={setStubJson} language="json" height={420} />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create stub"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
