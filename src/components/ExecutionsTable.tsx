import { useState } from "react";
import { Execution, ExecutionInputFilters } from "@/types/n8n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { AdvancedPagination } from "@/components/AdvancedPagination";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ExecutionsTableProps {
  executions: Execution[];
  isLoading?: boolean;
  onViewDetail?: (execution: Execution) => void;
  workflowNamesMap?: { workflowId: string; workflowName: string }[];
}

type SortField = "id" | "workflowName" | "status" | "startedAt" | "stoppedAt";
type SortOrder = "asc" | "desc";

export function ExecutionsTable({
  executions,
  isLoading,
  onViewDetail,
  workflowNamesMap = [],
}: ExecutionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>("startedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
 const handleSearchExecutions = (
  executions: Execution[],
  newFilters: Partial<ExecutionInputFilters>
): ExecutionInputFilters[] => {
  let executionsFiltered = [...executions];

  if (newFilters.id) {
    executionsFiltered = executionsFiltered.filter((e) =>
      e.id.toLowerCase().includes(newFilters.id!.toLowerCase())
    );
  }

  if (typeof newFilters.finished === "boolean") {
    executionsFiltered = executionsFiltered.filter(
      (e) => e.finished === newFilters.finished
    );
  }

  if (newFilters.mode) {
    executionsFiltered = executionsFiltered.filter((e) =>
      e.mode.toLowerCase().includes(newFilters.mode!.toLowerCase())
    );
  }

  if (newFilters.status) {
    executionsFiltered = executionsFiltered.filter(
      (e) => e.status === newFilters.status
    );
  }

  if (newFilters.workflowId) {
    executionsFiltered = executionsFiltered.filter(
      (e) => e.workflowId === newFilters.workflowId
    );
  }

  if (newFilters.startedAt) {
    const startDate = new Date(newFilters.startedAt);
    executionsFiltered = executionsFiltered.filter(
      (e) => new Date(e.startedAt) >= startDate
    );
  }

  if (newFilters.stoppedAt) {
    const stopDate = new Date(newFilters.stoppedAt);
    executionsFiltered = executionsFiltered.filter(
      (e) => e.stoppedAt && new Date(e.stoppedAt) <= stopDate
    );
  }

  return executionsFiltered;
};
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

  const sortedExecutions = [...executions].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "id":
        comparison = parseInt(a.id) - parseInt(b.id);
        break;
      case "workflowName":
        const nameA = workflowNamesMap.find((w) => w.workflowId === a.workflowId)?.workflowName || a.workflowId;
        const nameB = workflowNamesMap.find((w) => w.workflowId === b.workflowId)?.workflowName || b.workflowId;
        comparison = nameA.localeCompare(nameB);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "startedAt":
        comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
        break;
      case "stoppedAt":
        if (!a.stoppedAt && !b.stoppedAt) comparison = 0;
        else if (!a.stoppedAt) comparison = 1;
        else if (!b.stoppedAt) comparison = -1;
        else comparison = new Date(a.stoppedAt).getTime() - new Date(b.stoppedAt).getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedExecutions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentExecutions = sortedExecutions.slice(startIndex, endIndex);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
  };

  const getDuration = (startedAt: string, stoppedAt?: string) => {
    if (!stoppedAt) return "-";
    const start = new Date(startedAt);
    const stop = new Date(stoppedAt);
    const diff = stop.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
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
        <CardTitle>Recent Executions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => handleSort("id")}
                  >
                    ID
                    {getSortIcon("id")}
                  </Button>
                </TableHead>
                <TableHead>Workflow ID</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => handleSort("workflowName")}
                  >
                    Workflow Name
                    {getSortIcon("workflowName")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    {getSortIcon("status")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => handleSort("startedAt")}
                  >
                    Started At
                    {getSortIcon("startedAt")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => handleSort("stoppedAt")}
                  >
                    Stopped At
                    {getSortIcon("stoppedAt")}
                  </Button>
                </TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentExecutions.map((execution) => (
                <TableRow
                  key={execution.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onViewDetail?.(execution)}
                >
                  <TableCell className="font-mono text-sm">{execution.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {execution.workflowId}
                  </TableCell>
                  <TableCell className="font-medium">
                    {workflowNamesMap.find((w) => w.workflowId === execution.workflowId)?.workflowName || execution.workflowId}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={execution.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(execution.startedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {execution.stoppedAt ? formatDate(execution.stoppedAt) : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getDuration(execution.startedAt, execution.stoppedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail?.(execution);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sortedExecutions.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardContent>
    </Card>
  );
}
