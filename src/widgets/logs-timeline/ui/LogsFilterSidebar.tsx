import { FilterIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export type LogsFilters = {
  method: string;
  status: "all" | "2xx" | "3xx" | "4xx" | "5xx" | "na";
  matchState: "all" | "matched" | "unmatched";
  timeRange: "all" | "15m" | "1h" | "24h";
};

export const defaultLogsFilters: LogsFilters = {
  method: "all",
  status: "all",
  matchState: "all",
  timeRange: "all",
};

type LogsFilterSidebarProps = {
  filters: LogsFilters;
  availableMethods: string[];
  onChange: (filters: LogsFilters) => void;
  onClear: () => void;
};

export function LogsFilterSidebar({ filters, availableMethods, onChange, onClear }: LogsFilterSidebarProps) {
  return (
    <Card className="min-h-[32rem]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FilterIcon className="size-4 text-muted-foreground" />
          <CardTitle>Filters</CardTitle>
        </div>
        <CardDescription>Refine the request journal client-side without triggering extra API calls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logs-method-filter">Method</Label>
          <Select value={filters.method} onValueChange={(value) => onChange({ ...filters, method: value })}>
            <SelectTrigger className="w-full" id="logs-method-filter">
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {availableMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logs-status-filter">Status</Label>
          <Select value={filters.status} onValueChange={(value) => onChange({ ...filters, status: value as LogsFilters["status"] })}>
            <SelectTrigger className="w-full" id="logs-status-filter">
              <SelectValue placeholder="All status codes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="2xx">2xx</SelectItem>
              <SelectItem value="3xx">3xx</SelectItem>
              <SelectItem value="4xx">4xx</SelectItem>
              <SelectItem value="5xx">5xx</SelectItem>
              <SelectItem value="na">N/A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logs-match-filter">Matched state</Label>
          <Select
            value={filters.matchState}
            onValueChange={(value) => onChange({ ...filters, matchState: value as LogsFilters["matchState"] })}
          >
            <SelectTrigger className="w-full" id="logs-match-filter">
              <SelectValue placeholder="All entries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entries</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logs-time-filter">Time range</Label>
          <Select value={filters.timeRange} onValueChange={(value) => onChange({ ...filters, timeRange: value as LogsFilters["timeRange"] })}>
            <SelectTrigger className="w-full" id="logs-time-filter">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">Last 15 minutes</SelectItem>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" type="button" variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      </CardContent>
    </Card>
  );
}
