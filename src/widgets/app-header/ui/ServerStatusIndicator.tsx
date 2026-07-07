import { useServerHealth } from "@/entities/server";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

/** Small dot + label reflecting WireMock server connectivity, polled every 15s. */
export function ServerStatusIndicator() {
  const { data, isError, isLoading } = useServerHealth();

  const state = isLoading ? "checking" : isError ? "offline" : data?.status === "healthy" ? "online" : "degraded";

  const label = {
    checking: "Checking...",
    online: `Online${data?.version ? ` · v${data.version}` : ""}`,
    degraded: "Degraded",
    offline: "Offline",
  }[state];

  const dotClass = {
    checking: "bg-muted-foreground",
    online: "bg-[hsl(var(--status-2xx))]",
    degraded: "bg-[hsl(var(--status-4xx))]",
    offline: "bg-[hsl(var(--status-5xx))]",
  }[state];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-muted-foreground">
          <span className={cn("size-2 rounded-full", dotClass, state === "online" && "animate-pulse")} />
          <span className="hidden sm:inline">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>WireMock server status</TooltipContent>
    </Tooltip>
  );
}
