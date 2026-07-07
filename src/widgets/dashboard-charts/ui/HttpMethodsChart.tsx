import type { HttpMethodCount } from "@/entities/dashboard-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type HttpMethodsChartProps = {
  data: HttpMethodCount[];
};

const METHOD_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

export function HttpMethodsChart({ data }: HttpMethodsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>HTTP methods</CardTitle>
        <CardDescription>Traffic distribution by method, falling back to stub mappings when needed.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No HTTP method data is available yet.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="method" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <Tooltip formatter={(value) => [String(value), "Requests"]} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={entry.method} fill={METHOD_COLORS[index % METHOD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
