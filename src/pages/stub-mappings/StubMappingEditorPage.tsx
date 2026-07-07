import { AlertCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStubMapping } from "@/entities/stub-mapping";
import { StubMappingWizard } from "@/features/create-stub-mapping";
import type { DuplicateStubMappingNavigationState } from "@/features/duplicate-stub-mapping";
import { PageHeader } from "@/shared/ui/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function StubMappingEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const stubMappingQuery = useStubMapping(id);
  const duplicateState = (location.state as DuplicateStubMappingNavigationState | null)?.duplicatedStubMapping;
  const isEditMode = Boolean(id);

  if (isEditMode && stubMappingQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Stub Mapping" description="Loading the selected stub mapping." />
        <div className="space-y-4 rounded-lg border p-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (isEditMode && stubMappingQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Stub Mapping" description="Unable to load the selected stub mapping." />
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load the stub mapping</AlertTitle>
          <AlertDescription>
            <p>{stubMappingQuery.error instanceof Error ? stubMappingQuery.error.message : "An unexpected error occurred."}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void stubMappingQuery.refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Stub Mapping" : "New Stub Mapping"}
        description={isEditMode
          ? "Update the selected WireMock stub mapping."
          : "Create a new WireMock stub mapping using the guided wizard."}
      />

      <StubMappingWizard
        mode={isEditMode ? "edit" : "create"}
        defaultValues={isEditMode ? stubMappingQuery.data : duplicateState}
        onSuccess={() => navigate("/mappings")}
      />
    </div>
  );
}
