import { describe, it, expect } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  it("emits a single JSON line per call", () => {
    const lines: string[] = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      lines.push(chunk.toString());
      return true;
    }) as typeof process.stdout.write;
    try {
      logger.info("test_event", { requestId: "rid-1", foo: "bar" });
    } finally {
      process.stdout.write = orig;
    }
    expect(lines.length).toBe(1);
    const parsed = JSON.parse(lines[0]);
    expect(parsed.level).toBe("info");
    expect(parsed.msg).toBe("test_event");
    expect(parsed.requestId).toBe("rid-1");
    expect(parsed.foo).toBe("bar");
    expect(parsed.ts).toBeTruthy();
  });

  it("redacts sensitive keys", () => {
    const lines: string[] = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      lines.push(chunk.toString());
      return true;
    }) as typeof process.stdout.write;
    try {
      logger.info("leak_test", {
        apiKey: "sk-secret",
        topic: "user-supplied-prompt-injection-attempt",
        postText: "AI generated content",
        safeField: "ok",
      });
    } finally {
      process.stdout.write = orig;
    }
    const parsed = JSON.parse(lines[0]);
    expect(parsed.apiKey).toBe("[REDACTED]");
    expect(parsed.topic).toBe("[REDACTED]");
    expect(parsed.postText).toBe("[REDACTED]");
    expect(parsed.safeField).toBe("ok");
  });

  it("truncates very long string values to 200 chars", () => {
    const lines: string[] = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      lines.push(chunk.toString());
      return true;
    }) as typeof process.stdout.write;
    try {
      logger.info("trunc_test", { longField: "x".repeat(500) });
    } finally {
      process.stdout.write = orig;
    }
    const parsed = JSON.parse(lines[0]);
    expect(parsed.longField.length).toBeLessThan(220);
    expect(parsed.longField).toContain("...[truncated]");
  });
});
