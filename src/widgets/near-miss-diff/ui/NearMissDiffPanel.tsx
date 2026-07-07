import { Search } from "lucide-react";
import type { NearMiss } from "@/entities/near-miss";
import { GenerateStubFromNearMissDialog } from "@/features/generate-stub-from-near-miss";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { JsonEditor } from "@/shared/ui/json-editor";
import { Progress } from "@/shared/ui/progress";

type NearMissDiffPanelProps = {
  nearMiss?: NearMiss | null;
};

function toPrettyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function toSimilarity(distance: number): number {
  return Math.max(0, Math.min(100, (1 - distance) * 100));
}

export function NearMissDiffPanel({ nearMiss }: NearMissDiffPanelProps) {
  if (!nearMiss) {
    return (
      <Card className="py-0">
        <CardContent className="py-6">
          <EmptyState
            icon={Search}
            title="Select a near miss"
            description="Pick an item from the list to compare the expected and actual request shapes."
          />
        </CardContent>
      </Card>
    );
  }

  const similarity = toSimilarity(nearMiss.matchResult.distance);
  const expectedRequestPattern = nearMiss.stubMapping?.request ?? nearMiss.requestPattern ?? {};

  return (
    <Card className="gap-4 py-0">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Near miss diff</CardTitle>
            <CardDescription>
              {nearMiss.stubMapping?.name
                ? `Closest stub: ${nearMiss.stubMapping.name}`
                : "Compare the closest request pattern against the unmatched request."}
            </CardDescription>
          </div>

          <GenerateStubFromNearMissDialog
            nearMiss={nearMiss}
            trigger={
              <Button variant="outline">
                Generate Stub
              </Button>
            }
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Similarity score</span>
            <span className="text-sm text-muted-foreground">{similarity.toFixed(0)}%</span>
          </div>
          <Progress value={similarity} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Expected request pattern</h3>
            <JsonEditor value={toPrettyJson(expectedRequestPattern)} readOnly language="json" height={420} />
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Actual request</h3>
            <JsonEditor value={toPrettyJson(nearMiss.request)} readOnly language="json" height={420} />
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
