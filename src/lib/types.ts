export type AgentStatus =
  | "completed"
  | "stopped"
  | "error"
  | "running"
  | "creating";

export interface CloudAgent {
  id: string;
  status: AgentStatus;
  prompt: string;
  repoFullName: string;
  branch: string;
  baseBranch: string;
  prUrl: string | null;
  errorMessage: string | null;
  modelName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConversation {
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AgentArtifact {
  name: string;
  url: string;
  type: string;
}

export interface Repository {
  id: string;
  fullName: string;
  defaultBranch: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
}

export interface LaunchAgentParams {
  repoFullName: string;
  prompt: string;
  modelId?: string;
  baseBranch?: string;
}

export interface FollowUpParams {
  agentId: string;
  prompt: string;
}

export type Screen =
  | { type: "dashboard" }
  | { type: "detail"; agentId: string }
  | { type: "launch"; step: 1 | 2 | 3 }
  | { type: "follow-up"; agentId: string }
  | { type: "setup"; step: 1 | 2 }
  | { type: "error"; message: string; statusCode?: number };

export interface AppConfig {
  apiKey: string;
  hooksInstalled: boolean;
}

export interface AgentStats {
  running: number;
  completed: number;
  error: number;
  total: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: "started" | "completed" | "error" | "stopped";
  agentName: string;
  detail?: string;
}
