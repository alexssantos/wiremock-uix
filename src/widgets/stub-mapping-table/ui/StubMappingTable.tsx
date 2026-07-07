import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import { AlertCircle, Copy, Download, MoreHorizontal, Pencil, Plus, Search, Trash2, Webhook } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { HttpMethod } from "@/shared/types/common";
import type { StubMapping } from "@/entities/stub-mapping";
import { useStubMappings } from "@/entities/stub-mapping";
import { useDuplicateStubMapping } from "@/features/duplicate-stub-mapping";
import { useExportStubMappings } from "@/features/export-stub-mappings";
import { FavoriteToggle, useFavoriteStubMappings } from "@/features/favorite-stub-mapping";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { EmptyState } from "@/shared/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { HttpMethodBadge } from "@/shared/ui/http-method-badge";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatusCodeBadge } from "@/shared/ui/status-code-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

const methodFilterValues = ["ALL", "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE", "ANY"] as const;
const pageSizeOptions = [10, 20, 50] as const;

type StubMappingTableProps = {
  onImportRequested?: () => void;
  onDeleteRequested?: (stubMappings: StubMapping[]) => void;
};

type UrlDescriptor = {
  label: string;
  mode: "url" | "urlPath" | "urlPattern" | "urlPathPattern" | "unknown";
};

function getStubMappingUrl(stubMapping: StubMapping): UrlDescriptor {
  if (stubMapping.request?.url) {
    return { label: stubMapping.request.url, mode: "url" };
  }

  if (stubMapping.request?.urlPath) {
    return { label: stubMapping.request.urlPath, mode: "urlPath" };
  }

  if (stubMapping.request?.urlPattern) {
    return { label: stubMapping.request.urlPattern, mode: "urlPattern" };
  }

  if (stubMapping.request?.urlPathPattern) {
    return { label: stubMapping.request.urlPathPattern, mode: "urlPathPattern" };
  }

  return { label: "No URL configured", mode: "unknown" };
}

function getStubMappingId(stubMapping: StubMapping, index: number) {
  return stubMapping.id ?? stubMapping.uuid ?? `${getStubMappingUrl(stubMapping).label}-${index}`;
}

function parsePositiveNumber(value: string | null, fallback: number) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}

export function StubMappingTable({ onImportRequested, onDeleteRequested }: StubMappingTableProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const duplicateStubMapping = useDuplicateStubMapping();
  const exportStubMappings = useExportStubMappings();
  const { favoriteIds } = useFavoriteStubMappings();
  const stubMappingsQuery = useStubMappings({});

  const search = searchParams.get("search") ?? "";
  const methodFilter = (searchParams.get("method") as HttpMethod | null) ?? null;
  const favoritesOnly = searchParams.get("favorites") === "1";
  const pageIndex = parsePositiveNumber(searchParams.get("page"), 1) - 1;
  const pageSize = parsePositiveNumber(searchParams.get("pageSize"), 10);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (searchInput.trim()) {
          nextParams.set("search", searchInput.trim());
        } else {
          nextParams.delete("search");
        }
        nextParams.set("page", "1");
        return nextParams;
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput, setSearchParams]);

  const allMappings = stubMappingsQuery.data?.mappings ?? [];

  const filteredMappings = useMemo(() => {
    return allMappings.filter((stubMapping) => {
      const urlDescriptor = getStubMappingUrl(stubMapping);
      const normalizedSearch = search.toLowerCase();
      const matchesSearch = normalizedSearch
        ? urlDescriptor.label.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesMethod = methodFilter ? stubMapping.request?.method === methodFilter : true;
      const matchesFavorite = favoritesOnly
        ? (() => {
            const id = stubMapping.id ?? stubMapping.uuid;
            return id ? favoriteIds.includes(id) : false;
          })()
        : true;

      return matchesSearch && matchesMethod && matchesFavorite;
    });
  }, [allMappings, favoriteIds, favoritesOnly, methodFilter, search]);

  useEffect(() => {
    const maxPageIndex = Math.max(0, Math.ceil(filteredMappings.length / pageSize) - 1);
    if (pageIndex > maxPageIndex) {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set("page", String(maxPageIndex + 1));
        return nextParams;
      });
    }
  }, [filteredMappings.length, pageIndex, pageSize, setSearchParams]);

  const columnHelper = createColumnHelper<StubMapping>();

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select current page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      size: 36,
    }),
    columnHelper.display({
      id: "favorite",
      header: "",
      cell: ({ row, row: { index } }) => <FavoriteToggle id={row.original.id ?? row.original.uuid ?? getStubMappingId(row.original, index)} />,
      enableSorting: false,
      size: 48,
    }),
    columnHelper.display({
      id: "method",
      header: "Method",
      cell: ({ row }) => <HttpMethodBadge method={row.original.request?.method ?? "ANY"} />,
    }),
    columnHelper.display({
      id: "url",
      header: "URL / pattern",
      cell: ({ row }) => {
        const descriptor = getStubMappingUrl(row.original);
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">{descriptor.label}</div>
            <div className="text-xs text-muted-foreground">{descriptor.mode}</div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "status",
      header: "Response",
      cell: ({ row }) => <StatusCodeBadge status={row.original.response?.status} />,
    }),
    columnHelper.display({
      id: "priority",
      header: "Priority",
      cell: ({ row }) => row.original.priority ?? "—",
    }),
    columnHelper.display({
      id: "scenario",
      header: "Scenario",
      cell: ({ row }) => row.original.scenarioName ?? "—",
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const mapping = row.original;
        const mappingId = mapping.id ?? mapping.uuid;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Open row actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={!mappingId} onClick={() => mappingId && navigate(`/mappings/${mappingId}`)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateStubMapping(mapping)}>
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportStubMappings(mapping)}>
                <Download className="size-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDeleteRequested?.([mapping])}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      size: 56,
    }),
  ], [columnHelper, duplicateStubMapping, exportStubMappings, navigate, onDeleteRequested]);

  const table = useReactTable({
    data: filteredMappings,
    columns,
    state: {
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const nextPagination = functionalUpdate(updater, { pageIndex, pageSize });
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set("page", String(nextPagination.pageIndex + 1));
        nextParams.set("pageSize", String(nextPagination.pageSize));
        return nextParams;
      });
    },
    enableRowSelection: true,
    getRowId: (row, index) => getStubMappingId(row, index),
  });

  const selectedMappings = table.getSelectedRowModel().rows.map((row) => row.original);

  if (stubMappingsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Unable to load stub mappings</AlertTitle>
        <AlertDescription>
          <p>{stubMappingsQuery.error instanceof Error ? stubMappingsQuery.error.message : "An unexpected error occurred while loading stub mappings."}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void stubMappingsQuery.refetch()}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const noMappings = !stubMappingsQuery.isLoading && allMappings.length === 0;
  const noFilteredResults = !stubMappingsQuery.isLoading && allMappings.length > 0 && filteredMappings.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by URL or pattern"
              className="pl-9"
            />
          </div>

          <Select
            value={methodFilter ?? "ALL"}
            onValueChange={(value) => {
              setSearchParams((currentParams) => {
                const nextParams = new URLSearchParams(currentParams);
                if (value === "ALL") {
                  nextParams.delete("method");
                } else {
                  nextParams.set("method", value);
                }
                nextParams.set("page", "1");
                return nextParams;
              });
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              {methodFilterValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {value === "ALL" ? "All methods" : value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant={favoritesOnly ? "secondary" : "outline"}
            onClick={() => {
              setSearchParams((currentParams) => {
                const nextParams = new URLSearchParams(currentParams);
                if (favoritesOnly) {
                  nextParams.delete("favorites");
                } else {
                  nextParams.set("favorites", "1");
                }
                nextParams.set("page", "1");
                return nextParams;
              });
            }}
          >
            Favorites only
          </Button>
        </div>

        <Button type="button" onClick={() => navigate("/mappings/new")}>
          <Plus className="size-4" />
          New Stub Mapping
        </Button>
      </div>

      {selectedMappings.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="text-sm font-medium">{selectedMappings.length} mapping(s) selected</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => exportStubMappings(selectedMappings)}>
              <Download className="size-4" />
              Export selected
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => onDeleteRequested?.(selectedMappings)}>
              <Trash2 className="size-4" />
              Delete selected
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setRowSelection({})}>
              Clear selection
            </Button>
          </div>
        </div>
      ) : null}

      {stubMappingsQuery.isLoading ? (
        <div className="rounded-lg border">
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="grid grid-cols-[36px_48px_110px_minmax(0,1fr)_100px_90px_160px_56px] gap-3">
                {Array.from({ length: 8 }).map((__, cellIndex) => (
                  <Skeleton key={`skeleton-${index}-${cellIndex}`} className="h-10" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {noMappings ? (
        <EmptyState
          icon={Webhook}
          title="No stub mappings yet"
          description="Create your first stub mapping or import an existing JSON file."
          action={(
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" onClick={() => navigate("/mappings/new")}>
                <Plus className="size-4" />
                New Stub Mapping
              </Button>
              <Button type="button" variant="outline" onClick={onImportRequested}>
                Import mappings
              </Button>
            </div>
          )}
        />
      ) : null}

      {noFilteredResults ? (
        <EmptyState
          icon={Search}
          title="No stub mappings match your filters"
          description="Try another search term, method, or favorite filter."
          action={(
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchInput("");
                setSearchParams(new URLSearchParams());
              }}
            >
              Clear filters
            </Button>
          )}
        />
      ) : null}

      {!stubMappingsQuery.isLoading && !noMappings && !noFilteredResults ? (
        <>
          <div className="rounded-lg border">
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
                  <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
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

          <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredMappings.length === 0 ? 0 : pageIndex * pageSize + 1}
              {"–"}
              {Math.min(filteredMappings.length, (pageIndex + 1) * pageSize)} of {filteredMappings.length} filtered mapping(s)
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                  table.setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="button" variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
