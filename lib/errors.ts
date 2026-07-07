/**
 * Typed error contract for the /api/generate route.
 *
 * Replaces raw error.message leaks (audit finding C-02) with a small, stable
 * enum that the client can map to user-friendly recovery actions.
 *
 * Every error response from /api/generate is one of these codes, accompanied
 * by a requestId the user can quote in support tickets.
 */

export type ErrorCode =
  | "INVALID_INPUT"          // 400 — body failed zod validation
  | "RATE_LIMITED"           // 429 — per-IP quota exceeded
  | "UPSTREAM_UNAVAILABLE"   // 503 — Gemini + OpenRouter both unreachable
  | "UPSTREAM_INVALID_RESPONSE" // 502 — LLM returned non-conformant JSON
  | "INTERNAL_ERROR";        // 500 — catch-all for unhandled exceptions

export const ERROR_STATUS: Record<ErrorCode, number> = {
  INVALID_INPUT: 400,
  RATE_LIMITED: 429,
  UPSTREAM_UNAVAILABLE: 503,
  UPSTREAM_INVALID_RESPONSE: 502,
  INTERNAL_ERROR: 500,
};

export const ERROR_USER_MESSAGE: Record<ErrorCode, string> = {
  INVALID_INPUT: "The request was malformed. Please check your inputs and try again.",
  RATE_LIMITED: "You've sent too many requests. Please wait an hour and try again.",
  UPSTREAM_UNAVAILABLE: "The AI backend is currently unavailable. Please try again later.",
  UPSTREAM_INVALID_RESPONSE: "The AI backend returned an unexpected response. Please try again.",
  INTERNAL_ERROR: "Something went wrong on our side. Please try again later.",
};

export class UpstreamError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, cause?: unknown) {
    super(code);
    this.name = "UpstreamError";
    this.code = code;
    // Preserve the original cause for server-side logging without exposing it
    // to the client.
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

/**
 * Build the JSON body returned to the client for an error.
 *
 * CRITICAL: never includes the underlying Error.message — only the typed code
 * and a human-readable message that is safe to display.
 */
export function errorResponse(code: ErrorCode, requestId: string) {
  return {
    error: ERROR_USER_MESSAGE[code],
    code,
    requestId,
  };
}
