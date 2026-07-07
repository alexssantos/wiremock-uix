import type { RequestsPerMinutePoint } from "@/entities/dashboard-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RequestsPerMinuteChartProps = {
  data: RequestsPerMinutePoint[];
};

export function RequestsPerMinuteChart({ data }: RequestsPerMinuteChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requests per minute</CardTitle>
        <CardDescription>Recent traffic grouped into minute buckets.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No request traffic has been recorded yet.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="requests-per-minute-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="minute" tickFormatter={formatMinuteTick} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <Tooltip labelFormatter={(label) => `Minute: ${String(label)}`} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#requests-per-minute-fill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatMinuteTick(value: string): string {
  return value.slice(-5);
}
