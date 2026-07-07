import type { TopUrlCount } from "@/entities/dashboard-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TopUrlsChartProps = {
  data: TopUrlCount[];
};

export function TopUrlsChart({ data }: TopUrlsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top URLs</CardTitle>
        <CardDescription>Most frequent URLs seen in recent traffic or configured stubs.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No URL frequency data is available yet.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="url"
                  tickFormatter={truncateUrl}
                  tickLine={false}
                  axisLine={false}
                  width={112}
                />
                <Tooltip formatter={(value) => [String(value), "Occurrences"]} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function truncateUrl(url: string): string {
  return url.length > 22 ? `${url.slice(0, 19)}...` : url;
}
