import { ExecutionDetail, ExecutionFilters, ExecutionsResponse, Workflow, WorkflowFilters, WorkflowsResponse } from "@/types/n8n";

const API_BASE_URL = "";

// Mock API key - replace with environment variable in production
const API_KEY = "your-api-key-here";

const headers = {
  "Content-Type": "application/json",
  "X-N8N-API-KEY": API_KEY,
};

export async function fetchExecutions(filters: ExecutionFilters = {}): Promise<ExecutionsResponse> {
  // Tạo query string từ filters
  const params = new URLSearchParams();

  if (filters.workflowId) params.append("workflowId", filters.workflowId);
  if (filters.status) params.append("status", filters.status);
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.projectId) params.append("projectId", filters.projectId);
  if (filters.includeData !== undefined)
    params.append("includeData", String(filters.includeData));

  const response = await fetch(`${API_BASE_URL}/webhook/executions?${params.toString()}`, {
    method: "GET",
    headers, // giữ nguyên headers có chứa api-key hoặc token
  });

  if (!response.ok) {
    throw new Error("Failed to fetch executions");
  }

  return response.json();
}


export async function fetchExecutionDetail(executionId: string, includeData? : boolean): Promise<ExecutionDetail> {
  const response = await fetch(`${API_BASE_URL}/webhook/execution?id=${executionId}&includeData=${includeData}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch execution detail");
  }

  return response.json();
}


export async function fetchWorkflows(filters: WorkflowFilters = {}): Promise<WorkflowsResponse> {
  const params = new URLSearchParams();

  if (filters.active !== undefined) params.append("active", String(filters.active));
  if (filters.tags) params.append("tags", filters.tags);
  if (filters.name) params.append("name", filters.name);
  if (filters.projectId) params.append("projectId", filters.projectId);
  if (filters.excludePinnedData !== undefined)
    params.append("excludePinnedData", String(filters.excludePinnedData));
  if (filters.limit) params.append("limit", filters.limit.toString());

  const response = await fetch(`${API_BASE_URL}/webhook/workflows?${params.toString()}`, {
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

export async function toggleWorkflowActive(id: string, active: boolean): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/webhook/workflows/${active ? 'activate' : 'deactivate'}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error(`Failed to ${active ? 'activate' : 'deactivate'} workflow`);
  }
}

// Scheduler APIs
export async function fetchSchedulers(): Promise<{ data: any[] }> {
  const response = await fetch(`${API_BASE_URL}/webhook/schedulers`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch schedulers");
  }

  return response.json();
}

export async function toggleScheduler(id: string, enabled: boolean): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/webhook/schedulers/${id}/toggle`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ enabled }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to toggle scheduler`);
  }
}

// Chatbot API
export async function sendChatMessage(message: string): Promise<{ output: string }> {
  const body =  {
    chatInput: message
  }
  const response = await fetch(`${API_BASE_URL}/webhook/chat-agent`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body) ,
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  return response.json();
}
