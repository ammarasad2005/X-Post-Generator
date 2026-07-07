import { NextResponse } from "next/server";
import { isOpenRouterConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Lightweight health-check endpoint.
 *
 * Returns 200 if the server process is alive and at least one upstream
 * provider is configured. Returns 503 if no upstream is available (so a load
 * balancer can pull the instance out of rotation).
 *
 * Intentionally does NOT call OpenRouter — that would cost quota and would
 * duplicate what /api/generate already does. Operators should pair this with
 * synthetic monitoring that hits /api/generate periodically.
 */
export async function GET() {
  const openrouter = isOpenRouterConfigured();
  const ok = openrouter;

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      upstream: { openrouter },
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
