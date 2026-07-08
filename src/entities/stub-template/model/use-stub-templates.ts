import { useCallback, useEffect, useMemo, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/shared/lib/local-storage";
import { builtInStubTemplates } from "@/entities/stub-template/model/builtin-templates";
import type { StubTemplate, StubTemplateInput } from "@/entities/stub-template/model/types";

const TEMPLATES_STORAGE_KEY = "wiremock-ui.stub-templates";

function generateTemplateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `template-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * CRUD for user-created stub templates, persisted to LocalStorage (the same
 * pattern used by favorite-stub-mapping - see use-favorite-stub-mappings.ts).
 * Always merges in the read-only built-in templates so callers get a single
 * combined list. Built-in templates can never be mutated or removed here;
 * "editing" or "deleting" one is rejected, callers should duplicate it into
 * a custom template first (see duplicateTemplate).
 */
export function useStubTemplates() {
  const [customTemplates, setCustomTemplates] = useState<StubTemplate[]>(() =>
    readLocalStorage<StubTemplate[]>(TEMPLATES_STORAGE_KEY, []),
  );

  useEffect(() => {
    writeLocalStorage(TEMPLATES_STORAGE_KEY, customTemplates);
  }, [customTemplates]);

  const templates = useMemo(
    () => [...builtInStubTemplates, ...customTemplates],
    [customTemplates],
  );

  const getTemplate = useCallback(
    (id: string) => templates.find((template) => template.id === id),
    [templates],
  );

  const saveTemplate = useCallback((input: StubTemplateInput): StubTemplate => {
    const now = new Date().toISOString();

    if (input.id) {
      let saved: StubTemplate | undefined;
      setCustomTemplates((current) => {
        const index = current.findIndex((template) => template.id === input.id);
        if (index === -1) return current;
        const updated: StubTemplate = {
          ...current[index],
          name: input.name,
          description: input.description,
          category: input.category,
          stubMapping: input.stubMapping,
          updatedAt: now,
        };
        saved = updated;
        const next = [...current];
        next[index] = updated;
        return next;
      });
      if (saved) return saved;
    }

    const created: StubTemplate = {
      id: generateTemplateId(),
      name: input.name,
      description: input.description,
      category: input.category,
      stubMapping: input.stubMapping,
      createdAt: now,
      updatedAt: now,
    };
    setCustomTemplates((current) => [...current, created]);
    return created;
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setCustomTemplates((current) => current.filter((template) => template.id !== id));
  }, []);

  const duplicateTemplate = useCallback(
    (id: string): StubTemplate | undefined => {
      const source = getTemplate(id);
      if (!source) return undefined;

      const now = new Date().toISOString();
      const duplicated: StubTemplate = {
        id: generateTemplateId(),
        name: source.builtIn ? `${source.name} (copy)` : `${source.name} Copy`,
        description: source.description,
        category: source.category,
        stubMapping: source.stubMapping,
        createdAt: now,
        updatedAt: now,
      };
      setCustomTemplates((current) => [...current, duplicated]);
      return duplicated;
    },
    [getTemplate],
  );

  const isBuiltIn = useCallback((id: string) => Boolean(getTemplate(id)?.builtIn), [getTemplate]);

  return {
    templates,
    getTemplate,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    isBuiltIn,
  };
}
