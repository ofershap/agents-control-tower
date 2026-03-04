import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { StatusBadge, StatusLabel } from "./status-badge.js";
import { useElapsed } from "../hooks/use-elapsed.js";
import { getConversation } from "../lib/cursor-api.js";
import type { CloudAgent, ConversationMessage } from "../lib/types.js";

const BORDER = "#1e3a5f";
const LABEL = "#4a90c4";
const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";

interface AgentDetailProps {
  agent: CloudAgent;
  apiKey: string;
  onBack: () => void;
  onFollowUp: () => void;
  onStop: () => void;
  onDelete: () => void;
  onOpenBrowser: () => void;
}

export function AgentDetail({
  agent,
  apiKey,
  onBack,
  onFollowUp,
  onStop,
  onDelete,
  onOpenBrowser,
}: AgentDetailProps) {
  const elapsed = useElapsed(agent.createdAt);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  useEffect(() => {
    getConversation(apiKey, agent.id)
      .then((conv) => setMessages(conv.messages))
      .catch(() => {});
  }, [apiKey, agent.id]);

  useInput((input, key) => {
    if (key.escape) onBack();
    if (input === "f" && agent.status === "running") onFollowUp();
    if (input === "s" && agent.status === "running") onStop();
    if (input === "d") onDelete();
    if (input === "o") onOpenBrowser();
  });

  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={DIM}>← esc back</Text>
      <Box marginTop={1} gap={1}>
        <StatusBadge status={agent.status} />
        <StatusLabel status={agent.status} />
        <Text color={DIM}>· {elapsed}</Text>
      </Box>
      <Text color={BODY} bold>
        {agent.prompt.slice(0, 80)}
      </Text>
      <Text color={BORDER}>
        {"──────────────────────────────────────────────────────────────"}
      </Text>
      <Box marginTop={1} flexDirection="column" gap={0}>
        <Box>
          <Box width={14}>
            <Text color={DIM}>repo</Text>
          </Box>
          <Text color={BODY}>{agent.repoFullName}</Text>
        </Box>
        <Box>
          <Box width={14}>
            <Text color={DIM}>branch</Text>
          </Box>
          <Text color={BODY}>{agent.branch}</Text>
        </Box>
        <Box>
          <Box width={14}>
            <Text color={DIM}>base</Text>
          </Box>
          <Text color={BODY}>{agent.baseBranch}</Text>
        </Box>
        <Box>
          <Box width={14}>
            <Text color={DIM}>started</Text>
          </Box>
          <Text color={BODY}>
            {new Date(agent.createdAt).toLocaleTimeString()}
          </Text>
        </Box>
        {agent.prUrl && (
          <Box>
            <Box width={14}>
              <Text color={DIM}>pr</Text>
            </Box>
            <Text color={LABEL}>{agent.prUrl}</Text>
          </Box>
        )}
      </Box>

      <Box
        marginTop={1}
        flexDirection="column"
        borderStyle="single"
        borderColor={BORDER}
        paddingX={1}
      >
        <Text color={LABEL} bold>
          your task
        </Text>
        <Text color={BODY}>{agent.prompt}</Text>
      </Box>

      {lastAssistantMsg && (
        <Box
          marginTop={1}
          flexDirection="column"
          borderStyle="single"
          borderColor={BORDER}
          paddingX={1}
        >
          <Text color={LABEL} bold>
            latest from agent
          </Text>
          <Text color={BODY} wrap="truncate">
            {lastAssistantMsg.content.slice(0, 500)}
          </Text>
          {messages.filter((m) => m.role === "assistant").length > 1 && (
            <Text color={DIM}>
              ─ ─ scroll up for{" "}
              {messages.filter((m) => m.role === "assistant").length - 1}{" "}
              earlier messages ─ ─
            </Text>
          )}
        </Box>
      )}

      <Box marginTop={1} gap={2}>
        <Text color={DIM}>esc</Text>
        <Text color={BODY}>back</Text>
        {agent.status === "running" && (
          <>
            <Text color={AMBER}>f</Text>
            <Text color={BODY}>follow-up</Text>
            <Text color={AMBER}>s</Text>
            <Text color={BODY}>stop</Text>
          </>
        )}
        <Text color={AMBER}>d</Text>
        <Text color={BODY}>delete</Text>
        <Text color={AMBER}>o</Text>
        <Text color={BODY}>open in browser</Text>
      </Box>
    </Box>
  );
}
