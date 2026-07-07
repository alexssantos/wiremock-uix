import { useMemo } from "react";
import type { LogEntry } from "@/entities/log-entry";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { HttpMethodBadge } from "@/shared/ui/http-method-badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { StatusCodeBadge } from "@/shared/ui/status-code-badge";

const dayFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: "medium" });

type LogsTimelineProps = {
  entries: LogEntry[];
};

export function LogsTimeline({ entries }: LogsTimelineProps) {
  const groups = useMemo(() => {
    const map = new Map<string, LogEntry[]>();

    entries.forEach((entry) => {
      const timestamp = new Date(entry.timestamp);
      const key = dayFormatter.format(timestamp);
      const existingEntries = map.get(key);

      if (existingEntries) {
        existingEntries.push(entry);
      } else {
        map.set(key, [entry]);
      }
    });

    return [...map.entries()];
  }, [entries]);

  return (
    <Card className="min-h-[32rem]">
      <CardHeader>
        <CardTitle>Event timeline</CardTitle>
        <CardDescription>Chronological view of entries collected from the WireMock request journal.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-18rem)] min-h-[24rem] pr-4">
          <div className="space-y-8">
            {groups.map(([dateLabel, groupEntries]) => (
              <section key={dateLabel} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">{dateLabel}</h3>
                  <p className="text-xs text-muted-foreground">{groupEntries.length} event(s)</p>
                </div>

                <div className="relative border-l pl-6">
                  {groupEntries.map((entry, index) => (
                    <div key={entry.id} className="relative pb-6 last:pb-0">
                      <span
                        className={cn(
                          "absolute top-2 left-[-29px] size-3 rounded-full border-2 border-background",
                          entry.matched ? "bg-[hsl(var(--status-2xx))]" : "bg-[hsl(var(--status-5xx))]"
                        )}
                      />
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <HttpMethodBadge method={entry.method} />
                          <StatusCodeBadge status={entry.status} />
                          <Badge variant={entry.matched ? "secondary" : "outline"}>
                            {entry.matched ? "Matched" : "Unmatched"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{timeFormatter.format(new Date(entry.timestamp))}</span>
                        </div>
                        <p className="break-all font-mono text-sm">{entry.url}</p>
                        <p className="font-mono text-xs text-muted-foreground">{entry.id}</p>
                      </div>
                      {index < groupEntries.length - 1 ? <Separator className="mt-6" /> : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
