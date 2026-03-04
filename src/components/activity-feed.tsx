import React from "react";
import { Box, Text } from "ink";
import { formatTimeAgo } from "../hooks/use-elapsed.js";
import type { ActivityEvent } from "../lib/types.js";

const BORDER = "#1e3a5f";
const LABEL = "#4a90c4";
const DIM = "#4a6785";
const AMBER = "#e8912d";
const GREEN = "#3fb950";
const RED = "#f85149";

const TYPE_SYMBOLS: Record<ActivityEvent["type"], { symbol: string; color: string }> = {
  started: { symbol: "◉", color: AMBER },
  completed: { symbol: "✔", color: GREEN },
  error: { symbol: "✖", color: RED },
  stopped: { symbol: "◉", color: DIM },
};

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxItems?: number;
}

export function ActivityFeed({ events, maxItems = 5 }: ActivityFeedProps) {
  if (events.length === 0) return null;

  const visible = events.slice(0, maxItems);

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={BORDER}>
      <Box>
        <Text color={LABEL} bold>
          {" "}
          activity{" "}
        </Text>
      </Box>
      {visible.map((event) => {
        const cfg = TYPE_SYMBOLS[event.type];
        return (
          <Box key={event.id} gap={1}>
            <Text color={DIM}>
              {"  "}
              {formatTimeAgo(event.timestamp).padEnd(10)}
            </Text>
            <Text color={cfg.color}>{cfg.symbol}</Text>
            <Text color="#c9d1d9">
              {`"${event.agentName}"`}
              {event.detail ? ` · ${event.detail}` : ""}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
