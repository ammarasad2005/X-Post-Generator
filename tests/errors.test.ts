import { describe, it, expect } from "vitest";
import { ERROR_STATUS, errorResponse, UpstreamError } from "@/lib/errors";

describe("ERROR_STATUS", () => {
  it("maps every code to a valid HTTP status", () => {
    expect(ERROR_STATUS.INVALID_INPUT).toBe(400);
    expect(ERROR_STATUS.RATE_LIMITED).toBe(429);
    expect(ERROR_STATUS.UPSTREAM_UNAVAILABLE).toBe(503);
    expect(ERROR_STATUS.UPSTREAM_INVALID_RESPONSE).toBe(502);
    expect(ERROR_STATUS.INTERNAL_ERROR).toBe(500);
  });
});

describe("errorResponse", () => {
  it("returns a typed envelope with a requestId", () => {
    const r = errorResponse("RATE_LIMITED", "abc-123");
    expect(r.code).toBe("RATE_LIMITED");
    expect(r.requestId).toBe("abc-123");
    // Critical: the response must NOT include raw error.message.
    expect(JSON.stringify(r)).not.toContain("Error:");
    expect(JSON.stringify(r)).not.toContain("stack");
  });

  it("includes a human-readable error message", () => {
    const r = errorResponse("UPSTREAM_UNAVAILABLE", "x");
    expect(typeof r.error).toBe("string");
    expect(r.error.length).toBeGreaterThan(10);
  });
});

describe("UpstreamError", () => {
  it("carries the typed code", () => {
    const e = new UpstreamError("UPSTREAM_INVALID_RESPONSE");
    expect(e.code).toBe("UPSTREAM_INVALID_RESPONSE");
    expect(e instanceof Error).toBe(true);
  });

  it("preserves cause for server-side logging", () => {
    const cause = new Error("SDK said 404");
    const e = new UpstreamError("UPSTREAM_UNAVAILABLE", cause);
    expect((e as { cause?: unknown }).cause).toBe(cause);
  });
});
