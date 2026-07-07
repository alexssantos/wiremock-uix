import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { StubMapping } from "@/entities/stub-mapping";

export type DuplicateStubMappingNavigationState = {
  duplicatedStubMapping?: StubMapping;
};

export function useDuplicateStubMapping() {
  const navigate = useNavigate();

  return useCallback((stubMapping: StubMapping) => {
    const duplicatedStubMapping: StubMapping = {
      ...stubMapping,
      name: stubMapping.name ? `${stubMapping.name} Copy` : undefined,
    };

    delete duplicatedStubMapping.id;
    delete duplicatedStubMapping.uuid;

    navigate("/mappings/new", {
      state: {
        duplicatedStubMapping,
      } satisfies DuplicateStubMappingNavigationState,
    });
  }, [navigate]);
}
