import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import type { AgentStats } from "../lib/types.js";

const AMBER = "#e8912d";
const AMBER_DARK = "#c67b1c";
const GOLD = "#d4a843";
const DIM = "#4a6785";
const BLUE = "#4a90c4";
const TEAL = "#2d7d7d";
const RED = "#f85149";
const GREEN = "#3fb950";
const BORDER_COLOR = "#1e3a5f";

// Original pixel-art block font — 2 rows per word, uses █▀▄░
const CONTROL_LINES = [
  "█▀▀ █▀█ █▄░█ ▀█▀ █▀█ █▀█ █░░",
  "█▄▄ █▄█ █░▀█ ░█░ █▀▄ █▄█ █▄▄",
];

const TOWER_WORD = [
  "▀█▀ █▀█ █░█░█ █▀▀ █▀█",
  "░█░ █▄█ ▀▄▀▄▀ ██▄ █▀▄",
];

const RADAR_FRAMES = [
  [" ", "#", " ", "#", " ", "#", " "],
  ["#", " ", "#", " ", "#", " ", "#"],
  [" ", "#", " ", "#", " ", "#", " "],
];

interface Segment { text: string; color: string }

function buildTowerLines(
  radarIdx: number,
  blinkState: boolean[],
  windowColor: string,
): Segment[][] {
  const ac = (i: number) => blinkState[i] ? RED : AMBER;
  const TUBE = AMBER_DARK;

  const radar = RADAR_FRAMES[radarIdx]!;
  const radarSegs: Segment[] = radar.map(ch =>
    ch === "#" ? { text: "#", color: BLUE } : { text: " ", color: DIM }
  );

  // 15 chars per line, box-drawing chars matching the title style
  return [
    // row 0: "       ║       "
    [
      { text: "       ", color: DIM },
      { text: "║", color: ac(1) },
      { text: "       ", color: DIM },
    ],
    // row 1: "   ║   ║   ║   "
    [
      { text: "   ", color: DIM },
      { text: "║", color: ac(0) },
      { text: "   ", color: DIM },
      { text: "║", color: TUBE },
      { text: "   ", color: DIM },
      { text: "║", color: ac(2) },
      { text: "   ", color: DIM },
    ],
    // row 2: "  ╔═════════╗  "
    [
      { text: "  ", color: DIM },
      { text: "╔═════════╗", color: AMBER },
      { text: "  ", color: DIM },
    ],
    // row 3: "  ║ # # # # ║  "
    [
      { text: "  ", color: DIM },
      { text: "║ ", color: AMBER },
      ...radarSegs,
      { text: " ║", color: AMBER },
      { text: "  ", color: DIM },
    ],
    // row 4: "  ╠═════════╣  "
    [
      { text: "  ", color: DIM },
      { text: "╠", color: AMBER },
      { text: "═════════", color: windowColor },
      { text: "╣", color: AMBER },
      { text: "  ", color: DIM },
    ],
    // row 5: "  ╚═════════╝  "
    [
      { text: "  ", color: DIM },
      { text: "╚═════════╝", color: AMBER },
      { text: "  ", color: DIM },
    ],
    // row 6: "     ║   ║     "
    [
      { text: "     ", color: DIM },
      { text: "║", color: TUBE },
      { text: "   ", color: DIM },
      { text: "║", color: TUBE },
      { text: "     ", color: DIM },
    ],
    // row 7: "     ║ o ║     "
    [
      { text: "     ", color: DIM },
      { text: "║", color: TUBE },
      { text: " o ", color: windowColor },
      { text: "║", color: TUBE },
      { text: "     ", color: DIM },
    ],
    // row 8: "  ══╩═════╩══  "
    [
      { text: "  ", color: DIM },
      { text: "══╩═════╩══", color: AMBER },
      { text: "  ", color: DIM },
    ],
  ];
}

function TowerArt({ runningCount, hasError }: { runningCount: number; hasError: boolean }) {
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
    }, 700);
    return () => {
      clearInterval(radarTimer);
      clearInterval(blinkTimer);
    };
  }, []);

  const windowColor = hasError ? RED : runningCount > 0 ? AMBER : DIM;
  const lines = buildTowerLines(frame, blink, windowColor);

  return (
    <Box flexDirection="column" marginRight={3}>
      {lines.map((segments, i) => (
        <Text key={i} wrap="truncate">
          {segments.map((seg, j) => (
            <Text key={j} color={seg.color}>{seg.text}</Text>
          ))}
        </Text>
      ))}
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

interface HeaderProps {
  stats: AgentStats;
  lastSync: Date | null;
  compact?: boolean;
}

export function Header({ stats, lastSync, compact }: HeaderProps) {
  if (compact) {
    return (
      <Box>
        <Text bold color={AMBER}>
          AGENTS CONTROL TOWER
        </Text>
        <Text color={DIM}> | </Text>
        {stats.running > 0 && (
          <Text color={AMBER}>{stats.running} run</Text>
        )}
        {stats.completed > 0 && (
          <>
            <Text color={DIM}> | </Text>
            <Text color={GREEN}>{stats.completed} done</Text>
          </>
        )}
        {stats.error > 0 && (
          <>
            <Text color={DIM}> | </Text>
            <Text color={RED}>{stats.error} err</Text>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingTop={1}>
      <Box>
        <Box flexDirection="column" paddingLeft={2}>
          <Text color={GOLD} bold>{"  A G E N T S"}</Text>
          <Text> </Text>
          {CONTROL_LINES.map((line, i) => (
            <Text key={`c${i}`} color={AMBER} bold wrap="truncate">
              {"  "}{line}
            </Text>
          ))}
          <Text> </Text>
          {TOWER_WORD.map((line, i) => (
            <Text key={`t${i}`} color={AMBER_DARK} bold wrap="truncate">
              {"  "}{line}
            </Text>
          ))}
          <Text> </Text>
          <Text wrap="truncate">
            <Text color={BORDER_COLOR}>{"  ░░░░"}</Text>
            <Text color={TEAL}>{" launch"}</Text>
            <Text color={DIM}>{" · "}</Text>
            <Text color={TEAL}>{"watch"}</Text>
            <Text color={DIM}>{" · "}</Text>
            <Text color={TEAL}>{"command"}</Text>
            <Text color={DIM}>{" "}</Text>
            <Text color={BORDER_COLOR}>{"░░░░"}</Text>
          </Text>
        </Box>
        <TowerArt runningCount={stats.running} hasError={stats.error > 0} />
      </Box>

      <Box marginTop={1} justifyContent="space-between" paddingX={2}>
        <Box gap={3}>
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
