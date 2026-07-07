import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import type { NearMiss } from "@/entities/near-miss";
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

type GenerateStubFromNearMissDialogProps = {
  nearMiss: NearMiss;
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

function toResponseHeaders(headers: unknown) {
  if (!headers || typeof headers !== "object") {
    return undefined;
  }

  const entries = Object.entries(headers).filter(([key, value]) => value && !IGNORED_RESPONSE_HEADERS.has(key.toLowerCase()));
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function buildResponse(nearMiss: NearMiss) {
  const stubResponse = nearMiss.stubMapping?.response;
  const status =
    stubResponse && typeof stubResponse.status === "number"
      ? stubResponse.status
      : 200;
  const body =
    stubResponse && typeof stubResponse.body === "string"
      ? stubResponse.body
      : "";
  const headers = stubResponse ? toResponseHeaders(stubResponse.headers) : undefined;

  return {
    status,
    ...(headers ? { headers } : {}),
    body,
  };
}

function buildStubMapping(nearMiss: NearMiss, includeHeaders: boolean) {
  const requestHeaders = includeHeaders ? toHeaderMatchers(nearMiss.request.headers) : undefined;

  return {
    name: `Generated from near miss ${nearMiss.request.method} ${toUrlPath(nearMiss.request.url)}`,
    request: {
      method: nearMiss.request.method,
      url: toUrlPath(nearMiss.request.url),
      ...(requestHeaders ? { headers: requestHeaders } : {}),
    },
    response: buildResponse(nearMiss),
  };
}

export function GenerateStubFromNearMissDialog({
  nearMiss,
  onCreated,
  trigger,
}: GenerateStubFromNearMissDialogProps) {
  const [open, setOpen] = useState(false);
  const [includeHeaders, setIncludeHeaders] = useState(false);
  const [stubJson, setStubJson] = useState(() => toPrettyJson(buildStubMapping(nearMiss, false)));
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStubJson(toPrettyJson(buildStubMapping(nearMiss, includeHeaders)));
  }, [includeHeaders, nearMiss, open]);

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

      toast.success("Stub created from near miss.");

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
          <DialogTitle>Generate stub from near miss</DialogTitle>
          <DialogDescription>
            Start from the unmatched request and refine the generated stub before saving it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label htmlFor="near-miss-headers-switch">Include request headers</Label>
            <p className="text-sm text-muted-foreground">
              Add stable request headers as exact matchers in the generated stub.
            </p>
          </div>
          <Switch
            id="near-miss-headers-switch"
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
