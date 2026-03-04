<h1 align="center">agents-control-tower</h1>

<p align="center">
  <strong>Your Cursor agents are running. You have no idea what they're doing.</strong>
</p>

<p align="center">
  Five cloud agents in parallel. Three in-IDE sessions.<br>
  One is stuck. One finished and opened a PR. One is about to <code>rm -rf</code> something.<br>
  You're alt-tabbing between browser tabs trying to keep track.
</p>

<p align="center">
  <em>One terminal. All your agents. Full control.</em>
</p>

<p align="center">
  <a href="#quick-start"><img src="https://img.shields.io/badge/Quick_Start-grey?style=for-the-badge" alt="Quick Start" /></a>
  &nbsp;
  <a href="#what-you-can-do"><img src="https://img.shields.io/badge/Features-grey?style=for-the-badge" alt="Features" /></a>
  &nbsp;
  <a href="#how-it-works"><img src="https://img.shields.io/badge/Architecture-grey?style=for-the-badge" alt="Architecture" /></a>
</p>

<p align="center">
  <a href="https://github.com/ofershap/agents-control-tower/actions/workflows/ci.yml"><img src="https://github.com/ofershap/agents-control-tower/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node-≥20-brightgreen" alt="Node >= 20" /></a>
</p>

---

## The Tower Is Watching

You launched a Cursor cloud agent 20 minutes ago. Did it finish? Did it open a PR? Did it crash?

Your options right now:
- Open cursor.com, find the agents page, scroll, click, read
- Check your email for a notification that may or may not come
- Hope for the best

`agents-control-tower` is a retro terminal dashboard that connects to the Cursor Cloud Agents API and shows you everything in one screen. Not just a viewer. You can launch new agents, send follow-up instructions, stop runaway agents, and delete finished ones. All without leaving your terminal.

```bash
npx agents-control-tower
```

That's it. One command. The tower lights up.

---

<a id="what-you-can-do"></a>

## What You Can Do

| Key | Action | |
|-----|--------|-|
| `n` | Launch a new cloud agent | Pick repo, write prompt, choose model |
| `f` | Send follow-up | Give a running agent new instructions |
| `s` | Stop an agent | Kill it mid-flight |
| `d` | Delete an agent | Permanently remove |
| `o` | Open in browser | Jump to the PR or agent URL |
| `enter` | View details | Full conversation, metadata, status |
| `↑↓` / `jk` | Navigate | Move between agents |
| `r` | Refresh | Force a sync with Cursor API |

The dashboard polls every 5 seconds. Running agents pulse amber. Finished agents show their PR link. Errors show what went wrong.

---

## Quick Start

```bash
npx agents-control-tower
```

On first run, the setup wizard asks for your Cursor API key. Get one at [cursor.com/settings](https://cursor.com/settings) under API Keys. The key is saved to `~/.agents-control-tower/config.json`.

Or set it as an env var:

```bash
CURSOR_API_KEY=sk-... npx agents-control-tower
```

---

## The Dashboard

```
   A G E N T S                                            ╻
   ╔═╗╔═╗╔╗╔╦╗╔═╗╔═╗╔╗                            ╻ ┃ ╻
   ║  ║║ ║║║║ ║╠═╝║ ║║║                           ┏━━┻━━┓
   ║  ║║ ║║╚╝ ║║╚╗║ ║║╚╗                         ┃░▓░░▓░┃
   ╚═╝╚═╝╝ ╚═╝╚═╝╚═╝╚═╝                          ┣━━━━━━┫
   ╔╦╗╔═╗╔╗╔╗╔═╗╔═╗                                ┃ ░░ ┃
   ║ ║║ ║║║║║║╣ ╠═╝                                ┃ ░░ ┃
   ╝ ╚╚═╝╚╩╝╚╚═╝╚═╝                               ┗━━━━┛
   ░░░░ launch · watch · command ░░░░             ━━┻━━━━┻━━

   3 running    1 done    1 error                 synced 2s ago

 ┌─ cloud ──────────────────────────────────────────────────────┐
 │ ▸◉  Add auth middleware       ofershap/myapp       4m 12s   │
 │  ◉  Fix payment webhook       ofershap/myapp       2m 45s   │
 │  ✔  Update README             ofershap/tools   done → PR #42│
 │  ✖  Refactor DB queries       ofershap/api    error: tests  │
 └──────────────────────────────────────────────────────────────┘

 ┌─ activity ───────────────────────────────────────────────────┐
 │  2m ago   ✔  "Update README" finished · PR #42 created      │
 │  4m ago   ◉  "Fix payment" started on ofershap/myapp        │
 └──────────────────────────────────────────────────────────────┘

 n new agent  ↑↓ navigate  enter details  s stop  d delete  q quit
```

The header has a pixel-art control tower with blinking antenna lights, a radar sweep in the observation deck, and orbiting dots for each running agent. The tower glows amber when agents are active, green when all are done, and red when something failed.

---

<a id="how-it-works"></a>

## How It Works

The tower talks to two data sources:

| Source | What | How |
|--------|------|-----|
| Cursor Cloud API | List, launch, stop, delete agents. Get conversations and artifacts | REST API, polled every 5s |
| Cursor Hooks (Phase 2) | See local IDE agent sessions, file edits, shell commands | File-based event stream |

```
  Cursor Cloud API ──→ Poller (5s) ──→ State Store ──→ Ink TUI
  Cursor Hooks     ──→ File Watcher ──→ State Store ──→ Ink TUI
```

**Stack:** Ink 5 (React for terminals) · TypeScript (strict) · native fetch · tsup · Vitest

---

## Screens

**Launch wizard** - 3 steps: pick repo (with fuzzy filter), write the task prompt, select model and launch. The new agent appears on the dashboard within seconds.

**Agent detail** - Full metadata (repo, branch, base, started time, PR link), the prompt you gave it, and the latest message from the agent with scrollable history.

**Follow-up** - Send new instructions to a running agent without leaving the terminal.

**Stop / Delete** - Inline confirmation. Press `s` or `d` on any agent, hit `y` to confirm.

**Setup** - First-run wizard. Paste your API key, optionally install local hooks.

**Error state** - Clear error messages with fix instructions. Auto-retry with backoff.

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
 d         delete selected
 r         force refresh            LAUNCH FLOW
 q         quit                     ──────────────────────────
 ?         help                     ↑↓        navigate options
                                    /         filter repos
 GLOBAL                             enter     select / confirm
 ──────────────────────────         esc       cancel / go back
 ctrl+c    quit immediately
 c         reconfigure
```

---

## Roadmap

**Phase 1 (current)** - Cloud agents command center. Full CRUD. Retro TUI.

**Phase 2** - Local agent hooks. See your in-IDE Cursor sessions, file edits, shell commands. Activity feed with live events.

**Phase 3** - Vim keybindings, color themes, compact mode for narrow terminals.

---

## Author

[![Made by ofershap](https://gitshow.dev/api/card/ofershap)](https://gitshow.dev/ofershap)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
