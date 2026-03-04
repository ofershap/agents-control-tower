import { createCanvas } from "canvas";
import { writeFileSync } from "fs";

const W = 200;
const H = 200;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const BG = "#0c1222";
const AMBER = "#e8912d";
const AMBER_DARK = "#c67b1c";
const BLUE = "#4a90c4";
const RED = "#f85149";
const DIM = "#4a6785";

ctx.fillStyle = BG;
ctx.beginPath();
ctx.roundRect(0, 0, W, H, 20);
ctx.fill();

const cx = W / 2;
const lh = 16;
let y = 20;

ctx.font = "15px Menlo, monospace";
ctx.textAlign = "center";

ctx.fillStyle = RED;
ctx.fillText("║", cx, y); y += lh;

ctx.fillStyle = AMBER_DARK;
ctx.fillText("║   ║   ║", cx, y); y += lh;

ctx.fillStyle = AMBER;
ctx.fillText("╔═════════╗", cx, y); y += lh;

ctx.fillStyle = AMBER;
ctx.fillText("║", cx - 48, y);
ctx.fillStyle = BLUE;
ctx.fillText("# # # #", cx, y);
ctx.fillStyle = AMBER;
ctx.fillText("║", cx + 48, y); y += lh;

ctx.fillStyle = AMBER;
ctx.fillText("╠═════════╣", cx, y); y += lh;

ctx.fillStyle = AMBER;
ctx.fillText("╚═════════╝", cx, y); y += lh;

ctx.fillStyle = AMBER_DARK;
ctx.fillText("║   ║", cx, y); y += lh;

ctx.fillStyle = AMBER_DARK;
ctx.fillText("║", cx - 14, y);
ctx.fillStyle = AMBER;
ctx.fillText("o", cx, y);
ctx.fillStyle = AMBER_DARK;
ctx.fillText("║", cx + 14, y); y += lh;

ctx.fillStyle = AMBER;
ctx.fillText("══╩═════╩══", cx, y); y += lh + 6;

ctx.font = "bold 13px Menlo, monospace";
ctx.fillStyle = AMBER;
ctx.fillText("CONTROL", cx, y); y += 15;
ctx.fillStyle = AMBER_DARK;
ctx.fillText("TOWER", cx, y);

const buf = canvas.toBuffer("image/png");
writeFileSync("assets/logo.png", buf);
console.log("logo.png written (" + buf.length + " bytes)");
