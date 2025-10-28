import { ExecutionStatus } from "@/types/n8n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const foundWorkflow = workflows.find(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (foundWorkflow) {
        onWorkflowChange(foundWorkflow.id);
      }
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    onReset();
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search - Executions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus || "all"}
              onValueChange={(value) => onStatusChange(value === "all" ? undefined : value as ExecutionStatus)}
            >
              <SelectTrigger id="status">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow">Workflow</Label>
            <Select
              value={selectedWorkflow || "all"}
              onValueChange={(value) => onWorkflowChange(value === "all" ? undefined : value)}
            >
              <SelectTrigger id="workflow">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search by Name</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Enter workflow name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch} size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
