import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

const W = 880;
const H = 520;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const BG = "#0c1222";
const BORDER = "#1e3a5f";
const AMBER = "#e8912d";
const AMBER_DARK = "#c67b1c";
const GOLD = "#d4a843";
const BLUE = "#4a90c4";
const DIM = "#4a6785";
const BODY = "#c9d1d9";
const GREEN = "#3fb950";
const RED = "#f85149";
const SELECTED_BG = "#13213d";
const FOOTER_BG = "#0a0f1c";

ctx.fillStyle = BG;
ctx.roundRect(0, 0, W, H, 12);
ctx.fill();

ctx.fillStyle = "#1a1a2e";
ctx.fillRect(0, 0, W, 32);
ctx.fillStyle = "#ff5f57";
ctx.beginPath(); ctx.arc(16, 16, 6, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "#ffbd2e";
ctx.beginPath(); ctx.arc(36, 16, 6, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "#28c940";
ctx.beginPath(); ctx.arc(56, 16, 6, 0, Math.PI * 2); ctx.fill();

ctx.fillStyle = DIM;
ctx.font = "12px Menlo, monospace";
ctx.fillText("agents-control-tower — npx agents-control-tower", 300, 20);

const LM = 28;
let y = 58;

ctx.fillStyle = GOLD;
ctx.font = "13px Menlo, monospace";
ctx.fillText("  A G E N T S", LM, y);

y += 18;
const controlLines = [
  "█▀▀ █▀█ █▄░█ ▀█▀ █▀█ █▀█ █░░",
  "█▄▄ █▄█ █░▀█ ░█░ █▀▄ █▄█ █▄▄",
];

ctx.fillStyle = AMBER;
ctx.font = "bold 14px Menlo, monospace";
for (const line of controlLines) {
  ctx.fillText("  " + line, LM, y);
  y += 16;
}

y += 4;
const towerWord = [
  "▀█▀ █▀█ █░█░█ █▀▀ █▀█",
  "░█░ █▄█ ▀▄▀▄▀ ██▄ █▀▄",
];

ctx.fillStyle = AMBER_DARK;
for (const line of towerWord) {
  ctx.fillText("  " + line, LM, y);
  y += 16;
}

const tx = 700;
let ty = 52;
ctx.font = "13px Menlo, monospace";
ctx.fillStyle = RED;
ctx.fillText("|", tx + 52, ty); ty += 14;
ctx.fillStyle = AMBER_DARK;
ctx.fillText("║   ║   ║", tx + 24, ty); ty += 14;
ctx.fillStyle = AMBER;
ctx.fillText("╔═════════╗", tx + 16, ty); ty += 14;
ctx.fillStyle = AMBER;
ctx.fillText("║", tx + 16, ty);
ctx.fillStyle = BLUE;
ctx.fillText(" # # # # ", tx + 24, ty);
ctx.fillStyle = AMBER;
ctx.fillText("║", tx + 106, ty); ty += 14;
ctx.fillStyle = AMBER;
ctx.fillText("╠═════════╣", tx + 16, ty); ty += 14;
ctx.fillText("╚═════════╝", tx + 16, ty); ty += 14;
ctx.fillStyle = AMBER_DARK;
ctx.fillText("║   ║", tx + 36, ty); ty += 14;
ctx.fillStyle = AMBER_DARK;
ctx.fillText("║", tx + 36, ty);
ctx.fillStyle = AMBER;
ctx.fillText(" o ", tx + 44, ty);
ctx.fillStyle = AMBER_DARK;
ctx.fillText("║", tx + 68, ty); ty += 14;
ctx.fillStyle = AMBER;
ctx.fillText("══╩═════╩══", tx + 16, ty);

y += 6;
ctx.fillStyle = DIM;
ctx.font = "12px Menlo, monospace";
ctx.fillText("  ░░░░ launch · watch · command ░░░░", LM, y);

y += 22;
ctx.fillStyle = AMBER;
ctx.font = "bold 13px Menlo, monospace";
ctx.fillText("3 running", LM + 22, y);
ctx.fillStyle = GREEN;
ctx.fillText("2 done", LM + 148, y);
ctx.fillStyle = DIM;
ctx.font = "12px Menlo, monospace";
ctx.fillText("synced just now", 620, y);

y += 20;

ctx.strokeStyle = BORDER;
ctx.lineWidth = 1;
ctx.strokeRect(LM - 4, y, W - 52, 138);

ctx.fillStyle = "#0f1830";
ctx.fillRect(LM - 3, y + 1, W - 54, 18);
ctx.fillStyle = BLUE;
ctx.font = "bold 12px Menlo, monospace";
ctx.fillText("  cloud", LM, y + 14);
ctx.fillStyle = DIM;
ctx.fillText("1/5", W - 84, y + 14);

y += 24;

const agents = [
  { b: "●", bc: AMBER, name: "Add auth middleware", repo: "acme-corp/web-app", s: "3m 22s", sc: AMBER, sel: true },
  { b: "●", bc: AMBER, name: "Fix payment webhook", repo: "acme-corp/web-app", s: "1m 45s", sc: AMBER, sel: false },
  { b: "●", bc: AMBER, name: "Write unit tests", repo: "acme-corp/api-server", s: "58s", sc: AMBER, sel: false },
  { b: "✔", bc: GREEN, name: "Update error handling", repo: "acme-corp/web-app", s: "done → PR #142", sc: GREEN, sel: false },
  { b: "✔", bc: GREEN, name: "Refactor auth module", repo: "acme-corp/api-server", s: "done → PR #89", sc: GREEN, sel: false },
];

ctx.font = "13px Menlo, monospace";
for (const a of agents) {
  if (a.sel) {
    ctx.fillStyle = SELECTED_BG;
    ctx.fillRect(LM - 3, y - 13, W - 54, 18);
    ctx.fillStyle = AMBER;
    ctx.fillText(" ▸", LM, y);
  } else {
    ctx.fillText("  ", LM, y);
  }
  ctx.fillStyle = a.bc;
  ctx.fillText(a.b, LM + 26, y);
  ctx.fillStyle = a.sel ? "#ffffff" : BODY;
  ctx.font = a.sel ? "bold 13px Menlo, monospace" : "13px Menlo, monospace";
  ctx.fillText(a.name.padEnd(30).slice(0, 30), LM + 42, y);
  ctx.font = "13px Menlo, monospace";
  ctx.fillStyle = DIM;
  ctx.fillText(a.repo.padEnd(24).slice(0, 24), LM + 298, y);
  ctx.fillStyle = a.sc;
  ctx.fillText(a.s, LM + 498, y);
  y += 20;
}

y += 12;

ctx.strokeStyle = BORDER;
ctx.strokeRect(LM - 4, y, W - 52, 56);

ctx.fillStyle = "#0f1830";
ctx.fillRect(LM - 3, y + 1, W - 54, 18);
ctx.fillStyle = BLUE;
ctx.font = "bold 12px Menlo, monospace";
ctx.fillText("  activity", LM, y + 14);

y += 26;
ctx.font = "13px Menlo, monospace";
ctx.fillStyle = DIM;
ctx.fillText("2m ago ", LM + 8, y);
ctx.fillStyle = GREEN;
ctx.fillText("●", LM + 80, y);
ctx.fillStyle = BODY;
ctx.fillText('"Update error handling" done · acme-corp/web-app', LM + 98, y);

y += 18;
ctx.fillStyle = DIM;
ctx.fillText("5m ago ", LM + 8, y);
ctx.fillStyle = GREEN;
ctx.fillText("●", LM + 80, y);
ctx.fillStyle = BODY;
ctx.fillText('"Refactor auth module" done · acme-corp/api-server', LM + 98, y);

y += 30;

ctx.fillStyle = FOOTER_BG;
ctx.fillRect(0, y - 14, W, 30);

ctx.font = "13px Menlo, monospace";
const items = [
  { key: " n ", label: "new", bg: AMBER },
  { key: " ↑↓ ", label: "nav", bg: AMBER },
  { key: " ⏎ ", label: "detail", bg: AMBER },
  { key: " s ", label: "stop", bg: AMBER },
  { key: " d ", label: "delete", bg: AMBER },
  { key: " f ", label: "follow-up", bg: AMBER },
  { key: " r ", label: "refresh", bg: AMBER },
  { key: " c ", label: "config", bg: DIM },
  { key: " q ", label: "quit", bg: AMBER },
];
let fx = LM + 4;
for (const item of items) {
  ctx.fillStyle = item.bg;
  ctx.font = "bold 12px Menlo, monospace";
  const keyW = ctx.measureText(item.key).width;
  const rh = 16;
  const ry = y - 8;
  ctx.beginPath();
  ctx.roundRect(fx, ry, keyW + 4, rh, 3);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.fillText(item.key, fx + 2, y + 4);
  fx += keyW + 8;
  ctx.fillStyle = BODY;
  ctx.font = "13px Menlo, monospace";
  ctx.fillText(item.label, fx, y + 4);
  fx += ctx.measureText(item.label).width + 10;
}

const buf = canvas.toBuffer("image/png");
writeFileSync("assets/screenshot.png", buf);
console.log("screenshot.png written (" + buf.length + " bytes)");
