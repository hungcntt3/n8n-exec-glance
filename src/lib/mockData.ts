import { Execution, ExecutionStatus, Workflow } from "@/types/n8n";

const statuses: ExecutionStatus[] = ["success", "error", "running", "waiting", "canceled"];

const workflowNames = [
  "Data Sync Workflow",
  "Email Notification Pipeline",
  "Customer Onboarding",
  "Report Generation",
  "API Integration",
  "Data Validation",
  "Backup Process",
  "Analytics Collection",
];

export function generateMockExecutions(count: number = 50): Execution[] {
  const executions: Execution[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const startedAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const duration = Math.random() * 300000; // 0-5 minutes
    const stoppedAt = new Date(startedAt.getTime() + duration);
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    executions.push({
      id: (5000 - i).toString(),
      finished: status !== "running",
      mode: "webhook",
      status,
      startedAt: startedAt.toISOString(),
      stoppedAt: status !== "running" ? stoppedAt.toISOString() : undefined,
      workflowId: `WF${Math.floor(Math.random() * 5) + 1}`,
      workflowName: workflowNames[Math.floor(Math.random() * workflowNames.length)],
    });
  }

  return executions.sort((a, b) => 
    new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export function generateMockWorkflows(): Workflow[] {
  return [
    {
      id: "WF1",
      name: "Data Sync Workflow",
      active: true,
      isArchived: false,
      createdAt: "2025-01-15T10:00:00.000Z",
    },
    {
      id: "WF2",
      name: "Email Notification Pipeline",
      active: true,
      isArchived: false,
      createdAt: "2025-02-20T14:30:00.000Z",
    },
    {
      id: "WF3",
      name: "Customer Onboarding",
      active: false,
      isArchived: false,
      createdAt: "2025-03-10T09:15:00.000Z",
    },
    {
      id: "WF4",
      name: "Report Generation",
      active: true,
      isArchived: false,
      createdAt: "2025-04-05T16:45:00.000Z",
    },
    {
      id: "WF5",
      name: "API Integration",
      active: true,
      isArchived: true,
      createdAt: "2025-05-12T11:20:00.000Z",
    },
  ];
}

export const MOCK_EXECUTIONS = generateMockExecutions();
export const MOCK_WORKFLOWS = generateMockWorkflows();
