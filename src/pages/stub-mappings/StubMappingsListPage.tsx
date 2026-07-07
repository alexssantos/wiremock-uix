import { useState } from "react";
import { Import } from "lucide-react";
import type { StubMapping } from "@/entities/stub-mapping";
import { DeleteStubMappingDialog } from "@/features/delete-stub-mapping";
import { ImportMappingsDialog } from "@/features/import-stub-mappings";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { StubMappingTable } from "@/widgets/stub-mapping-table";

export function StubMappingsListPage() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [stubMappingsToDelete, setStubMappingsToDelete] = useState<StubMapping[]>([]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stub Mappings"
        description="Create, search, import, export, and manage WireMock stub mappings."
        actions={(
          <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Import className="size-4" />
            Import mappings
          </Button>
        )}
      />

      <StubMappingTable
        onImportRequested={() => setIsImportDialogOpen(true)}
        onDeleteRequested={setStubMappingsToDelete}
      />

      <ImportMappingsDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
      <DeleteStubMappingDialog
        open={stubMappingsToDelete.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setStubMappingsToDelete([]);
          }
        }}
        stubMappings={stubMappingsToDelete}
        onDeleted={() => setStubMappingsToDelete([])}
      />
    </div>
  );
}
