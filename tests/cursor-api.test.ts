import { describe, it, expect, vi, beforeEach } from "vitest";
import { CursorApiError } from "../src/lib/cursor-api.js";

describe("CursorApiError", () => {
  it("captures status code and message", () => {
    const err = new CursorApiError(401, "Unauthorized");
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Unauthorized");
    expect(err.name).toBe("CursorApiError");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("cursor-api module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("listAgents calls correct endpoint", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ agents: [{ id: "1", status: "running" }] }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    const { listAgents } = await import("../src/lib/cursor-api.js");
    const agents = await listAgents("test-key");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.cursor.com/v0/agents?limit=100",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      }),
    );
    expect(agents).toHaveLength(1);
    expect(agents[0]!.id).toBe("1");
  });

  it("throws CursorApiError on non-ok response", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: () => Promise.resolve("Invalid token"),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    const { listAgents } = await import("../src/lib/cursor-api.js");

    await expect(listAgents("bad-key")).rejects.toThrow(CursorApiError);
    await expect(listAgents("bad-key")).rejects.toThrow("401");
  });

  it("validateApiKey returns true on success", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ agents: [] }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    const { validateApiKey } = await import("../src/lib/cursor-api.js");
    expect(await validateApiKey("good-key")).toBe(true);
  });

  it("validateApiKey returns false on failure", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: () => Promise.resolve(""),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    const { validateApiKey } = await import("../src/lib/cursor-api.js");
    expect(await validateApiKey("bad-key")).toBe(false);
  });
});
