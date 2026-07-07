import { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Inbox, RefreshCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useRequestJournal } from "@/entities/serve-event";
import type { RequestJournalCriteria, ServeEvent } from "@/entities/serve-event";
import { cn } from "@/shared/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { HttpMethodBadge } from "@/shared/ui/http-method-badge";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatusCodeBadge } from "@/shared/ui/status-code-badge";
import { Switch } from "@/shared/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

type RequestTableProps = {
  onRowClick?: (id: string) => void;
  selectedId?: string | null;
};

const METHOD_OPTIONS = ["ALL", "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"] as const;

function formatAbsoluteDate(timestamp: number | undefined): string {
  if (!timestamp) {
    return "Unknown time";
  }

  return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
}

function formatRelativeDate(timestamp: number | undefined): string {
  if (!timestamp) {
    return "—";
  }

  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

function updateSearchParam(
  searchParams: URLSearchParams,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  key: string,
  value: string | null
) {
  const nextSearchParams = new URLSearchParams(searchParams);

  if (value && value.length > 0) {
    nextSearchParams.set(key, value);
  } else {
    nextSearchParams.delete(key);
  }

  setSearchParams(nextSearchParams, { replace: true });
}

function RequestTableSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export function RequestTable({ onRowClick, selectedId }: RequestTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get("search") ?? "";
  const methodValue = searchParams.get("method") ?? "ALL";
  const matchedValue = searchParams.get("matched") ?? "all";
  const live = searchParams.get("live") === "1";
  const [searchInput, setSearchInput] = useState(searchValue);

  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (searchInput === searchValue) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      updateSearchParam(searchParams, setSearchParams, "search", searchInput.trim() || null);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, searchParams, searchValue, setSearchParams]);

  const matchedFilter = matchedValue === "matched" ? true : matchedValue === "unmatched" ? false : undefined;

  const criteria = useMemo<RequestJournalCriteria>(
    () => ({
      method: methodValue === "ALL" ? undefined : methodValue,
      matched: matchedFilter,
      urlPathPattern: searchValue || undefined,
    }),
    [matchedFilter, methodValue, searchValue]
  );

  const {
    data,
    error,
    isError,
    isLoading,
    refetch,
  } = useRequestJournal(criteria, { live });

  const requests = data?.requests ?? [];

  const columns = useMemo<ColumnDef<ServeEvent>[]>(
    () => [
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm">{formatRelativeDate(row.original.request.loggedDate)}</span>
              </TooltipTrigger>
              <TooltipContent>{formatAbsoluteDate(row.original.request.loggedDate)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => <HttpMethodBadge method={row.original.request.method} />,
      },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => (
          <div className="min-w-0 space-y-1 whitespace-normal">
            <p className="truncate font-mono text-xs sm:text-sm">{row.original.request.url}</p>
            {row.original.request.absoluteUrl ? (
              <p className="truncate text-xs text-muted-foreground">{row.original.request.absoluteUrl}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "matched",
        header: "Matched",
        cell: ({ row }) => (
          <div className="space-y-1 whitespace-normal">
            <Badge variant={row.original.wasMatched ? "secondary" : "destructive"}>
              {row.original.wasMatched ? "Matched" : "Unmatched"}
            </Badge>
            {row.original.wasMatched && row.original.stubMapping?.name ? (
              <p className="text-xs text-muted-foreground">{row.original.stubMapping.name}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusCodeBadge status={row.original.response?.status ?? row.original.responseDefinition?.status} />
        ),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => <span>{row.original.timing?.totalTime != null ? `${row.original.timing.totalTime} ms` : "—"}</span>,
      },
      {
        accessorKey: "clientIp",
        header: "Client IP",
        cell: ({ row }) => <span>{row.original.request.clientIp ?? "—"}</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <RequestTableSkeleton />;
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by URL or method"
            className="w-full sm:max-w-sm"
          />

          <Select
            value={methodValue}
            onValueChange={(value) => updateSearchParam(searchParams, setSearchParams, "method", value === "ALL" ? null : value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              {METHOD_OPTIONS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method === "ALL" ? "All methods" : method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={matchedValue}
            onValueChange={(value) => updateSearchParam(searchParams, setSearchParams, "matched", value === "all" ? null : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Match state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All requests</SelectItem>
              <SelectItem value="matched">Matched only</SelectItem>
              <SelectItem value="unmatched">Unmatched only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Live tail</span>
          <Switch
            checked={live}
            onCheckedChange={(checked) => updateSearchParam(searchParams, setSearchParams, "live", checked ? "1" : null)}
            aria-label="Toggle live tail"
          />
        </div>
      </div>

      {data?.requestJournalDisabled ? (
        <Alert>
          <AlertTitle>Request journal is disabled</AlertTitle>
          <AlertDescription>
            Enable WireMock request journaling to inspect request history from this dashboard.
          </AlertDescription>
        </Alert>
      ) : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load requests</AlertTitle>
          <AlertDescription className="gap-3">
            <p>{error instanceof Error ? error.message : "The request journal could not be loaded."}</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCcw className="size-4" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!isError && requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No requests match the current filters"
          description="Adjust the filters or wait for new traffic to reach WireMock."
          action={
            <Button
              variant="outline"
              onClick={() => {
                const nextSearchParams = new URLSearchParams(searchParams);
                nextSearchParams.delete("search");
                nextSearchParams.delete("method");
                nextSearchParams.delete("matched");
                setSearchParams(nextSearchParams, { replace: true });
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : null}

      {!isError && requests.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{requests.length}</span> requests
            </p>
          </div>

          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.original.id === selectedId ? "selected" : undefined}
                  className={cn("cursor-pointer", row.original.id === selectedId && "bg-muted")}
                  onClick={() => onRowClick?.(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
