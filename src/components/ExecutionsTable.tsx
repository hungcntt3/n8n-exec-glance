import { useEffect, useState } from "react";
import { Execution } from "@/types/n8n";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fetchExecutions } from "@/lib/api";

interface WorkflowNamesMap {
  workflowId: string;
  workflowName: string;
}
interface ExecutionsTableProps {
  executions: Execution[];
  isLoading?: boolean;
  workflowNamesMap?: WorkflowNamesMap[]
  onViewDetail?: (execution: Execution) => void;
}

const ITEMS_PER_PAGE = 10;

type SortField = "id" | "workflowName" | "status" | "startedAt" | "stoppedAt";
type SortOrder = "asc" | "desc";

export function ExecutionsTable({ executions, isLoading, workflowNamesMap, onViewDetail }: ExecutionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [executionsPerPage, setExecutionsPerPage] = useState(executions);
  const [sortField, setSortField] = useState<SortField>("startedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
   const loadData = async (limit = 10,includeData = false, cursor?:string ) => {
        try {
          
          const data = await fetchExecutions({
              projectId: "yxhyeLFN7bv5SYj3",
              workflowId:  executionsPerPage[0]?.workflowId,
              limit: limit,
              includeData: includeData,
              cursor: cursor
              // includeData: true
          });
          setExecutionsPerPage(data.data || []);
          
  
        }
        catch (err) {
          console.error(err);
        }
        finally {
        }
      };
  // check onchange then call executions
  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
    useEffect(() => {
      loadData(10,true, executionsPerPage[executionsPerPage.length -1]?.id);
    }, [executionsPerPage]);
    
  }
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
        let nameA = a.workflowName || a.workflowId;
        let nameB = b.workflowName || b.workflowId;
        
        workflowNamesMap && (nameA = workflowNamesMap[a.workflowId] || nameA);
        workflowNamesMap && (nameB = workflowNamesMap[b.workflowId] || nameB);
        comparison = nameA.localeCompare(nameB);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "startedAt":
        comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

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

  const totalPages = Math.ceil(sortedExecutions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExecutions = sortedExecutions.slice(startIndex, endIndex);

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
                 <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-semibold"
                    onClick={() => {}}
                  >
                    Workflow Id
                  </Button>
                </TableHead>
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
                    onClick={() => {}}
                  >
                    Status
                    {/* {getSortIcon("status")} */}
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
                   <TableCell className="font-medium">
                     {execution.workflowId}
                  </TableCell>
                  <TableCell className="font-medium">
                     {execution?.workflowData?.name || execution.workflowId}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={execution.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(execution.startedAt)}
                  </TableCell>
                   <TableCell className="text-sm text-muted-foreground">
                     {execution.stoppedAt
                    ? formatDistanceToNow(new Date(execution.stoppedAt), {
                        addSuffix: true,
                      })
                    : "Đang chạy..."}
                    {/* {formatDate(execution.stoppedAt)} */}
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

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedExecutions.length)}
            {/* {sortedExecutions.length} executions */}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
