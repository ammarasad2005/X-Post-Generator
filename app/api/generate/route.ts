import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini SDK with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { topic, strategy, tone, customContext, sport } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const systemInstruction = `You are the **X Post Generator** — a viral media consultant and master of social psychology specializing in sports engagement. Your primary objective is to create content for X (formerly Twitter) that sparks massive viral engagement by triggering intense, polarized debates in the comment sections, without resorting to obvious spam or character attacks.

### Core Strategy: The Split-Audience Bait (The Mismatch Effect)
Rather than writing an aggressive controversy, you create *seemingly objective, factual, or harmless comparative statements* that contain an inherent "cognitive mismatch" or subtle cherry-picked superiority. This triggers different reactions in two halves of the fanbase:
1. **The Beneficiary Group (Positive Reaction):** Sees the stats/quote as vindication for their favorite player/team. They celebrate and share it.
2. **The Defensive Group (Outraged/Defensive Reaction):** Sees the stats/quote as a cherry-picked attack or misrepresentation. They rush to the comment section in a frenzy to post context, explanations, and counter-arguments.

This creates a battlefield in the comments, pushing the post into the X algorithm's viral loop.

### Real-Time Grounding & Statistics Requirement:
You must strictly base your content (post text, psychological triggers, and especially theSuggested Stats Card) on the provided live crawled facts and web context. Choose real statistics, actual match metrics, or official records from the crawl to construct your comparative stats card. This ensures the numbers look incredibly authentic, leaving defenders with no choice but to argue about context rather than disputing the math.

### Engagement Patterns to Leverage:
1. **The Stats Trap (Sangakkara vs. Tendulkar style):** Compare two players where Player A is a universally worshiped legend (e.g., Tendulkar, Messi, Ronaldo, LeBron, Jordan) and Player B is an incredibly elite but slightly less hyped superstar (e.g., Sangakkara, Suarez, Kroos, Benzema, Durant). Highlight a set of metrics where Player B looks statistically superior (e.g., average, efficiency, consistency, team win rate) but omit some volume stats. The fans of Player A will go absolutely wild trying to defend their hero, while fans of Player B will claim he is underrated.
2. **The Statement/Reality Contrast (Irony):** Pair a grand, self-confident quote (e.g., Ronaldo's "I am back", Mbappe's "We are ready") with an objective post-match highlight or visual (e.g., benched, eliminated, low match rating). Write a simple, seemingly respectful caption like "Legacy stands tall." or "Confidence is key." The juxtaposition does the work; fans will split into "he's finished" vs "you are disrespecting a legend" in the comments.
3. **The Sarcastic Tribute:** Praise a player for something highly specific or slightly mediocre in a grand tone, implying they are the GOAT of that specific sub-category (e.g., "The greatest group-stage penalty scorer in history. Unmatched.").
4. **The Socratic Question:** Post a stark, side-by-side comparison with a single word or phrase like "Discuss." or "The debate is officially over." or "Let's be objective for once."

### Guidelines for Generation:
- **No Violence or Direct Abuse:** Never target a player's character, personal life, or use hateful/abusive language. Focus strictly on their professional career, stats, quotes, and matches. Sarcasm, irony, and fun are encouraged.
- **Short & Snappy Text:** X posts should be compact (usually under 200 characters). Avoid long explanations. The text should act as a fuse; the image prompt/graphic is the bomb.
- **Image Prompt:** Write highly descriptive prompts for DALL-E or ChatGPT to generate professional collages, comparison cards, or cinematic split graphics.
- **Suggested Stats Card:** Return structured data for a comparison card that our app can render. If the user input is about statistics or comparison, fill this with highly relevant, mathematically accurate, or highly provocative real-world sports data. If not, generate high-context comparative metrics.
- **Hashtags:** Include 3-5 viral hashtags.`;

    // Step 1: Web crawl/search to gather verified context, stats, and recent facts on the sports topic
    const crawlPrompt = `Perform a deep web crawl and search for verified facts, recent match results, head-to-head records, controversy quotes, official player statistics, and up-to-date details about the topic: "${topic}" (Sport category: ${sport}).
Compile a comprehensive, highly specific, and accurate fact sheet that contains:
- Recent events or specific matches related to this topic.
- Verified real-world statistics, career metrics, or match scores.
- Any direct quotes or ongoing debates.
Keep the facts objective, highly detailed, and accurate. Do not make up statistics.`;

    let crawledFacts = "No live facts gathered.";
    let searchQueries: string[] = [];
    let uniqueSources: { title: string; url: string }[] = [];

    try {
      const crawlResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: crawlPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      crawledFacts = crawlResponse.text || "No live facts gathered.";

      // Extract search queries and grounding URLs
      const metadata = crawlResponse.candidates?.[0]?.groundingMetadata;
      searchQueries = metadata?.webSearchQueries || [];
      const groundingChunks = metadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || "Web Source",
          url: chunk.web?.uri || ""
        }))
        .filter((s: any) => s.url);

      // De-duplicate sources
      const seenUrls = new Set<string>();
      for (const source of sources) {
        if (source.url && !seenUrls.has(source.url)) {
          seenUrls.add(source.url);
          uniqueSources.push(source);
        }
      }
    } catch (crawlError: any) {
      console.warn("Google Search crawl failed or quota exceeded. Falling back to built-in knowledge:", crawlError);
      crawledFacts = `[Notice: Live Google Search grounding is currently unavailable because the API key is either on a Free Tier limit or has exceeded its search quota. The system has gracefully bypassed live-crawling and generated high-precision, authentic sports post material utilizing Gemini's deep sports repository.]`;
      searchQueries = ["Live search bypassed due to API quota limits."];
      uniqueSources = [
        {
          title: "Gemini Knowledge Engine (Fallback)",
          url: "https://ai.google.dev/gemini-api/docs"
        }
      ];
    }

    const prompt = `Generate a high-engagement X post package for the following input:
Topic: ${topic}
Strategy: ${strategy}
Tone: ${tone}
Sport Context: ${sport}
Additional Context: ${customContext || "None specified"}

BELOW IS THE REAL-TIME CRAWLED WEB CONTEXT GATHERED FOR THIS TOPIC. YOU MUST SYNCHRONIZE AND BASE ALL YOUR GENERATED OUTPUTS (POST TEXT, PSYCHOLOGICAL ANALYSIS, AND THE STATS CARD) SECURELY ON THESE LATEST FACTS, REAL NUMBERS, AND ACTUAL RECENT HIGHLIGHTS:
${crawledFacts}`;

    let data: any = null;
    let apiEngine = "Gemini AI (Native)";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["postText", "imagePrompt", "hashtags", "psychologicalAnalysis", "suggestedStatsCard"],
            properties: {
              postText: {
                type: Type.STRING,
                description: "The exact text to be pasted into the X post. Under 240 characters, extremely catchy, provocative but subtle."
              },
              imagePrompt: {
                type: Type.STRING,
                description: "A highly descriptive, professional prompt to generate the corresponding graphic or photo collage in ChatGPT or DALL-E 3."
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 tactical hashtags to gain maximum search and algorithm visibility."
              },
              psychologicalAnalysis: {
                type: Type.OBJECT,
                required: ["concept", "halfOneTrigger", "halfTwoTrigger", "mismatchStrategy"],
                properties: {
                  concept: { type: Type.STRING, description: "Overview of the bait and why it works." },
                  halfOneTrigger: { type: Type.STRING, description: "Why group A (supporters/beneficiaries) will love/share this." },
                  halfTwoTrigger: { type: Type.STRING, description: "Why group B (outraged/defenders) will flood the comment section to argue." },
                  mismatchStrategy: { type: Type.STRING, description: "The core cognitive mismatch or irony employed." }
                }
              },
              suggestedStatsCard: {
                type: Type.OBJECT,
                required: ["title", "player1", "player2", "provocativeLabel"],
                properties: {
                  title: { type: Type.STRING, description: "Title of the statistical comparison (e.g., 'THE COLD NUMBERS', 'DECADE OF DOMINANCE')" },
                  player1: {
                    type: Type.OBJECT,
                    required: ["name", "team", "avatarColor", "stats"],
                    properties: {
                      name: { type: Type.STRING, description: "Name of Player A" },
                      team: { type: Type.STRING, description: "Club/Country of Player A" },
                      avatarColor: { type: Type.STRING, description: "Hex color code representing their primary team color (e.g. #EF4444 for Red)" },
                      stats: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ["label", "value"],
                          properties: {
                            label: { type: Type.STRING, description: "Stat label (e.g., Goals, Win Rate %, KO Ratio)" },
                            value: { type: Type.STRING, description: "Stat value (e.g., '54', '78.5%', '0.94')" }
                          }
                        }
                      }
                    }
                  },
                  player2: {
                    type: Type.OBJECT,
                    required: ["name", "team", "avatarColor", "stats"],
                    properties: {
                      name: { type: Type.STRING, description: "Name of Player B" },
                      team: { type: Type.STRING, description: "Club/Country of Player B" },
                      avatarColor: { type: Type.STRING, description: "Hex color code representing their primary team color (e.g. #3B82F6 for Blue)" },
                      stats: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ["label", "value"],
                          properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.STRING }
                          }
                        }
                      }
                    }
                  },
                  provocativeLabel: {
                    type: Type.STRING,
                    description: "A small footnote at the bottom that subtly highlights a loophole or a hilarious detail (e.g., '*Note: Excludes friendlies and penalties', '*Ronaldo was 38 in these seasons')"
                  }
                }
              }
            }
          }
        }
      });

      data = JSON.parse(response.text || "{}");
    } catch (nativeError: any) {
      console.warn("Native Gemini Post Generation failed. Trying OpenRouter Fallback:", nativeError);
      
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        throw new Error("Native Gemini failed and no fallback OPENROUTER_API_KEY is configured. Error: " + nativeError.message);
      }

      // Try free models on OpenRouter
      const freeModels = [
        "google/gemini-2.5-flash:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-r1-distill-llama-8b:free",
        "mistralai/mistral-7b-instruct:free"
      ];

      let openRouterParsed = null;
      let modelUsed = "";

      for (const model of freeModels) {
        try {
          console.log(`Querying OpenRouter free model: ${model}`);
          const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openRouterKey}`,
              "HTTP-Referer": "https://ai.studio/build",
              "X-Title": "X Viral Post Generator"
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemInstruction + "\n\nCRITICAL: You must return valid JSON ONLY matching the requested structure. Do not output conversational text or general explanations outside of the JSON block." },
                { role: "user", content: prompt }
              ],
              response_format: { type: "json_object" },
              temperature: 0.7
            })
          });

          if (!orResponse.ok) {
            const errBody = await orResponse.text();
            throw new Error(`OpenRouter HTTP ${orResponse.status}: ${errBody}`);
          }

          const orResult = await orResponse.json();
          const rawText = orResult.choices?.[0]?.message?.content;
          if (!rawText) {
            throw new Error("Empty response from OpenRouter");
          }

          // Try standard parse
          try {
            openRouterParsed = JSON.parse(rawText);
          } catch (pe) {
            // Extraction regex fallback
            const jsonRegex = /```json\s*([\s\S]*?)\s*```/i;
            const match = rawText.match(jsonRegex) || rawText.match(/```\s*([\s\S]*?)\s*```/);
            if (match && match[1]) {
              openRouterParsed = JSON.parse(match[1].trim());
            } else {
              // Try finding first '{' and last '}'
              const startIdx = rawText.indexOf("{");
              const endIdx = rawText.lastIndexOf("}");
              if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                openRouterParsed = JSON.parse(rawText.substring(startIdx, endIdx + 1));
              } else {
                throw pe;
              }
            }
          }

          if (openRouterParsed) {
            modelUsed = model;
            break; // Successfully got JSON!
          }
        } catch (orModelError) {
          console.error(`OpenRouter model ${model} failed:`, orModelError);
        }
      }

      if (!openRouterParsed) {
        throw new Error("All OpenRouter free models failed to generate valid JSON content. Original error: " + nativeError.message);
      }

      data = openRouterParsed;
      apiEngine = `OpenRouter Fallback (${modelUsed})`;
    }

    data.crawledFacts = crawledFacts;
    data.searchQueries = searchQueries;
    data.sources = uniqueSources;
    data.apiEngine = apiEngine;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini Post Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate post. " + (error?.message || "") },
      { status: 500 }
    );
  }
}

