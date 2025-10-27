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
import { ChevronLeft, ChevronRight, Play, Pause, Archive } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface WorkflowsTableProps {
  workflows: Workflow[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function WorkflowsTable({ workflows, isLoading }: WorkflowsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(workflows.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWorkflows = workflows.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

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
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Project</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWorkflows.map((workflow) => (
                <TableRow
                  key={workflow.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{workflow.name}</TableCell>
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
                  <TableCell className="text-sm text-muted-foreground">
                    {workflow.project?.name || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, workflows.length)} of{" "}
            {workflows.length} workflows
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
