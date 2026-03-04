import React, { useState, useCallback, useRef } from "react";
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
import type { Screen, AppConfig, CloudAgent, ActivityEvent } from "./lib/types.js";
import { DEMO_AGENTS, DEMO_ACTIVITY, computeDemoStats, DEMO_CONVERSATION_TEXT } from "./lib/demo-data.js";

const DIM = "#4a6785";
const AMBER = "#e8912d";
const BODY = "#c9d1d9";
const BORDER_COLOR = "#1e3a5f";
const LABEL = "#4a90c4";
const TEAL = "#2d7d7d";

function Dashboard({ apiKey, onReconfigure, demo }: { apiKey: string; onReconfigure: () => void; demo?: boolean }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 80;
  const rows = stdout?.rows ?? 24;
  const compact = cols < 80;

  const real = useCloudAgents(demo ? "" : apiKey);
  const { repos, loading: reposLoading } = useRepos(demo ? "" : apiKey);
  const { models, loading: modelsLoading } = useModels(demo ? "" : apiKey);

  const noop = async () => {};
  const agents = demo ? DEMO_AGENTS : real.agents;
  const stats = demo ? computeDemoStats(DEMO_AGENTS) : real.stats;
  const activity = demo ? DEMO_ACTIVITY : real.activity;
  const lastSync = demo ? new Date() : real.lastSync;
  const error = demo ? null : real.error;
  const loading = demo ? false : real.loading;
  const refresh = demo ? noop : real.refresh;
  const launch = demo ? (async () => DEMO_AGENTS[0]!) : real.launch;
  const followUp = demo ? noop : real.followUp;
  const stop = demo ? noop : real.stop;
  const remove = demo ? noop : real.remove;

  const [screen, setScreen] = useState<Screen>({ type: "dashboard" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{
    type: "stop" | "delete" | "reconfigure";
    agentId: string;
    agentName: string;
  } | null>(null);
  const [pendingQuit, setPendingQuit] = useState(false);
  const quitTimer = useRef<ReturnType<typeof setTimeout>>();

  const goToDashboard = useCallback(() => {
    setScreen({ type: "dashboard" });
    setConfirmAction(null);
    setPendingQuit(false);
  }, []);

  useInput(
    (input, key) => {
      if (screen.type !== "dashboard" || confirmAction) return;

      if (input === "q") {
        if (pendingQuit) {
          exit();
        } else {
          setPendingQuit(true);
          clearTimeout(quitTimer.current);
          quitTimer.current = setTimeout(() => setPendingQuit(false), 3000);
        }
        return;
      }
      if (pendingQuit) {
        setPendingQuit(false);
        return;
      }
      if (input === "r") refresh();
      if (input === "n") setScreen({ type: "launch", step: 1 });
      if (input === "c") {
        setConfirmAction({ type: "reconfigure", agentId: "", agentName: "" });
      }

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
        if (agent.status === "RUNNING") {
          setConfirmAction({
            type: "stop",
            agentId: agent.id,
            agentName: agent.name.slice(0, 40),
          });
        }
      }
      if (input === "d" && agents[selectedIndex]) {
        const agent = agents[selectedIndex]!;
        setConfirmAction({
          type: "delete",
          agentId: agent.id,
          agentName: agent.name.slice(0, 40),
        });
      }
    },
    { isActive: screen.type === "dashboard" },
  );

  if (error && agents.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor={BORDER_COLOR} paddingX={1} minHeight={rows}>
        <Header stats={stats} lastSync={lastSync} compact={compact} />
        <ErrorState
          error={error}
          onReconfigure={onReconfigure}
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
          const url = agent.target.prUrl ?? agent.target.url;
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
        onSubmit={async (text) => {
          await followUp(agent.id, text);
          goToDashboard();
        }}
        onCancel={goToDashboard}
      />
    );
  }

  if (loading && agents.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor={BORDER_COLOR} paddingX={1} minHeight={rows}>
        <Header stats={stats} lastSync={null} compact={compact} />
        <Box paddingY={2} justifyContent="center">
          <Text color={AMBER}>Connecting to Cursor API...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={BORDER_COLOR}
      paddingX={1}
      minHeight={rows}
    >
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
                  : confirmAction.type === "delete"
                  ? `Delete "${confirmAction.agentName}"? This is permanent.`
                  : `Reset config and re-run setup?`
              }
              destructive={confirmAction.type !== "stop"}
              onConfirm={async () => {
                if (confirmAction.type === "stop") {
                  await stop(confirmAction.agentId);
                } else if (confirmAction.type === "delete") {
                  await remove(confirmAction.agentId);
                } else {
                  onReconfigure();
                }
                setConfirmAction(null);
              }}
              onCancel={() => setConfirmAction(null)}
            />
          )}
        </Box>
      )}

      <Box
        marginTop={1}
        flexDirection="column"
        borderStyle="single"
        borderColor={BORDER_COLOR}
      >
        <Box>
          <Text color={LABEL} bold>
            {" "}local{" "}
          </Text>
        </Box>
        <Box paddingX={2} paddingY={0}>
          <Text color={DIM}>
            No local sessions detected · install hooks with{" "}
            <Text color={TEAL}>c</Text>
          </Text>
        </Box>
      </Box>

      {activity.length > 0 && (
        <Box marginTop={1}>
          <ActivityFeed events={activity} />
        </Box>
      )}

      <Box flexGrow={1} />

      <Box paddingX={0}>
        {pendingQuit ? (
          <Text color="#f85149" bold backgroundColor="#1a0000" inverse>
            {" "}Press q again to quit, any other key to cancel{" "}
          </Text>
        ) : (
          <Text>
            <Text backgroundColor={AMBER} color="#000000" bold> n </Text>
            <Text color={BODY}> new </Text>
            <Text backgroundColor={DIM} color="#000000" bold> ↑↓ </Text>
            <Text color={BODY}> nav </Text>
            <Text backgroundColor={AMBER} color="#000000" bold> ⏎ </Text>
            <Text color={BODY}> detail </Text>
            <Text backgroundColor={AMBER} color="#000000" bold> s </Text>
            <Text color={BODY}> stop </Text>
            <Text backgroundColor={AMBER} color="#000000" bold> d </Text>
            <Text color={BODY}> delete </Text>
            <Text backgroundColor={AMBER} color="#000000" bold> f </Text>
            <Text color={BODY}> follow-up </Text>
            <Text backgroundColor={AMBER} color="#000000" bold> r </Text>
            <Text color={BODY}> refresh </Text>
            <Text backgroundColor={DIM} color="#000000" bold> c </Text>
            <Text color={BODY}> config </Text>
            <Text backgroundColor={AMBER} color="#000000" bold> q </Text>
            <Text color={BODY}> quit</Text>
          </Text>
        )}
      </Box>
    </Box>
  );
}

export function App({ demo }: { demo?: boolean }) {
  const { config, loading: configLoading, save, reset } = useConfig();
  const { exit } = useApp();

  if (demo) {
    return <Dashboard apiKey="" onReconfigure={() => {}} demo />;
  }

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

  return <Dashboard apiKey={config.apiKey} onReconfigure={reset} />;
}
