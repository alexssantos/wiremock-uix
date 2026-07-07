import { useMemo, useState } from "react";
import type { StubMapping } from "@/entities/stub-mapping";
import { useDeleteStubMapping } from "@/entities/stub-mapping";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

type DeleteStubMappingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stubMappings: StubMapping[];
  onDeleted?: () => void;
};

function getStubMappingIdentity(stubMapping: StubMapping) {
  return stubMapping.id ?? stubMapping.uuid;
}

export function DeleteStubMappingDialog({
  open,
  onOpenChange,
  stubMappings,
  onDeleted,
}: DeleteStubMappingDialogProps) {
  const deleteStubMapping = useDeleteStubMapping();
  const [isDeleting, setIsDeleting] = useState(false);

  const ids = useMemo(
    () => stubMappings.map(getStubMappingIdentity).filter((id): id is string => Boolean(id)),
    [stubMappings],
  );

  const label = stubMappings.length === 1
    ? stubMappings[0]?.name || getStubMappingIdentity(stubMappings[0]) || "this stub mapping"
    : `${stubMappings.length} stub mappings`;

  const handleDelete = async () => {
    if (ids.length === 0) {
      onOpenChange(false);
      return;
    }

    setIsDeleting(true);
    const results = await Promise.allSettled(ids.map((id) => deleteStubMapping.mutateAsync(id)));
    setIsDeleting(false);

    const hasFailures = results.some((result) => result.status === "rejected");
    if (!hasFailures) {
      onDeleted?.();
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete stub mapping</AlertDialogTitle>
          <AlertDialogDescription>
            {stubMappings.length === 1
              ? `This action will permanently remove ${label}.`
              : `This action will permanently remove ${label}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {isDeleting ? "Deleting..." : stubMappings.length === 1 ? "Delete stub mapping" : "Delete selected mappings"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
