import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { TextInput } from "@inkjs/ui";
import { StatusBadge } from "./status-badge.js";
import { useElapsed } from "../hooks/use-elapsed.js";
import type { CloudAgent } from "../lib/types.js";

const BORDER = "#1e3a5f";
const LABEL = "#4a90c4";
const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";

interface FollowUpPromptProps {
  agent: CloudAgent;
  onSubmit: (prompt: string) => void;
  onCancel: () => void;
}

export function FollowUpPrompt({
  agent,
  onSubmit,
  onCancel,
}: FollowUpPromptProps) {
  const elapsed = useElapsed(agent.createdAt);
  const [value, setValue] = useState("");

  useInput((_input, key) => {
    if (key.escape) onCancel();
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={DIM}>← esc cancel</Text>
      <Box marginTop={1} gap={1}>
        <StatusBadge status={agent.status} />
        <Text color={BODY} bold>
          {agent.prompt.slice(0, 50)}
        </Text>
        <Text color={DIM}>· {elapsed}</Text>
      </Box>
      <Text color={BORDER}>
        {"──────────────────────────────────────────────────────────────"}
      </Text>
      <Box marginTop={1}>
        <Text color={LABEL}>Send a follow-up instruction to this agent:</Text>
      </Box>
      <Box
        marginTop={1}
        borderStyle="single"
        borderColor={AMBER}
        paddingX={1}
      >
        <TextInput
          placeholder="Type your follow-up here..."
          onChange={setValue}
          onSubmit={() => {
            if (value.trim()) onSubmit(value.trim());
          }}
        />
      </Box>
      <Box marginTop={1}>
        <Text color={DIM}>
          The agent will receive this and continue working.
        </Text>
      </Box>
      <Box marginTop={2} gap={2}>
        <Text color={AMBER}>enter</Text>
        <Text color={BODY}>send</Text>
        <Text color={AMBER}>esc</Text>
        <Text color={BODY}>cancel</Text>
      </Box>
    </Box>
  );
}
