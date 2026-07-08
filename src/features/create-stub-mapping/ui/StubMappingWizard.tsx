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
import {
  stubTemplateCategoryValues,
  type StubTemplate,
  type StubTemplateCategory,
  type StubTemplateInput,
} from "@/entities/stub-template";
import { useStubMappingForm } from "@/features/create-stub-mapping/model/use-stub-mapping-form";
import { MetadataTab } from "@/features/create-stub-mapping/ui/tabs/MetadataTab";
import { PreviewTab } from "@/features/create-stub-mapping/ui/tabs/PreviewTab";
import { RequestTab } from "@/features/create-stub-mapping/ui/tabs/RequestTab";
import { ResponseTab } from "@/features/create-stub-mapping/ui/tabs/ResponseTab";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";

const TEMPLATE_CATEGORY_LABELS: Record<StubTemplateCategory, string> = {
  rest: "REST",
  errors: "Errors",
  latency: "Latency / faults",
  auth: "Auth",
  other: "Other",
};

type StubMappingWizardProps = {
  mode: "create" | "edit";
  defaultValues?: StubMapping;
  onSuccess?: (stubMapping: StubMapping) => void;
  /** When "template", the wizard saves to the local template store instead of calling the WireMock API. Defaults to "wiremock". */
  target?: "wiremock" | "template";
  /** Pre-fills the "Template details" fields; required when `target` is "template" so `onSaveTemplate` can save an update. */
  templateDefaults?: Pick<StubTemplate, "id" | "name" | "description" | "category">;
  onSaveTemplate?: (input: StubTemplateInput) => void;
};

const tabDefinitions = [
  { value: "request", label: "Request" },
  { value: "response", label: "Response" },
  { value: "metadata", label: "Metadata" },
  { value: "preview", label: "Preview" },
] as const;

export function StubMappingWizard({
  mode,
  defaultValues,
  onSuccess,
  target = "wiremock",
  templateDefaults,
  onSaveTemplate,
}: StubMappingWizardProps) {
  const form = useStubMappingForm(defaultValues);
  const createStubMapping = useCreateStubMapping();
  const updateStubMapping = useUpdateStubMapping();
  const [activeTab, setActiveTab] = useState<ComponentProps<typeof Tabs>["defaultValue"]>("request");
  const isTemplateTarget = target === "template";

  const [templateName, setTemplateName] = useState(templateDefaults?.name ?? "");
  const [templateDescription, setTemplateDescription] = useState(templateDefaults?.description ?? "");
  const [templateCategory, setTemplateCategory] = useState<StubTemplateCategory>(templateDefaults?.category ?? "other");
  const [templateNameError, setTemplateNameError] = useState<string | null>(null);

  const isSubmitting = createStubMapping.isPending || updateStubMapping.isPending;

  const handleSubmit = form.handleSubmit(
    async (values) => {
      // `values.baseStub` is typed as `unknown` in the RHF-facing schema to
      // avoid TS "excessively deep" instantiation errors (see schema.ts);
      // cast back to the entity's `StubMappingFormDraft` shape here.
      const stubMapping = generateStubMappingJson(values as StubMappingFormDraft);

      if (isTemplateTarget) {
        if (!templateName.trim()) {
          setTemplateNameError("Enter a name for this template.");
          setActiveTab("request");
          toast.error("Please fill in the template details before saving.");
          return;
        }
        setTemplateNameError(null);
        onSaveTemplate?.({
          id: templateDefaults?.id,
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
          category: templateCategory,
          stubMapping,
        });
        return;
      }

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
        {isTemplateTarget ? (
          <Card>
            <CardHeader>
              <CardTitle>Template details</CardTitle>
              <CardDescription>
                Give this reusable stub blueprint a name and category so it&apos;s easy to find later on the Templates page.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="template-name">Template name</Label>
                <Input
                  id="template-name"
                  placeholder="REST: Get resource by id"
                  value={templateName}
                  onChange={(event) => {
                    setTemplateName(event.target.value);
                    if (templateNameError) setTemplateNameError(null);
                  }}
                />
                {templateNameError ? <p className="text-sm text-destructive">{templateNameError}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Select value={templateCategory} onValueChange={(value) => setTemplateCategory(value as StubTemplateCategory)}>
                  <SelectTrigger id="template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stubTemplateCategoryValues.map((category) => (
                      <SelectItem key={category} value={category}>
                        {TEMPLATE_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 lg:col-span-3">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  placeholder="What is this template useful for?"
                  rows={2}
                  value={templateDescription}
                  onChange={(event) => setTemplateDescription(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>
              {isTemplateTarget
                ? "Template stub mapping"
                : mode === "edit" ? "Edit stub mapping" : "Create stub mapping"}
            </CardTitle>
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
              <Link to={isTemplateTarget ? "/templates" : "/mappings"}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isTemplateTarget
                ? templateDefaults?.id ? "Save template" : "Create template"
                : isSubmitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create stub mapping"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
