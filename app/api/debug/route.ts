import { NextResponse } from "next/server";
import { isOpenRouterConfigured, APP_URL, OPENROUTER_PRIMARY_MODEL } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic endpoint to debug OpenRouter connectivity.
 *
 * ⚠️ This endpoint leaks information about the upstream API key's validity
 * (key prefix, length, OpenRouter account info). Delete this file before
 * going fully to production.
 */
interface CheckResult {
  status?: number;
  status_text?: string;
  body?: string;
  error?: string;
  [key: string]: unknown;
}

export async function GET() {
  const keyConfigured = isOpenRouterConfigured();
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "";

  const out: {
    timestamp: string;
    app_url: string;
    primary_model: string;
    openrouter_key_configured: boolean;
    openrouter_key_length: number;
    openrouter_key_prefix: string;
    openrouter_key_starts_with_sk_or: boolean;
    checks: Record<string, CheckResult | string>;
  } = {
    timestamp: new Date().toISOString(),
    app_url: APP_URL,
    primary_model: OPENROUTER_PRIMARY_MODEL,
    openrouter_key_configured: keyConfigured,
    openrouter_key_length: OPENROUTER_KEY.length,
    openrouter_key_prefix: OPENROUTER_KEY.slice(0, 10) + "...",
    openrouter_key_starts_with_sk_or: OPENROUTER_KEY.startsWith("sk-or-"),
    checks: {},
  };

  if (!keyConfigured) {
    out.checks = { error: "OPENROUTER_API_KEY not configured" };
    return NextResponse.json(out, { status: 503 });
  }

  // Check 1: hit /api/v1/auth/key (free, returns key info)
  try {
    const authRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${OPENROUTER_KEY}` },
    });
    out.checks.auth_key_check = {
      status: authRes.status,
      status_text: authRes.statusText,
      body: await authRes.text(),
    };
  } catch (e) {
    out.checks.auth_key_check = { error: e instanceof Error ? e.message : String(e) };
  }

  // Check 2: list models (free, returns catalog)
  try {
    const modelsRes = await fetch("https://openrouter.ai/api/v1/models");
    const modelsCheck: CheckResult = {
      status: modelsRes.status,
      status_text: modelsRes.statusText,
    };
    if (modelsRes.ok) {
      const modelsJson = await modelsRes.json() as { data?: { id: string }[] };
      const allModels = modelsJson.data?.map((m) => m.id) ?? [];
      modelsCheck.total_models = allModels.length;
      modelsCheck.primary_model_available = allModels.includes(OPENROUTER_PRIMARY_MODEL);
      modelsCheck.sample_free_models = allModels
        .filter((id: string) => id.endsWith(":free"))
        .slice(0, 10);
    }
    out.checks.models_list = modelsCheck;
  } catch (e) {
    out.checks.models_list = { error: e instanceof Error ? e.message : String(e) };
  }

  // Check 3: minimal chat completion (consumes 1-2 tokens of free quota)
  try {
    const chatRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": APP_URL,
        "X-Title": "X Post Generator (debug)",
      },
      body: JSON.stringify({
        model: OPENROUTER_PRIMARY_MODEL,
        messages: [{ role: "user", content: "Say OK" }],
        max_tokens: 5,
      }),
    });
    out.checks.minimal_chat = {
      status: chatRes.status,
      status_text: chatRes.statusText,
      body: (await chatRes.text()).slice(0, 500),
    };
  } catch (e) {
    out.checks.minimal_chat = { error: e instanceof Error ? e.message : String(e) };
  }

  return NextResponse.json(out);
}
