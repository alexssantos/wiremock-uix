import { useMemo, useState } from "react";
import { Copy, LayoutTemplate, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStubTemplates, type StubTemplate, type StubTemplateCategory } from "@/entities/stub-template";
import { useCreateStubMappingFromTemplate } from "@/features/create-stub-mapping-from-template";
import { DeleteStubTemplateDialog } from "@/features/manage-stub-templates";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { HttpMethodBadge } from "@/shared/ui/http-method-badge";
import { PageHeader } from "@/shared/ui/page-header";

const TEMPLATE_CATEGORY_LABELS: Record<StubTemplateCategory, string> = {
  rest: "REST",
  errors: "Errors",
  latency: "Latency / faults",
  auth: "Auth",
  other: "Other",
};

const categoryOrder: StubTemplateCategory[] = ["rest", "errors", "auth", "latency", "other"];

function getTemplateUrlLabel(template: StubTemplate) {
  const request = template.stubMapping.request;
  return request?.url ?? request?.urlPath ?? request?.urlPattern ?? request?.urlPathPattern ?? "No URL configured";
}

export function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, duplicateTemplate } = useStubTemplates();
  const createStubMappingFromTemplate = useCreateStubMappingFromTemplate();
  const [templateToDelete, setTemplateToDelete] = useState<StubTemplate | null>(null);

  const groupedTemplates = useMemo(() => {
    const groups = new Map<StubTemplateCategory, StubTemplate[]>();
    for (const template of templates) {
      const list = groups.get(template.category) ?? [];
      list.push(template);
      groups.set(template.category, list);
    }
    return categoryOrder
      .map((category) => ({ category, templates: groups.get(category) ?? [] }))
      .filter((group) => group.templates.length > 0);
  }, [templates]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stub Templates"
        description="Reusable request/response blueprints you can start a new stub mapping from."
        actions={(
          <Button type="button" onClick={() => navigate("/templates/new")}>
            <Plus className="size-4" />
            New Template
          </Button>
        )}
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates yet"
          description="Create a template from scratch, or save an existing stub mapping as one from the Stub Mappings page."
          action={(
            <Button type="button" onClick={() => navigate("/templates/new")}>
              <Plus className="size-4" />
              New Template
            </Button>
          )}
        />
      ) : (
        <div className="space-y-8">
          {groupedTemplates.map((group) => (
            <section key={group.category} className="space-y-3">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {TEMPLATE_CATEGORY_LABELS[group.category]}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.templates.map((template) => (
                  <Card key={template.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {template.builtIn ? (
                          <Badge variant="secondary" className="shrink-0">
                            <Lock className="size-3" />
                            Built-in
                          </Badge>
                        ) : null}
                      </div>
                      {template.description ? (
                        <CardDescription>{template.description}</CardDescription>
                      ) : null}
                    </CardHeader>

                    <CardContent className="flex flex-1 items-center gap-2">
                      <HttpMethodBadge method={template.stubMapping.request?.method ?? "ANY"} />
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {getTemplateUrlLabel(template)}
                      </span>
                    </CardContent>

                    <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => createStubMappingFromTemplate(template.stubMapping)}
                      >
                        Use template
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateTemplate(template.id)}
                      >
                        <Copy className="size-4" />
                        Duplicate
                      </Button>
                      {!template.builtIn ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/templates/${template.id}`)}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setTemplateToDelete(template)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </>
                      ) : null}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <DeleteStubTemplateDialog
        open={Boolean(templateToDelete)}
        onOpenChange={(open) => {
          if (!open) setTemplateToDelete(null);
        }}
        template={templateToDelete}
      />
    </div>
  );
}
