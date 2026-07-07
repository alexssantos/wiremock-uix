import { GitBranch, RefreshCw } from "lucide-react";
import { useResetAllScenarios, useScenarios } from "@/entities/scenario";
import { ScenarioGraph } from "@/widgets/scenario-graph";
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
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

export function ScenariosPage() {
  const scenariosQuery = useScenarios();
  const resetAllScenariosMutation = useResetAllScenarios();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scenarios"
        description="Visualize the current scenario state machines managed by WireMock."
        actions={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={resetAllScenariosMutation.isPending} variant="outline">
                Reset all scenarios
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all scenarios?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will send every scenario back to its initial state in WireMock.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => resetAllScenariosMutation.mutate()}>
                  Reset scenarios
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      {scenariosQuery.isPending && !scenariosQuery.data ? <ScenariosLoadingState /> : null}

      {scenariosQuery.isError && !scenariosQuery.data ? (
        <Alert variant="destructive">
          <GitBranch />
          <AlertTitle>Unable to load scenarios</AlertTitle>
          <AlertDescription>
            <p>{scenariosQuery.error instanceof Error ? scenariosQuery.error.message : "The scenarios endpoint could not be loaded."}</p>
            <Button className="mt-2" onClick={() => scenariosQuery.refetch()} size="sm" variant="outline">
              <RefreshCw />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!scenariosQuery.isPending && !scenariosQuery.isError && (scenariosQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No scenarios detected"
          description="Scenarios appear here once a stub mapping references a scenarioName."
        />
      ) : null}

      {scenariosQuery.data && scenariosQuery.data.length > 0 ? (
        <section className="grid gap-6">
          {scenariosQuery.data.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{scenario.name}</CardTitle>
                    <CardDescription>Current state: {scenario.state}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-accent text-accent-foreground" variant="secondary">
                      {scenario.state}
                    </Badge>
                    <Badge variant="outline">{scenario.possibleStates.length} states</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {scenario.possibleStates.map((state) => (
                    <Badge
                      key={`${scenario.id}-${state}`}
                      className={state === scenario.state ? "bg-primary text-primary-foreground" : undefined}
                      variant={state === scenario.state ? "default" : "outline"}
                    >
                      {state}
                    </Badge>
                  ))}
                </div>
                <ScenarioGraph scenario={scenario} />
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function ScenariosLoadingState() {
  return (
    <section className="grid gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={`scenario-skeleton-${index}`}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((__, badgeIndex) => (
                <Skeleton key={`badge-skeleton-${badgeIndex}`} className="h-6 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
