# agents-control-tower -- UI Specification v3

> Launch, watch, and command your Cursor agents from one terminal.

---

## What this tool can actually DO (via Cursor API + Hooks)

Before the screens -- this is the capability matrix.
Every action marked with a key is accessible from the TUI.

```
 CLOUD AGENTS (via Cursor REST API)
 ─────────────────────────────────────────────────────────────────────
 n  Launch a new agent       pick repo, write prompt, choose model
 f  Send follow-up           give a running agent new instructions
 s  Stop an agent            pause execution mid-flight
 d  Delete an agent          permanently remove
 o  Open in browser          open PR or agent URL
    View conversation        full chat history
    View/download artifacts  screenshots, videos, files it produced
    List your repos           for the launch picker
    List available models     for model selection

 LOCAL AGENTS (via Cursor Hooks)
 ─────────────────────────────────────────────────────────────────────
    See sessions start/end   know when agents are active
    See subagents spawn      track Task tool usage
    See file edits           what files are being changed
    See shell commands        what commands are running
    Block shell commands      guardrails: deny dangerous commands
    Block file reads          guardrails: protect sensitive files
    Block MCP calls           guardrails: deny tool usage
```

---

## Design Philosophy

1. **Command center, not window shopping** -- You can launch agents,
   give them new instructions, stop them, and clean them up.
   All from one terminal. No browser needed.

2. **First-glance clarity** -- A new user sees the dashboard and instantly
   understands what's happening. No learning curve.

3. **Retro terminal warmth** -- Amber-on-dark CRT aesthetic inspired by
   the Dan Rosenthal "Claude Code Agent Swarms" visual. Warm, inviting,
   slightly nostalgic.

4. **Show outcomes, not noise** -- Running agents show elapsed time.
   Finished agents show their PR. Errors show what went wrong.
   No "edited file X" spam.

5. **Zero-config wow moment** -- `npx agents-control-tower` should
   produce a beautiful, functional screen within 30 seconds.

---

## Color Palette (from reference image)

```
Background:      #0c1222  (deep navy-black)
Panel bg:        #111a2e  (slightly lighter navy for content areas)
Borders:         #1e3a5f  (muted teal-blue, box-drawing chars)
Header title:    #e8912d  (warm amber-orange)
Header accent:   #c67b1c  (darker amber for decorative bars)
Subtitle:        #d4a843  (gold)
Section labels:  #4a90c4  (cool blue)
Teal accents:    #2d7d7d  (teal-green)

Status running:  #e8912d  (amber, pulsing)
Status done:     #3fb950  (green)
Status error:    #f85149  (red)
Status creating: #4a6785  (dim blue-gray)

Body text:       #c9d1d9  (light gray)
Dim text:        #4a6785  (muted blue-gray)
Selected row:    #1a3050  (subtle blue highlight)
Input active:    #e8912d  (amber cursor/border on focused inputs)
```

---

## Header Design (the signature element)

The header is the brand. It's what people screenshot and share.
Layout: text on the LEFT, pixel tower art on the RIGHT.

### Text hierarchy (left side)

```
 Line 1:   A G E N T S                              (small, spaced out, dim gold)
 Lines 2-5: CONTROL TOWER                            (BIG retro block font, amber)
 Line 6:   ░░░░ launch · watch · command ░░░░        (tagline, dim blue with bars)
```

This mirrors the reference image's layout:
- "CLAUDE CODE" = our "CONTROL TOWER" (big, amber block font)
- "AGENT SWARMS" = our "AGENTS" (smaller, above)
- "5 WORKFLOW SKILLS" = our "launch · watch · command" (tagline below)

The block font uses the chunky brick-style characters from the reference
(thick horizontal strokes with small gaps, amber #e8912d on navy #0c1222).

### Pixel tower art (right side)

An ASCII art control tower inspired by the pixel art reference image.
Uses Unicode box-drawing and block characters. Approximately 10 lines tall,
16 characters wide.

```
               ╻
             ╻ ┃ ╻               <- antenna lights (blink red)
            ┏━━┻━━┓
           ┃░▓░░▓░┃              <- glass observation deck (radar sweep)
           ┣━━━━━━┫
            ┃ ░░ ┃               <- tower body with windows
            ┃ ░░ ┃
            ┗━━━━┛
           ━━┻━━━━┻━━            <- base
```

### Tower animations

1. **Blinking antenna lights:** The three ╻ tips alternate between
   bright red (#f85149) and dim (#4a6785) on a 1-second cycle.
   Staggered timing so they don't all blink together.

2. **Radar sweep:** The observation deck pattern (░▓░░▓░) shifts
   one character per 0.5s, creating a rotating sweep effect:
   frame 1: ░▓░░▓░
   frame 2: ░░▓░░▓
   frame 3: ▓░░▓░░
   Then repeats. Subtle but alive.

3. **Agent dots orbiting:** Tiny dots (·) on either side of the tower
   representing active agents. They slowly orbit:
   - One dot circles clockwise around the tower every 4 seconds
   - Number of dots = number of running agents (max 4 visible)
   - When an agent finishes, its dot "lands" at the base and disappears

4. **Status-linked glow:** The tower windows change color based on
   overall status:
   - All idle: dim blue-gray
   - Agents running: amber glow
   - All done: green glow
   - Any error: red glow in one window

### Combined header layout

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                                                               ╻               ║
║   A G E N T S                                     ·         ╻ ┃ ╻             ║
║   ╔═╗╔═╗╔╗╔╦╗╔═╗╔═╗╔╗                                    ┏━━┻━━┓            ║
║   ║  ║║ ║║║║ ║╠═╝║ ║║║                           ·       ┃░▓░░▓░┃            ║
║   ║  ║║ ║║╚╝ ║║╚╗║ ║║╚╗                                  ┣━━━━━━┫            ║
║   ╚═╝╚═╝╝ ╚═╝╚═╝╚═╝╚═╝                             ·     ┃ ░░ ┃             ║
║   ╔╦╗╔═╗╔╗╔╗╔═╗╔═╗                                        ┃ ░░ ┃             ║
║   ║ ║║ ║║║║║║╣ ╠═╝                                         ┗━━━━┛             ║
║   ╝ ╚╚═╝╚╩╝╚╚═╝╚═╝                                      ━━┻━━━━┻━━          ║
║   ░░░░ launch · watch · command ░░░░                                           ║
║                                                                                ║
║   3 running    1 done    1 error                         synced 2s ago         ║
║                                                                                ║
║ ┌─ cloud ───────────────────────────────────────────────────────────────────┐  ║
║ │                                                                           │  ║
║ │  ◉  Add auth middleware       ofershap/myapp       4m 12s                 │  ║
║ │  ◉  Fix payment webhook       ofershap/myapp       2m 45s                 │  ║
║ │  ◉  Write unit tests          ofershap/api         1m 03s                 │  ║
║ │  ✔  Update README             ofershap/tools       done → PR #42          │  ║
║ │  ✖  Refactor DB queries       ofershap/api         error: tests failed    │  ║
║ │                                                                           │  ║
║ └───────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                ║
║ ┌─ local ───────────────────────────────────────────────────────────────────┐  ║
║ │                                                                           │  ║
║ │  ◉  session a3f2       ~/Dev/myapp          working on auth middleware    │  ║
║ │  ◉  session d7e4       ~/Dev/api            running tests                 │  ║
║ │                                                                           │  ║
║ └───────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                ║
║ ┌─ activity ────────────────────────────────────────────────────────────────┐  ║
║ │                                                                           │  ║
║ │  2m ago   ✔  "Update README" finished · PR #42 created                   │  ║
║ │  4m ago   ◉  "Write unit tests" started on ofershap/api                  │  ║
║ │  6m ago   ✖  "Refactor DB queries" failed · test suite error             │  ║
║ │  8m ago   ◉  "Fix payment webhook" started on ofershap/myapp             │  ║
║ │                                                                           │  ║
║ └───────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                ║
║  n new agent  ↑↓ navigate  enter details  s stop  d delete  r refresh  q quit  ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

### Key changes from v2

- **`n` for new agent** is the first action in the footer bar.
  This is the primary power action. You should see it immediately.
- **`s` stop and `d` delete** available directly from the dashboard
  without entering the detail view. Select a row, press `s`, done.
- The footer reads like a sentence of everything you can do.

---

## Screen 2: Launch New Agent (press `n`)

A guided flow inside the TUI. Three steps: pick repo, write prompt, configure.
The header collapses to a single line to maximize space for the launch form.

### Step 1: Pick a repository

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  AGENTS CONTROL TOWER                                                          ║
║                                                                                ║
║   NEW AGENT ─ step 1/3 ─ pick a repo                                          ║
║                                                                                ║
║   Filter: █                                                                    ║
║                                                                                ║
║   ┌────────────────────────────────────────────────────────────────────────┐    ║
║   │                                                                        │    ║
║   │  ▸ ofershap/myapp                                                      │    ║
║   │    ofershap/api                                                        │    ║
║   │    ofershap/tools                                                      │    ║
║   │    ofershap/landing-page                                               │    ║
║   │    ofershap/agents-control-tower                                       │    ║
║   │    ofershap/ts-nano-event                                              │    ║
║   │    ofershap/env-guard                                                  │    ║
║   │    ofershap/mcp-server-devutils                                        │    ║
║   │                                                                        │    ║
║   └────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                ║
║   23 repos available · type to filter                                          ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║  ↑↓ navigate    enter select    / filter    esc cancel                         ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

### Step 2: Write the prompt

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  AGENTS CONTROL TOWER                                                          ║
║                                                                                ║
║   NEW AGENT ─ step 2/3 ─ describe the task                                    ║
║                                                                                ║
║   Repo: ofershap/myapp · Branch: main                                          ║
║                                                                                ║
║   What should the agent do?                                                    ║
║                                                                                ║
║   ┌────────────────────────────────────────────────────────────────────────┐    ║
║   │ Add rate limiting middleware to all API routes.                        │    ║
║   │ Use express-rate-limit with a sliding window of 100 req/15min.        │    ║
║   │ Add tests. Update the README with the new rate limit docs.            │    ║
║   │ █                                                                      │    ║
║   │                                                                        │    ║
║   │                                                                        │    ║
║   │                                                                        │    ║
║   │                                                                        │    ║
║   └────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                ║
║   Multi-line input. Write as much detail as you want.                          ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║  ctrl+enter continue    esc cancel                                             ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

### Step 3: Configure and launch

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  AGENTS CONTROL TOWER                                                          ║
║                                                                                ║
║   NEW AGENT ─ step 3/3 ─ configure                                            ║
║                                                                                ║
║   Repo: ofershap/myapp · Branch: main                                          ║
║   Task: Add rate limiting middleware to all API routes...                       ║
║                                                                                ║
║   ┌────────────────────────────────────────────────────────────────────────┐    ║
║   │                                                                        │    ║
║   │  Model          ▸ auto (recommended)                                   │    ║
║   │                    claude-4-sonnet                                      │    ║
║   │                    claude-4.5-sonnet-thinking                          │    ║
║   │                    gpt-5.2                                             │    ║
║   │                                                                        │    ║
║   │  Base branch      main                                                 │    ║
║   │                                                                        │    ║
║   │  Auto-create PR   [✔] yes                                              │    ║
║   │                                                                        │    ║
║   └────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║  ↑↓ navigate    space toggle    enter launch    esc cancel                     ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

### After pressing Enter to launch:

The screen briefly shows a confirmation, then returns to the dashboard
where the new agent appears at the top with ◉ CREATING status.

```
║                                                                                ║
║   ✔  Agent launched: "Add rate limiting middleware..."                          ║
║       on ofershap/myapp · model: auto · auto-PR: yes                           ║
║                                                                                ║
║   Returning to dashboard...                                                    ║
║                                                                                ║
```

---

## Screen 3: Agent Detail (press Enter on a row)

Now with action buttons that DO things.

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  ← esc back                                                                   ║
║                                                                                ║
║  ◉ RUNNING · 4m 22s                                                            ║
║  Add auth middleware                                                           ║
║  ──────────────────────────────────────────────────────────────────────────     ║
║                                                                                ║
║  repo         ofershap/myapp                                                   ║
║  branch       cursor/auth-middleware-1234                                       ║
║  base         main                                                             ║
║  started      14:28:03                                                         ║
║  pr           not yet created                                                  ║
║                                                                                ║
║  ┌─ your task ──────────────────────────────────────────────────────────────┐  ║
║  │                                                                          │  ║
║  │  Add JWT auth middleware to all /api routes.                             │  ║
║  │  Use the existing auth service in src/services/auth.ts.                 │  ║
║  │  Add tests.                                                             │  ║
║  │                                                                          │  ║
║  └──────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                ║
║  ┌─ latest from agent ──────────────────────────────────────────────────────┐  ║
║  │                                                                          │  ║
║  │  I've created the middleware and added tests:                            │  ║
║  │  · Created src/middleware/auth.ts with JWT verification                  │  ║
║  │  · Added 8 test cases in tests/middleware/auth.test.ts                   │  ║
║  │  · Updated src/routes/api.ts to use the middleware                       │  ║
║  │                                                                          │  ║
║  │  ─ ─ scroll up for 2 earlier messages ─ ─                               │  ║
║  │                                                                          │  ║
║  └──────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                ║
║  esc back   f follow-up   s stop   d delete   o open in browser               ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen 4: Send Follow-up (press `f` in detail view)

An inline prompt that sends new instructions to a running agent.

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  ← esc cancel                                                                  ║
║                                                                                ║
║  ◉ RUNNING · 4m 22s                                                            ║
║  Add auth middleware                                                           ║
║  ──────────────────────────────────────────────────────────────────────────     ║
║                                                                                ║
║  Send a follow-up instruction to this agent:                                   ║
║                                                                                ║
║  ┌────────────────────────────────────────────────────────────────────────┐     ║
║  │ Also add rate limiting to the auth endpoint.                           │     ║
║  │ Max 5 login attempts per minute per IP.█                               │     ║
║  │                                                                        │     ║
║  │                                                                        │     ║
║  └────────────────────────────────────────────────────────────────────────┘     ║
║                                                                                ║
║  The agent will receive this and continue working.                             ║
║  If the agent was stopped, it will resume.                                     ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║  ctrl+enter send    esc cancel                                                 ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen 5: Stop Confirmation (press `s`)

Quick inline confirmation -- not a separate screen.

```
║ ┌─ cloud ───────────────────────────────────────────────────────────────────┐  ║
║ │                                                                           │  ║
║ │  ◉  Add auth middleware       ofershap/myapp       4m 12s                 │  ║
║ │  ◉  Fix payment webhook       ofershap/myapp       2m 45s                 │  ║
║ │  ◉  Write unit tests          ofershap/api         1m 03s                 │  ║
║ │  ✔  Update README             ofershap/tools       done → PR #42          │  ║
║ │  ✖  Refactor DB queries       ofershap/api         error: tests failed    │  ║
║ │                                                                           │  ║
║ │  ┌───────────────────────────────────────────────────┐                    │  ║
║ │  │  Stop "Add auth middleware"?   y yes    n no      │                    │  ║
║ │  └───────────────────────────────────────────────────┘                    │  ║
║ │                                                                           │  ║
║ └───────────────────────────────────────────────────────────────────────────┘  ║
```

Same pattern for delete, but with:
```
║ │  ┌──────────────────────────────────────────────────────────┐             │  ║
║ │  │  Delete "Update README"? This is permanent.  y / n       │             │  ║
║ │  └──────────────────────────────────────────────────────────┘             │  ║
```

---

## Screen 6: Finished Agent Detail (with PR)

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  ← esc back                                                                   ║
║                                                                                ║
║  ✔ FINISHED · 3m 18s                                                           ║
║  Update README docs                                                            ║
║  ──────────────────────────────────────────────────────────────────────────     ║
║                                                                                ║
║  repo         ofershap/tools                                                   ║
║  branch       cursor/readme-update-5678                                        ║
║  pr           github.com/ofershap/tools/pull/42                                ║
║                                                                                ║
║  ┌─ summary ────────────────────────────────────────────────────────────────┐  ║
║  │                                                                          │  ║
║  │  Added installation instructions, usage examples, and a                  │  ║
║  │  troubleshooting section to README.md.                                   │  ║
║  │                                                                          │  ║
║  └──────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                ║
║  ┌─ your task ──────────────────────────────────────────────────────────────┐  ║
║  │                                                                          │  ║
║  │  Update the README with install instructions and examples.              │  ║
║  │                                                                          │  ║
║  └──────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                ║
║  esc back    o open PR in browser    d delete                                  ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen 7: First Run / Setup

The full header with tower art shows on first run -- it's the first impression.

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                                                               ╻               ║
║   A G E N T S                                               ╻ ┃ ╻             ║
║   ╔═╗╔═╗╔╗╔╦╗╔═╗╔═╗╔╗                                    ┏━━┻━━┓            ║
║   ║  ║║ ║║║║ ║╠═╝║ ║║║                                   ┃░▓░░▓░┃            ║
║   ║  ║║ ║║╚╝ ║║╚╗║ ║║╚╗                                  ┣━━━━━━┫            ║
║   ╚═╝╚═╝╝ ╚═╝╚═╝╚═╝╚═╝                                   ┃ ░░ ┃             ║
║   ╔╦╗╔═╗╔╗╔╗╔═╗╔═╗                                        ┃ ░░ ┃             ║
║   ║ ║║ ║║║║║║╣ ╠═╝                                         ┗━━━━┛             ║
║   ╝ ╚╚═╝╚╩╝╚╚═╝╚═╝                                      ━━┻━━━━┻━━          ║
║   ░░░░ launch · watch · command ░░░░                                           ║
║                                                                                ║
║   Welcome. Let's connect to your Cursor agents.                                ║
║                                                                                ║
║                                                                                ║
║   STEP 1 of 2 ─────────────────────────────────────────────────────────────    ║
║                                                                                ║
║   Paste your Cursor API key:                                                   ║
║                                                                                ║
║   ┌────────────────────────────────────────────────────────────────────────┐    ║
║   │ █                                                                      │    ║
║   └────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                ║
║   Get your key at cursor.com/settings → API Keys                               ║
║   Or set CURSOR_API_KEY env var and restart.                                   ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║  enter continue    q quit                                                      ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

Step 2 (after API key validated):

```
║   ✔ Connected as developer@example.com                                         ║
║                                                                                ║
║   STEP 2 of 2 ─────────────────────────────────────────────────────────────    ║
║                                                                                ║
║   Monitor local Cursor IDE agents too?                                         ║
║                                                                                ║
║   This installs lightweight hooks into ~/.cursor/hooks.json                    ║
║   so the tower can see your in-IDE agents.                                     ║
║   Your existing hooks are preserved.                                           ║
║                                                                                ║
║   ▸ Yes, install hooks                                                         ║
║     Skip for now (cloud agents only)                                           ║
```

---

## Screen 8: Empty State

Full header with tower art. Tower windows are dim (no agents = idle tower).

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                                                               ╻               ║
║   A G E N T S                                               ╻ ┃ ╻             ║
║   ╔═╗╔═╗╔╗╔╦╗╔═╗╔═╗╔╗                                    ┏━━┻━━┓            ║
║   ║  ║║ ║║║║ ║╠═╝║ ║║║                                   ┃░░░░░░┃            ║
║   ║  ║║ ║║╚╝ ║║╚╗║ ║║╚╗                                  ┣━━━━━━┫            ║
║   ╚═╝╚═╝╝ ╚═╝╚═╝╚═╝╚═╝                                   ┃ ░░ ┃             ║
║   ╔╦╗╔═╗╔╗╔╗╔═╗╔═╗                                        ┃ ░░ ┃             ║
║   ║ ║║ ║║║║║║╣ ╠═╝                                         ┗━━━━┛             ║
║   ╝ ╚╚═╝╚╩╝╚╚═╝╚═╝                                      ━━┻━━━━┻━━          ║
║   ░░░░ launch · watch · command ░░░░                                           ║
║                                                                                ║
║   0 agents                                               synced just now       ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                 Your tower is ready. No agents in flight yet.                  ║
║                                                                                ║
║                 Press  n  to launch your first cloud agent.                    ║
║                                                                                ║
║                 Or start a chat in Cursor IDE — it'll appear here              ║
║                 automatically if hooks are installed.                           ║
║                                                                                ║
║                 Watching for agents...                                         ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║  n new agent    c configure    q quit    ? help                                ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

Key change: **"Press `n` to launch your first cloud agent."** -- the empty state
teaches you the primary action. You're not stuck staring at nothing.

---

## Screen 9: Error State

Tower windows glow red. Antenna lights stop blinking. Tower is "offline."

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║                                                               ╻               ║
║   A G E N T S                                               ╻ ┃ ╻             ║
║   ╔═╗╔═╗╔╗╔╦╗╔═╗╔═╗╔╗                                    ┏━━┻━━┓            ║
║   ║  ║║ ║║║║ ║╠═╝║ ║║║                                   ┃▓▓▓▓▓▓┃            ║
║   ║  ║║ ║║╚╝ ║║╚╗║ ║║╚╗                                  ┣━━━━━━┫            ║
║   ╚═╝╚═╝╝ ╚═╝╚═╝╚═╝╚═╝                                   ┃ ▓▓ ┃             ║
║   ╔╦╗╔═╗╔╗╔╗╔═╗╔═╗                                        ┃ ▓▓ ┃             ║
║   ║ ║║ ║║║║║║╣ ╠═╝                                         ┗━━━━┛             ║
║   ╝ ╚╚═╝╚╩╝╚╚═╝╚═╝                                      ━━┻━━━━┻━━          ║
║   ░░░░ launch · watch · command ░░░░                                           ║
║                                                                                ║
║   disconnected                                                                 ║
║                                                                                ║
║                                                                                ║
║                 ✖  Can't reach Cursor API                                      ║
║                                                                                ║
║                 401 Unauthorized                                               ║
║                 Your API key may have expired.                                 ║
║                                                                                ║
║                 Fix it:                                                        ║
║                   1. Go to cursor.com/settings → API Keys                      ║
║                   2. Create a new key                                          ║
║                   3. Press c to reconfigure                                    ║
║                                                                                ║
║                 Retrying in 8s...                                              ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║                                                                                ║
║  c reconfigure    r retry now    q quit                                        ║
║                                                                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Screen 10: Compact Mode (< 80 cols)

```
┌──────────────────────────────────────────────┐
│ AGENTS CONTROL TOWER     3 run · 1 done      │
│ ─────────────────────────────────────────     │
│ ◉  Add auth middleware          4m 12s       │
│ ◉  Fix payment webhook          2m 45s       │
│ ◉  Write unit tests             1m 03s       │
│ ✔  Update README            → PR #42         │
│ ✖  Refactor DB queries     tests failed      │
│ ─────────────────────────────────────────     │
│ 2m ago  ✔ "Update README" → PR #42           │
│ 4m ago  ◉ "Write tests" started              │
│ 6m ago  ✖ "Refactor DB" failed               │
│ ─────────────────────────────────────────     │
│ n new  enter details  s stop  q quit         │
└──────────────────────────────────────────────┘
```

---

## Complete Keyboard Map

```
 DASHBOARD                          DETAIL VIEW
 ──────────────────────────         ──────────────────────────
 n         launch new agent         esc       back to dashboard
 ↑ / k     move up                  f         send follow-up
 ↓ / j     move down                s         stop agent
 enter     open detail              d         delete agent
 s         stop selected agent      o         open PR / URL in browser
 d         delete selected agent
 tab       switch panel             LAUNCH FLOW
 r         force refresh            ──────────────────────────
 q         quit                     ↑↓        navigate options
 ?         help overlay             /         filter repos
                                    enter     select / confirm
 GLOBAL                             space     toggle checkbox
 ──────────────────────────         ctrl+enter submit text
 ctrl+c    quit immediately         esc       cancel / go back
 c         reconfigure
```

---

## Status Badge Reference

```
 Symbol   Color              Meaning
 ─────────────────────────────────────────────────────────────
 ◉        amber #e8912d      RUNNING / CREATING (pulsing)
 ✔        green #3fb950      FINISHED
 ✖        red #f85149        ERROR
 ◉        dim #4a6785        STOPPED (manual pause)
 ◉        teal #2d7d7d       LIVE (local agent session)
 ○        dim #4a6785        IDLE (local, no activity)
```

---

## Animation / Dynamic Behavior

### Tower animations (header, right side)

1. **Blinking antenna lights:** The three antenna tips on the tower
   alternate between bright red (#f85149) and dim (#4a6785).
   Each blinks on a 1s cycle, staggered by 0.3s so they feel organic,
   not synchronized. Represents "the tower is online and scanning."

2. **Radar sweep:** The observation deck characters cycle through
   a 3-frame rotation every 1.5s:
   ```
   frame 1:  ░▓░░▓░
   frame 2:  ░░▓░░▓
   frame 3:  ▓░░▓░░
   ```
   Creates a subtle radar-scanning effect.

3. **Orbiting agent dots:** Tiny · characters orbit the tower.
   One dot per running agent (max 4 visible). They move to adjacent
   positions every 0.5s in a clockwise pattern around the tower.
   When an agent finishes, its dot "descends" to the base and vanishes.

4. **Status-linked tower glow:** Tower windows change color:
   - No agents: dim blue-gray (░░) -- tower is idle
   - Agents running: amber (░▓) -- tower is active
   - All done: green -- mission accomplished
   - Any error: one window turns red (▓▓) -- attention needed

### Table animations

5. **Pulsing heartbeat:** Running agents' ◉ alternates bright/dim, 1s cycle.
6. **Elapsed time ticking:** Updates every second for running agents.
7. **Status transitions:** Amber → green flash when agent finishes.

### System animations

8. **Startup sequence:** On first launch, the tower "builds" itself
   from bottom to top (base → body → deck → antennas), then the
   title text types in left to right. Total ~2s. Skippable with
   any keypress or `--no-animation` flag.
9. **Sync indicator:** "synced 2s ago" updates continuously.
   Drops to amber at 30s, red "disconnected" at 60s.
10. **Launch success flash:** Brief green confirmation after launching.

---

## Terminal Size Breakpoints

```
 < 60 cols     too narrow, show warning
 60-79 cols    compact mode: no ASCII art, text title, single list
 80-99 cols    standard mode: ASCII header, all panels, abbreviated
 100+ cols     full mode: spacious columns, full agent names
```

---

## What This UI Does NOT Show (deliberate omissions)

- **Branch names in the main table.** Available in detail view.
- **Individual file edits in the activity feed.** Only state transitions.
- **Column headers.** The data is self-explanatory.
- **Cost/token tracking.** Cursor API doesn't expose this yet.
- **Full conversation by default.** Latest message + scrollable history.
- **Guardrail configuration.** Hooks are installed as defaults.
  Advanced guardrail tuning is done by editing hooks.json directly.
