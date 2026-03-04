<p align="center">
  <img src="assets/logo.png" alt="agents-control-tower" width="140" height="140" />
</p>

<h1 align="center">agents-control-tower</h1>

<p align="center">
  <strong>Your Cursor agents are running. Do you know what they're doing?</strong>
</p>

<p align="center">
  Five cloud agents in parallel. One is stuck. One finished and opened a PR.<br>
  One errored out 10 minutes ago and you didn't notice.<br>
  You're alt-tabbing between browser tabs trying to keep track.
</p>

<p align="center">
  <em>Welcome aboard the control tower. One terminal. All your agents. Full control.</em>
</p>

<p align="center">
  <a href="#install"><img src="https://img.shields.io/badge/TRY_IT_NOW-2ea44f?style=for-the-badge" alt="Try It Now" /></a>
  &nbsp;
  <a href="#install"><img src="https://img.shields.io/badge/INSTALL-0969da?style=for-the-badge" alt="Install" /></a>
  &nbsp;
  <a href="#the-dashboard"><img src="https://img.shields.io/badge/SEE_DASHBOARD-8957e5?style=for-the-badge" alt="See Dashboard" /></a>
</p>

<p align="center">
  <a href="https://github.com/ofershap/agents-control-tower/actions/workflows/ci.yml"><img src="https://github.com/ofershap/agents-control-tower/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript" /></a>
  <a href="https://github.com/ofershap/agents-control-tower/stargazers"><img src="https://img.shields.io/github/stars/ofershap/agents-control-tower?style=social" alt="GitHub Stars" /></a>
  <a href="https://github.com/ofershap/agents-control-tower/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

## The Tower Is Watching

You launched a Cursor cloud agent 20 minutes ago. Did it finish? Did it open a PR? Did it crash?

Your options right now:
- Open cursor.com, find the agents page, scroll, click, read
- Check your email for a notification that may or may not come
- Hope for the best

`agents-control-tower` is a retro terminal dashboard that connects to the Cursor Cloud Agents API and shows you everything in one screen. Launch new agents, send follow-up instructions, stop runaway agents, delete finished ones. All without leaving your terminal.

```bash
npx agents-control-tower
```

One command. The tower lights up.

---

<a id="the-dashboard"></a>

## The Dashboard

<p align="center">
  <img src="assets/screenshot.png" alt="agents-control-tower dashboard" width="820" />
</p>

Running agents pulse amber. Done agents link to their PR. Errors glow red.

---

## What's Different

| | Cursor web dashboard | Conduit | SwarmClaw | agents-control-tower |
|---|---|---|---|---|
| Cursor-native | yes | no | no | yes |
| Terminal UI | no | yes | no | yes |
| Launch agents | no | no | partial | yes |
| Follow-up / stop / delete | no | no | no | yes |
| Local agent hooks | no | no | no | Phase 2 |
| Retro ASCII aesthetic | no | no | no | yes |
| One command install | n/a | yes | no | yes |

---

## What You Can Do

| Key | Action | |
|-----|--------|-|
| `n` | Launch a new cloud agent | Pick repo, write prompt, choose model |
| `f` | Send follow-up | Give a running agent new instructions |
| `s` | Stop an agent | Kill it mid-run |
| `d` | Delete an agent | Remove permanently |
| `o` | Open in browser | Jump to the PR or agent URL |
| `enter` | View details | Full conversation, metadata, status |
| `↑↓` / `jk` | Navigate | Move between agents |
| `r` | Refresh | Force sync with Cursor API |
| `c` | Reconfigure | Re-run setup wizard |

The dashboard polls every 5 seconds. Scroll through agents with arrow keys, view full agent messages with scrollable detail view.

---

## Install

Run directly with npx (nothing to install):

```bash
npx agents-control-tower
```

Or install globally for a shorter command:

```bash
npm install -g agents-control-tower
act
```

Both `agents-control-tower` and `act` work after global install.

First run asks for your Cursor API key. Grab one from [cursor.com/dashboard - Integrations](https://cursor.com/dashboard?tab=integrations). Saved to `~/.agents-control-tower/config.json`.

Or pass it as an env var:

```bash
CURSOR_API_KEY=sk-... act
```

---

## How It Works

| Source | What | How |
|--------|------|-----|
| Cursor Cloud API | List, launch, stop, delete agents. Read conversations | REST, polled every 5s |
| Cursor Hooks (coming) | Local IDE sessions, file edits, shell commands | File-based event stream |

```mermaid
graph LR
    A[Cursor Cloud API] -->|poll 5s| B[State Store]
    C[Cursor Hooks] -->|file watcher| B
    B --> D[Ink TUI]
```

### Tech Stack

| | |
|---|---|
| <img src="https://img.shields.io/badge/Ink_5-React_for_CLIs-61DAFB?logo=react&logoColor=white" alt="Ink" /> | TUI framework |
| <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /> | Type safety |
| <img src="https://img.shields.io/badge/Node.js-≥20-339933?logo=node.js&logoColor=white" alt="Node.js" /> | Runtime |
| <img src="https://img.shields.io/badge/tsup-build-000000?logo=esbuild&logoColor=white" alt="tsup" /> | Bundler |
| <img src="https://img.shields.io/badge/Vitest-testing-6E9F18?logo=vitest&logoColor=white" alt="Vitest" /> | Tests |

---

## Screens

Launch wizard - 3 steps: pick repo (with fuzzy filter), write the task prompt, select model and launch.

Agent detail - repo, branch, PR link, the prompt you gave it, and the full agent response with scroll.

Follow-up - send new instructions to a running agent without leaving the terminal.

Stop / Delete - inline confirmation. Press `s` or `d`, then `y`.

---

## Keyboard Map

```
 DASHBOARD                          DETAIL VIEW
 ──────────────────────────         ──────────────────────────
 n         launch new agent         esc       back to dashboard
 ↑ / k     move up                  f         send follow-up
 ↓ / j     move down                s         stop agent
 enter     open detail              d         delete agent
 s         stop selected            o         open PR / URL
 d         delete selected          ↑↓        scroll message
 r         force refresh
 q         quit                    LAUNCH FLOW
                                    ──────────────────────────
 GLOBAL                             ↑↓        navigate options
 ──────────────────────────         /         filter repos
 ctrl+c    quit immediately         enter     select / confirm
 c         reconfigure              esc       cancel / go back
```

---

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup.

---

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

---

If this helped you, [star the repo](https://github.com/ofershap/agents-control-tower), [open an issue](https://github.com/ofershap/agents-control-tower/issues) if something breaks.

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
