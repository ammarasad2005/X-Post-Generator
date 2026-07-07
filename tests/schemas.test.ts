import { describe, it, expect } from "vitest";
import {
  RequestSchema,
  GenerationResponseSchema,
} from "@/lib/schemas";

describe("RequestSchema", () => {
  const valid = {
    topic: "Messi vs Ronaldo UCL final stats",
    strategy: "stats-trap",
    tone: "objective-trap",
    sport: "football",
    customContext: "recent form data",
  };

  it("accepts a fully valid request", () => {
    expect(RequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a topic shorter than 3 chars", () => {
    const r = RequestSchema.safeParse({ ...valid, topic: "ab" });
    expect(r.success).toBe(false);
  });

  it("rejects a topic longer than 500 chars", () => {
    const r = RequestSchema.safeParse({ ...valid, topic: "x".repeat(501) });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid strategy enum", () => {
    const r = RequestSchema.safeParse({ ...valid, strategy: "troll" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid sport enum", () => {
    const r = RequestSchema.safeParse({ ...valid, sport: "baseball" });
    expect(r.success).toBe(false);
  });

  it("defaults customContext to empty string when omitted", () => {
    const r = RequestSchema.safeParse({
      topic: valid.topic,
      strategy: valid.strategy,
      tone: valid.tone,
      sport: valid.sport,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.customContext).toBe("");
    }
  });

  it("rejects customContext longer than 2000 chars", () => {
    const r = RequestSchema.safeParse({
      ...valid,
      customContext: "x".repeat(2001),
    });
    expect(r.success).toBe(false);
  });
});

describe("GenerationResponseSchema", () => {
  const valid = {
    postText: "The numbers don't lie.",
    imagePrompt: "A minimalist sports graphic comparison card with dark slate background.",
    hashtags: ["#Football", "#GOAT"],
    psychologicalAnalysis: {
      concept: "The Stats Trap.",
      halfOneTrigger: "Supporters will share it.",
      halfTwoTrigger: "Critics will argue in comments.",
      mismatchStrategy: "Contrast volume with efficiency.",
    },
    suggestedStatsCard: {
      title: "THE COLD NUMBERS",
      player1: {
        name: "Player A",
        team: "TEAM A",
        avatarColor: "#EF4444",
        stats: [{ label: "Goals", value: "30" }],
      },
      player2: {
        name: "Player B",
        team: "TEAM B",
        avatarColor: "#3B82F6",
        stats: [{ label: "Goals", value: "28" }],
      },
      provocativeLabel: "*Note: Excludes friendlies.",
    },
  };

  it("accepts a fully valid response", () => {
    expect(GenerationResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid avatarColor (must be #rrggbb)", () => {
    const r = GenerationResponseSchema.safeParse({
      ...valid,
      suggestedStatsCard: {
        ...valid.suggestedStatsCard,
        player1: {
          ...valid.suggestedStatsCard.player1,
          avatarColor: "red",
        },
      },
    });
    expect(r.success).toBe(false);
  });

  it("rejects an empty postText", () => {
    const r = GenerationResponseSchema.safeParse({ ...valid, postText: "" });
    expect(r.success).toBe(false);
  });

  it("rejects an empty hashtags array (min 1)", () => {
    const r = GenerationResponseSchema.safeParse({ ...valid, hashtags: [] });
    expect(r.success).toBe(false);
  });

  it("rejects missing psychologicalAnalysis.halfTwoTrigger", () => {
    const broken = {
      ...valid,
      psychologicalAnalysis: {
        concept: "x",
        halfOneTrigger: "y",
        mismatchStrategy: "z",
        // halfTwoTrigger missing
      },
    };
    expect(GenerationResponseSchema.safeParse(broken).success).toBe(false);
  });
});
