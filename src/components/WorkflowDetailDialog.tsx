import { Workflow } from "@/types/n8n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Archive } from "lucide-react";

interface WorkflowDetailDialogProps {
  workflow: Workflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowDetailDialog({
  workflow,
  open,
  onOpenChange,
}: WorkflowDetailDialogProps) {
  if (!workflow) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPpp");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Workflow Details</DialogTitle>
          <DialogDescription>
            Detailed information about {workflow.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Workflow ID</p>
              <p className="font-mono text-sm">{workflow.id}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm font-semibold">{workflow.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
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
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active State</p>
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
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm">{formatDate(workflow.createdAt)}</p>
            </div>

            {workflow.project && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                  <p className="text-sm">{workflow.project.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Project ID</p>
                  <p className="font-mono text-sm">{workflow.project.id}</p>
                </div>
              </>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Archived</p>
              <p className="text-sm">{workflow.isArchived ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
