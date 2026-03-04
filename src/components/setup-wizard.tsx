import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { TextInput, Select } from "@inkjs/ui";
import { Header } from "./header.js";
import { validateApiKey } from "../lib/cursor-api.js";
import type { AppConfig } from "../lib/types.js";

const LABEL = "#4a90c4";
const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";
const GREEN = "#3fb950";
const RED = "#f85149";

interface SetupWizardProps {
  onComplete: (config: AppConfig) => void;
  onQuit: () => void;
}

export function SetupWizard({ onComplete, onQuit }: SetupWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [apiKey, setApiKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useInput((input) => {
    if (input === "q" && step === 1 && !validating) onQuit();
  });

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) return;
    setValidating(true);
    setError(null);
    const valid = await validateApiKey(apiKey.trim());
    setValidating(false);
    if (valid) {
      setStep(2);
    } else {
      setError("Invalid API key. Check it and try again.");
    }
  };

  const emptyStats = { running: 0, completed: 0, error: 0, total: 0 };

  if (step === 1) {
    return (
      <Box flexDirection="column">
        <Header stats={emptyStats} lastSync={null} />
        <Box marginTop={1}>
          <Text color={BODY}>
            Welcome. Let's connect to your Cursor agents.
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={LABEL} bold>
            STEP 1 of 2 ───────────────────────────
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={BODY}>Paste your Cursor API key:</Text>
        </Box>
        <Box
          marginTop={1}
          borderStyle="single"
          borderColor={AMBER}
          paddingX={1}
        >
          <TextInput
            placeholder="sk-..."
            onChange={setApiKey}
            onSubmit={handleApiKeySubmit}
          />
        </Box>
        {validating && (
          <Box marginTop={1}>
            <Text color={AMBER}>Validating...</Text>
          </Box>
        )}
        {error && (
          <Box marginTop={1}>
            <Text color={RED}>✖ {error}</Text>
          </Box>
        )}
        <Box marginTop={1} flexDirection="column">
          <Text color={DIM}>
            Get your key at cursor.com/settings → API Keys
          </Text>
          <Text color={DIM}>
            Or set CURSOR_API_KEY env var and restart.
          </Text>
        </Box>
        <Box marginTop={2} gap={2}>
          <Text color={AMBER}>enter</Text>
          <Text color={BODY}>continue</Text>
          <Text color={AMBER}>q</Text>
          <Text color={BODY}>quit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header stats={emptyStats} lastSync={null} />
      <Box marginTop={1}>
        <Text color={GREEN}>✔ API key validated</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={LABEL} bold>
          STEP 2 of 2 ───────────────────────────
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color={BODY}>Monitor local Cursor IDE agents too?</Text>
        <Box marginTop={1}>
          <Text color={DIM}>
            This installs lightweight hooks into ~/.cursor/hooks.json
          </Text>
        </Box>
      </Box>
      <Box marginTop={1}>
        <Select
          options={[
            { label: "Yes, install hooks", value: "yes" },
            { label: "Skip for now (cloud agents only)", value: "no" },
          ]}
          onChange={(val) => {
            onComplete({
              apiKey: apiKey.trim(),
              hooksInstalled: val === "yes",
            });
          }}
        />
      </Box>
    </Box>
  );
}
