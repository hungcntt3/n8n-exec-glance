import { useState, useMemo, useEffect } from "react";
import { Activity, CheckCircle2, XCircle, PlayCircle, Calendar } from "lucide-react";
import { OverviewCard } from "@/components/OverviewCard";
import { AdvancedExecutionsChart } from "@/components/AdvancedExecutionsChart";
import { ExecutionsTable } from "@/components/ExecutionsTable";
import { ExecutionFilters } from "@/components/ExecutionFilters";
import { ExecutionDetailDialog } from "@/components/ExecutionDetailDialog";
import { WorkflowsTable } from "@/components/WorkflowsTable";
import { WorkflowDetailDialog } from "@/components/WorkflowDetailDialog";
import { WorkflowFilters } from "@/components/WorkflowFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Chatbot } from "@/components/Chatbot";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_EXECUTIONS, MOCK_WORKFLOWS } from "@/lib/mockData";
import { Execution, ExecutionStatus, Workflow } from "@/types/n8n";
import { fetchExecutionDetail, fetchExecutions, fetchWorkflows, toggleWorkflowActive } from "@/lib/api";
import { useNavigate } from "react-router-dom";
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
  const [selectedStatus, setSelectedStatus] = useState<ExecutionStatus | undefined>();
  const [selectedWorkflowFilter, setSelectedWorkflowFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Use mock data - replace with real API calls later
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [executionsTotal, setExecutionsTotal] = useState<Execution[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [toggleWorkflow ,setToggleWorkflowActive] = useState<boolean>(false);
   const loadData = async (limit = 10,includeData = false ) => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchExecutions({
            projectId: "yxhyeLFN7bv5SYj3",
            workflowId:  selectedWorkflowFilter,
            status: selectedStatus,
            limit: 250,
            includeData: false
            // includeData: true
        });
        const data2 = await fetchExecutions({
            projectId: "yxhyeLFN7bv5SYj3",
            workflowId:  selectedWorkflowFilter,
            status: selectedStatus,
            limit: 250,
            // includeData: true
        });
        setExecutionsTotal(data2.data || []);
        
        // Giả sử API trả về { data: [...], total: ... }
        setExecutions(data.data || []);
        const workflowsData = await fetchWorkflows({
          tags: "po-agent",
          limit: 250,

        });
        setWorkflows(workflowsData.data || []);
        setFilteredWorkflows(workflowsData.data || []);

      }
      catch (err) {
        setError("Không thể tải dữ liệu executions");
        console.error(err);
      }
      finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedWorkflowFilter,toggleWorkflow]);

  const handleToggleWorkflowActive = async (id: string, active: boolean) => {
    try {
      const data = await toggleWorkflowActive(id, active);
      setToggleWorkflowActive(!toggleWorkflow);
    } catch (err) {
      console.error("Failed to toggle workflow active status", err);
    }
  };


  const filteredExecutions = useMemo(() => {
    return executions.filter((execution) => {
      console.log("Filtering execution:", selectedWorkflowFilter);
      // load lại khi filter thay đổi
      
      if (selectedStatus && execution.status !== selectedStatus) return false;
      if (selectedWorkflowFilter && execution.workflowId !== selectedWorkflowFilter) return false;
      return true;
    });
  }, [executions, selectedStatus, selectedWorkflowFilter]);

  const stats = useMemo(() => {
    
    const total = executionsTotal.length;
    const success = executionsTotal.filter((e) => e.status === "success").length;
    const error = executionsTotal.filter((e) => e.status === "error").length;
    const running = executionsTotal.filter((e) => e.status === "running").length;

    return { total, success, error, running };
  }, [executionsTotal]);

  const handleViewExecutionDetail = async (execution: Execution) => {
    // get execution detail from API if needed
     let executionDetail =  await fetchExecutionDetail(execution.id, true);
    setSelectedExecution(executionDetail);
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
            selectedStatus={selectedStatus}
            selectedWorkflow={selectedWorkflowFilter}
            workflows={workflows}
            onStatusChange={setSelectedStatus}
            onWorkflowChange={setSelectedWorkflowFilter}
            onReset={handleResetFilters}
          />

          <AdvancedExecutionsChart
            executions={executions}
            workflows={workflows}
            isLoading={loading}
          />

          <ExecutionsTable
            executions={filteredExecutions}
            isLoading={loading}
            onViewDetail={handleViewExecutionDetail}
            workflowNamesMap={workflows.map(wf => ({workflowId: wf.id, workflowName: wf.name}))}
          />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowFilters onFilterChange={(filters) => {
            let filtered = [...workflows];
            
            if (filters.active !== undefined) {
              filtered = filtered.filter(w => w.active === filters.active);
            }
            
            if (filters.isArchived !== undefined) {
              filtered = filtered.filter(w => w.isArchived === filters.isArchived);
            }
            
            if (filters.name) {
              filtered = filtered.filter(w => 
                w.name.toLowerCase().includes(filters.name!.toLowerCase())
              );
            }
            
            setFilteredWorkflows(filtered);
          }} />
          
          <WorkflowsTable 
            workflows={filteredWorkflows}  
            onToggleActive={(id, active) => {
              handleToggleWorkflowActive(id, active);
            }} 
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
