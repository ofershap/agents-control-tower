import React from "react";
import { render } from "ink";
import { App } from "./app.js";

const CLEAR = "\x1b[2J\x1b[H";

process.stdout.write(CLEAR);

const { waitUntilExit } = render(<App />, { exitOnCtrlC: true });

waitUntilExit().then(() => {
  process.stdout.write(CLEAR);
});
