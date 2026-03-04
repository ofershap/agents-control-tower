import React from "react";
import { Box, Text } from "ink";

const BODY = "#c9d1d9";
const DIM = "#4a6785";
const AMBER = "#e8912d";

export function EmptyState() {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      paddingY={3}
    >
      <Text color={BODY}>Your tower is ready. No agents in flight yet.</Text>
      <Box marginTop={1}>
        <Text color={BODY}>
          Press <Text color={AMBER} bold>n</Text> to launch your first
          cloud agent.
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color={DIM}>
          Or start a chat in Cursor IDE — it'll appear here
        </Text>
      </Box>
      <Text color={DIM}>automatically if hooks are installed.</Text>
      <Box marginTop={2}>
        <Text color={DIM}>Watching for agents...</Text>
      </Box>
    </Box>
  );
}
