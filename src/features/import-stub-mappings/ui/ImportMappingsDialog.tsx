import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { StubMapping, StubMappingDuplicatePolicy } from "@/entities/stub-mapping";
import { stubMappingDuplicatePolicyValues, useImportStubMappings } from "@/entities/stub-mapping";
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
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Checkbox } from "@/shared/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

type ImportMappingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getStubMappingUrl(stubMapping: StubMapping) {
  return (
    stubMapping.request?.url ??
    stubMapping.request?.urlPath ??
    stubMapping.request?.urlPattern ??
    stubMapping.request?.urlPathPattern ??
    "No URL configured"
  );
}

export function ImportMappingsDialog({ open, onOpenChange }: ImportMappingsDialogProps) {
  const importStubMappings = useImportStubMappings();
  const [fileName, setFileName] = useState("");
  const [mappings, setMappings] = useState<StubMapping[]>([]);
  const [duplicatePolicy, setDuplicatePolicy] = useState<StubMappingDuplicatePolicy>("OVERWRITE");
  const [deleteAllNotInImport, setDeleteAllNotInImport] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFileName("");
      setMappings([]);
      setDuplicatePolicy("OVERWRITE");
      setDeleteAllNotInImport(false);
      setParseError(null);
    }
  }, [open]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setParseError(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      const nextMappings = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && "mappings" in parsed && Array.isArray(parsed.mappings)
          ? parsed.mappings
          : null;

      if (!nextMappings) {
        setMappings([]);
        setParseError("The selected file must contain either a JSON array or an object with a mappings array.");
        return;
      }

      setMappings(nextMappings as StubMapping[]);

      if (parsed && typeof parsed === "object" && "importOptions" in parsed && parsed.importOptions && typeof parsed.importOptions === "object") {
        const importOptions = parsed.importOptions as {
          duplicatePolicy?: StubMappingDuplicatePolicy;
          deleteAllNotInImport?: boolean;
        };

        if (importOptions.duplicatePolicy && stubMappingDuplicatePolicyValues.includes(importOptions.duplicatePolicy)) {
          setDuplicatePolicy(importOptions.duplicatePolicy);
        }

        if (typeof importOptions.deleteAllNotInImport === "boolean") {
          setDeleteAllNotInImport(importOptions.deleteAllNotInImport);
        }
      }
    } catch {
      setMappings([]);
      setParseError("Unable to parse the selected file. Please upload a valid JSON document.");
    }
  };

  const previewItems = useMemo(() => mappings.slice(0, 20), [mappings]);

  const handleImport = async () => {
    if (mappings.length === 0) {
      return;
    }

    try {
      await importStubMappings.mutateAsync({
        mappings,
        importOptions: {
          duplicatePolicy,
          deleteAllNotInImport,
        },
      });
      onOpenChange(false);
    } catch {
      // Mutation hook already handles the toast.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import stub mappings</DialogTitle>
          <DialogDescription>
            Upload a JSON file exported from WireMock or this dashboard to import multiple stub mappings at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mappings-file">Mappings file</Label>
            <Input id="mappings-file" type="file" accept=".json,application/json" onChange={(event) => void handleFileChange(event)} />
            {fileName ? <p className="text-sm text-muted-foreground">Selected file: {fileName}</p> : null}
          </div>

          {parseError ? (
            <Alert variant="destructive">
              <AlertTitle>Invalid import file</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-3 rounded-lg border p-4">
            <div>
              <h3 className="font-medium">Duplicate policy</h3>
              <p className="text-sm text-muted-foreground">Choose how to handle stub mappings that already exist on the WireMock server.</p>
            </div>
            <RadioGroup value={duplicatePolicy} onValueChange={(value) => setDuplicatePolicy(value as StubMappingDuplicatePolicy)} className="grid gap-3 md:grid-cols-2">
              {stubMappingDuplicatePolicyValues.map((value) => (
                <label key={value} className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
                  <RadioGroupItem value={value} />
                  {value}
                </label>
              ))}
            </RadioGroup>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox checked={deleteAllNotInImport} onCheckedChange={(checked) => setDeleteAllNotInImport(checked === true)} />
              Delete existing server mappings that are not present in this import file
            </label>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Import preview</h3>
                <p className="text-sm text-muted-foreground">{mappings.length === 0 ? "No mappings loaded yet." : `${mappings.length} mapping(s) ready to import.`}</p>
              </div>
            </div>

            {previewItems.length > 0 ? (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-2 text-sm">
                {previewItems.map((stubMapping, index) => (
                  <li key={stubMapping.id ?? stubMapping.uuid ?? `${getStubMappingUrl(stubMapping)}-${index}`} className="rounded-md border bg-muted/30 px-3 py-2">
                    <div className="font-medium">{stubMapping.request?.method ?? "ANY"} {getStubMappingUrl(stubMapping)}</div>
                    <div className="text-muted-foreground">{stubMapping.name ?? "Unnamed stub mapping"}</div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={importStubMappings.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleImport()} disabled={mappings.length === 0 || importStubMappings.isPending || Boolean(parseError)}>
            {importStubMappings.isPending ? "Importing..." : "Import mappings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
