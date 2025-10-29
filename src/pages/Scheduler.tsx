import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Clock, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Scheduler } from "@/types/scheduler";
import { fetchWorkflows, toggleWorkflowActive } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";

const SchedulerPage = () => {
  const navigate = useNavigate();
  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadSchedulers = async () => {
    try {
      setLoading(true);
      const workflowsData = await fetchWorkflows({
        tags: "scheduler",
        limit: 250,
      });
      const schedulerData = workflowsData.data.map((wf: any) => ({
        id: wf.id,
        name: wf.name,
        workflowId: wf.id,
        workflowName: wf.name,
        cron: wf.settings?.executionOrder || "N/A",
        enabled: wf.active,
        createdAt: wf.createdAt,
        updatedAt: wf.updatedAt,
      }));
      setSchedulers(schedulerData || []);
    } catch (error) {
      console.error("Failed to load schedulers:", error);
      toast.error("Failed to load schedulers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedulers();
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    setTogglingId(id);
    try {
      await toggleWorkflowActive(id, enabled);
      setSchedulers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled } : s))
      );
      toast.success(`Scheduler ${enabled ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Failed to toggle scheduler:", error);
      toast.error("Failed to toggle scheduler");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-10" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Scheduler Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor your workflow schedules
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Schedulers</CardTitle>
            <Badge variant="outline" className="text-lg">
              {schedulers.filter((s) => s.enabled).length} / {schedulers.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Schedule (Cron)</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedulers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No schedulers found
                    </TableCell>
                  </TableRow>
                ) : (
                  schedulers.map((scheduler) => (
                    <TableRow key={scheduler.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{scheduler.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {scheduler.workflowName || scheduler.workflowId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {scheduler.cron}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {scheduler.nextRunAt
                          ? format(new Date(scheduler.nextRunAt), "MMM dd, HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {scheduler.lastRunAt
                          ? format(new Date(scheduler.lastRunAt), "MMM dd, HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {scheduler.enabled ? (
                          <Badge className="bg-status-success text-status-success-foreground">
                            <Play className="mr-1 h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted">
                            <Pause className="mr-1 h-3 w-3" />
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={scheduler.enabled}
                          onCheckedChange={(checked) => handleToggle(scheduler.id, checked)}
                          disabled={togglingId === scheduler.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulerPage;
