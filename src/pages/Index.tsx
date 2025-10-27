import { useState, useMemo } from "react";
import { Activity, CheckCircle2, XCircle, PlayCircle } from "lucide-react";
import { OverviewCard } from "@/components/OverviewCard";
import { ExecutionsChart } from "@/components/ExecutionsChart";
import { ExecutionsTable } from "@/components/ExecutionsTable";
import { ExecutionFilters } from "@/components/ExecutionFilters";
import { ExecutionDetailDialog } from "@/components/ExecutionDetailDialog";
import { MOCK_EXECUTIONS, MOCK_WORKFLOWS } from "@/lib/mockData";
import { Execution, ExecutionStatus } from "@/types/n8n";

const Index = () => {
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ExecutionStatus | undefined>();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | undefined>();

  // Use mock data - replace with real API calls later
  const executions = MOCK_EXECUTIONS;
  const workflows = MOCK_WORKFLOWS;

  const filteredExecutions = useMemo(() => {
    return executions.filter((execution) => {
      if (selectedStatus && execution.status !== selectedStatus) return false;
      if (selectedWorkflow && execution.workflowId !== selectedWorkflow) return false;
      return true;
    });
  }, [executions, selectedStatus, selectedWorkflow]);

  const stats = useMemo(() => {
    const total = executions.length;
    const success = executions.filter((e) => e.status === "success").length;
    const error = executions.filter((e) => e.status === "error").length;
    const running = executions.filter((e) => e.status === "running").length;

    return { total, success, error, running };
  }, [executions]);

  const handleViewDetail = (execution: Execution) => {
    setSelectedExecution(execution);
    setDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedStatus(undefined);
    setSelectedWorkflow(undefined);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">n8n Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your workflow executions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Executions"
          value={stats.total}
          icon={Activity}
        />
        <OverviewCard
          title="Successful"
          value={stats.success}
          icon={CheckCircle2}
        />
        <OverviewCard
          title="Failed"
          value={stats.error}
          icon={XCircle}
        />
        <OverviewCard
          title="Running"
          value={stats.running}
          icon={PlayCircle}
        />
      </div>

      <ExecutionFilters
        selectedStatus={selectedStatus}
        selectedWorkflow={selectedWorkflow}
        workflows={workflows}
        onStatusChange={setSelectedStatus}
        onWorkflowChange={setSelectedWorkflow}
        onReset={handleResetFilters}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ExecutionsChart executions={filteredExecutions} />
        </div>
        <div className="lg:col-span-2">
          <ExecutionsTable
            executions={filteredExecutions}
            onViewDetail={handleViewDetail}
          />
        </div>
      </div>

      <ExecutionDetailDialog
        execution={selectedExecution}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default Index;
