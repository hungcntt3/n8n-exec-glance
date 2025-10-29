import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Clock, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchWorkflows, toggleWorkflowActive } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WorkflowsTable } from "@/components/WorkflowsTable";
import { WorkflowFilters, WorkflowFilterValues } from "@/components/WorkflowFilters";
import { Workflow } from "@/types/n8n";

const SchedulerPage = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [filters, setFilters] = useState<Partial<WorkflowFilterValues>>({});
  const [loading, setLoading] = useState(true);

  const loadSchedulers = async () => {
    try {
      setLoading(true);
      const workflowsData = await fetchWorkflows({
        tags: "scheduler",
        limit: 250,
      });
      setWorkflows(workflowsData.data || []);
      setFilteredWorkflows(workflowsData.data || []);
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

  const handleFilterChange = (newFilters: Partial<WorkflowFilterValues>) => {
    setFilters(newFilters);
    
    let filtered = [...workflows];
    
    if (newFilters.id) {
      filtered = filtered.filter(w => w.id?.toLowerCase().includes(newFilters.id!.toLowerCase()));
    }
    
    if (newFilters.name) {
      filtered = filtered.filter(w => w.name?.toLowerCase().includes(newFilters.name!.toLowerCase()));
    }
    
    if (newFilters.active !== undefined) {
      filtered = filtered.filter(w => w.active === newFilters.active);
    }
    
    if (newFilters.isArchived !== undefined) {
      filtered = filtered.filter(w => w.isArchived === newFilters.isArchived);
    }
    
    if (newFilters.createdAtFrom) {
      const fromDate = new Date(newFilters.createdAtFrom);
      filtered = filtered.filter(w => new Date(w.createdAt) >= fromDate);
    }
    
    if (newFilters.createdAtTo) {
      const toDate = new Date(newFilters.createdAtTo);
      filtered = filtered.filter(w => new Date(w.createdAt) <= toDate);
    }
    
    setFilteredWorkflows(filtered);
  };

  const handleResetFilters = () => {
    setFilters({});
    setFilteredWorkflows(workflows);
  };

  if (loading) {
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
        <div className="animate-fade-in space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
        </div>
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

      <WorkflowFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Schedulers</CardTitle>
            <Badge variant="outline" className="text-lg">
              <Clock className="mr-1 h-4 w-4" />
              {filteredWorkflows.filter((w) => w.active).length} / {filteredWorkflows.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <WorkflowsTable 
            workflows={filteredWorkflows} 
            onToggleActive={async (id, active) => {
              await toggleWorkflowActive(id, active);
              loadSchedulers();
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulerPage;
