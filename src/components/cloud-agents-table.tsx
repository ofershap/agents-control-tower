import React from "react";
import { Box, Text } from "ink";
import { StatusBadge } from "./status-badge.js";
import { useElapsed } from "../hooks/use-elapsed.js";
import type { CloudAgent } from "../lib/types.js";

const BORDER = "#1e3a5f";
const LABEL = "#4a90c4";
const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";
const GREEN = "#3fb950";
const RED = "#f85149";
const SELECTED_BG = "#13243d";

const MAX_VISIBLE = 5;

interface AgentRowProps {
  agent: CloudAgent;
  selected: boolean;
}

function repoShortName(repo: string): string {
  return repo
    .replace("https://github.com/", "")
    .replace("github.com/", "");
}

function AgentRow({ agent, selected }: AgentRowProps) {
  const elapsed = useElapsed(
    agent.status === "RUNNING" || agent.status === "CREATING"
      ? agent.createdAt
      : null,
  );

  const name =
    agent.name.length > 30 ? agent.name.slice(0, 30) + "…" : agent.name;

  const rightInfo = (() => {
    if (agent.status === "RUNNING" || agent.status === "CREATING") {
      return { text: elapsed, color: DIM };
    }
    if (agent.status === "FINISHED" && agent.target.prUrl) {
      const prNum = agent.target.prUrl.match(/\/pull\/(\d+)/)?.[1];
      return { text: `done → PR #${prNum ?? "?"}`, color: GREEN };
    }
    if (agent.status === "ERROR") {
      const msg = agent.summary?.slice(0, 30) ?? "error";
      return { text: `error: ${msg}`, color: RED };
    }
    if (agent.status === "EXPIRED") {
      return { text: "expired", color: DIM };
    }
    return { text: "done", color: GREEN };
  })();

  const bg = selected ? SELECTED_BG : undefined;

  return (
    <Box>
      <Text backgroundColor={bg}>
        <Text color={selected ? AMBER : DIM}>{selected ? " ▸ " : "   "}</Text>
      </Text>
      <Box width={2}>
        <StatusBadge status={agent.status} />
      </Box>
      <Text backgroundColor={bg}>
        <Text color={selected ? "#ffffff" : BODY}> {name.padEnd(30)}</Text>
        <Text color={DIM}> {repoShortName(agent.source.repository).padEnd(22)}</Text>
        <Text color={rightInfo.color}> {rightInfo.text}</Text>
      </Text>
    </Box>
  );
}

interface CloudAgentsTableProps {
  agents: CloudAgent[];
  selectedIndex: number;
}

export function CloudAgentsTable({
  agents,
  selectedIndex,
}: CloudAgentsTableProps) {
  if (agents.length === 0) return null;

  const total = agents.length;
  const needsScroll = total > MAX_VISIBLE;

  let startIdx = 0;
  if (needsScroll) {
    startIdx = Math.max(0, Math.min(selectedIndex - 2, total - MAX_VISIBLE));
  }
  const visibleAgents = needsScroll
    ? agents.slice(startIdx, startIdx + MAX_VISIBLE)
    : agents;

  const hasMore = needsScroll && startIdx + MAX_VISIBLE < total;
  const hasAbove = needsScroll && startIdx > 0;

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={BORDER}>
      <Box justifyContent="space-between">
        <Text color={LABEL} bold>
          {" "}cloud{" "}
        </Text>
        {needsScroll && (
          <Text color={DIM}>
            {" "}{selectedIndex + 1}/{total}{" "}
          </Text>
        )}
      </Box>
      {hasAbove && (
        <Box paddingX={1}>
          <Text color={DIM}>  ↑ {startIdx} more</Text>
        </Box>
      )}
      {visibleAgents.map((agent, i) => (
        <AgentRow
          key={agent.id}
          agent={agent}
          selected={startIdx + i === selectedIndex}
        />
      ))}
      {hasMore && (
        <Box paddingX={1}>
          <Text color={DIM}>  ↓ {total - startIdx - MAX_VISIBLE} more</Text>
        </Box>
      )}
    </Box>
  );
}
