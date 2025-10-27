import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Execution } from "@/types/n8n";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ExecutionsChartProps {
  executions: Execution[];
  isLoading?: boolean;
}

const COLORS = {
  success: "hsl(var(--chart-1))",
  error: "hsl(var(--chart-2))",
  running: "hsl(var(--chart-3))",
  waiting: "hsl(var(--chart-4))",
  canceled: "hsl(var(--chart-5))",
};

export function ExecutionsChart({ executions, isLoading }: ExecutionsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusCounts = executions.reduce((acc, execution) => {
    acc[execution.status] = (acc[execution.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    status,
  }));

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Execution Status Distribution</CardTitle>
        <CardDescription>Breakdown of executions by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
