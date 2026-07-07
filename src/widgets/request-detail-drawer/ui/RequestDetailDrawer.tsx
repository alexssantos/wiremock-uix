import { useMemo } from "react";
import { Download, Inbox, Play, Trash2 } from "lucide-react";
import { useDeleteRequest, useRequest } from "@/entities/serve-event";
import { GenerateStubFromRequestDialog } from "@/features/generate-stub-from-request";
import { useReplayRequest } from "@/features/replay-request";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { HttpMethodBadge } from "@/shared/ui/http-method-badge";
import { JsonEditor } from "@/shared/ui/json-editor";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatusCodeBadge } from "@/shared/ui/status-code-badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type RequestDetailDrawerProps = {
  open: boolean;
  requestId?: string | null;
  onOpenChange: (open: boolean) => void;
};

type KeyValueTableProps = {
  entries: Record<string, string> | undefined;
  emptyMessage: string;
};

function getHeaderValue(headers: Record<string, string> | undefined, headerName: string): string | undefined {
  const matchedEntry = Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === headerName.toLowerCase());
  return matchedEntry?.[1];
}

function detectEditorLanguage(contentType: string | undefined, body: string): "json" | "xml" | "html" | "plaintext" {
  const normalizedContentType = contentType?.toLowerCase() ?? "";
  const trimmedBody = body.trim();

  if (normalizedContentType.includes("json") || trimmedBody.startsWith("{") || trimmedBody.startsWith("[")) {
    return "json";
  }

  if (normalizedContentType.includes("xml") || trimmedBody.startsWith("<")) {
    return "xml";
  }

  if (normalizedContentType.includes("html")) {
    return "html";
  }

  return "plaintext";
}

function formatPayload(body: string | undefined, contentType: string | undefined): string {
  if (!body) {
    return "";
  }

  if (detectEditorLanguage(contentType, body) === "json") {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }

  return body;
}

function downloadJsonFile(fileName: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(downloadUrl);
}

function KeyValueTable({ entries, emptyMessage }: KeyValueTableProps) {
  const rows = Object.entries(entries ?? {});

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([key, value]) => (
          <TableRow key={key}>
            <TableCell className="font-mono text-xs">{key}</TableCell>
            <TableCell className="font-mono text-xs whitespace-normal break-all">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RequestDetailSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export function RequestDetailDrawer({ open, requestId, onOpenChange }: RequestDetailDrawerProps) {
  const { data, error, isError, isLoading, refetch } = useRequest(open ? requestId : null);
  const deleteRequest = useDeleteRequest();
  const replayRequest = useReplayRequest();

  const requestBody = useMemo(() => {
    const contentType = getHeaderValue(data?.request.headers, "content-type");
    return formatPayload(data?.request.body, contentType);
  }, [data?.request.body, data?.request.headers]);

  const responseStatus = data?.response?.status ?? data?.responseDefinition?.status;
  const responseHeaders = data?.response?.headers ?? data?.responseDefinition?.headers;
  const responseContentType = getHeaderValue(responseHeaders, "content-type");
  const responseBodySource =
    data?.response?.body ??
    data?.responseDefinition?.body ??
    (data?.responseDefinition?.jsonBody !== undefined ? JSON.stringify(data.responseDefinition.jsonBody) : "");
  const responseBody = formatPayload(responseBodySource, responseContentType);

  async function handleDelete() {
    if (!data) {
      return;
    }

    await deleteRequest.mutateAsync(data.id);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-5xl">
        <SheetHeader className="border-b">
          <div className="flex flex-wrap items-center gap-3">
            {data ? <HttpMethodBadge method={data.request.method} /> : null}
            <SheetTitle>Request details</SheetTitle>
            {data ? <StatusCodeBadge status={responseStatus} /> : null}
          </div>
          <SheetDescription className="font-mono text-xs break-all">
            {data?.request.url ?? "Loading request details..."}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? <RequestDetailSkeleton /> : null}

        {isError ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTitle>Failed to load request details</AlertTitle>
              <AlertDescription className="gap-3">
                <p>{error instanceof Error ? error.message : "The request details could not be loaded."}</p>
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        {!isLoading && !isError && !data ? (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              title="No request selected"
              description="Choose a request from the table to inspect it in detail."
            />
          </div>
        ) : null}

        {data ? (
          <>
            <Tabs defaultValue="request" className="min-h-0 flex-1 gap-0">
              <div className="border-b px-4 py-3">
                <TabsList>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <TabsContent value="request" className="space-y-6 p-4">
                  <section className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Method</p>
                      <div className="mt-2">
                        <HttpMethodBadge method={data.request.method} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Client IP</p>
                      <p className="mt-2 text-sm text-muted-foreground">{data.request.clientIp ?? "Unknown"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium">URL</p>
                      <p className="mt-2 font-mono text-xs break-all">{data.request.absoluteUrl ?? data.request.url}</p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Headers</h3>
                    <KeyValueTable entries={data.request.headers} emptyMessage="No request headers were recorded." />
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Cookies</h3>
                    <KeyValueTable entries={data.request.cookies} emptyMessage="No cookies were recorded." />
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Body</h3>
                    <JsonEditor
                      value={requestBody}
                      readOnly
                      language={detectEditorLanguage(getHeaderValue(data.request.headers, "content-type"), requestBody)}
                      height={320}
                    />
                  </section>
                </TabsContent>

                <TabsContent value="response" className="space-y-6 p-4">
                  <section className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <div className="mt-2">
                        <StatusCodeBadge status={responseStatus} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Matched</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {data.wasMatched ? data.stubMapping?.name ?? "Matched by a configured stub" : "No matching stub"}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Headers</h3>
                    <KeyValueTable entries={responseHeaders} emptyMessage="No response headers were recorded." />
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Body</h3>
                    <JsonEditor
                      value={responseBody}
                      readOnly
                      language={detectEditorLanguage(responseContentType, responseBody)}
                      height={320}
                    />
                  </section>
                </TabsContent>

                <TabsContent value="raw" className="p-4">
                  <JsonEditor value={JSON.stringify(data, null, 2)} readOnly language="json" height={520} />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <SheetFooter className="border-t bg-background">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleteRequest.isPending}>
                      <Trash2 className="size-4" />
                      {deleteRequest.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this request?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action removes the request from the journal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => void handleDelete()}>
                        Delete request
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button variant="outline" onClick={() => downloadJsonFile(`request-${data.id}.json`, data)}>
                  <Download className="size-4" />
                  Export
                </Button>

                <GenerateStubFromRequestDialog
                  serveEvent={data}
                  trigger={
                    <Button variant="outline">
                      Generate Stub
                    </Button>
                  }
                />

                <Button onClick={() => replayRequest.mutate(data.request)} disabled={replayRequest.isPending}>
                  <Play className="size-4" />
                  {replayRequest.isPending ? "Replaying..." : "Replay"}
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
