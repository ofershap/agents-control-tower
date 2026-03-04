import type { CloudAgent, ActivityEvent, AgentStats } from "./types.js";

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

export const DEMO_AGENTS: CloudAgent[] = [
  {
    id: "demo-1",
    name: "Add auth middleware",
    status: "RUNNING",
    source: { repository: "https://github.com/acme-corp/web-app", ref: "main" },
    target: { branchName: "cursor/add-auth-middleware-a1b2", url: "https://github.com/acme-corp/web-app", autoCreatePr: true },
    createdAt: ago(3),
  },
  {
    id: "demo-2",
    name: "Fix payment webhook retry logic",
    status: "RUNNING",
    source: { repository: "https://github.com/acme-corp/web-app", ref: "main" },
    target: { branchName: "cursor/fix-payment-webhook-c3d4", url: "https://github.com/acme-corp/web-app", autoCreatePr: true },
    createdAt: ago(2),
  },
  {
    id: "demo-3",
    name: "Write unit tests for billing module",
    status: "RUNNING",
    source: { repository: "https://github.com/acme-corp/api-server", ref: "main" },
    target: { branchName: "cursor/write-unit-tests-e5f6", url: "https://github.com/acme-corp/api-server", autoCreatePr: true },
    createdAt: ago(1),
  },
  {
    id: "demo-4",
    name: "Update error handling in API routes",
    status: "FINISHED",
    source: { repository: "https://github.com/acme-corp/web-app", ref: "main" },
    target: { branchName: "cursor/update-error-handling-g7h8", url: "https://github.com/acme-corp/web-app", prUrl: "https://github.com/acme-corp/web-app/pull/142" },
    summary: "Added try-catch blocks to all API route handlers, standardized error response format, added Sentry integration for unhandled exceptions.",
    createdAt: ago(12),
  },
  {
    id: "demo-5",
    name: "Refactor auth module to use sessions",
    status: "FINISHED",
    source: { repository: "https://github.com/acme-corp/api-server", ref: "main" },
    target: { branchName: "cursor/refactor-auth-i9j0", url: "https://github.com/acme-corp/api-server", prUrl: "https://github.com/acme-corp/api-server/pull/89" },
    summary: "Replaced JWT tokens with server-side sessions using Redis. Updated all middleware, added session cleanup cron job.",
    createdAt: ago(25),
  },
  {
    id: "demo-6",
    name: "Migrate user table to new schema",
    status: "ERROR",
    source: { repository: "https://github.com/acme-corp/api-server", ref: "develop" },
    target: { branchName: "cursor/migrate-user-table-k1l2", url: "https://github.com/acme-corp/api-server" },
    createdAt: ago(40),
  },
  {
    id: "demo-7",
    name: "Add rate limiting to public endpoints",
    status: "FINISHED",
    source: { repository: "https://github.com/acme-corp/web-app", ref: "main" },
    target: { branchName: "cursor/rate-limiting-m3n4", url: "https://github.com/acme-corp/web-app", prUrl: "https://github.com/acme-corp/web-app/pull/156" },
    summary: "Added sliding window rate limiter using Redis. 100 req/min for authenticated, 20 req/min for anonymous.",
    createdAt: ago(60),
  },
];

export const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: "a1", timestamp: new Date(now.getTime() - 2 * 60_000), type: "completed", agentName: "Update error handling in API routes", detail: "acme-corp/web-app" },
  { id: "a2", timestamp: new Date(now.getTime() - 5 * 60_000), type: "completed", agentName: "Refactor auth module to use sessions", detail: "acme-corp/api-server" },
  { id: "a3", timestamp: new Date(now.getTime() - 8 * 60_000), type: "error", agentName: "Migrate user table to new schema", detail: "acme-corp/api-server" },
  { id: "a4", timestamp: new Date(now.getTime() - 15 * 60_000), type: "completed", agentName: "Add rate limiting to public endpoints", detail: "acme-corp/web-app" },
  { id: "a5", timestamp: new Date(now.getTime() - 30 * 60_000), type: "started", agentName: "Add auth middleware", detail: "acme-corp/web-app" },
];

export function computeDemoStats(agents: CloudAgent[]): AgentStats {
  return {
    running: agents.filter((a) => a.status === "RUNNING").length,
    completed: agents.filter((a) => a.status === "FINISHED").length,
    error: agents.filter((a) => a.status === "ERROR" || a.status === "EXPIRED").length,
    total: agents.length,
  };
}

export const DEMO_CONVERSATION_TEXT = `I'll add authentication middleware to protect the API routes.

First, let me check the existing route structure...

Found 12 route files in \`src/routes/\`. The current setup has no auth checks - all endpoints are public.

**Plan:**
1. Create \`src/middleware/auth.ts\` with JWT verification
2. Add session validation against Redis
3. Apply middleware to all routes except \`/health\` and \`/auth/login\`
4. Add role-based access control for admin endpoints

Working on step 1 now...

Created \`src/middleware/auth.ts\`:
- Extracts Bearer token from Authorization header
- Verifies JWT signature and expiry
- Attaches decoded user to \`req.user\`
- Returns 401 for missing/invalid tokens

Moving to step 2 - adding Redis session validation...

Done with session validation. Each request now checks that the JWT's \`sessionId\` exists in Redis and hasn't been revoked.

Applying middleware to routes... Updated 10 of 12 route files. Skipped \`/health\` and \`/auth/*\`.

Running existing tests to check for breakage... 3 tests failed (expected - they weren't passing auth headers). Updating test fixtures now.

All 47 tests passing. Opening PR.`;
