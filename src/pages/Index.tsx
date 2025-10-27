import { useState, useMemo } from "react";
import { Activity, CheckCircle2, XCircle, PlayCircle } from "lucide-react";
import { OverviewCard } from "@/components/OverviewCard";
import { ExecutionsChart } from "@/components/ExecutionsChart";
import { ExecutionsTable } from "@/components/ExecutionsTable";
import { ExecutionFilters } from "@/components/ExecutionFilters";
import { ExecutionDetailDialog } from "@/components/ExecutionDetailDialog";
import { WorkflowsTable } from "@/components/WorkflowsTable";
import { WorkflowDetailDialog } from "@/components/WorkflowDetailDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_EXECUTIONS, MOCK_WORKFLOWS } from "@/lib/mockData";
import { Execution, ExecutionStatus, Workflow } from "@/types/n8n";

const Index = () => {
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ExecutionStatus | undefined>();
  const [selectedWorkflowFilter, setSelectedWorkflowFilter] = useState<string | undefined>();

  // Use mock data - replace with real API calls later
  const executions = MOCK_EXECUTIONS;
  const workflows = MOCK_WORKFLOWS;

  const filteredExecutions = useMemo(() => {
    return executions.filter((execution) => {
      if (selectedStatus && execution.status !== selectedStatus) return false;
      if (selectedWorkflowFilter && execution.workflowId !== selectedWorkflowFilter) return false;
      return true;
    });
  }, [executions, selectedStatus, selectedWorkflowFilter]);

  const stats = useMemo(() => {
    const total = executions.length;
    const success = executions.filter((e) => e.status === "success").length;
    const error = executions.filter((e) => e.status === "error").length;
    const running = executions.filter((e) => e.status === "running").length;

    return { total, success, error, running };
  }, [executions]);

  const handleViewExecutionDetail = (execution: Execution) => {
    setSelectedExecution(execution);
    setExecutionDialogOpen(true);
  };

  const handleViewWorkflowDetail = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedStatus(undefined);
    setSelectedWorkflowFilter(undefined);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">n8n Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your workflow executions
          </p>
        </div>
        <ThemeToggle />
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

      <Tabs defaultValue="executions" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="executions" className="space-y-6">
          <ExecutionFilters
            selectedStatus={selectedStatus}
            selectedWorkflow={selectedWorkflowFilter}
            workflows={workflows}
            onStatusChange={setSelectedStatus}
            onWorkflowChange={setSelectedWorkflowFilter}
            onReset={handleResetFilters}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ExecutionsChart executions={filteredExecutions} />
            </div>
            <div className="lg:col-span-2">
              <ExecutionsTable
                executions={filteredExecutions}
                onViewDetail={handleViewExecutionDetail}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <WorkflowsTable workflows={workflows} onViewDetail={handleViewWorkflowDetail} />
        </TabsContent>
      </Tabs>

      <ExecutionDetailDialog
        execution={selectedExecution}
        open={executionDialogOpen}
        onOpenChange={setExecutionDialogOpen}
      />

      <WorkflowDetailDialog
        workflow={selectedWorkflow}
        open={workflowDialogOpen}
        onOpenChange={setWorkflowDialogOpen}
      />
    </div>
  );
};

export default Index;
