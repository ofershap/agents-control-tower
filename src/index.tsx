import React from "react";
import { render } from "ink";
import { App } from "./app.js";

const CLEAR = "\x1b[2J\x1b[H";
const demo = process.argv.includes("--demo");

process.stdout.write(CLEAR);

const { waitUntilExit } = render(<App demo={demo} />, { exitOnCtrlC: true });

waitUntilExit().then(() => {
  process.stdout.write(CLEAR);
});
