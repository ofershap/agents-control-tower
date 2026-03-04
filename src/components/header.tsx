import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import type { AgentStats } from "../lib/types.js";

const AMBER = "#e8912d";
const GOLD = "#d4a843";
const DIM = "#4a6785";
const BLUE = "#4a90c4";
const RED = "#f85149";
const GREEN = "#3fb950";

const TITLE_AGENTS = "A G E N T S";

const CONTROL = [
  "╔═╗╔═╗╔╗╔╦╗╔═╗╔═╗╔╗  ",
  "║  ║║ ║║║║ ║╠═╝║ ║║║  ",
  "║  ║║ ║║╚╝ ║║╚╗║ ║║╚╗ ",
  "╚═╝╚═╝╝ ╚═╝╚═╝╚═╝╚═╝ ",
];

const TOWER_TEXT = [
  "╔╦╗╔═╗╔╗╔╗╔═╗╔═╗",
  "║ ║║ ║║║║║║╣ ╠═╝",
  "╝ ╚╚═╝╚╩╝╚╚═╝╚═╝",
];

const RADAR_FRAMES = ["░▓░░▓░", "░░▓░░▓", "▓░░▓░░"];

interface HeaderProps {
  stats: AgentStats;
  lastSync: Date | null;
  compact?: boolean;
}

function TowerArt({ runningCount }: { runningCount: number }) {
  const [frame, setFrame] = useState(0);
  const [blink, setBlink] = useState([false, true, false]);

  useEffect(() => {
    const radarTimer = setInterval(() => setFrame((f) => (f + 1) % 3), 500);
    const blinkTimer = setInterval(() => {
      setBlink((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * 3);
        next[idx] = !next[idx];
        return next;
      });
    }, 800);
    return () => {
      clearInterval(radarTimer);
      clearInterval(blinkTimer);
    };
  }, []);

  const antennaColor = (i: number) => (blink[i] ? RED : DIM);
  const windowChar = runningCount > 0 ? "░▓" : "░░";
  const windowColor =
    runningCount > 0 ? AMBER : DIM;
  const radar = RADAR_FRAMES[frame]!;

  return (
    <Box flexDirection="column" alignItems="flex-end">
      <Text>
        <Text color={antennaColor(1)}>{"     ╻"}</Text>
      </Text>
      <Text>
        <Text color={antennaColor(0)}>{"   ╻"}</Text>
        <Text color={DIM}>{" ┃ "}</Text>
        <Text color={antennaColor(2)}>{"╻"}</Text>
      </Text>
      <Text color={DIM}>{"  ┏━━┻━━┓"}</Text>
      <Text>
        <Text color={DIM}>{" ┃"}</Text>
        <Text color={BLUE}>{radar}</Text>
        <Text color={DIM}>{"┃"}</Text>
      </Text>
      <Text color={DIM}>{" ┣━━━━━━┫"}</Text>
      <Text>
        <Text color={DIM}>{"  ┃ "}</Text>
        <Text color={windowColor}>{windowChar}</Text>
        <Text color={DIM}>{" ┃"}</Text>
      </Text>
      <Text>
        <Text color={DIM}>{"  ┃ "}</Text>
        <Text color={windowColor}>{windowChar}</Text>
        <Text color={DIM}>{" ┃"}</Text>
      </Text>
      <Text color={DIM}>{"  ┗━━━━┛"}</Text>
      <Text color={DIM}>{"━━┻━━━━┻━━"}</Text>
    </Box>
  );
}

function SyncIndicator({ lastSync }: { lastSync: Date | null }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!lastSync) return <Text color={DIM}>connecting...</Text>;

  const ago = Math.floor((Date.now() - lastSync.getTime()) / 1000);
  const color = ago > 60 ? RED : ago > 30 ? AMBER : DIM;
  const label =
    ago > 60
      ? "disconnected"
      : ago < 2
        ? "synced just now"
        : `synced ${ago}s ago`;

  return <Text color={color}>{label}</Text>;
}

export function Header({ stats, lastSync, compact }: HeaderProps) {
  if (compact) {
    return (
      <Box>
        <Text bold color={AMBER}>
          AGENTS CONTROL TOWER
        </Text>
        <Text color={DIM}> · </Text>
        {stats.running > 0 && (
          <Text color={AMBER}>{stats.running} run</Text>
        )}
        {stats.completed > 0 && (
          <>
            <Text color={DIM}> · </Text>
            <Text color={GREEN}>{stats.completed} done</Text>
          </>
        )}
        {stats.error > 0 && (
          <>
            <Text color={DIM}> · </Text>
            <Text color={RED}>{stats.error} err</Text>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box justifyContent="space-between">
        <Box flexDirection="column">
          <Text color={GOLD}> {TITLE_AGENTS}</Text>
          {CONTROL.map((line, i) => (
            <Text key={`c${i}`} color={AMBER} bold>
              {" "}
              {line}
            </Text>
          ))}
          {TOWER_TEXT.map((line, i) => (
            <Text key={`t${i}`} color={AMBER} bold>
              {" "}
              {line}
            </Text>
          ))}
          <Text color={DIM}>
            {" "}
            ░░░░ launch · watch · command ░░░░
          </Text>
        </Box>
        <TowerArt runningCount={stats.running} />
      </Box>
      <Box marginTop={1} justifyContent="space-between">
        <Box gap={2}>
          {stats.running > 0 && (
            <Text color={AMBER} bold>
              {stats.running} running
            </Text>
          )}
          {stats.completed > 0 && (
            <Text color={GREEN}>{stats.completed} done</Text>
          )}
          {stats.error > 0 && (
            <Text color={RED}>{stats.error} error</Text>
          )}
          {stats.total === 0 && <Text color={DIM}>0 agents</Text>}
        </Box>
        <SyncIndicator lastSync={lastSync} />
      </Box>
    </Box>
  );
}
