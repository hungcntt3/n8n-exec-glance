import { useState, useMemo, useEffect } from "react";
import { Activity, CheckCircle2, XCircle, PlayCircle, Calendar } from "lucide-react";
import { OverviewCard } from "@/components/OverviewCard";
import { AdvancedExecutionsChart } from "@/components/AdvancedExecutionsChart";
import { ExecutionsTable } from "@/components/ExecutionsTable";
import { ExecutionFilters } from "@/components/ExecutionFilters";
import { ExecutionDetailDialog } from "@/components/ExecutionDetailDialog";
import { WorkflowsTable } from "@/components/WorkflowsTable";
import { WorkflowDetailDialog } from "@/components/WorkflowDetailDialog";
import { WorkflowFilters, WorkflowFilterValues } from "@/components/WorkflowFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Chatbot } from "@/components/Chatbot";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_EXECUTIONS, MOCK_WORKFLOWS } from "@/lib/mockData";
import { Execution, ExecutionInputFilters, ExecutionStatus, Workflow } from "@/types/n8n";
import { fetchExecutionDetail, fetchExecutions, fetchWorkflows, toggleWorkflowActive } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { set } from "date-fns";

interface WorkflowNamesMap {
  workflowId: string;
  workflowName: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for executions
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [executionsRaw, setExecutionsRaw] = useState<Execution[]>([]);
  const [executionFilters, setExecutionFilters] = useState<Partial<ExecutionInputFilters>>({});
  
  // State for workflows
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowsRaw, setWorkflowsRaw] = useState<Workflow[]>([]);
  const [workflowFilters, setWorkflowFilters] = useState<Partial<WorkflowFilterValues>>({});
  const [toggleWorkflow, setToggleWorkflowActive] = useState<boolean>(false);

  // Load workflows from API
  const loadWorkflows = async () => {
    try {
        const workflowsData = await fetchWorkflows({
          tags: "po-agent",
          limit: 250,
      });

      setWorkflowsRaw(workflowsData.data || []);
        setWorkflows(workflowsData.data || []);
      
      return workflowsData.data || [];
    } catch (err) {
      console.error("Failed to load workflows:", err);
      return [];
    }
  };

  // Load executions from API with workflowId filter
  const loadExecutions = async (workflowId?: string) => {
    try {
      setLoading(true);
      const executionsData = await fetchExecutions({
        projectId: "yxhyeLFN7bv5SYj3",
        workflowId: workflowId,
        limit: 250,
        includeData: false
      });
      
      setExecutionsRaw(executionsData.data || []);
      setExecutions(executionsData.data || []);
    } catch (err) {
        setError("Không thể tải dữ liệu executions");
        console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on initial mount
  const loadData = async () => {
    try {
      setError(null);
      
      // Fetch workflows first
      const workflows = await loadWorkflows();
      
      // Set filter with first workflow ID, which will trigger loadExecutions via useEffect
      const firstWorkflowId = workflows?.[0]?.id;
      if (firstWorkflowId) {
        setExecutionFilters({ workflowId: firstWorkflowId });
      }
    } catch (err) {
      setError("Không thể tải dữ liệu");
      console.error(err);
    }
  };

  // Load data on mount and when toggle workflow changes
  useEffect(() => {
    loadData();
  }, [toggleWorkflow]);

  // Reload executions when workflowId filter changes
  useEffect(() => {
    if (executionFilters.workflowId) {
      loadExecutions(executionFilters.workflowId);
    }
  }, [executionFilters.workflowId]);

  // Apply client-side filters (except workflowId which triggers API call)
  useEffect(() => {
    // Create a copy of filters without workflowId since it's handled by API
    const { workflowId, ...clientFilters } = executionFilters;
    const filtered = filterExecutions(executionsRaw, clientFilters);
    setExecutions(filtered);
  }, [executionFilters, executionsRaw]);

  // Filter workflows when filters change
  useEffect(() => {
    const filtered = filterWorkflows(workflowsRaw, workflowFilters);
    setWorkflows(filtered);
  }, [workflowFilters, workflowsRaw]);

  // Filter executions function
  const filterExecutions = (
    data: Execution[],
    filters: Partial<ExecutionInputFilters>
  ): Execution[] => {
    let result = [...data];

    if (filters.id) {
      result = result.filter((e) =>
        e.id.toLowerCase().includes(filters.id!.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((e) => e.status === filters.status);
    }

    if (filters.workflowId) {
      result = result.filter((e) => e.workflowId === filters.workflowId);
    }

    if (typeof filters.finished === "boolean") {
      result = result.filter((e) => e.finished === filters.finished);
    }

    if (filters.mode) {
      result = result.filter((e) =>
        e.mode.toLowerCase().includes(filters.mode!.toLowerCase())
      );
    }

    if (filters.startedAt) {
      const startDate = new Date(filters.startedAt);
      result = result.filter((e) => new Date(e.startedAt) >= startDate);
    }

    if (filters.stoppedAt) {
      const stopDate = new Date(filters.stoppedAt);
      result = result.filter(
        (e) => e.stoppedAt && new Date(e.stoppedAt) <= stopDate
      );
    }

    return result;
  };

  // Filter workflows function
  const filterWorkflows = (
    data: Workflow[],
    filters: Partial<WorkflowFilterValues>
  ): Workflow[] => {
    let result = [...data];

    if (filters.id) {
      result = result.filter((w) =>
        w.id.toLowerCase().includes(filters.id!.toLowerCase())
      );
    }

    if (filters.name) {
      result = result.filter((w) =>
        w.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (typeof filters.active === "boolean") {
      result = result.filter((w) => w.active === filters.active);
    }

    if (typeof filters.isArchived === "boolean") {
      result = result.filter((w) => w.isArchived === filters.isArchived);
    }

    if (filters.createdAtFrom) {
      const fromDate = new Date(filters.createdAtFrom);
      result = result.filter((w) => new Date(w.createdAt) >= fromDate);
    }

    if (filters.createdAtTo) {
      const toDate = new Date(filters.createdAtTo);
      result = result.filter((w) => new Date(w.createdAt) <= toDate);
    }

    if (filters.projectId) {
      result = result.filter(
        (w) => w.project?.id.toLowerCase().includes(filters.projectId!.toLowerCase())
      );
    }

    return result;
  };

  const handleToggleWorkflowActive = async (id: string, active: boolean) => {
    try {
      await toggleWorkflowActive(id, active);
      setToggleWorkflowActive(!toggleWorkflow);
    } catch (err) {
      console.error("Failed to toggle workflow active status", err);
    }
  };

  const stats = useMemo(() => {
    const total = executionsRaw.length;
    const success = executionsRaw.filter((e) => e.status === "success").length;
    const error = executionsRaw.filter((e) => e.status === "error").length;
    const running = executionsRaw.filter((e) => e.status === "running").length;

    return { total, success, error, running };
  }, [executionsRaw]);

  const handleViewExecutionDetail = async (execution: Execution) => {
    try {
      const executionDetail = await fetchExecutionDetail(execution.id, true);
    setSelectedExecution(executionDetail);
    setExecutionDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch execution detail", err);
    }
  };

  const handleViewWorkflowDetail = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowDialogOpen(true);
  };

  // Handle execution filters
  const handleExecutionFiltersChange = (newFilters: Partial<ExecutionInputFilters>) => {
    setExecutionFilters(newFilters);
  };

  const handleResetExecutionFilters = () => {
    // Reset to first workflow instead of empty
    const resetFilters = workflowsRaw.length > 0 ? { workflowId: workflowsRaw[0].id } : {};
    setExecutionFilters(resetFilters);
  };

  // Handle workflow filters
  const handleWorkflowFiltersChange = (newFilters: Partial<WorkflowFilterValues>) => {
    setWorkflowFilters(newFilters);
  };

  const handleResetWorkflowFilters = () => {
    setWorkflowFilters({});
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/scheduler")}>
            <Calendar className="mr-2 h-4 w-4" />
            Scheduler
          </Button>
          <ThemeToggle />
        </div>
      </div>

    

<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Executions"
          value={stats.total == 250 ? "250+" : stats.total}
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
            filters={executionFilters}
            onChange={handleExecutionFiltersChange}
            workflows={workflowsRaw.map(wf => ({ id: wf.id, name: wf.name }))}
            onReset={handleResetExecutionFilters}
          />

          <AdvancedExecutionsChart
            executions={executions}
            isLoading={loading}
          />

          <ExecutionsTable
            executions={executions}
            isLoading={loading}
            onViewDetail={handleViewExecutionDetail}
            workflowNamesMap={workflowsRaw.map(wf => ({workflowId: wf.id, workflowName: wf.name}))}
          />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowFilters 
            filters={workflowFilters}
            onFilterChange={handleWorkflowFiltersChange}
            onReset={handleResetWorkflowFilters}
          />
          
          <WorkflowsTable 
            workflows={workflows}  
            onToggleActive={handleToggleWorkflowActive} 
            onViewDetail={handleViewWorkflowDetail} 
          />
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

      <Chatbot />
    </div>
  );
};

export default Index;
