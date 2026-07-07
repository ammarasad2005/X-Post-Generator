<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# X-Post-Generator

Create high-engagement, split-audience psychological "bait" posts for X (Twitter) — designed to spark debates and build follower bases using stats, subtle ironies, and current sports events. Built on Next.js 15 + **OpenRouter** (uses free-tier models exclusively — no Gemini dependency).

> View in AI Studio: https://ai.studio/apps/81cc93de-b6a0-4e2b-8f5d-853a7a493b0a

## ⚠️ Responsible Use

This tool generates content **designed to provoke polarized reactions** about real, named athletes. Use it responsibly:

- Do not publish defamatory, harassing, or knowingly false content.
- Disclose AI-generated content where required by your jurisdiction.
- The operator is solely responsible for the content they publish.

The app includes a 30-day TTL on locally-saved drafts and a "Clear All Drafts" button so you can wipe generated content from your device at any time.

## Run Locally

**Prerequisites:** Node.js 20+ (tested on Node 22).

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables.** Copy the example file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local`:
   | Variable | Required | Description |
   |---|---|---|
   | `OPENROUTER_API_KEY` | **Yes** | Get a free key at https://openrouter.ai/keys |
   | `APP_URL` | No | The URL where this app is hosted (used as OpenRouter `HTTP-Referer`). Defaults to `http://localhost:3000`. |
   | `OPENROUTER_PRIMARY_MODEL` | No | Override the primary free model. Default: `google/gemini-2.5-flash:free`. Browse all free models at https://openrouter.ai/models?q=free |
   | `LOG_LEVEL` | No | One of `debug` \| `info` \| `warn` \| `error`. Default: `info`. |

   > ⚠️ **Important:** if `OPENROUTER_API_KEY` is empty or still set to a placeholder value, the API route will return a typed `UPSTREAM_UNAVAILABLE` (HTTP 503) error on every request. The app will not silently fail.

3. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build (outputs to `.next/standalone/`) |
| `npm start` | Start production server (`node .next/standalone/server.js`) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checker |
| `npm run clean` | Remove the `.next/` build cache |

## Production Deployment

The app is configured with `output: 'standalone'` (see `next.config.ts`). After `npm run build`, the entire self-contained server lives at `.next/standalone/server.js`. To run it:

```bash
NODE_ENV=production node .next/standalone/server.js
```

You will also need to copy the `.next/static` and `public/` directories alongside the standalone server (Next.js emits these separately). The exact deployment story depends on your platform:

- **Cloud Run:** Copy `.next/standalone`, `.next/static`, and `public/` into the image. Set `OPENROUTER_API_KEY`, `APP_URL` via the Cloud Run secrets mechanism.
- **Vercel:** Push the repo and import it. Vercel handles `output: 'standalone'` automatically. Set env vars in the project settings.
- **Docker:** A minimal Dockerfile based on `node:22-alpine` is sufficient — copy the standalone output and run `node server.js`.

## Architecture

- **Frontend:** Single-page React 19 client (`app/page.tsx`) with Tailwind CSS 4, motion, and lucide-react icons. Drafts persist to `localStorage` with a 30-day TTL and 50-entry cap.
- **Backend:** One API route (`app/api/generate/route.ts`) that:
  1. Validates input with `zod` (lib/schemas.ts)
  2. Rate-limits per IP (lib/rate-limit.ts, 10 req/hour, in-memory)
  3. Calls OpenRouter's free-tier models — tries the primary model first (`OPENROUTER_PRIMARY_MODEL`, default `google/gemini-2.5-flash:free`), falls back through `meta-llama/llama-3.3-70b-instruct:free` → `mistralai/mistral-7b-instruct:free` → `qwen/qwen-2.5-72b-instruct:free` if the primary returns an error or unparseable JSON.
  4. Validates the LLM response against the zod schema before returning
- **Provider choice:** OpenRouter exclusively. The original Gemini integration was removed because (a) Gemini's free tier has aggressive rate limits (10 RPM, 1500 RPD) that are easily exhausted, and (b) the Gemini API is intermittently unavailable for free-tier keys. OpenRouter's free model pool provides better availability and a wider model selection.
- **No live web grounding:** The previous Google Search grounded crawl step was removed because it was only available via the Gemini SDK. The model now uses its training knowledge. If you need live grounding, add a separate search API (e.g. Brave Search API) and re-introduce a 2-step pipeline.
- **Error contract:** Every error response is one of `INVALID_INPUT` / `RATE_LIMITED` / `UPSTREAM_UNAVAILABLE` / `UPSTREAM_INVALID_RESPONSE` / `INTERNAL_ERROR`, accompanied by a `requestId` for support correlation. Internal exception details are never exposed to the client.
- **Logging:** Structured JSON logger (lib/logger.ts) with `requestId` propagation, PII redaction (user-supplied `topic`/`customContext`/`postText` are always redacted), and log-level control via `LOG_LEVEL`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Every generate request returns `UPSTREAM_UNAVAILABLE` (HTTP 503) | `OPENROUTER_API_KEY` not set or still placeholder | Set a real key in `.env.local` |
| Generate requests return `UPSTREAM_INVALID_RESPONSE` (HTTP 502) | All free models returned unparseable JSON | Try a different `OPENROUTER_PRIMARY_MODEL` (some free models struggle with strict JSON schema) |
| Build fails with "Cannot find module 'autoprefixer'" | Dependencies not fully installed | Run `npm install` again |
| `npm start` complains about `output: 'standalone'` | You're using an old start script | Use `node .next/standalone/server.js` (the default `start` script already does this) |
| Rate-limited after a few requests | Per-IP limit is 10 req/hour | Wait an hour, or run your own instance |
| `429 Too Many Requests` from OpenRouter (not from this app) | The free model's global rate limit is hit | Set `OPENROUTER_PRIMARY_MODEL` to a different free model, or upgrade to a paid OpenRouter tier |

## License

See the AI Studio applet terms at https://ai.studio/terms.
