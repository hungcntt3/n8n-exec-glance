import { ExecutionStatus } from "@/types/n8n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecutionFiltersProps {
  selectedStatus?: ExecutionStatus;
  selectedWorkflow?: string;
  workflows: Array<{ id: string; name: string }>;
  onStatusChange: (status: ExecutionStatus | undefined) => void;
  onWorkflowChange: (workflowId: string | undefined) => void;
  onReset: () => void;
}

export function ExecutionFilters({
  selectedStatus,
  selectedWorkflow,
  workflows,
  onStatusChange,
  onWorkflowChange,
  onReset,
}: ExecutionFiltersProps) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters:
          </div>

          <Select
            value={selectedStatus || "all"}
            onValueChange={(value) => onStatusChange(value === "all" ? undefined : value as ExecutionStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedWorkflow || "all"}
            onValueChange={(value) => onWorkflowChange(value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="All Workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
