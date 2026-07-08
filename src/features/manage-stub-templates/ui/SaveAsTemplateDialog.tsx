import { useState } from "react";
import { toast } from "sonner";
import type { StubMapping } from "@/entities/stub-mapping";
import {
  stubTemplateCategoryValues,
  useStubTemplates,
  type StubTemplateCategory,
} from "@/entities/stub-template";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

const TEMPLATE_CATEGORY_LABELS: Record<StubTemplateCategory, string> = {
  rest: "REST",
  errors: "Errors",
  latency: "Latency / faults",
  auth: "Auth",
  other: "Other",
};

type SaveAsTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stubMapping: StubMapping | null;
  onSaved?: () => void;
};

/**
 * Lightweight dialog to snapshot an existing (already-created) stub mapping
 * into a reusable template, without going through the full wizard - used
 * from the stub mappings table's row actions.
 */
export function SaveAsTemplateDialog({ open, onOpenChange, stubMapping, onSaved }: SaveAsTemplateDialogProps) {
  const { saveTemplate } = useStubTemplates();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<StubTemplateCategory>("other");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && stubMapping) {
      setName(stubMapping.name ? `${stubMapping.name} template` : "");
      setDescription("");
      setCategory("other");
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!stubMapping) return;
    if (!name.trim()) {
      setError("Enter a name for this template.");
      return;
    }

    const { id: _id, uuid: _uuid, ...templateStub } = stubMapping;
    saveTemplate({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      stubMapping: templateStub,
    });
    toast.success("Template saved.");
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>
            Store this stub mapping&apos;s request/response shape as a reusable template on the Templates page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="save-template-name">Template name</Label>
            <Input
              id="save-template-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
              }}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="save-template-category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as StubTemplateCategory)}>
              <SelectTrigger id="save-template-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stubTemplateCategoryValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {TEMPLATE_CATEGORY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="save-template-description">Description</Label>
            <Textarea
              id="save-template-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
