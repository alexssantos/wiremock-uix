import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clipboard } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { generateStubMappingJson, type StubMappingFormDraft } from "@/entities/stub-mapping";
import { stubMappingFormSchema, type StubMappingFormValues } from "@/features/create-stub-mapping/model/schema";
import { Button } from "@/shared/ui/button";
import { JsonEditor } from "@/shared/ui/json-editor";

export function PreviewTab() {
  const { control } = useFormContext<StubMappingFormValues>();
  const values = useWatch({ control });

  const preview = useMemo(() => {
    // `values` is a deep-partial live snapshot for preview purposes only;
    // `baseStub` is typed `unknown` on the form schema (see schema.ts) to
    // avoid RHF path-recursion issues, so cast to the entity draft shape here.
    const stubMapping = generateStubMappingJson(values as StubMappingFormDraft);
    return JSON.stringify(stubMapping, null, 2);
  }, [values]);

  const validationResult = useMemo(() => stubMappingFormSchema.safeParse(values), [values]);
  const issues = validationResult.success ? [] : validationResult.error.issues;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      toast.success("Stub mapping JSON copied to the clipboard.");
    } catch {
      toast.error("Unable to copy the stub mapping JSON.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <div>
          <h3 className="font-medium">Generated stub mapping</h3>
          <p className="text-sm text-muted-foreground">Review the final JSON payload before saving the stub mapping.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void handleCopy()}>
          <Clipboard className="size-4" />
          Copy to clipboard
        </Button>
      </div>

      <JsonEditor value={preview} readOnly language="json" height={420} />

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          {issues.length === 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />}
          <h3 className="font-medium">Validation summary</h3>
        </div>

        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No validation errors. This stub mapping is ready to save.</p>
        ) : (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {issues.map((issue) => (
              <li key={`${issue.path.join(".")}-${issue.message}`} className="rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-medium text-foreground">{issue.path.join(".") || "form"}</span>
                <span className="mx-2 text-muted-foreground">—</span>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
