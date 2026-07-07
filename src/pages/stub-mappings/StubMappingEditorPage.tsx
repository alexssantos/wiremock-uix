import { useParams } from "react-router-dom";
import { PageHeader } from "@/shared/ui/page-header";

export function StubMappingEditorPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title={id ? "Edit Stub Mapping" : "New Stub Mapping"} />
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
