# Multi-stage Dockerfile for x-post-generator.
# Uses Next.js standalone output (next.config.ts: output: 'standalone').

# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Install only what's needed to compute the lockfile hash.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund && \
    # Wipe and reinstall including devDeps so the build stage has everything.
    rm -rf node_modules && \
    npm ci --no-audit --no-fund

# ─── Stage 2: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env: the route module only validates the OpenRouter key at request
# time, not build time. Pass a placeholder to suppress any future warnings.
ENV OPENROUTER_API_KEY=build-placeholder
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 3: run ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS run
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Run as non-root for defense-in-depth.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server + static assets + public.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Lightweight healthcheck — returns 200 only if at least one upstream is
# configured AND the server process is responsive.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
