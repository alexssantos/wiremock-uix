import { cn } from "@/shared/lib/utils";

function rangeFor(status: number | undefined): "2xx" | "3xx" | "4xx" | "5xx" | "na" {
  if (!status) return "na";
  if (status >= 200 && status < 300) return "2xx";
  if (status >= 300 && status < 400) return "3xx";
  if (status >= 400 && status < 500) return "4xx";
  if (status >= 500) return "5xx";
  return "na";
}

const RANGE_CLASS_NAMES: Record<string, string> = {
  "2xx": "bg-[hsl(var(--status-2xx)/0.15)] text-[hsl(var(--status-2xx))]",
  "3xx": "bg-[hsl(var(--status-3xx)/0.15)] text-[hsl(var(--status-3xx))]",
  "4xx": "bg-[hsl(var(--status-4xx)/0.15)] text-[hsl(var(--status-4xx))]",
  "5xx": "bg-[hsl(var(--status-5xx)/0.15)] text-[hsl(var(--status-5xx))]",
  na: "bg-[hsl(var(--status-na)/0.15)] text-[hsl(var(--status-na))]",
};

/** Color-coded badge for an HTTP status code, grouped by response class (2xx/3xx/4xx/5xx). */
export function StatusCodeBadge({ status, className }: { status?: number; className?: string }) {
  const range = rangeFor(status);

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 font-mono text-xs font-semibold",
        RANGE_CLASS_NAMES[range],
        className
      )}
    >
      {status ?? "—"}
    </span>
  );
}
