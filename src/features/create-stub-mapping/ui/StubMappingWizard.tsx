import type { ComponentProps } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  generateStubMappingJson,
  useCreateStubMapping,
  useUpdateStubMapping,
  type StubMapping,
  type StubMappingFormDraft,
} from "@/entities/stub-mapping";
import { useStubMappingForm } from "@/features/create-stub-mapping/model/use-stub-mapping-form";
import { MetadataTab } from "@/features/create-stub-mapping/ui/tabs/MetadataTab";
import { PreviewTab } from "@/features/create-stub-mapping/ui/tabs/PreviewTab";
import { RequestTab } from "@/features/create-stub-mapping/ui/tabs/RequestTab";
import { ResponseTab } from "@/features/create-stub-mapping/ui/tabs/ResponseTab";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

type StubMappingWizardProps = {
  mode: "create" | "edit";
  defaultValues?: StubMapping;
  onSuccess?: (stubMapping: StubMapping) => void;
};

const tabDefinitions = [
  { value: "request", label: "Request" },
  { value: "response", label: "Response" },
  { value: "metadata", label: "Metadata" },
  { value: "preview", label: "Preview" },
] as const;

export function StubMappingWizard({ mode, defaultValues, onSuccess }: StubMappingWizardProps) {
  const form = useStubMappingForm(defaultValues);
  const createStubMapping = useCreateStubMapping();
  const updateStubMapping = useUpdateStubMapping();
  const [activeTab, setActiveTab] = useState<ComponentProps<typeof Tabs>["defaultValue"]>("request");

  const isSubmitting = createStubMapping.isPending || updateStubMapping.isPending;

  const handleSubmit = form.handleSubmit(
    async (values) => {
      // `values.baseStub` is typed as `unknown` in the RHF-facing schema to
      // avoid TS "excessively deep" instantiation errors (see schema.ts);
      // cast back to the entity's `StubMappingFormDraft` shape here.
      const stubMapping = generateStubMappingJson(values as StubMappingFormDraft);

      try {
        const existingId = values.id ?? values.uuid ?? defaultValues?.id ?? defaultValues?.uuid;
        const savedStubMapping = mode === "edit" && existingId
          ? await updateStubMapping.mutateAsync({ id: existingId, stubMapping })
          : await createStubMapping.mutateAsync(stubMapping);

        onSuccess?.(savedStubMapping);
      } catch {
        // Mutation hooks already surface user-friendly toasts.
      }
    },
    () => {
      setActiveTab("preview");
      toast.error("Please fix the validation errors before saving the stub mapping.");
    },
  );

  return (
    <Form {...form}>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{mode === "edit" ? "Edit stub mapping" : "Create stub mapping"}</CardTitle>
            <CardDescription>
              Configure request matching, response behavior, metadata, and preview the final JSON before saving.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                {tabDefinitions.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="request">
                <RequestTab />
              </TabsContent>

              <TabsContent value="response">
                <ResponseTab />
              </TabsContent>

              <TabsContent value="metadata">
                <MetadataTab />
              </TabsContent>

              <TabsContent value="preview">
                <PreviewTab />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="justify-between gap-3 border-t pt-6">
            <Button type="button" variant="outline" asChild>
              <Link to="/mappings">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create stub mapping"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
