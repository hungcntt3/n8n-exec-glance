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
import { Search, X } from "lucide-react";
import { useState } from "react";

export interface WorkflowFilterValues {
  active?: boolean;
  name?: string;
  isArchived?: boolean;
}

interface WorkflowFiltersProps {
  onFilterChange: (filters: WorkflowFilterValues) => void;
}

export function WorkflowFilters({ onFilterChange }: WorkflowFiltersProps) {
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [archivedStatus, setArchivedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleApplyFilters = () => {
    const filters: WorkflowFilterValues = {};
    
    if (activeStatus === "active") {
      filters.active = true;
    } else if (activeStatus === "inactive") {
      filters.active = false;
    }
    
    if (archivedStatus === "archived") {
      filters.isArchived = true;
    } else if (archivedStatus === "not-archived") {
      filters.isArchived = false;
    }
    
    if (searchQuery.trim()) {
      filters.name = searchQuery.trim();
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    setActiveStatus("all");
    setArchivedStatus("all");
    setSearchQuery("");
    onFilterChange({});
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search - Workflows
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="active-status">Active Status</Label>
            <Select value={activeStatus} onValueChange={setActiveStatus}>
              <SelectTrigger id="active-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="archived-status">Archive Status</Label>
            <Select value={archivedStatus} onValueChange={setArchivedStatus}>
              <SelectTrigger id="archived-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not-archived">Not Archived</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow-search">Search by Name</Label>
            <Input
              id="workflow-search"
              placeholder="Enter workflow name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
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
    </Card>
  );
}
