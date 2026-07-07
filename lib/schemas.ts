/**
 * Zod schemas for /api/generate request body and LLM response.
 *
 * H-02 fix: validate every user-supplied field before it reaches the LLM.
 * H-06 fix: validate LLM output against the response schema before sending
 * to the client — refuse malformed responses instead of forwarding them.
 */
import { z } from "zod";

// ─── Request schema ──────────────────────────────────────────────────────────
export const RequestSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(3, "Topic must be at least 3 characters")
    .max(500, "Topic must be at most 500 characters"),
  strategy: z.enum(["stats-trap", "irony", "underdog", "socratic"]),
  tone: z.enum([
    "objective-trap",
    "sarcastic",
    "passive-aggressive",
    "direct-bait",
  ]),
  sport: z.enum(["football", "cricket", "basketball", "custom"]),
  customContext: z
    .string()
    .max(2000, "Custom context must be at most 2000 characters")
    .optional()
    .default(""),
});
export type ValidatedRequest = z.infer<typeof RequestSchema>;

// ─── Response schema (mirrors the Gemini responseSchema in route.ts) ─────────
const StatItemSchema = z.object({
  label: z.string().min(1).max(40),
  value: z.string().min(1).max(40),
});

const PlayerStatsSchema = z.object({
  name: z.string().min(1).max(80),
  team: z.string().min(1).max(80),
  avatarColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "avatarColor must be a #rrggbb hex code"),
  stats: z.array(StatItemSchema).min(1).max(8),
});

export const GenerationResponseSchema = z.object({
  postText: z.string().min(1).max(500),
  imagePrompt: z.string().min(1).max(2000),
  hashtags: z.array(z.string().min(1).max(40)).min(1).max(10),
  psychologicalAnalysis: z.object({
    concept: z.string().min(1).max(1000),
    halfOneTrigger: z.string().min(1).max(1000),
    halfTwoTrigger: z.string().min(1).max(1000),
    mismatchStrategy: z.string().min(1).max(1000),
  }),
  suggestedStatsCard: z.object({
    title: z.string().min(1).max(120),
    player1: PlayerStatsSchema,
    player2: PlayerStatsSchema,
    provocativeLabel: z.string().min(1).max(200),
  }),
});
export type ValidatedGenerationResponse = z.infer<typeof GenerationResponseSchema>;
