import { useState } from "react";
import { toast } from "sonner";
import type { StubTemplate } from "@/entities/stub-template";
import { useStubTemplates } from "@/entities/stub-template";
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

type DeleteStubTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: StubTemplate | null;
  onDeleted?: () => void;
};

export function DeleteStubTemplateDialog({ open, onOpenChange, template, onDeleted }: DeleteStubTemplateDialogProps) {
  const { deleteTemplate } = useStubTemplates();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (!template) {
      onOpenChange(false);
      return;
    }

    setIsDeleting(true);
    deleteTemplate(template.id);
    setIsDeleting(false);
    toast.success("Template deleted.");
    onDeleted?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete template</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently remove {template?.name ? `"${template.name}"` : "this template"}. Stub mappings
            already created from it are not affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? "Deleting..." : "Delete template"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
