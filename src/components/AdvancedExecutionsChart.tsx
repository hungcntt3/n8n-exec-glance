import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { Execution } from "@/types/n8n";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface AdvancedExecutionsChartProps {
  executions: Execution[];
  isLoading?: boolean;
}

type TimeRange = "7days" | "14days" | "30days";

export function AdvancedExecutionsChart({ executions, isLoading }: AdvancedExecutionsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7days");

  const { chartData, stats } = useMemo(() => {
    const now = new Date();
    const daysCount = timeRange === "7days" ? 7 : timeRange === "14days" ? 14 : 30;
    const startDate = subDays(now, daysCount - 1);
    const days = eachDayOfInterval({ start: startDate, end: now });

    const data = days.map((day) => {
      const dayExecutions = executions.filter(
          (e) => format(new Date(e.startedAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
        );
        return {
        date: format(day, "MMM dd"),
          success: dayExecutions.filter((e) => e.status === "success").length,
          error: dayExecutions.filter((e) => e.status === "error").length,
          running: dayExecutions.filter((e) => e.status === "running").length,
          total: dayExecutions.length,
        };
      });

    const totalExecutions = executions.length;
    const successCount = executions.filter((e) => e.status === "success").length;
    const errorCount = executions.filter((e) => e.status === "error").length;
    const successRate = totalExecutions > 0 ? ((successCount / totalExecutions) * 100).toFixed(1) : "0";
    
    // Calculate trend (compare first half vs second half)
    const halfIndex = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, halfIndex).reduce((sum, item) => sum + item.total, 0);
    const secondHalf = data.slice(halfIndex).reduce((sum, item) => sum + item.total, 0);
    const trend = secondHalf > firstHalf ? "up" : secondHalf < firstHalf ? "down" : "stable";

        return {
      chartData: data,
      stats: {
        total: totalExecutions,
        success: successCount,
        error: errorCount,
        successRate,
        trend,
      },
    };
  }, [executions, timeRange]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Success: {payload[0].value}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Error: {payload[1].value}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Running: {payload[2].value}</span>
            </div>
            <div className="pt-1 border-t border-border mt-2">
              <span className="font-semibold">Total: {payload[0].payload.total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Execution Trends
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Daily execution statistics over time
            </p>
          </div>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="14days">14 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Success</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.success}</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Error</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.error}</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-500 flex items-center gap-1">
              {stats.successRate}%
              {stats.trend === "up" && <TrendingUp className="h-4 w-4" />}
              {stats.trend === "down" && <TrendingDown className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: 14, paddingTop: 10 }}
              iconType="circle"
            />
            <Bar dataKey="success" fill="rgb(34, 197, 94)" name="Success" radius={[4, 4, 0, 0]} />
            <Bar dataKey="error" fill="rgb(239, 68, 68)" name="Error" radius={[4, 4, 0, 0]} />
            <Bar dataKey="running" fill="rgb(59, 130, 246)" name="Running" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
