import { Execution } from "@/types/n8n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ExecutionDetailDialogProps {
  execution: Execution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExecutionDetailDialog({
  execution,
  open,
  onOpenChange,
}: ExecutionDetailDialogProps) {
  if (!execution) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPpp");
  };

  const getDuration = (startedAt: string, stoppedAt?: string) => {
    if (!stoppedAt) return "In progress";
    const start = new Date(startedAt);
    const stop = new Date(stoppedAt);
    const diff = stop.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes ${seconds % 60} seconds`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Execution Details</DialogTitle>
          <DialogDescription>
            Detailed information about execution #{execution.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Execution ID</p>
              <p className="font-mono text-sm">{execution.id}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <StatusBadge status={execution.status} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Workflow</p>
              <p className="text-sm">
                {execution.workflowName || `Workflow ${execution.workflowId}`}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Mode</p>
              <p className="text-sm capitalize">{execution.mode}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Started At</p>
              <p className="text-sm">{formatDate(execution.startedAt)}</p>
            </div>

            {execution.stoppedAt && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Stopped At</p>
                <p className="text-sm">{formatDate(execution.stoppedAt)}</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-sm">{getDuration(execution.startedAt, execution.stoppedAt)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Finished</p>
              <p className="text-sm">{execution.finished ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
