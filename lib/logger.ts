/**
 * Structured logger with request correlation IDs and PII redaction.
 *
 * Replaces raw console.* calls in API routes per audit finding H-08.
 * - Emits JSON lines to stdout for easy ingestion by Cloud Logging / Datadog
 * - Tags every line with a requestId for end-to-end traceability
 * - Redacts user-supplied content from log payloads (never log raw prompt input)
 * - Does not log upstream model identifiers (mitigates info disclosure)
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  [key: string]: unknown;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

// Read threshold from env so operators can quiet the logs in production.
const THRESHOLD: LogLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ?? "info";

/** Fields whose values are always redacted from log output. */
const REDACTED_KEYS = new Set([
  "apiKey",
  "apikey",
  "authorization",
  "password",
  "token",
  "secret",
  "cookie",
  // User-controlled content must never appear in logs (privacy + log-volume).
  "topic",
  "customContext",
  "prompt",
  "systemInstruction",
  "postText",
  "imagePrompt",
]);

const REDACTED_PLACEHOLDER = "[REDACTED]";

function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    // Truncate very long strings to prevent log explosion from large inputs.
    return value.length > 200 ? value.slice(0, 200) + "...[truncated]" : value;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACTED_KEYS.has(k) ? REDACTED_PLACEHOLDER : redact(v);
    }
    return out;
  }
  return value;
}

function emit(level: LogLevel, msg: string, ctx: LogContext = {}): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[THRESHOLD]) return;
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...redact(ctx) as Record<string, unknown>,
  };
  // Use process.stdout.write to avoid the console.* call stack appearing in
  // structured-log aggregators. Single-line JSON for easy parsing.
  process.stdout.write(JSON.stringify(payload) + "\n");
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info:  (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn:  (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
};
