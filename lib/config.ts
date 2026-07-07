/**
 * Centralized environment configuration.
 *
 * H-05 fix: refuse to operate with placeholder env values. Both the
 * /api/generate route and the /api/health route use these helpers so the
 * "is Gemini configured?" question has a single source of truth.
 */

const RAW_GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
const RAW_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "";

const PLACEHOLDER_VALUES = new Set(["", "MY_GEMINI_API_KEY", "MY_APP_URL"]);

export function isGeminiConfigured(): boolean {
  return Boolean(RAW_GEMINI_KEY) && !PLACEHOLDER_VALUES.has(RAW_GEMINI_KEY);
}

export function isOpenRouterConfigured(): boolean {
  return (
    Boolean(RAW_OPENROUTER_KEY) && !PLACEHOLDER_VALUES.has(RAW_OPENROUTER_KEY)
  );
}

export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
