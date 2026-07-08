import { useNavigate, useParams } from "react-router-dom";
import { useStubTemplates, type StubTemplateInput } from "@/entities/stub-template";
import { StubMappingWizard } from "@/features/create-stub-mapping";
import { PageHeader } from "@/shared/ui/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getTemplate, saveTemplate, isBuiltIn } = useStubTemplates();
  const isEditMode = Boolean(id);
  const template = isEditMode ? getTemplate(id!) : undefined;

  if (isEditMode && !template) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Template" description="Unable to load the selected template." />
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Template not found</AlertTitle>
          <AlertDescription>This template may have been deleted.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isEditMode && id && isBuiltIn(id)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Template" description="Built-in templates cannot be edited." />
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>This is a built-in template</AlertTitle>
          <AlertDescription>Duplicate it from the Templates page to create an editable copy.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSaveTemplate = (input: StubTemplateInput) => {
    saveTemplate(input);
    toast.success(isEditMode ? "Template updated." : "Template created.");
    navigate("/templates");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Template" : "New Template"}
        description={isEditMode
          ? "Update this reusable stub mapping blueprint."
          : "Configure a reusable request/response blueprint other stub mappings can be created from."}
      />

      <StubMappingWizard
        mode={isEditMode ? "edit" : "create"}
        defaultValues={template?.stubMapping}
        target="template"
        templateDefaults={template}
        onSaveTemplate={handleSaveTemplate}
      />
    </div>
  );
}
