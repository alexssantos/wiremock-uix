import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { stubMappingRequestMatcherOperatorValues, stubMappingUrlMatchTypeValues } from "@/entities/stub-mapping";
import type { StubMappingFormValues } from "@/features/create-stub-mapping/model/schema";

const httpMethodValues = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE", "ANY"] as const;
const bodyMatcherValues = ["equalTo", "contains", "matchesJsonPath", "equalToJson"] as const;

function createRowId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

type MatcherSectionProps = {
  title: string;
  description: string;
  name: "request.headers" | "request.queryParameters" | "request.cookies";
};

function MatcherSection({ title, description, name }: MatcherSectionProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<StubMappingFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const values = watch(name);
  const fieldErrors = name === "request.headers"
    ? errors.request?.headers
    : name === "request.queryParameters"
      ? errors.request?.queryParameters
      : errors.request?.cookies;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              id: createRowId(name),
              key: "",
              operator: "equalTo",
              value: "",
              caseInsensitive: false,
            })
          }
        >
          <Plus className="size-4" />
          Add matcher
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matchers added yet.</p>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const operator = values[index]?.operator ?? "equalTo";
          const error = fieldErrors?.[index];

          return (
            <div key={field.id} className="space-y-2 rounded-md border bg-muted/30 p-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <Label htmlFor={`${field.id}-key`}>Name</Label>
                  <Input id={`${field.id}-key`} placeholder="Accept" {...register(`${name}.${index}.key`)} />
                </div>

                <div className="space-y-2">
                  <Label>Matcher</Label>
                  <Controller
                    control={control}
                    name={`${name}.${index}.operator`}
                    render={({ field: controllerField }) => (
                      <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a matcher" />
                        </SelectTrigger>
                        <SelectContent>
                          {stubMappingRequestMatcherOperatorValues.map((matcher) => (
                            <SelectItem key={matcher} value={matcher}>
                              {matcher}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${field.id}-value`}>Value</Label>
                  <Input
                    id={`${field.id}-value`}
                    disabled={operator === "absent"}
                    placeholder={operator === "matchesJsonPath" ? "$.field" : "application/json"}
                    {...register(`${name}.${index}.value`)}
                  />
                </div>

                <div className="flex items-end justify-end">
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)} aria-label={`Remove ${title} matcher`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {operator === "equalTo" ? (
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`${name}.${index}.caseInsensitive`}
                    render={({ field: controllerField }) => (
                      <Switch
                        checked={controllerField.value}
                        onCheckedChange={controllerField.onChange}
                        aria-label="Toggle case insensitive match"
                      />
                    )}
                  />
                  <span className="text-sm text-muted-foreground">Case insensitive match</span>
                </div>
              ) : null}

              {error ? <p className="text-sm text-destructive">{String(error.key?.message ?? error.value?.message ?? "Please review this matcher.")}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RequestTab() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<StubMappingFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "request.bodyPatterns" });
  const bodyPatterns = watch("request.bodyPatterns");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[220px_220px_minmax(0,1fr)]">
        <div className="space-y-2">
          <Label>HTTP method</Label>
          <Controller
            control={control}
            name="request.method"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  {httpMethodValues.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>URL match mode</Label>
          <Controller
            control={control}
            name="request.urlMatchType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a mode" />
                </SelectTrigger>
                <SelectContent>
                  {stubMappingUrlMatchTypeValues.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-url-value">URL or pattern</Label>
          <Input id="request-url-value" placeholder="/api/orders" {...register("request.urlValue")} />
          {errors.request?.urlValue ? <p className="text-sm text-destructive">{String(errors.request.urlValue.message)}</p> : null}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <Label htmlFor="priority">Priority</Label>
        <Input
          id="priority"
          type="number"
          min={1}
          placeholder="1"
          {...register("priority", {
            setValueAs: (value) => value === "" ? null : Number(value),
          })}
        />
        <p className="text-sm text-muted-foreground">Lower numbers are matched first by WireMock.</p>
        {errors.priority ? <p className="text-sm text-destructive">{String(errors.priority.message)}</p> : null}
      </div>

      <MatcherSection
        title="Headers"
        description="Match incoming request headers using WireMock content patterns."
        name="request.headers"
      />

      <MatcherSection
        title="Query parameters"
        description="Match individual query string parameters."
        name="request.queryParameters"
      />

      <MatcherSection
        title="Cookies"
        description="Match cookies attached to the incoming request."
        name="request.cookies"
      />

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium">Body patterns</h3>
            <p className="text-sm text-muted-foreground">Use body matchers for JSON payloads, text fragments, or raw equality checks.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                id: createRowId("body-pattern"),
                matcher: "equalTo",
                value: "",
                ignoreArrayOrder: false,
                ignoreExtraElements: false,
              })
            }
          >
            <Plus className="size-4" />
            Add body matcher
          </Button>
        </div>

        {fields.length === 0 ? <p className="text-sm text-muted-foreground">No body patterns added yet.</p> : null}

        <div className="space-y-3">
          {fields.map((field, index) => {
            const matcher = bodyPatterns[index]?.matcher ?? "equalTo";
            const error = errors.request?.bodyPatterns?.[index];

            return (
              <div key={field.id} className="space-y-3 rounded-md border bg-muted/30 p-3">
                <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto]">
                  <div className="space-y-2">
                    <Label>Matcher</Label>
                    <Controller
                      control={control}
                      name={`request.bodyPatterns.${index}.matcher`}
                      render={({ field: controllerField }) => (
                        <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a matcher" />
                          </SelectTrigger>
                          <SelectContent>
                            {bodyMatcherValues.map((bodyMatcher) => (
                              <SelectItem key={bodyMatcher} value={bodyMatcher}>
                                {bodyMatcher}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${field.id}-value`}>Value</Label>
                    {matcher === "equalToJson" ? (
                      <Textarea id={`${field.id}-value`} rows={6} placeholder='{"id": 1}' {...register(`request.bodyPatterns.${index}.value`)} />
                    ) : (
                      <Input
                        id={`${field.id}-value`}
                        placeholder={matcher === "matchesJsonPath" ? "$.payload.id" : "Expected value"}
                        {...register(`request.bodyPatterns.${index}.value`)}
                      />
                    )}
                  </div>

                  <div className="flex items-end justify-end">
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)} aria-label="Remove body matcher">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {matcher === "equalToJson" ? (
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`request.bodyPatterns.${index}.ignoreArrayOrder`}
                        render={({ field: controllerField }) => (
                          <Switch checked={controllerField.value} onCheckedChange={controllerField.onChange} aria-label="Ignore JSON array order" />
                        )}
                      />
                      <span className="text-sm text-muted-foreground">Ignore array order</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`request.bodyPatterns.${index}.ignoreExtraElements`}
                        render={({ field: controllerField }) => (
                          <Switch checked={controllerField.value} onCheckedChange={controllerField.onChange} aria-label="Ignore extra JSON elements" />
                        )}
                      />
                      <span className="text-sm text-muted-foreground">Ignore extra elements</span>
                    </div>
                  </div>
                ) : null}

                {error ? <p className="text-sm text-destructive">{String(error.value?.message ?? "Please review this body matcher.")}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
