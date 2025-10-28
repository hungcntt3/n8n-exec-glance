export interface Scheduler {
  id: string;
  name: string;
  workflowId: string;
  workflowName?: string;
  cron: string;
  enabled: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulersResponse {
  data: Scheduler[];
  total?: number;
}
