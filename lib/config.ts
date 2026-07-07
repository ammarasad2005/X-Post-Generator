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
 *
 * Default: nvidia/nemotron-3-ultra-550b-a55b:free — as of 2026-07-07 this is
 * the most reliable free model on OpenRouter (1M context, 550B params, lower
 * traffic so less likely to hit global rate limits). The fallback chain below
 * is tried in order if the primary returns a non-200 or parsing fails.
 *
 * Note: google/gemini-2.5-flash:free was the previous default but is no
 * longer available on the free tier (OpenRouter moved it to paid-only).
 * meta-llama/llama-3.3-70b-instruct:free, openai/gpt-oss-120b:free, and
 * qwen/qwen3-coder:free are also frequently globally rate-limited during
 * peak hours — kept as fallbacks but not primary.
 *
 * If you have a paid OpenRouter account, set OPENROUTER_PRIMARY_MODEL=
 * google/gemini-2.5-flash (no :free suffix) for higher quality and no
 * shared rate limits.
 *
 * Browse all current free models at https://openrouter.ai/models?q=free
 */
export const OPENROUTER_PRIMARY_MODEL =
  process.env.OPENROUTER_PRIMARY_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b:free";

export const OPENROUTER_FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3-coder:free",
];
