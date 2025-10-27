export type ExecutionStatus = "success" | "error" | "running" | "waiting" | "canceled";

export interface Execution {
  id: string;
  finished: boolean;
  mode: string;
  status: ExecutionStatus;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowName?: string;
}

export interface ExecutionDetail extends Execution {
  // Additional fields from detail endpoint
}

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  isArchived: boolean;
  createdAt: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface ExecutionsResponse {
  data: Execution[];
}

export interface WorkflowsResponse {
  data: Workflow[];
}

export interface ExecutionFilters {
  status?: ExecutionStatus;
  workflowId?: string;
  limit?: number;
}
