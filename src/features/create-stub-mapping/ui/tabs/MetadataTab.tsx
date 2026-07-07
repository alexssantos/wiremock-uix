import { Controller, useFormContext } from "react-hook-form";
import type { StubMappingFormValues } from "@/features/create-stub-mapping/model/schema";
import { Input } from "@/shared/ui/input";
import { JsonEditor } from "@/shared/ui/json-editor";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

export function MetadataTab() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<StubMappingFormValues>();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stub-name">Display name</Label>
          <Input id="stub-name" placeholder="Orders list stub" {...register("name")} />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="persistent" className="text-base">Persistent mapping</Label>
            <p className="mt-1 text-sm text-muted-foreground">Persist the stub mapping to the WireMock backing store when possible.</p>
          </div>
          <Controller
            control={control}
            name="persistent"
            render={({ field }) => (
              <Switch id="persistent" checked={field.value} onCheckedChange={field.onChange} aria-label="Toggle persistent mapping" />
            )}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="scenario-name">Scenario name</Label>
          <Input id="scenario-name" placeholder="Checkout flow" {...register("scenarioName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="required-scenario-state">Required scenario state</Label>
          <Input id="required-scenario-state" placeholder="Started" {...register("requiredScenarioState")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-scenario-state">New scenario state</Label>
          <Input id="new-scenario-state" placeholder="Completed" {...register("newScenarioState")} />
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <div>
          <Label>Metadata JSON</Label>
          <p className="text-sm text-muted-foreground">Add free-form metadata that can later be queried through the WireMock admin API.</p>
        </div>
        <Controller
          control={control}
          name="metadataText"
          render={({ field }) => <JsonEditor value={field.value} onChange={field.onChange} language="json" height={320} />}
        />
        {errors.metadataText ? <p className="text-sm text-destructive">{String(errors.metadataText.message)}</p> : null}
      </div>
    </div>
  );
}
