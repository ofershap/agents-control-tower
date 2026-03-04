import React, { useState, useCallback } from "react";
import { Box, Text, useInput, useApp, useStdout } from "ink";
import { Header } from "./components/header.js";
import { CloudAgentsTable } from "./components/cloud-agents-table.js";
import { ActivityFeed } from "./components/activity-feed.js";
import { AgentDetail } from "./components/agent-detail.js";
import { LaunchFlow } from "./components/launch-flow.js";
import { FollowUpPrompt } from "./components/follow-up-prompt.js";
import { Confirmation } from "./components/confirmation.js";
import { SetupWizard } from "./components/setup-wizard.js";
import { EmptyState } from "./components/empty-state.js";
import { ErrorState } from "./components/error-state.js";
import { useCloudAgents } from "./hooks/use-cloud-agents.js";
import { useConfig } from "./hooks/use-config.js";
import { useRepos } from "./hooks/use-repos.js";
import { useModels } from "./hooks/use-models.js";
import type { Screen, AppConfig } from "./lib/types.js";

const DIM = "#4a6785";
const AMBER = "#e8912d";
const BODY = "#c9d1d9";

function Dashboard({ apiKey }: { apiKey: string }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 80;
  const compact = cols < 80;

  const {
    agents,
    stats,
    activity,
    lastSync,
    error,
    loading,
    refresh,
    launch,
    followUp,
    stop,
    remove,
  } = useCloudAgents(apiKey);

  const { repos, loading: reposLoading } = useRepos(apiKey);
  const { models, loading: modelsLoading } = useModels(apiKey);

  const [screen, setScreen] = useState<Screen>({ type: "dashboard" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{
    type: "stop" | "delete";
    agentId: string;
    agentName: string;
  } | null>(null);

  const goToDashboard = useCallback(() => {
    setScreen({ type: "dashboard" });
    setConfirmAction(null);
  }, []);

  useInput(
    (input, key) => {
      if (screen.type !== "dashboard" || confirmAction) return;

      if (input === "q") exit();
      if (input === "r") refresh();
      if (input === "n") setScreen({ type: "launch", step: 1 });

      if (key.upArrow || input === "k") {
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
      if (key.downArrow || input === "j") {
        setSelectedIndex((i) => Math.min(agents.length - 1, i + 1));
      }
      if (key.return && agents[selectedIndex]) {
        setScreen({ type: "detail", agentId: agents[selectedIndex]!.id });
      }
      if (input === "s" && agents[selectedIndex]) {
        const agent = agents[selectedIndex]!;
        if (agent.status === "running") {
          setConfirmAction({
            type: "stop",
            agentId: agent.id,
            agentName: agent.prompt.slice(0, 40),
          });
        }
      }
      if (input === "d" && agents[selectedIndex]) {
        const agent = agents[selectedIndex]!;
        setConfirmAction({
          type: "delete",
          agentId: agent.id,
          agentName: agent.prompt.slice(0, 40),
        });
      }
    },
    { isActive: screen.type === "dashboard" },
  );

  if (error && agents.length === 0) {
    return (
      <Box flexDirection="column">
        <Header stats={stats} lastSync={lastSync} compact={compact} />
        <ErrorState
          error={error}
          onReconfigure={() => {}}
          onRetry={refresh}
          onQuit={() => exit()}
        />
      </Box>
    );
  }

  if (screen.type === "launch") {
    return (
      <LaunchFlow
        repos={repos}
        models={models}
        reposLoading={reposLoading}
        modelsLoading={modelsLoading}
        onLaunch={async (params) => {
          await launch(params);
          setTimeout(goToDashboard, 2000);
        }}
        onCancel={goToDashboard}
      />
    );
  }

  if (screen.type === "detail") {
    const agent = agents.find((a) => a.id === screen.agentId);
    if (!agent) {
      setScreen({ type: "dashboard" });
      return null;
    }
    return (
      <AgentDetail
        agent={agent}
        apiKey={apiKey}
        onBack={goToDashboard}
        onFollowUp={() =>
          setScreen({ type: "follow-up", agentId: agent.id })
        }
        onStop={async () => {
          await stop(agent.id);
          goToDashboard();
        }}
        onDelete={async () => {
          await remove(agent.id);
          goToDashboard();
        }}
        onOpenBrowser={() => {
          const url = agent.prUrl ?? `https://cursor.com/agents/${agent.id}`;
          import("open").then((mod) => mod.default(url));
        }}
      />
    );
  }

  if (screen.type === "follow-up") {
    const agent = agents.find((a) => a.id === screen.agentId);
    if (!agent) {
      goToDashboard();
      return null;
    }
    return (
      <FollowUpPrompt
        agent={agent}
        onSubmit={async (prompt) => {
          await followUp({ agentId: agent.id, prompt });
          goToDashboard();
        }}
        onCancel={goToDashboard}
      />
    );
  }

  if (loading && agents.length === 0) {
    return (
      <Box flexDirection="column">
        <Header stats={stats} lastSync={null} compact={compact} />
        <Box paddingY={2} justifyContent="center">
          <Text color={AMBER}>Connecting to Cursor API...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header stats={stats} lastSync={lastSync} compact={compact} />

      {agents.length === 0 ? (
        <EmptyState />
      ) : (
        <Box marginTop={1} flexDirection="column">
          <CloudAgentsTable
            agents={agents}
            selectedIndex={selectedIndex}
          />
          {confirmAction && (
            <Confirmation
              message={
                confirmAction.type === "stop"
                  ? `Stop "${confirmAction.agentName}"?`
                  : `Delete "${confirmAction.agentName}"? This is permanent.`
              }
              destructive={confirmAction.type === "delete"}
              onConfirm={async () => {
                if (confirmAction.type === "stop") {
                  await stop(confirmAction.agentId);
                } else {
                  await remove(confirmAction.agentId);
                }
                setConfirmAction(null);
              }}
              onCancel={() => setConfirmAction(null)}
            />
          )}
        </Box>
      )}

      {activity.length > 0 && (
        <Box marginTop={1}>
          <ActivityFeed events={activity} />
        </Box>
      )}

      <Box marginTop={1} gap={2}>
        <Text color={AMBER}>n</Text>
        <Text color={BODY}>new agent</Text>
        <Text color={DIM}>↑↓</Text>
        <Text color={BODY}>navigate</Text>
        <Text color={AMBER}>enter</Text>
        <Text color={BODY}>details</Text>
        <Text color={AMBER}>s</Text>
        <Text color={BODY}>stop</Text>
        <Text color={AMBER}>d</Text>
        <Text color={BODY}>delete</Text>
        <Text color={AMBER}>r</Text>
        <Text color={BODY}>refresh</Text>
        <Text color={AMBER}>q</Text>
        <Text color={BODY}>quit</Text>
      </Box>
    </Box>
  );
}

export function App() {
  const { config, loading: configLoading, save } = useConfig();
  const { exit } = useApp();

  if (configLoading) {
    return (
      <Box paddingY={1}>
        <Text color={AMBER}>Loading configuration...</Text>
      </Box>
    );
  }

  if (!config) {
    return (
      <SetupWizard
        onComplete={async (newConfig: AppConfig) => {
          await save(newConfig);
        }}
        onQuit={() => exit()}
      />
    );
  }

  return <Dashboard apiKey={config.apiKey} />;
}
