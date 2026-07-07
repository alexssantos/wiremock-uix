import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { useNearMissesForUnmatched } from "@/entities/near-miss";
import type { NearMiss } from "@/entities/near-miss";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { HttpMethodBadge } from "@/shared/ui/http-method-badge";
import { PageHeader } from "@/shared/ui/page-header";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { NearMissDiffPanel } from "@/widgets/near-miss-diff";

function getNearMissKey(nearMiss: NearMiss, index: number): string {
  return `${nearMiss.request.method}:${nearMiss.request.url}:${nearMiss.request.loggedDate ?? index}`;
}

function toSimilarity(distance: number): number {
  return Math.max(0, Math.min(100, (1 - distance) * 100));
}

function NearMissesPageSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <Card className="py-0">
        <CardHeader className="border-b">
          <CardTitle>Closest matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 py-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
      <Skeleton className="h-[560px] w-full rounded-xl" />
    </div>
  );
}

export function NearMissesPage() {
  const { data, error, isError, isLoading } = useNearMissesForUnmatched();
  const nearMisses = data?.nearMisses ?? [];
  const items = useMemo(
    () => nearMisses.map((nearMiss, index) => ({ key: getNearMissKey(nearMiss, index), nearMiss })),
    [nearMisses]
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedKey(null);
      return;
    }

    if (!selectedKey || !items.some((item) => item.key === selectedKey)) {
      setSelectedKey(items[0].key);
    }
  }, [items, selectedKey]);

  const selectedNearMiss = items.find((item) => item.key === selectedKey)?.nearMiss ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Near Misses"
        description="Diagnose almost-matching requests and compare them with the closest stub candidates."
      />

      {isLoading ? <NearMissesPageSkeleton /> : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Failed to load near misses</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Near-miss data could not be loaded."}
          </AlertDescription>
        </Alert>
      ) : null}

      {!isLoading && !isError && nearMisses.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No unmatched requests need investigation right now"
          description="WireMock did not report any near misses for unmatched requests."
        />
      ) : null}

      {!isLoading && !isError && nearMisses.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <Card className="py-0">
            <CardHeader className="border-b">
              <CardTitle>Closest matches</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[560px]">
                <div className="space-y-2 p-4">
                  {items.map(({ key, nearMiss }) => {
                    const similarity = toSimilarity(nearMiss.matchResult.distance);
                    const isSelected = selectedKey === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedKey(key)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-2">
                            <HttpMethodBadge method={nearMiss.request.method} />
                            <p className="truncate font-mono text-xs">{nearMiss.request.url}</p>
                            <p className="text-xs text-muted-foreground">
                              {nearMiss.stubMapping?.name ?? "Closest request pattern"}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">{similarity.toFixed(0)}%</span>
                        </div>
                        <div className="mt-3 space-y-1">
                          <Progress value={similarity} />
                          <p className="text-xs text-muted-foreground">Distance: {nearMiss.matchResult.distance.toFixed(3)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <NearMissDiffPanel nearMiss={selectedNearMiss} />
        </div>
      ) : null}
    </div>
  );
}
