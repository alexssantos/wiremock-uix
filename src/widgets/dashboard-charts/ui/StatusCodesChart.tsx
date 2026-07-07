import type { StatusCodeCount } from "@/entities/dashboard-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type StatusCodesChartProps = {
  data: StatusCodeCount[];
};

const STATUS_COLORS: Record<string, string> = {
  "2xx": "hsl(var(--status-2xx))",
  "3xx": "hsl(var(--status-3xx))",
  "4xx": "hsl(var(--status-4xx))",
  "5xx": "hsl(var(--status-5xx))",
  "N/A": "hsl(var(--status-na))",
};

export function StatusCodesChart({ data }: StatusCodesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status code ranges</CardTitle>
        <CardDescription>Observed response classes from the request journal.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No response status data is available yet.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="status" innerRadius={56} outerRadius={88} paddingAngle={3}>
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "hsl(var(--status-na))"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [String(value), "Requests"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
