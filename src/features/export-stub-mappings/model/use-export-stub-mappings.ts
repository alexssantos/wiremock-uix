import { useCallback } from "react";
import { toast } from "sonner";
import type { StubMapping } from "@/entities/stub-mapping";

function downloadJson(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useExportStubMappings() {
  return useCallback((input: StubMapping | StubMapping[]) => {
    const stubMappings = Array.isArray(input) ? input : [input];

    if (stubMappings.length === 0) {
      toast.error("No stub mappings available to export.");
      return;
    }

    const filename = stubMappings.length === 1
      ? `stub-mapping-${stubMappings[0]?.id ?? stubMappings[0]?.uuid ?? "export"}.json`
      : `stub-mappings-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const payload = stubMappings.length === 1 ? stubMappings[0] : { mappings: stubMappings };

    downloadJson(filename, JSON.stringify(payload, null, 2));
    toast.success(stubMappings.length === 1 ? "Stub mapping exported." : "Stub mappings exported.");
  }, []);
}
