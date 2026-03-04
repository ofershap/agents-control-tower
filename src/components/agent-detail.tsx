import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useStdout } from "ink";
import { StatusBadge, StatusLabel } from "./status-badge.js";
import { useElapsed } from "../hooks/use-elapsed.js";
import { getConversation } from "../lib/cursor-api.js";
import { DEMO_CONVERSATION_TEXT } from "../lib/demo-data.js";
import type { CloudAgent, ConversationMessage } from "../lib/types.js";

const BORDER = "#1e3a5f";
const LABEL = "#4a90c4";
const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";

function repoShortName(repo: string): string {
  return repo
    .replace("https://github.com/", "")
    .replace("github.com/", "");
}

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
  const [scrollOffset, setScrollOffset] = useState(0);
  const { stdout } = useStdout();
  const termHeight = stdout?.rows ?? 24;
  const headerLines = 12;
  const footerLines = 3;
  const availableLines = Math.max(5, termHeight - headerLines - footerLines);

  useEffect(() => {
    if (agent.id.startsWith("demo-")) {
      setMessages([{ id: "m1", type: "assistant_message", text: DEMO_CONVERSATION_TEXT }]);
      return;
    }
    getConversation(apiKey, agent.id)
      .then((conv) => setMessages(conv.messages))
      .catch(() => {});
  }, [apiKey, agent.id]);

  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.type === "assistant_message");

  const msgLines = lastAssistantMsg
    ? lastAssistantMsg.text.split("\n")
    : [];
  const totalLines = msgLines.length;
  const maxScroll = Math.max(0, totalLines - availableLines);

  useInput((input, key) => {
    if (key.escape) onBack();
    if (input === "f" && agent.status === "RUNNING") onFollowUp();
    if (input === "s" && agent.status === "RUNNING") onStop();
    if (input === "d") onDelete();
    if (input === "o") onOpenBrowser();
    if (key.upArrow) setScrollOffset((s) => Math.max(0, s - 1));
    if (key.downArrow) setScrollOffset((s) => Math.min(maxScroll, s + 1));
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={DIM}>← esc back</Text>
      <Box marginTop={1} gap={1}>
        <StatusBadge status={agent.status} />
        <StatusLabel status={agent.status} />
        <Text color={DIM}>· {elapsed}</Text>
      </Box>
      <Text color={BODY} bold>
        {agent.name}
      </Text>
      <Text color={BORDER}>
        {"──────────────────────────────────────────────────────────────"}
      </Text>
      <Box marginTop={1} flexDirection="column" gap={0}>
        <Box>
          <Box width={14}>
            <Text color={DIM}>repo</Text>
          </Box>
          <Text color={BODY}>{repoShortName(agent.source.repository)}</Text>
        </Box>
        {agent.target.branchName && (
          <Box>
            <Box width={14}>
              <Text color={DIM}>branch</Text>
            </Box>
            <Text color={BODY}>{agent.target.branchName}</Text>
          </Box>
        )}
        {agent.source.ref && (
          <Box>
            <Box width={14}>
              <Text color={DIM}>base</Text>
            </Box>
            <Text color={BODY}>{agent.source.ref}</Text>
          </Box>
        )}
        <Box>
          <Box width={14}>
            <Text color={DIM}>started</Text>
          </Box>
          <Text color={BODY}>
            {new Date(agent.createdAt).toLocaleTimeString()}
          </Text>
        </Box>
        {agent.target.prUrl && (
          <Box>
            <Box width={14}>
              <Text color={DIM}>pr</Text>
            </Box>
            <Text color={LABEL}>{agent.target.prUrl}</Text>
          </Box>
        )}
      </Box>

      {agent.summary && (
        <Box
          marginTop={1}
          flexDirection="column"
          borderStyle="single"
          borderColor={BORDER}
          paddingX={1}
        >
          <Text color={LABEL} bold>
            summary
          </Text>
          <Text color={BODY}>{agent.summary}</Text>
        </Box>
      )}

      {lastAssistantMsg && (
        <Box
          marginTop={1}
          flexDirection="column"
          borderStyle="single"
          borderColor={BORDER}
          paddingX={1}
          flexGrow={1}
        >
          <Box justifyContent="space-between">
            <Text color={LABEL} bold>
              latest from agent
            </Text>
            {totalLines > availableLines && (
              <Text color={DIM}>
                ↕ {scrollOffset + 1}-{Math.min(scrollOffset + availableLines, totalLines)}/{totalLines}
              </Text>
            )}
          </Box>
          {msgLines.slice(scrollOffset, scrollOffset + availableLines).map((line, i) => (
            <Text key={i} color={BODY}>
              {line}
            </Text>
          ))}
          {scrollOffset < maxScroll && (
            <Text color={DIM}>↓ {maxScroll - scrollOffset} more lines</Text>
          )}
        </Box>
      )}

      <Box gap={1}>
        <Text backgroundColor={DIM} color="#000000" bold> esc </Text>
        <Text color={BODY}> back</Text>
        {agent.status === "RUNNING" && (
          <>
            <Text backgroundColor={AMBER} color="#000000" bold> f </Text>
            <Text color={BODY}> follow-up</Text>
            <Text backgroundColor={AMBER} color="#000000" bold> s </Text>
            <Text color={BODY}> stop</Text>
          </>
        )}
        <Text backgroundColor={AMBER} color="#000000" bold> d </Text>
        <Text color={BODY}> delete</Text>
        <Text backgroundColor={AMBER} color="#000000" bold> o </Text>
        <Text color={BODY}> open in browser</Text>
        {totalLines > availableLines && (
          <>
            <Text backgroundColor={DIM} color="#000000" bold> ↑↓ </Text>
            <Text color={BODY}> scroll</Text>
          </>
        )}
      </Box>
    </Box>
  );
}
