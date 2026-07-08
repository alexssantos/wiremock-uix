import type { StubMapping } from "@/entities/stub-mapping";

export const stubTemplateCategoryValues = [
  "rest",
  "errors",
  "latency",
  "auth",
  "other",
] as const;

export type StubTemplateCategory = (typeof stubTemplateCategoryValues)[number];

/**
 * A reusable "blueprint" for creating stub mappings: a named/described
 * preset that captures a fully-configured request matcher + response
 * (the same JSON shape WireMock itself accepts), so a user can start a new
 * stub mapping from a known-good starting point instead of an empty form.
 *
 * Templates are a dashboard-only concept - WireMock has no native "template"
 * resource - so they are never sent to the WireMock admin API; they live
 * entirely in the browser's LocalStorage (see model/use-stub-templates.ts),
 * the same way favorites do.
 */
export type StubTemplate = {
  id: string;
  name: string;
  description?: string;
  category: StubTemplateCategory;
  /** Built-in templates ship with the app and cannot be edited or deleted (only duplicated into a custom template). */
  builtIn?: boolean;
  /** The stub mapping JSON this template is based on. Never carries an id/uuid - each "use" creates a brand-new mapping. */
  stubMapping: StubMapping;
  createdAt: string;
  updatedAt: string;
};

export type StubTemplateInput = {
  id?: string;
  name: string;
  description?: string;
  category: StubTemplateCategory;
  stubMapping: StubMapping;
};
