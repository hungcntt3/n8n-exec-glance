import { ExecutionDetail, ExecutionFilters, ExecutionsResponse, Workflow, WorkflowsResponse } from "@/types/n8n";

const API_BASE_URL = "https://n8n.infodation.vn/api/v1";

// Mock API key - replace with environment variable in production
const API_KEY = "your-api-key-here";

const headers = {
  "Content-Type": "application/json",
  "X-N8N-API-KEY": API_KEY,
};

export async function fetchExecutions(filters: ExecutionFilters = {}): Promise<ExecutionsResponse> {
  const response = await fetch(`${API_BASE_URL}/executions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      limit: filters.limit || 10,
      workflowId: filters.workflowId,
      status: filters.status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch executions");
  }

  return response.json();
}

export async function fetchExecutionDetail(executionId: string): Promise<ExecutionDetail> {
  const response = await fetch(`${API_BASE_URL}/executions/${executionId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch execution detail");
  }

  return response.json();
}

export async function fetchWorkflows(): Promise<WorkflowsResponse> {
  const response = await fetch(`${API_BASE_URL}/workflows`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workflows");
  }

  return response.json();
}

export async function fetchWorkflowDetail(workflowId: string): Promise<Workflow> {
  const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workflow detail");
  }

  return response.json();
}
