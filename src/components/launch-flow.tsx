import React, { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { TextInput, Select } from "@inkjs/ui";
import type { Repository, Model, LaunchAgentParams } from "../lib/types.js";

const BORDER = "#1e3a5f";
const LABEL = "#4a90c4";
const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";
const GREEN = "#3fb950";

interface LaunchFlowProps {
  repos: Repository[];
  models: Model[];
  reposLoading: boolean;
  modelsLoading: boolean;
  onLaunch: (params: LaunchAgentParams) => void;
  onCancel: () => void;
}

export function LaunchFlow({
  repos,
  models,
  reposLoading,
  modelsLoading,
  onLaunch,
  onCancel,
}: LaunchFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string>("auto");
  const [filter, setFilter] = useState("");
  const [launched, setLaunched] = useState(false);

  useInput((_input, key) => {
    if (key.escape) {
      if (step === 1) onCancel();
      else setStep((s) => (s - 1) as 1 | 2 | 3);
    }
  });

  const filteredRepos = useMemo(() => {
    if (!filter) return repos;
    const lower = filter.toLowerCase();
    return repos.filter((r) =>
      r.fullName.toLowerCase().includes(lower),
    );
  }, [repos, filter]);

  if (launched) {
    return (
      <Box flexDirection="column" paddingX={1} paddingY={2}>
        <Text color={GREEN}>
          ✔ Agent launched: "{prompt.slice(0, 50)}..."
        </Text>
        <Text color={DIM}>
          {"   "}on {selectedRepo?.fullName} · model: {selectedModelId}
        </Text>
        <Box marginTop={1}>
          <Text color={DIM}>Returning to dashboard...</Text>
        </Box>
      </Box>
    );
  }

  if (step === 1) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color={BODY} bold>
          AGENTS CONTROL TOWER
        </Text>
        <Box marginTop={1}>
          <Text color={LABEL}>NEW AGENT ─ step 1/3 ─ pick a repo</Text>
        </Box>
        <Box marginTop={1}>
          <Text color={DIM}>Filter: </Text>
          <TextInput
            placeholder="type to filter..."
            onChange={setFilter}
          />
        </Box>
        {reposLoading ? (
          <Box marginTop={1}>
            <Text color={DIM}>Loading repos...</Text>
          </Box>
        ) : (
          <Box marginTop={1}>
            <Select
              options={filteredRepos.map((r) => ({
                label: r.fullName,
                value: r.id,
              }))}
              onChange={(repoId) => {
                const repo = repos.find((r) => r.id === repoId);
                if (repo) {
                  setSelectedRepo(repo);
                  setStep(2);
                }
              }}
            />
          </Box>
        )}
        <Box marginTop={1}>
          <Text color={DIM}>
            {filteredRepos.length} repos available · type to filter
          </Text>
        </Box>
        <Box marginTop={1} gap={2}>
          <Text color={AMBER}>↑↓</Text>
          <Text color={BODY}>navigate</Text>
          <Text color={AMBER}>enter</Text>
          <Text color={BODY}>select</Text>
          <Text color={AMBER}>esc</Text>
          <Text color={BODY}>cancel</Text>
        </Box>
      </Box>
    );
  }

  if (step === 2) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color={BODY} bold>
          AGENTS CONTROL TOWER
        </Text>
        <Box marginTop={1}>
          <Text color={LABEL}>NEW AGENT ─ step 2/3 ─ describe the task</Text>
        </Box>
        <Box marginTop={1}>
          <Text color={DIM}>
            Repo: {selectedRepo?.fullName} · Branch:{" "}
            {selectedRepo?.defaultBranch}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={LABEL}>What should the agent do?</Text>
        </Box>
        <Box
          marginTop={1}
          borderStyle="single"
          borderColor={AMBER}
          paddingX={1}
          minHeight={5}
        >
          <TextInput
            placeholder="Describe the task..."
            onChange={setPrompt}
            onSubmit={() => {
              if (prompt.trim()) setStep(3);
            }}
          />
        </Box>
        <Box marginTop={1} gap={2}>
          <Text color={AMBER}>enter</Text>
          <Text color={BODY}>continue</Text>
          <Text color={AMBER}>esc</Text>
          <Text color={BODY}>back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={BODY} bold>
        AGENTS CONTROL TOWER
      </Text>
      <Box marginTop={1}>
        <Text color={LABEL}>NEW AGENT ─ step 3/3 ─ configure</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color={DIM}>
          Repo: {selectedRepo?.fullName} · Branch:{" "}
          {selectedRepo?.defaultBranch}
        </Text>
        <Text color={DIM}>Task: {prompt.slice(0, 60)}...</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color={LABEL}>Model:</Text>
        {modelsLoading ? (
          <Text color={DIM}>Loading models...</Text>
        ) : (
          <Select
            options={[
              { label: "auto (recommended)", value: "auto" },
              ...models.map((m) => ({
                label: `${m.name} (${m.provider})`,
                value: m.id,
              })),
            ]}
            onChange={setSelectedModelId}
          />
        )}
      </Box>
      <Box marginTop={1} gap={2}>
        <Text color={AMBER}>enter</Text>
        <Text color={BODY}>launch</Text>
        <Text color={AMBER}>esc</Text>
        <Text color={BODY}>back</Text>
      </Box>

      {selectedModelId && (
        <LaunchButton
          onLaunch={() => {
            setLaunched(true);
            onLaunch({
              repoFullName: selectedRepo!.fullName,
              prompt,
              modelId: selectedModelId === "auto" ? undefined : selectedModelId,
              baseBranch: selectedRepo!.defaultBranch,
            });
          }}
        />
      )}
    </Box>
  );
}

function LaunchButton({ onLaunch }: { onLaunch: () => void }) {
  useInput((_input, key) => {
    if (key.return) onLaunch();
  });
  return null;
}
