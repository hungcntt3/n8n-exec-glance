"use client";

import { useState, useEffect } from "react";
import { ExecutionInputFilters, ExecutionStatus } from "@/types/n8n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ExecutionFiltersProps {
  filters: Partial<ExecutionInputFilters>;
  workflows: Array<{ id: string; name: string }>;
  onChange: (filters: Partial<ExecutionInputFilters>) => void;
  onReset: () => void;
}

export function ExecutionFilters({
  filters,
  workflows,
  onChange,
  onReset,
}: ExecutionFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Partial<ExecutionInputFilters>>(filters);

  // Sync with parent filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Set first workflow as default when workflows are loaded and auto apply
  useEffect(() => {
    if (workflows.length > 0 && !localFilters.workflowId) {
      const firstWorkflow = workflows[0];
      const newFilters = { workflowId: firstWorkflow.id };
      setLocalFilters(newFilters);
      // Auto apply filter with first workflow
      onChange(newFilters);
    }
  }, [workflows, localFilters.workflowId, onChange]);

  const handleChange = (key: keyof ExecutionInputFilters, value: any) => {
    const updated = { ...localFilters, [key]: value === "" ? undefined : value };
    setLocalFilters(updated);
  };

  const handleClearField = (key: keyof ExecutionInputFilters) => {
    const updated = { ...localFilters };
    delete updated[key];
    setLocalFilters(updated);
  };

  const handleApply = () => {
    // Remove empty values
    const cleanFilters: Partial<ExecutionInputFilters> = {};
    
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        (cleanFilters as any)[key] = value;
      }
    });
    
    onChange(cleanFilters);
  };

  const handleReset = () => {
    // Reset to first workflow instead of empty
    const resetFilters = workflows.length > 0 ? { workflowId: workflows[0].id } : {};
    setLocalFilters(resetFilters);
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

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Execution ID */}
          <div className="space-y-2">
            <Label htmlFor="id">Execution ID</Label>
            <div className="relative">
              <Input
                id="id"
                value={localFilters.id || ""}
                placeholder="Enter execution ID"
                onChange={(e) => handleChange("id", e.target.value)}
                className="pr-8"
              />
              {localFilters.id && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => handleClearField("id")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div className="relative">
              <Select
                value={localFilters.status || "all"}
                onValueChange={(v) =>
                  handleChange("status", v === "all" ? undefined : (v as ExecutionStatus))
                }
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
              {localFilters.status && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-0 h-full px-2 hover:bg-transparent z-10"
                  onClick={() => handleClearField("status")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Workflow */}
          <div className="space-y-2">
            <Label htmlFor="workflow">Workflow</Label>
            <Select
              value={localFilters.workflowId || (workflows.length > 0 ? workflows[0].id : "")}
              onValueChange={(v) => handleChange("workflowId", v)}
            >
              <SelectTrigger id="workflow">
                <SelectValue placeholder="Select Workflow" />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Finished */}
          <div className="space-y-2">
            <Label htmlFor="finished">Finished</Label>
            <div className="relative">
              <Select
                value={localFilters.finished?.toString() || "all"}
                onValueChange={(v) =>
                  handleChange("finished", v === "all" ? undefined : v === "true")
                }
              >
                <SelectTrigger id="finished">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Finished</SelectItem>
                  <SelectItem value="false">Not Finished</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.finished !== undefined && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-0 h-full px-2 hover:bg-transparent z-10"
                  onClick={() => handleClearField("finished")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <div className="relative">
              <Select
                value={localFilters.mode || "all"}
                onValueChange={(v) => handleChange("mode", v === "all" ? undefined : v)}
              >
                <SelectTrigger id="mode">
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="trigger">Trigger</SelectItem>
                  <SelectItem value="integrated">Integrated</SelectItem>
                  <SelectItem value="cli">CLI</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="retry">Retry</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.mode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-0 h-full px-2 hover:bg-transparent z-10"
                  onClick={() => handleClearField("mode")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Started At */}
          <div className="space-y-2">
            <Label htmlFor="startedAt">Started After</Label>
            <div className="relative">
              <Input
                id="startedAt"
                type="datetime-local"
                value={localFilters.startedAt || ""}
                onChange={(e) => handleChange("startedAt", e.target.value)}
                className="pr-8"
              />
              {localFilters.startedAt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => handleClearField("startedAt")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Stopped At */}
          <div className="space-y-2">
            <Label htmlFor="stoppedAt">Stopped Before</Label>
            <div className="relative">
              <Input
                id="stoppedAt"
                type="datetime-local"
                value={localFilters.stoppedAt || ""}
                onChange={(e) => handleChange("stoppedAt", e.target.value)}
                className="pr-8"
              />
              {localFilters.stoppedAt && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => handleClearField("stoppedAt")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleApply}>
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>

          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
