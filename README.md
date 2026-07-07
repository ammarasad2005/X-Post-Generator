<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# X-Post-Generator

Create high-engagement, split-audience psychological "bait" posts for X (Twitter) — designed to spark debates and build follower bases using stats, subtle ironies, and current sports events. Built on Next.js 15 + Google Gemini, with an OpenRouter fallback.

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
   | `GEMINI_API_KEY` | **Yes** | Get one at https://aistudio.google.com/apikey |
   | `APP_URL` | No | The URL where this app is hosted (used as OpenRouter `HTTP-Referer`). Defaults to `http://localhost:3000`. |
   | `OPENROUTER_API_KEY` | No | Fallback used when Gemini quota is exhausted. Get one at https://openrouter.ai/keys |
   | `LOG_LEVEL` | No | One of `debug` \| `info` \| `warn` \| `error`. Default: `info`. |

   > ⚠️ **Important:** if `GEMINI_API_KEY` is empty or still set to the placeholder value `MY_GEMINI_API_KEY`, the API route will return a typed `UPSTREAM_UNAVAILABLE` (HTTP 503) error on every request. The app will not silently fail.

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

- **Cloud Run:** Copy `.next/standalone`, `.next/static`, and `public/` into the image. Set `GEMINI_API_KEY`, `APP_URL`, `OPENROUTER_API_KEY` via the Cloud Run secrets mechanism.
- **Vercel:** Push the repo and import it. Vercel handles `output: 'standalone'` automatically. Set env vars in the project settings.
- **Docker:** A minimal Dockerfile based on `node:22-alpine` is sufficient — copy the standalone output and run `node server.js`.

## Architecture

- **Frontend:** Single-page React 19 client (`app/page.tsx`) with Tailwind CSS 4, motion, and lucide-react icons. Drafts persist to `localStorage` with a 30-day TTL and 50-entry cap.
- **Backend:** One API route (`app/api/generate/route.ts`) that:
  1. Validates input with `zod` (lib/schemas.ts)
  2. Rate-limits per IP (lib/rate-limit.ts, 10 req/hour, in-memory)
  3. Calls Gemini `gemini-2.5-flash` with Google Search grounding for the crawl step
  4. Calls Gemini again with a structured JSON response schema for the main generation
  5. Falls back to OpenRouter free models if Gemini is unavailable
  6. Validates the LLM response against the zod schema before returning
- **Error contract:** Every error response is one of `INVALID_INPUT` / `RATE_LIMITED` / `UPSTREAM_UNAVAILABLE` / `UPSTREAM_INVALID_RESPONSE` / `INTERNAL_ERROR`, accompanied by a `requestId` for support correlation. Internal exception details are never exposed to the client.
- **Logging:** Structured JSON logger (lib/logger.ts) with `requestId` propagation, PII redaction (user-supplied `topic`/`customContext`/`postText` are always redacted), and log-level control via `LOG_LEVEL`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Every generate request returns `UPSTREAM_UNAVAILABLE` (HTTP 503) | `GEMINI_API_KEY` not set or still placeholder | Set a real key in `.env.local` |
| Build fails with "Cannot find module 'autoprefixer'" | Dependencies not fully installed | Run `npm install` again |
| `npm start` complains about `output: 'standalone'` | You're using an old start script | Use `node .next/standalone/server.js` (the default `start` script already does this) |
| Rate-limited after a few requests | Per-IP limit is 10 req/hour | Wait an hour, or run your own instance |

## License

See the AI Studio applet terms at https://ai.studio/terms.
