import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  // Each test gets a fresh IP so the in-memory bucket does not leak between
  // tests. We can't easily reset the module-level Map without re-importing.
  let ipCounter = 0;
  let ip: string;

  beforeEach(() => {
    ipCounter++;
    ip = `10.0.0.${ipCounter}`;
  });

  it("allows the first 10 requests from a fresh IP", () => {
    for (let i = 0; i < 10; i++) {
      const result = rateLimit(ip);
      expect(result.ok).toBe(true);
    }
  });

  it("blocks the 11th request from the same IP", () => {
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(ip).ok).toBe(true);
    }
    const blocked = rateLimit(ip);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      // retryAfterMs should be positive (within the 1-hour window).
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
      expect(blocked.retryAfterMs).toBeLessThanOrEqual(60 * 60 * 1000);
    }
  });

  it("tracks different IPs independently", () => {
    const ipA = `192.168.1.${ipCounter}`;
    const ipB = `192.168.2.${ipCounter}`;
    for (let i = 0; i < 10; i++) rateLimit(ipA);
    expect(rateLimit(ipA).ok).toBe(false); // A is blocked
    expect(rateLimit(ipB).ok).toBe(true);  // B still has all 10 requests left
  });
});
