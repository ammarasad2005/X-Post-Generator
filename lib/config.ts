/**
 * Centralized environment configuration.
 *
 * Architecture change: the app now uses OpenRouter exclusively as the LLM
 * provider. Gemini has been removed entirely because:
 *   - Gemini's free tier has aggressive rate limits (10 RPM, 1500 RPD) that
 *     are easily exhausted by even light traffic.
 *   - The Gemini API is intermittently unavailable for free-tier keys.
 *   - OpenRouter's free model pool (`*:free` models) provides better
 *     availability and a wider model selection.
 *
 * The Google Search grounded crawl step has been removed too, because it was
 * only available via the Gemini SDK. Live web grounding can be re-added later
 * via a separate search API (e.g. Brave Search API) if needed.
 */

const RAW_OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "";

const PLACEHOLDER_VALUES = new Set([
  "",
  "MY_OPENROUTER_API_KEY",
  "MY_GEMINI_API_KEY",
  "MY_APP_URL",
]);

export function isOpenRouterConfigured(): boolean {
  return (
    Boolean(RAW_OPENROUTER_KEY) &&
    !PLACEHOLDER_VALUES.has(RAW_OPENROUTER_KEY)
  );
}

export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

/**
 * Primary OpenRouter model. Override via env to A/B test other free models.
 * Default: google/gemini-2.5-flash:free — best quality / latency ratio of
 * the free tier. The model list below is the fallback chain tried in order
 * if the primary returns a non-200 or parsing fails.
 */
export const OPENROUTER_PRIMARY_MODEL =
  process.env.OPENROUTER_PRIMARY_MODEL ?? "google/gemini-2.5-flash:free";

export const OPENROUTER_FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
];
