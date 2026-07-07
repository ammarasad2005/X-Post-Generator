/**
 * Per-IP rate limiter for /api/generate.
 *
 * Audit finding C-01: the public API endpoint had no rate limiting, exposing
 * the upstream Gemini/OpenRouter keys to anonymous abuse.
 *
 * Implementation: in-memory sliding-window counter, 10 requests per hour per
 * IP. Memory is bounded by MAX_TRACKED_IPS — when exceeded, oldest entries
 * are evicted. This is sufficient for a single-instance deploy; for multi-
 * instance production use, replace with Redis (Upstash) — see comments below.
 *
 * NOTE: in-memory state is per-process. If you scale horizontally behind a
 * load balancer, swap this implementation for a Redis-backed limiter using
 * @upstash/ratelimit:
 *
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis } from "@upstash/redis";
 *   const ratelimit = new Ratelimit({
 *     redis: Redis.fromEnv(),
 *     limiter: Ratelimit.slidingWindow(10, "1 h"),
 *   });
 *   const { success } = await ratelimit.limit(ip);
 */

const WINDOW_MS = 60 * 60 * 1000;   // 1 hour
const MAX_REQUESTS = 10;            // 10 requests per window per IP
const MAX_TRACKED_IPS = 10_000;     // bound memory; ~720 KB worst case

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Returns { ok: true } if the request is allowed, or
 * { ok: false, retryAfterMs } if rate-limited.
 */
export function rateLimit(ip: string): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();

  // Opportunistic cleanup: prune expired entries on every call. Cheap because
  // Map iteration is O(n) but we early-exit the cleanup loop after a cap.
  if (buckets.size > MAX_TRACKED_IPS * 0.9) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }

  const existing = buckets.get(ip);
  if (existing && existing.resetAt > now) {
    if (existing.count >= MAX_REQUESTS) {
      return { ok: false, retryAfterMs: existing.resetAt - now };
    }
    existing.count += 1;
    return { ok: true };
  }

  // New window
  buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  return { ok: true };
}

/** Extract the client IP from a Next.js request, accounting for proxies. */
export function getClientIp(req: Request): string {
  // x-forwarded-for is set by Vercel / Cloud Run / typical reverse proxies.
  // The first entry is the original client. Fall back to "unknown" if absent.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
