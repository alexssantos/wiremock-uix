import { cn } from "@/shared/lib/utils";
import type { HttpMethod } from "@/shared/types/common";

const METHOD_CLASS_NAMES: Record<string, string> = {
  GET: "bg-[hsl(var(--method-get)/0.15)] text-[hsl(var(--method-get))]",
  POST: "bg-[hsl(var(--method-post)/0.15)] text-[hsl(var(--method-post))]",
  PUT: "bg-[hsl(var(--method-put)/0.15)] text-[hsl(var(--method-put))]",
  PATCH: "bg-[hsl(var(--method-patch)/0.15)] text-[hsl(var(--method-patch))]",
  DELETE: "bg-[hsl(var(--method-delete)/0.15)] text-[hsl(var(--method-delete))]",
};

/**
 * Color-coded badge for an HTTP method, following the semantic palette
 * defined in docs/02-design-system.md (GET=blue, POST=green, PUT=orange,
 * PATCH=purple, DELETE=red, everything else=neutral).
 */
export function HttpMethodBadge({ method, className }: { method: HttpMethod | string; className?: string }) {
  const colorClass = METHOD_CLASS_NAMES[method] ?? "bg-[hsl(var(--method-any)/0.15)] text-[hsl(var(--method-any))]";

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 font-mono text-xs font-semibold tracking-wide",
        colorClass,
        className
      )}
    >
      {method}
    </span>
  );
}
