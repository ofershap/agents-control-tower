import type {
  CloudAgent,
  AgentConversation,
  Repository,
  Model,
  LaunchAgentParams,
  FollowUpParams,
} from "./types.js";

const BASE_URL = "https://api.cursor.com/v0";

export class CursorApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "CursorApiError";
  }
}

async function request<T>(
  path: string,
  apiKey: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new CursorApiError(
      res.status,
      `Cursor API ${res.status}: ${body || res.statusText}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listAgents(apiKey: string): Promise<CloudAgent[]> {
  const data = await request<{ agents: CloudAgent[] }>(
    "/agents?limit=100",
    apiKey,
  );
  return data.agents ?? [];
}

export async function getAgent(
  apiKey: string,
  agentId: string,
): Promise<CloudAgent> {
  return request<CloudAgent>(`/agents/${agentId}`, apiKey);
}

export async function getConversation(
  apiKey: string,
  agentId: string,
): Promise<AgentConversation> {
  return request<AgentConversation>(
    `/agents/${agentId}/conversation`,
    apiKey,
  );
}

export async function launchAgent(
  apiKey: string,
  params: LaunchAgentParams,
): Promise<CloudAgent> {
  return request<CloudAgent>("/agents", apiKey, {
    method: "POST",
    body: JSON.stringify({
      repo_full_name: params.repoFullName,
      prompt: params.prompt,
      model_id: params.modelId,
      base_branch: params.baseBranch,
    }),
  });
}

export async function followUpAgent(
  apiKey: string,
  params: FollowUpParams,
): Promise<void> {
  await request(`/agents/${params.agentId}/follow-up`, apiKey, {
    method: "POST",
    body: JSON.stringify({ prompt: params.prompt }),
  });
}

export async function stopAgent(
  apiKey: string,
  agentId: string,
): Promise<void> {
  await request(`/agents/${agentId}/stop`, apiKey, { method: "POST" });
}

export async function deleteAgent(
  apiKey: string,
  agentId: string,
): Promise<void> {
  await request(`/agents/${agentId}`, apiKey, { method: "DELETE" });
}

export async function listRepos(apiKey: string): Promise<Repository[]> {
  const data = await request<{ repos: Repository[] }>("/repos", apiKey);
  return data.repos ?? [];
}

export async function listModels(apiKey: string): Promise<Model[]> {
  const data = await request<{ models: Model[] }>("/models", apiKey);
  return data.models ?? [];
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await listAgents(apiKey);
    return true;
  } catch {
    return false;
  }
}
