import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { StubMapping } from "@/entities/stub-mapping";

export type CreateStubMappingFromTemplateNavigationState = {
  templateStubMapping?: StubMapping;
};

/**
 * Navigates to the "new stub mapping" wizard prefilled from a template's
 * stub mapping JSON. Mirrors duplicate-stub-mapping's navigation-state
 * pattern (see use-duplicate-stub-mapping.ts) but keeps the two concepts in
 * separate state keys since `StubMappingEditorPage` may need to distinguish
 * "duplicated from an existing mapping" from "created from a template".
 */
export function useCreateStubMappingFromTemplate() {
  const navigate = useNavigate();

  return useCallback((stubMapping: StubMapping) => {
    const templateStubMapping: StubMapping = { ...stubMapping };
    delete templateStubMapping.id;
    delete templateStubMapping.uuid;

    navigate("/mappings/new", {
      state: {
        templateStubMapping,
      } satisfies CreateStubMappingFromTemplateNavigationState,
    });
  }, [navigate]);
}
