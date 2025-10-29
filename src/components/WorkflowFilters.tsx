"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Workflow } from "@/types/n8n";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Extended filter interface based on Workflow fields
export interface WorkflowFilterValues {
  id?: string;
  name?: string;
  active?: boolean;
  isArchived?: boolean;
  createdAtFrom?: string;
  createdAtTo?: string;
  projectId?: string;
}

interface WorkflowFiltersProps {
  filters: Partial<WorkflowFilterValues>;
  onFilterChange: (filters: Partial<WorkflowFilterValues>) => void;
  onReset: () => void;
}

export function WorkflowFilters({ filters, onFilterChange, onReset }: WorkflowFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Partial<WorkflowFilterValues>>(filters);

  // Sync with parent filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof WorkflowFilterValues, value: any) => {
    const updated = { ...localFilters, [key]: value === "" ? undefined : value };
    setLocalFilters(updated);
  };

  const handleClearField = (key: keyof WorkflowFilterValues) => {
    const updated = { ...localFilters };
    delete updated[key];
    setLocalFilters(updated);
  };

  const handleApplyFilters = () => {
    // Remove empty values
    const cleanFilters: Partial<WorkflowFilterValues> = {};
    
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        (cleanFilters as any)[key] = value;
      }
    });
    
    onFilterChange(cleanFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="animate-fade-in">
        <CardHeader className="py-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-muted p-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <CardTitle className="text-base">Advanced Search - Workflows</CardTitle>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Workflow ID */}
          <div className="space-y-2">
            <Label htmlFor="workflow-id">Workflow ID</Label>
            <div className="relative">
              <Input
                id="workflow-id"
                placeholder="Enter workflow ID..."
                value={localFilters.id || ""}
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

          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <div className="relative">
              <Input
                id="workflow-name"
                placeholder="Enter workflow name..."
                value={localFilters.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="pr-8"
              />
              {localFilters.name && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => handleClearField("name")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <Label htmlFor="active-status">Active Status</Label>
            <div className="relative">
              <Select 
                value={localFilters.active?.toString() || "all"} 
                onValueChange={(v) => handleChange("active", v === "all" ? undefined : v === "true")}
              >
                <SelectTrigger id="active-status">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.active !== undefined && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-0 h-full px-2 hover:bg-transparent z-10"
                  onClick={() => handleClearField("active")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Archive Status */}
          <div className="space-y-2">
            <Label htmlFor="archived-status">Archive Status</Label>
            <div className="relative">
              <Select 
                value={localFilters.isArchived?.toString() || "all"} 
                onValueChange={(v) => handleChange("isArchived", v === "all" ? undefined : v === "true")}
              >
                <SelectTrigger id="archived-status">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="false">Not Archived</SelectItem>
                  <SelectItem value="true">Archived</SelectItem>
                </SelectContent>
              </Select>
              {localFilters.isArchived !== undefined && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-8 top-0 h-full px-2 hover:bg-transparent z-10"
                  onClick={() => handleClearField("isArchived")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Created At From */}
          <div className="space-y-2">
            <Label htmlFor="created-from">Created After</Label>
            <div className="relative">
              <Input
                id="created-from"
                type="datetime-local"
                value={localFilters.createdAtFrom || ""}
                onChange={(e) => handleChange("createdAtFrom", e.target.value)}
                className="pr-8"
              />
              {localFilters.createdAtFrom && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => handleClearField("createdAtFrom")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Created At To */}
          <div className="space-y-2">
            <Label htmlFor="created-to">Created Before</Label>
            <div className="relative">
              <Input
                id="created-to"
                type="datetime-local"
                value={localFilters.createdAtTo || ""}
                onChange={(e) => handleChange("createdAtTo", e.target.value)}
                className="pr-8"
              />
              {localFilters.createdAtTo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => handleClearField("createdAtTo")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div>

          {/* Project ID */}
          {/* <div className="space-y-2">
            <Label htmlFor="project-id">Project ID</Label>
            <div className="relative">
              <Input
                id="project-id"
                placeholder="Enter project ID..."
                value={localFilters.projectId || ""}
                onChange={(e) => handleChange("projectId", e.target.value)}
                className="pr-8"
              />
              {localFilters.projectId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => handleClearField("projectId")}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>
          </div> */}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} size="sm">
                <Search className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
