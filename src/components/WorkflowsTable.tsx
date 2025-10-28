import { useState } from "react";
import { Workflow } from "@/types/n8n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Archive,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toggleWorkflowActive } from "@/lib/api";

interface WorkflowsTableProps {
  workflows: Workflow[];
  isLoading?: boolean;
  onViewDetail?: (workflow: Workflow) => void;
  onToggleActive?: (id: string, active: boolean) => void; // 👈 callback để bật/tắt
}

const ITEMS_PER_PAGE = 10;

type SortField = "name" | "active" | "createdAt" | "isArchived";
type SortOrder = "asc" | "desc";

export function WorkflowsTable({
  workflows,
  isLoading,
  onViewDetail,
  onToggleActive,
}: WorkflowsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const sortedWorkflows = [...workflows].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "active":
        comparison = (a.active ? 1 : 0) - (b.active ? 1 : 0);
        break;
      case "isArchived":
        comparison = (a.isArchived ? 1 : 0) - (b.isArchived ? 1 : 0);
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedWorkflows.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWorkflows = sortedWorkflows.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow Id</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created At
                    {getSortIcon("createdAt")}
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWorkflows.map((workflow) => (
                <TableRow
                  key={workflow.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="text-sm text-muted-foreground">
                    {workflow.id || "-"}
                  </TableCell>
                  <TableCell
                    className="font-medium cursor-pointer"
                    onClick={() => onViewDetail?.(workflow)}
                  >
                    {workflow.name}
                  </TableCell>
                  <TableCell>
                    {workflow.isArchived ? (
                      <Badge variant="outline" className="bg-status-canceled/20">
                        <Archive className="mr-1.5 h-3 w-3" />
                        Archived
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-primary/20">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {workflow.active ? (
                      <Badge className="bg-status-success text-status-success-foreground">
                        <Play className="mr-1.5 h-3 w-3" />
                        Running
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted">
                        <Pause className="mr-1.5 h-3 w-3" />
                        Paused
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(workflow.createdAt)}
                  </TableCell>

                  {/* 🟢 Nút bật/tắt Active */}
                  <TableCell>
                    <Button
                variant={workflow.active ? "outline" : "default"}
                size="sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    // Sau khi thành công, cập nhật lại local state hoặc refetch.
                    onToggleActive?.(workflow.id, !workflow.active);
                  } catch (err) {
                    console.error(err);
                    alert("Không thể cập nhật trạng thái workflow");
                  }
                }}
              >
  {workflow.active ? (
    <>
      <Pause className="mr-1 h-4 w-4" /> Deactivate
    </>
  ) : (
    <>
      <Play className="mr-1 h-4 w-4" /> Activate
    </>
  )}
</Button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, sortedWorkflows.length)} of{" "}
            {sortedWorkflows.length} workflows
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
