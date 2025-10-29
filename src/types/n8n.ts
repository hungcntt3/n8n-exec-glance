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
  workflowData?: Workflow;
}

export interface ExecutionInputFilters  {
  id: string;
  finished: boolean;
  mode: string;
  status: ExecutionStatus;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
}

export interface ExecutionDetail extends Execution {
  // Additional fields from detail endpoint
  data?: ExecutionLogData;
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
  nextCursor?: string;
}

export interface WorkflowsResponse {
  data: Workflow[];
}

export interface ExecutionFilters {
  status?: ExecutionStatus;
  workflowId?: string;
  limit?: number;
  projectId?: string;
  includeData?: boolean;
  cursor?: string;
}
export interface WorkflowFilters {
  active?: boolean;
  tags?: string;
  name?: string;
  projectId?: string;
  excludePinnedData?: boolean;
  limit?: number;
}

export interface ExecutionLogData {
  startData: Record<string, unknown>;
  resultData: {
    runData: {
      [nodeName: string]: RunNodeExecution[];
    };
    lastNodeExecuted?: string;
    error?: ExecutionError;
  };
}

export interface RunNodeExecution {
  startTime: number;
  executionIndex: number;
  source: SourceInfo[];
  hints: any[];
  executionTime: number;
  executionStatus: "success" | "error";
  data?: {
    main?: Array<Array<{
      json: Record<string, unknown>;
      pairedItem?: { item: number };
    }>>;
  };
  error?: ExecutionError;
}

export interface SourceInfo {
  previousNode?: string;
}

export interface ExecutionError {
  level?: "warning" | "error";
  tags?: Record<string, unknown>;
  description?: string | null;
  errorResponse?: {
    status: string;
    reason?: {
      message: string;
      name?: string;
      stack?: string;
      code?: string;
      status?: number;
    };
  };
  timestamp?: number;
  context?: {
    itemIndex?: number;
  };
  functionality?: string;
  name?: string;
  node?: {
    parameters?: Record<string, unknown>;
    id?: string;
    name?: string;
    type?: string;
    typeVersion?: number;
    position?: [number, number];
  };
  messages?: string[];
  httpCode?: string;
  message?: string;
  stack?: string;
}
