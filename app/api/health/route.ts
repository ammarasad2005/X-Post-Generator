import { NextResponse } from "next/server";
import { isGeminiConfigured, isOpenRouterConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Lightweight health-check endpoint.
 *
 * Returns 200 if the server process is alive, with a status object indicating
 * whether upstream providers are configured. Returns 503 if no upstream is
 * available (so a load balancer can pull the instance out of rotation).
 *
 * Intentionally does NOT call Gemini/OpenRouter — that would cost quota and
 * would duplicate what /api/generate already does. Operators should pair this
 * with synthetic monitoring that hits /api/generate periodically.
 */
export async function GET() {
  const gemini = isGeminiConfigured();
  const openrouter = isOpenRouterConfigured();
  const ok = gemini || openrouter; // at least one upstream must be available

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      upstream: { gemini, openrouter },
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
