import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Execution, Workflow } from "@/types/n8n";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear } from "date-fns";

interface AdvancedExecutionsChartProps {
  executions: Execution[];
  workflows: Workflow[];
  isLoading?: boolean;
}

type TimeRange = "weekly" | "monthly" | "yearly";
type ChartType = "line" | "bar" | "area";

export function AdvancedExecutionsChart({ executions, workflows, isLoading }: AdvancedExecutionsChartProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || "");
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [chartType, setChartType] = useState<ChartType>("line");

  const chartData = useMemo(() => {
    if (!selectedWorkflowId) return [];

    const filtered = executions.filter((e) => e.workflowId === selectedWorkflowId);
    const now = new Date();

    if (timeRange === "weekly") {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      return days.map((day) => {
        const dayExecutions = filtered.filter(
          (e) => format(new Date(e.startedAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
        );
        return {
          name: format(day, "EEE"),
          success: dayExecutions.filter((e) => e.status === "success").length,
          error: dayExecutions.filter((e) => e.status === "error").length,
          running: dayExecutions.filter((e) => e.status === "running").length,
          total: dayExecutions.length,
        };
      });
    } else if (timeRange === "monthly") {
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

      return months.map((month) => {
        const monthExecutions = filtered.filter(
          (e) => format(new Date(e.startedAt), "yyyy-MM") === format(month, "yyyy-MM")
        );
        return {
          name: format(month, "MMM"),
          success: monthExecutions.filter((e) => e.status === "success").length,
          error: monthExecutions.filter((e) => e.status === "error").length,
          running: monthExecutions.filter((e) => e.status === "running").length,
          total: monthExecutions.length,
        };
      });
    } else {
      // yearly - last 5 years
      const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 4 + i);
      
      return years.map((year) => {
        const yearExecutions = filtered.filter(
          (e) => new Date(e.startedAt).getFullYear() === year
        );
        return {
          name: year.toString(),
          success: yearExecutions.filter((e) => e.status === "success").length,
          error: yearExecutions.filter((e) => e.status === "error").length,
          running: yearExecutions.filter((e) => e.status === "running").length,
          total: yearExecutions.length,
        };
      });
    }
  }, [executions, selectedWorkflowId, timeRange]);

  const totalCount = chartData.reduce((sum, item) => sum + item.total, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const chartContent = (
      <>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend />
      </>
    );

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          {chartContent}
          <Line type="monotone" dataKey="success" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Success" />
          <Line type="monotone" dataKey="error" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Error" />
          <Line type="monotone" dataKey="running" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Running" />
        </LineChart>
      );
    } else if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          {chartContent}
          <Bar dataKey="success" fill="hsl(var(--chart-1))" name="Success" />
          <Bar dataKey="error" fill="hsl(var(--chart-2))" name="Error" />
          <Bar dataKey="running" fill="hsl(var(--chart-3))" name="Running" />
        </BarChart>
      );
    } else {
      return (
        <AreaChart {...commonProps}>
          {chartContent}
          <Area type="monotone" dataKey="success" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Success" />
          <Area type="monotone" dataKey="error" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Error" />
          <Area type="monotone" dataKey="running" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} name="Running" />
        </AreaChart>
      );
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Execution Statistics</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select workflow" />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((wf) => (
                  <SelectItem key={wf.id} value={wf.id}>
                    {wf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
            <TabsList>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="area">Area</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Total executions: <span className="font-semibold text-foreground">{totalCount}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
