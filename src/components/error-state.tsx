import React from "react";
import { Box, Text, useInput } from "ink";
import type { CursorApiError } from "../lib/cursor-api.js";

const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";
const RED = "#f85149";

interface ErrorStateProps {
  error: CursorApiError;
  onReconfigure: () => void;
  onRetry: () => void;
  onQuit: () => void;
}

export function ErrorState({
  error,
  onReconfigure,
  onRetry,
  onQuit,
}: ErrorStateProps) {
  useInput((input) => {
    if (input === "c") onReconfigure();
    if (input === "r") onRetry();
    if (input === "q") onQuit();
  });

  const isAuthError = error.statusCode === 401 || error.statusCode === 403;

  return (
    <Box flexDirection="column" alignItems="center" paddingY={3}>
      <Text color={RED} bold>
        ✖ Can't reach Cursor API
      </Text>
      <Box marginTop={1}>
        <Text color={BODY}>
          {error.statusCode > 0
            ? `${error.statusCode} ${error.message}`
            : error.message}
        </Text>
      </Box>
      {isAuthError && (
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text color={DIM}>Your API key may have expired.</Text>
          <Box marginTop={1} flexDirection="column">
            <Text color={BODY}>Fix it:</Text>
            <Text color={DIM}>
              {"  "}1. Go to cursor.com/settings → API Keys
            </Text>
            <Text color={DIM}>{"  "}2. Create a new key</Text>
            <Text color={DIM}>{"  "}3. Press c to reconfigure</Text>
          </Box>
        </Box>
      )}
      <Box marginTop={2} gap={2}>
        <Text color={AMBER}>c</Text>
        <Text color={BODY}>reconfigure</Text>
        <Text color={AMBER}>r</Text>
        <Text color={BODY}>retry now</Text>
        <Text color={AMBER}>q</Text>
        <Text color={BODY}>quit</Text>
      </Box>
    </Box>
  );
}
