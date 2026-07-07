import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ChangeEvent } from "react";
import { useUpdateGlobalSettings } from "@/entities/settings";
import type { DelayDistribution, GlobalSettings } from "@/entities/settings";
import {
  defaultSettingsFormValues,
  delayDistributionTypes,
  type DelayDistributionType,
  settingsFormSchema,
  type SettingsFormValues,
} from "@/features/update-global-settings/model/schema";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";

function toInputValue(value: number | undefined) {
  return value ?? "";
}

function parseIntegerChange(onChange: (value: number | undefined) => void) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue === "" ? undefined : Number.parseInt(nextValue, 10));
  };
}

function parseNumberChange(onChange: (value: number | undefined) => void) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue === "" ? undefined : Number(nextValue));
  };
}

function buildDelayDistribution(values: SettingsFormValues): DelayDistribution | undefined {
  if (values.distributionType === delayDistributionTypes.uniform) {
    return {
      type: "uniform",
      lower: values.uniformLower ?? 0,
      upper: values.uniformUpper ?? 0,
    };
  }

  if (values.distributionType === delayDistributionTypes.lognormal) {
    return {
      type: "lognormal",
      median: values.lognormalMedian ?? 0,
      sigma: values.lognormalSigma ?? 1,
    };
  }

  return undefined;
}

function buildGlobalSettings(values: SettingsFormValues): GlobalSettings {
  const settings: GlobalSettings = {
    proxyPassThrough: values.proxyPassThrough,
  };

  if (values.fixedDelay !== undefined) {
    settings.fixedDelay = values.fixedDelay;
  }

  const badRequestMessage = values.badRequestMessage?.trim();
  if (badRequestMessage) {
    settings.badRequestMessage = badRequestMessage;
  }

  const delayDistribution = buildDelayDistribution(values);
  if (delayDistribution) {
    settings.delayDistribution = delayDistribution;
  }

  return settings;
}

export function SettingsForm() {
  const updateGlobalSettings = useUpdateGlobalSettings();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: defaultSettingsFormValues,
  });

  const distributionType = form.watch("distributionType");

  const handleDistributionTypeChange = (value: string) => {
    const nextValue = value as DelayDistributionType;
    form.setValue("distributionType", nextValue, { shouldDirty: true, shouldValidate: true });

    if (nextValue !== delayDistributionTypes.uniform) {
      form.setValue("uniformLower", undefined, { shouldDirty: true, shouldValidate: true });
      form.setValue("uniformUpper", undefined, { shouldDirty: true, shouldValidate: true });
    }

    if (nextValue !== delayDistributionTypes.lognormal) {
      form.setValue("lognormalMedian", undefined, { shouldDirty: true, shouldValidate: true });
      form.setValue("lognormalSigma", undefined, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleSubmit = async (values: SettingsFormValues) => {
    await updateGlobalSettings.mutateAsync(buildGlobalSettings(values));
    form.reset(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="fixedDelay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fixed delay (ms)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    min={0}
                    placeholder="500"
                    type="number"
                    value={toInputValue(field.value)}
                    onChange={parseIntegerChange(field.onChange)}
                  />
                </FormControl>
                <FormDescription>Apply the same global delay to every response.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proxyPassThrough"
            render={({ field }) => (
              <FormItem className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <FormLabel>Proxy pass-through</FormLabel>
                    <FormDescription>
                      Allow WireMock to pass unmatched requests through to a configured proxy when supported.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Delay distribution</h2>
            <p className="text-sm text-muted-foreground">
              Choose a random delay profile instead of a fixed global delay.
            </p>
          </div>

          <FormField
            control={form.control}
            name="distributionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distribution type</FormLabel>
                <Select value={field.value} onValueChange={handleDistributionTypeChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a distribution" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={delayDistributionTypes.none}>None</SelectItem>
                    <SelectItem value={delayDistributionTypes.uniform}>Uniform</SelectItem>
                    <SelectItem value={delayDistributionTypes.lognormal}>Lognormal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {distributionType === delayDistributionTypes.uniform ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="uniformLower"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lower bound (ms)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        min={0}
                        placeholder="100"
                        type="number"
                        value={toInputValue(field.value)}
                        onChange={parseIntegerChange(field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uniformUpper"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upper bound (ms)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        min={0}
                        placeholder="750"
                        type="number"
                        value={toInputValue(field.value)}
                        onChange={parseIntegerChange(field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          {distributionType === delayDistributionTypes.lognormal ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="lognormalMedian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Median (ms)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        min={0}
                        placeholder="250"
                        step="any"
                        type="number"
                        value={toInputValue(field.value)}
                        onChange={parseNumberChange(field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lognormalSigma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sigma</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        min={0}
                        placeholder="0.4"
                        step="any"
                        type="number"
                        value={toInputValue(field.value)}
                        onChange={parseNumberChange(field.onChange)}
                      />
                    </FormControl>
                    <FormDescription>Use a value greater than zero.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="badRequestMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bad request message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Custom message returned for invalid admin requests"
                  rows={4}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Optional custom message returned by WireMock when a request body is invalid.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {form.formState.isDirty ? "You have unsaved changes." : "Changes are applied when you save this form."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={updateGlobalSettings.isPending}
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset changes
            </Button>
            <Button disabled={updateGlobalSettings.isPending} type="submit">
              {updateGlobalSettings.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
