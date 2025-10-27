import { ExecutionStatus } from "@/types/n8n";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Clock, CircleSlash } from "lucide-react";

interface StatusBadgeProps {
  status: ExecutionStatus;
}

const statusConfig = {
  success: {
    label: "Success",
    icon: CheckCircle2,
    className: "bg-status-success text-status-success-foreground hover:bg-status-success/80",
  },
  error: {
    label: "Error",
    icon: XCircle,
    className: "bg-status-error text-status-error-foreground hover:bg-status-error/80",
  },
  running: {
    label: "Running",
    icon: Loader2,
    className: "bg-status-running text-status-running-foreground hover:bg-status-running/80",
  },
  waiting: {
    label: "Waiting",
    icon: Clock,
    className: "bg-status-waiting text-status-waiting-foreground hover:bg-status-waiting/80",
  },
  canceled: {
    label: "Canceled",
    icon: CircleSlash,
    className: "bg-status-canceled text-status-canceled-foreground hover:bg-status-canceled/80",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className={`mr-1.5 h-3.5 w-3.5 ${status === "running" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
