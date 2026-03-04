import { useState, useEffect, useCallback, useRef } from "react";
import {
  listAgents,
  stopAgent,
  deleteAgent,
  launchAgent,
  followUpAgent,
  CursorApiError,
} from "../lib/cursor-api.js";
import type {
  CloudAgent,
  AgentStats,
  ActivityEvent,
  LaunchAgentParams,
  FollowUpParams,
} from "../lib/types.js";

const POLL_INTERVAL = 5000;

interface UseCloudAgentsResult {
  agents: CloudAgent[];
  stats: AgentStats;
  activity: ActivityEvent[];
  lastSync: Date | null;
  error: CursorApiError | null;
  loading: boolean;
  refresh: () => Promise<void>;
  launch: (params: LaunchAgentParams) => Promise<CloudAgent>;
  followUp: (params: FollowUpParams) => Promise<void>;
  stop: (agentId: string) => Promise<void>;
  remove: (agentId: string) => Promise<void>;
}

function computeStats(agents: CloudAgent[]): AgentStats {
  return {
    running: agents.filter(
      (a) => a.status === "running" || a.status === "creating",
    ).length,
    completed: agents.filter((a) => a.status === "completed").length,
    error: agents.filter((a) => a.status === "error").length,
    total: agents.length,
  };
}

function diffActivity(
  prev: CloudAgent[],
  next: CloudAgent[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const prevMap = new Map(prev.map((a) => [a.id, a]));

  for (const agent of next) {
    const old = prevMap.get(agent.id);
    if (!old) {
      events.push({
        id: `${agent.id}-started`,
        timestamp: new Date(),
        type: "started",
        agentName: agent.prompt.slice(0, 50),
        detail: agent.repoFullName,
      });
    } else if (old.status !== agent.status) {
      const type =
        agent.status === "completed"
          ? "completed"
          : agent.status === "error"
            ? "error"
            : agent.status === "stopped"
              ? "stopped"
              : "started";
      events.push({
        id: `${agent.id}-${type}-${Date.now()}`,
        timestamp: new Date(),
        type,
        agentName: agent.prompt.slice(0, 50),
        detail:
          agent.status === "completed" && agent.prUrl
            ? `PR ${agent.prUrl}`
            : agent.errorMessage ?? undefined,
      });
    }
  }

  return events;
}

export function useCloudAgents(apiKey: string): UseCloudAgentsResult {
  const [agents, setAgents] = useState<CloudAgent[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<CursorApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const prevAgentsRef = useRef<CloudAgent[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await listAgents(apiKey);
      const newEvents = diffActivity(prevAgentsRef.current, data);
      if (newEvents.length > 0) {
        setActivity((prev) => [...newEvents, ...prev].slice(0, 50));
      }
      prevAgentsRef.current = data;
      setAgents(data);
      setLastSync(new Date());
      setError(null);
    } catch (err) {
      if (err instanceof CursorApiError) {
        setError(err);
      } else {
        setError(new CursorApiError(0, String(err)));
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  const launch = useCallback(
    async (params: LaunchAgentParams) => {
      const agent = await launchAgent(apiKey, params);
      await refresh();
      return agent;
    },
    [apiKey, refresh],
  );

  const followUp = useCallback(
    async (params: FollowUpParams) => {
      await followUpAgent(apiKey, params);
      await refresh();
    },
    [apiKey, refresh],
  );

  const stop = useCallback(
    async (agentId: string) => {
      await stopAgent(apiKey, agentId);
      await refresh();
    },
    [apiKey, refresh],
  );

  const remove = useCallback(
    async (agentId: string) => {
      await deleteAgent(apiKey, agentId);
      await refresh();
    },
    [apiKey, refresh],
  );

  return {
    agents,
    stats: computeStats(agents),
    activity,
    lastSync,
    error,
    loading,
    refresh,
    launch,
    followUp,
    stop,
    remove,
  };
}
