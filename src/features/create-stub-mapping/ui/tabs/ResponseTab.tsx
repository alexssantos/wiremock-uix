import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { stubMappingFaultValues, stubMappingResponseBodyModeValues } from "@/entities/stub-mapping";
import type { StubMappingFormValues } from "@/features/create-stub-mapping/model/schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { JsonEditor } from "@/shared/ui/json-editor";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

function createRowId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ResponseTab() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<StubMappingFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "response.headers" });
  const bodyMode = watch("response.bodyMode");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="response-status">Status code</Label>
          <Input
            id="response-status"
            type="number"
            min={100}
            max={599}
            {...register("response.status", { setValueAs: (value) => Number(value) })}
          />
          {errors.response?.status ? <p className="text-sm text-destructive">{String(errors.response.status.message)}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-status-message">Status message</Label>
          <Input id="response-status-message" placeholder="Created" {...register("response.statusMessage")} />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium">Response headers</h3>
            <p className="text-sm text-muted-foreground">Define the HTTP headers that WireMock should return.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ id: createRowId("response-header"), key: "", value: "" })}
          >
            <Plus className="size-4" />
            Add header
          </Button>
        </div>

        {fields.length === 0 ? <p className="text-sm text-muted-foreground">No response headers added yet.</p> : null}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const error = errors.response?.headers?.[index];

            return (
              <div key={field.id} className="grid gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <Label htmlFor={`${field.id}-key`}>Header name</Label>
                  <Input id={`${field.id}-key`} placeholder="Content-Type" {...register(`response.headers.${index}.key`)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${field.id}-value`}>Header value</Label>
                  <Input id={`${field.id}-value`} placeholder="application/json" {...register(`response.headers.${index}.value`)} />
                  {error ? <p className="text-sm text-destructive">{String(error.key?.message ?? error.value?.message ?? "Please review this header.")}</p> : null}
                </div>
                <div className="flex items-end justify-end">
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)} aria-label="Remove response header">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-medium">Response body</h3>
          <p className="text-sm text-muted-foreground">Choose how the stubbed response body should be returned.</p>
        </div>

        <Controller
          control={control}
          name="response.bodyMode"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 md:grid-cols-4">
              {stubMappingResponseBodyModeValues.map((mode) => (
                <label key={mode} className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium capitalize">
                  <RadioGroupItem value={mode} />
                  {mode}
                </label>
              ))}
            </RadioGroup>
          )}
        />

        {bodyMode === "text" ? (
          <div className="space-y-2">
            <Label htmlFor="response-body-text">Text body</Label>
            <Textarea id="response-body-text" rows={8} placeholder="Hello from WireMock" {...register("response.bodyText")} />
          </div>
        ) : null}

        {bodyMode === "json" ? (
          <div className="space-y-2">
            <Label>JSON body</Label>
            <Controller
              control={control}
              name="response.bodyJsonText"
              render={({ field }) => <JsonEditor value={field.value} onChange={field.onChange} language="json" height={320} />}
            />
            {errors.response?.bodyJsonText ? <p className="text-sm text-destructive">{String(errors.response.bodyJsonText.message)}</p> : null}
          </div>
        ) : null}

        {bodyMode === "base64" ? (
          <div className="space-y-2">
            <Label htmlFor="response-body-base64">Base64 body</Label>
            <Textarea id="response-body-base64" rows={8} placeholder="SGVsbG8gd29ybGQ=" {...register("response.bodyBase64")} />
          </div>
        ) : null}

        {bodyMode === "file" ? (
          <div className="space-y-2">
            <Label htmlFor="response-body-file">Body file name</Label>
            <Input id="response-body-file" placeholder="responses/orders.json" {...register("response.bodyFileName")} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="response-delay">Fixed delay (ms)</Label>
          <Input
            id="response-delay"
            type="number"
            min={0}
            placeholder="250"
            {...register("response.fixedDelayMilliseconds", {
              setValueAs: (value) => value === "" ? null : Number(value),
            })}
          />
          {errors.response?.fixedDelayMilliseconds ? <p className="text-sm text-destructive">{String(errors.response.fixedDelayMilliseconds.message)}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Fault</Label>
          <Controller
            control={control}
            name="response.fault"
            render={({ field }) => (
              <Select value={field.value || "__none"} onValueChange={(value) => field.onChange(value === "__none" ? "" : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No fault" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">No fault</SelectItem>
                  {stubMappingFaultValues.map((fault) => (
                    <SelectItem key={fault} value={fault}>
                      {fault}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-proxy-base-url">Proxy base URL</Label>
          <Input id="response-proxy-base-url" placeholder="https://api.example.com" {...register("response.proxyBaseUrl")} />
        </div>
      </div>
    </div>
  );
}
