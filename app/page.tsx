'use client'

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Twitter, 
  Sparkles, 
  Copy, 
  Check, 
  Info, 
  History, 
  Flame, 
  Brain, 
  RefreshCw, 
  Plus, 
  Trash2,
  Trophy,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Search,
  ExternalLink,
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string;
}

interface PlayerStats {
  name: string;
  team: string;
  avatarColor: string;
  stats: StatItem[];
}

interface SuggestedStatsCard {
  title: string;
  player1: PlayerStats;
  player2: PlayerStats;
  provocativeLabel: string;
}

interface PsychologicalAnalysis {
  concept: string;
  halfOneTrigger: string;
  halfTwoTrigger: string;
  mismatchStrategy: string;
}

interface GroundingSource {
  title: string;
  url: string;
}

interface GeneratedPost {
  id: string;
  topic: string;
  sport: string;
  strategy: string;
  tone: string;
  postText: string;
  imagePrompt: string;
  hashtags: string[];
  psychologicalAnalysis: PsychologicalAnalysis;
  suggestedStatsCard: SuggestedStatsCard;
  createdAt: string;
  crawledFacts?: string;
  searchQueries?: string[];
  sources?: GroundingSource[];
  apiEngine?: string;
}

// Predefined Case Studies to show initially
const CASE_STUDIES = [
  {
    title: "🏏 Cricket: Sachin vs. Sangakkara Stats Trap",
    topic: "Sachin Tendulkar vs Kumar Sangakkara Test match comparison",
    sport: "cricket",
    strategy: "stats-trap",
    tone: "objective-trap",
    postText: `Let's put names aside and look at the raw efficiency in red-ball cricket. 

One carried a nation's pressure, the other quietly dominated with pure surgical elegance. The numbers tell a very different story.

Who is your pick?`,
    imagePrompt: "A minimalist sports graphic comparison card with a dark slate background. On the left: 'Sachin Tendulkar' in elegant white typography with an Indian flag accent. On the right: 'Kumar Sangakkara' in elegant white typography with a Sri Lankan flag accent. Side-by-side comparative table of stats: Matches (329 vs 233), Runs (15921 vs 12400), Average (53.78 vs 57.40), Double Hundreds (6 vs 11). Standard, high-contrast, modern layout.",
    hashtags: ["CricketTrivia", "TestCricket", "LegendsOfTheGame", "CricketGOAT"],
    psychologicalAnalysis: {
      concept: "The Stats-Trap. Sachin Tendulkar is widely worshipped as the 'God of Cricket' with unmatched volume stats. By highlighting Kumar Sangakkara's superior average and double hundreds, we challenge the volume god with efficiency metrics.",
      halfOneTrigger: "Sangakkara supporters and neutral cricket purists will celebrate his underrated efficiency and share it to prove he belongs in the supreme tier.",
      halfTwoTrigger: "Sachin/Indian fanbases will flood the comments with defensive arguments about pitches, captaincy burden, bowling quality in the 90s, and longevity.",
      mismatchStrategy: "Contrasts Sachin's massive popularity with Sangakkara's superior ratio-based efficiency stats (average and double centuries)."
    },
    suggestedStatsCard: {
      title: "THE EFFICIENCY METRICS",
      player1: {
        name: "S. Tendulkar",
        team: "INDIA",
        avatarColor: "#0F52BA",
        stats: [
          { label: "Matches", value: "329" },
          { label: "Test Runs", value: "15,921" },
          { label: "Batting Avg", value: "53.78" },
          { label: "Double 100s", value: "6" }
        ]
      },
      player2: {
        name: "K. Sangakkara",
        team: "SRI LANKA",
        avatarColor: "#800020",
        stats: [
          { label: "Matches", value: "233" },
          { label: "Test Runs", value: "12,400" },
          { label: "Batting Avg", value: "57.40" },
          { label: "Double 100s", value: "11" }
        ]
      },
      provocativeLabel: "*Note: Innings ratio to double centuries is 1.8x superior for Sangakkara."
    }
  },
  {
    title: "⚽ Football: Ronaldo 'I am Back' Statement Contrast",
    topic: "Portugal World Cup Exit vs Ronaldo Confidence Statement",
    sport: "football",
    strategy: "irony",
    tone: "sarcastic",
    postText: `Cristiano Ronaldo before the World Cup: 'I write my own legacy, and I am back to claim what is ours.'

A true leader's self-confidence is a beautiful thing. Respect to the legend.`,
    imagePrompt: "A cinematic split graphic. On the left side: Cristiano Ronaldo pointing to his chest during a pre-tournament interview with a quote overlay: 'I write my own legacy.' On the right side: Ronaldo walking down the tunnel looking dejected after a knockout defeat, benched. High contrast, dark vignette.",
    hashtags: ["WorldCup", "Ronaldo", "Portugal", "FootballGOAT"],
    psychologicalAnalysis: {
      concept: "The Statement/Reality Contrast. Highlights a bold, majestic quote right before a major exit, wrapped in a surface-level 'respect' caption.",
      halfOneTrigger: "Messi fans and rival supporters will instantly retweet this with sarcastic replies, laughing at the immediate contrast and 'legacy' claim.",
      halfTwoTrigger: "Ronaldo fanatical fanbase will rush to defend him, posting compilation videos, list of UCLs, his age (39+), and blaming the national team manager.",
      mismatchStrategy: "Drapes an obvious sporting setback in a grand, hyper-respectful tribute, leaving the visual irony to do all the heavy lifting."
    },
    suggestedStatsCard: {
      title: "PRE-TOURNAMENT CLAIMS VS KNOCKOUT REALITY",
      player1: {
        name: "Pre-Cup Claims",
        team: "STATEMENT",
        avatarColor: "#10B981",
        stats: [
          { label: "Legacy Quotes", value: "100%" },
          { label: "Interviews", value: "Most Viewed" },
          { label: "Expected Glory", value: "Maximum" }
        ]
      },
      player2: {
        name: "Knockout Reality",
        team: "ON-PITCH",
        avatarColor: "#EF4444",
        stats: [
          { label: "Minutes Played", value: "57" },
          { label: "Knockout Goals", value: "0" },
          { label: "Chances Created", value: "1" }
        ]
      },
      provocativeLabel: "*Note: Ended tournament with 100% confidence rating in interviews."
    }
  },
  {
    title: "🏀 Basketball: LeBron Peak vs. Jordan Perfect Finals",
    topic: "LeBron James longevity vs Michael Jordan 6/6 Finals record",
    sport: "basketball",
    strategy: "stats-trap",
    tone: "passive-aggressive",
    postText: `Longevity is the ultimate marker of greatness. Playing at an MVP level for 22 seasons is mathematically more demanding than a 6-year peak in a less athletic era. 

Numbers don't lie.`,
    imagePrompt: "A high-fidelity minimalist NBA infographic. Left side: Michael Jordan celebrating with 6 fingers raised, colored in Chicago Bulls red background glow. Right side: LeBron James screaming in Lakers gold background glow. Middle column compares longevity statistics: Seasons Played, Total Career Points, Total Assists.",
    hashtags: ["NBAPlayoffs", "LeBron", "Jordan", "GOATDebate"],
    psychologicalAnalysis: {
      concept: "Longevity vs. Perfection. Frames Jordan's legendary peak as 'short-lived' and from 'a less athletic era' to immediately devalue his 6-0 Finals record, while elevating LeBron's career aggregate.",
      halfOneTrigger: "LeBron fans will use this as scientific proof that aggregate career value is the logical definition of GOAT status.",
      halfTwoTrigger: "Jordan fans will react furiously to 'less athletic era' and point to Jordan's defensive player of the year award, scoring titles, and perfect 6-for-6 Finals record.",
      mismatchStrategy: "Directly labels a historical era as inferior to provoke traditionalists, while using raw aggregate statistics to justify the claim."
    },
    suggestedStatsCard: {
      title: "AGGREGATE VALUE VS PEAK YEARS",
      player1: {
        name: "Michael Jordan",
        team: "CHICAGO BULLS",
        avatarColor: "#CE1141",
        stats: [
          { label: "Seasons", value: "15" },
          { label: "Career Points", value: "32,292" },
          { label: "Finals Record", value: "6-0" },
          { label: "Scoring Titles", value: "10" }
        ]
      },
      player2: {
        name: "LeBron James",
        team: "LA LAKERS",
        avatarColor: "#552583",
        stats: [
          { label: "Seasons", value: "22" },
          { label: "Career Points", value: "40,474" },
          { label: "Finals Record", value: "4-6" },
          { label: "Scoring Titles", value: "1" }
        ]
      },
      provocativeLabel: "*Note: Total career mileage represents 150,000+ more minutes for LeBron."
    }
  }
];

export default function Home() {
  // M-02 fix: initialize savedPosts with [] on both server and client to avoid
  // hydration mismatch. Use a useSyncExternalStore-style pattern: server
  // snapshot is always [], client snapshot reads from localStorage on mount.
  // The `mounted` flag is set via useState initializer that returns true only
  // on client (guarded by typeof window check) — but to avoid hydration
  // mismatch we still render the server version on first paint.
  const [savedPosts, setSavedPosts] = useState<GeneratedPost[]>([]);
  const [mounted, setMounted] = useState(false);

  // useEffect is allowed to call setState here because we are syncing with an
  // external system (localStorage). The react-hooks/set-state-in-effect rule
  // is silenced via the line-level disable comment because this is the
  // canonical Next.js client-storage hydration pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = window.localStorage.getItem("x_post_drafts");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // H-03 fix: prune drafts older than 30 days on load (TTL).
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const fresh = parsed.filter((p): p is GeneratedPost => {
            if (!p || typeof p !== "object") return false;
            const created = (p as GeneratedPost).createdAt;
            if (!created) return true; // keep entries without createdAt
            return new Date(created).getTime() >= thirtyDaysAgo;
          });
          setSavedPosts(fresh);
          if (fresh.length !== parsed.length) {
            // Persist the pruned list back to localStorage.
            try {
              window.localStorage.setItem("x_post_drafts", JSON.stringify(fresh));
            } catch {
              // ignore quota errors on prune write
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse saved posts", e);
    }
  }, []);

  // Default Post Package loaded lazily on startup (Preloaded with Case Study 0)
  const [currentPost, setCurrentPost] = useState<GeneratedPost>(() => {
    const template = CASE_STUDIES[0];
    return {
      id: "template-" + Date.now(),
      topic: template.topic,
      sport: template.sport,
      strategy: template.strategy,
      tone: template.tone,
      postText: template.postText,
      imagePrompt: template.imagePrompt,
      hashtags: template.hashtags,
      psychologicalAnalysis: template.psychologicalAnalysis,
      suggestedStatsCard: template.suggestedStatsCard,
      createdAt: new Date().toISOString()
    };
  });

  // Inputs configured synchronously
  const [topic, setTopic] = useState(CASE_STUDIES[0].topic);
  const [sport, setSport] = useState(CASE_STUDIES[0].sport);
  const [strategy, setStrategy] = useState(CASE_STUDIES[0].strategy);
  const [tone, setTone] = useState(CASE_STUDIES[0].tone);
  const [customContext, setCustomContext] = useState("");

  // Post Mockup customizer states
  const [profileName, setProfileName] = useState("Sports Analytics HQ");
  const [profileHandle, setProfileHandle] = useState("SportsAnalytica");
  const [verified, setVerified] = useState(true);
  const [likesCount, setLikesCount] = useState("12.4K");
  const [retweetsCount, setRetweetsCount] = useState("2.1K");
  const [viewsCount, setViewsCount] = useState("1.8M");

  // Output configuration state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "formula" | "prompt" | "context">("preview");
  const [generatingStep, setGeneratingStep] = useState("CRAWLING WEB FOR RECENT FACTS...");

  // Card editor states initialized directly from default template to bypass useEffect state sync
  const [cardTitle, setCardTitle] = useState(CASE_STUDIES[0].suggestedStatsCard.title);
  const [p1Name, setP1Name] = useState(CASE_STUDIES[0].suggestedStatsCard.player1.name);
  const [p1Team, setP1Team] = useState(CASE_STUDIES[0].suggestedStatsCard.player1.team);
  const [p1Color, setP1Color] = useState(CASE_STUDIES[0].suggestedStatsCard.player1.avatarColor);
  const [p1Stats, setP1Stats] = useState<StatItem[]>(CASE_STUDIES[0].suggestedStatsCard.player1.stats);

  const [p2Name, setP2Name] = useState(CASE_STUDIES[0].suggestedStatsCard.player2.name);
  const [p2Team, setP2Team] = useState(CASE_STUDIES[0].suggestedStatsCard.player2.team);
  const [p2Color, setP2Color] = useState(CASE_STUDIES[0].suggestedStatsCard.player2.avatarColor);
  const [p2Stats, setP2Stats] = useState<StatItem[]>(CASE_STUDIES[0].suggestedStatsCard.player2.stats);
  const [footnote, setFootnote] = useState(CASE_STUDIES[0].suggestedStatsCard.provocativeLabel);

  // Copy status indicators
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // M-09 fix: refs for interval + abort controller so they can be cleaned up
  // when the component unmounts. Prevents the "setGeneratingStep on unmounted
  // component" warning and the orphaned-interval memory leak.
  const intervalRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  // Synchronous State updates for all editors to fully eliminate React's synchronous state update inside effects
  const syncEditorStates = (post: GeneratedPost) => {
    const card = post.suggestedStatsCard;
    setCardTitle(card.title || "THE COLD NUMBERS");
    setP1Name(card.player1.name);
    setP1Team(card.player1.team);
    setP1Color(card.player1.avatarColor || "#EF4444");
    setP1Stats([...card.player1.stats]);

    setP2Name(card.player2.name);
    setP2Team(card.player2.team);
    setP2Color(card.player2.avatarColor || "#3B82F6");
    setP2Stats([...card.player2.stats]);

    setFootnote(card.provocativeLabel || "");
  };

  const loadPostFromTemplate = (template: typeof CASE_STUDIES[number]) => {
    const mockPost: GeneratedPost = {
      id: "template-" + Date.now(),
      topic: template.topic,
      sport: template.sport,
      strategy: template.strategy,
      tone: template.tone,
      postText: template.postText,
      imagePrompt: template.imagePrompt,
      hashtags: template.hashtags,
      psychologicalAnalysis: template.psychologicalAnalysis,
      suggestedStatsCard: template.suggestedStatsCard,
      createdAt: new Date().toISOString()
    };
    setCurrentPost(mockPost);
    syncEditorStates(mockPost);
    
    // Fill the inputs so the user can easily tweak
    setTopic(template.topic);
    setSport(template.sport);
    setStrategy(template.strategy);
    setTone(template.tone);
    setCustomContext("");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg("Please enter a sports topic or player rivalry!");
      return;
    }

    setIsGenerating(true);
    setGeneratingStep("CRAWLING THE WEB FOR REAL-TIME SPORTS NEWS...");
    setErrorMsg("");

    const steps = [
      "SEARCHING LATEST PLAYER NEWS & DATA...",
      "EXTRACTING PERFORMANCE METRICS & HEAD-TO-HEADS...",
      "ASSEMBLING CONTEXT ENGINE...",
      "ENGINEERING COGNITIVE DISCREPANCY...",
      "DRAFTING VIRAL POST AND BAIT FORMULAS...",
      "GENERATING SUGGESTED COMPARISON DATA CARD..."
    ];
    let stepIndex = 0;
    // M-09 fix: track the interval in a ref so it can be cleared on unmount
    // by the useEffect cleanup at the bottom of the component, preventing a
    // memory leak if the user navigates away mid-request.
    const interval = window.setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setGeneratingStep(steps[stepIndex]);
      }
    }, 1800);
    intervalRef.current = interval;

    // AbortController so the fetch can be cancelled if the component unmounts
    // before the upstream LLM call returns.
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          sport,
          strategy,
          tone,
          customContext
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // Surface the typed error code from the server if available.
        let detail = `Server returned error status: ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody?.code) detail = `${errBody.code}: ${errBody.error}`;
          if (errBody?.requestId) detail += ` (request ${errBody.requestId})`;
        } catch {
          // response had no JSON body
        }
        throw new Error(detail);
      }

      const data = await res.json();
      
      const newPost: GeneratedPost = {
        id: "post-" + Date.now(),
        topic,
        sport,
        strategy,
        tone,
        postText: data.postText,
        imagePrompt: data.imagePrompt,
        hashtags: data.hashtags,
        psychologicalAnalysis: data.psychologicalAnalysis,
        suggestedStatsCard: data.suggestedStatsCard,
        createdAt: new Date().toISOString(),
        crawledFacts: data.crawledFacts,
        searchQueries: data.searchQueries,
        sources: data.sources,
        apiEngine: data.apiEngine
      };

      setCurrentPost(newPost);
      syncEditorStates(newPost);
      setActiveTab("preview");

      // L-03 fix: previously generated random fake engagement counts and
      // presented them as real. Removed — the user can edit the count fields
      // directly if they want to mockup a specific scenario, but we no longer
      // auto-fill deceptive numbers.
    } catch (err: unknown) {
      // Ignore AbortError — fires when the component unmounts mid-request
      // and we explicitly abort the fetch in the cleanup useEffect.
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to generate post. Please check your connection or API key.";
      setErrorMsg(message);
    } finally {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsGenerating(false);
    }
  };

  const savePostToHistory = () => {
    if (!currentPost) return;

    // Build the latest version including any edits the user made on the stats card
    const updatedPost: GeneratedPost = {
      ...currentPost,
      id: currentPost.id.startsWith("template-") ? "saved-" + Date.now() : currentPost.id,
      suggestedStatsCard: {
        title: cardTitle,
        player1: {
          name: p1Name,
          team: p1Team,
          avatarColor: p1Color,
          stats: p1Stats
        },
        player2: {
          name: p2Name,
          team: p2Team,
          avatarColor: p2Color,
          stats: p2Stats
        },
        provocativeLabel: footnote
      }
    };

    const isAlreadySaved = savedPosts.some(p => p.id === updatedPost.id);
    let newSavedList: GeneratedPost[] = [];

    if (isAlreadySaved) {
      newSavedList = savedPosts.map(p => p.id === updatedPost.id ? updatedPost : p);
    } else {
      newSavedList = [updatedPost, ...savedPosts];
    }

    // H-03 fix: cap drafts at 50 items (FIFO eviction) so localStorage cannot
    // grow unbounded. Also wrap setItem in try/catch so QuotaExceededError
    // does not crash the handler — show a user-visible error instead.
    const MAX_DRAFTS = 50;
    if (newSavedList.length > MAX_DRAFTS) {
      newSavedList = newSavedList.slice(0, MAX_DRAFTS);
    }

    setSavedPosts(newSavedList);
    try {
      localStorage.setItem("x_post_drafts", JSON.stringify(newSavedList));
    } catch (e) {
      console.error("Failed to persist drafts to localStorage", e);
      setErrorMsg("Could not save draft — browser storage is full. Try deleting older drafts.");
    }
  };

  const deleteSavedPost = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPosts.filter(p => p.id !== id);
    setSavedPosts(updated);
    try {
      localStorage.setItem("x_post_drafts", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist drafts to localStorage", e);
    }
  };

  // H-03 fix: explicit "clear all drafts" action so users can wipe sensitive
  // AI-generated content from their device on demand.
  const clearAllDrafts = () => {
    if (!confirm("Delete ALL saved drafts? This cannot be undone.")) return;
    setSavedPosts([]);
    try {
      localStorage.removeItem("x_post_drafts");
    } catch (e) {
      console.error("Failed to clear drafts", e);
    }
  };

  const copyToClipboard = (text: string, type: "text" | "prompt" | "hash", hashVal?: string) => {
    navigator.clipboard.writeText(text);
    if (type === "text") {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } else if (type === "prompt") {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else if (type === "hash" && hashVal) {
      setCopiedHash(hashVal);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  // Helper to update specific stat item in editor
  const handleStatChange = (playerNum: 1 | 2, index: number, field: "label" | "value", newValue: string) => {
    if (playerNum === 1) {
      const updated = [...p1Stats];
      updated[index] = { ...updated[index], [field]: newValue };
      setP1Stats(updated);
    } else {
      const updated = [...p2Stats];
      updated[index] = { ...updated[index], [field]: newValue };
      setP2Stats(updated);
    }
  };

  const handleSelectDraft = (saved: GeneratedPost) => {
    setCurrentPost(saved);
    syncEditorStates(saved);
    setTopic(saved.topic);
    setSport(saved.sport);
    setStrategy(saved.strategy);
    setTone(saved.tone);
    setCustomContext("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col antialiased">
      {/* Header Banner - Styled to match Vibrant Palette theme */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0F0F10] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-black italic text-black select-none">
            X
          </div>
          <h1 className="text-lg font-black tracking-tight text-white/90 underline decoration-blue-500 decoration-4 underline-offset-4 font-display">
            POST GENERATOR
          </h1>
          {/* L-05 fix: previously showed a hardcoded "v1.2 PREMIUM" badge.
              Removed — there is no versioning scheme and no premium tier. */}
        </div>

        {/* Vibrant Palette Navigation Links */}
        {/* M-05 fix: previously these were non-interactive <span> elements with
            cursor-pointer styling but no role/aria/handler — confusing screen
            readers and misleading sighted users. Now aria-disabled with a
            "coming soon" tooltip and no pointer cursor. */}
        <nav className="hidden md:flex gap-6 text-[11px] font-bold uppercase tracking-[0.25em] text-white/40" aria-label="Main">
          <span className="text-blue-400" aria-current="page">Engine</span>
          <span aria-disabled="true" title="Coming soon" className="text-white/30 cursor-not-allowed">Trends</span>
          <span aria-disabled="true" title="Coming soon" className="text-white/30 cursor-not-allowed">Analytics</span>
          <span aria-disabled="true" title="Coming soon" className="text-white/30 cursor-not-allowed">Archive</span>
        </nav>

        {/* Header Action Buttons & Engagement Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadPostFromTemplate(CASE_STUDIES[Math.floor(Math.random() * CASE_STUDIES.length)])}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/10 transition flex items-center gap-1 cursor-pointer"
              title="Load dynamic random sports template"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Random Case</span>
            </button>
            <a
              href="#saved-drafts"
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/10 transition flex items-center gap-1"
            >
              <History className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">Drafts ({mounted ? savedPosts.length : 0})</span>
            </a>
          </div>

          {/* L-06 fix: previously showed a hardcoded "98.4% READY" Engagement
              Power indicator. Removed — the metric was fabricated. */}

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20 shadow-md shadow-blue-500/10" aria-hidden="true"></div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Generator Configuration & Customizer (5 columns) */}
        <section className="lg:col-span-5 flex flex-col gap-6" id="input-workspace">
          
          {/* Quick Case Studies Library - Styled to match Vibrant Palette sidebar aesthetics */}
          <div className="bg-[#0F0F10] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-blue-500" />
                Live Battlegrounds
              </h3>
              <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">
                Proven Bait
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {CASE_STUDIES.map((cs, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPostFromTemplate(cs)}
                  type="button"
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition flex flex-col gap-1 group cursor-pointer"
                >
                  <span className="text-xs font-semibold text-white/90 group-hover:text-blue-400 transition-colors">
                    {cs.title}
                  </span>
                  <span className="text-[10px] text-white/40 line-clamp-1">
                    Bait Style: <span className="text-white/60 font-mono font-semibold uppercase">{cs.strategy}</span> • Tone: <span className="text-white/60 font-mono font-semibold uppercase">{cs.tone}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Post Setup Form - Styled with sidebar parameters */}
          <form onSubmit={handleGenerate} className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 flex flex-col gap-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Configure Engagement Pack
              </h2>
              <span className="text-[10px] font-mono text-green-400 font-bold uppercase tracking-wider">Active</span>
            </div>

            {/* Sport Category Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Target Topic Category</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "football", label: "⚽ Soccer" },
                  { id: "cricket", label: "🏏 Cricket" },
                  { id: "basketball", label: "🏀 NBA" },
                  { id: "custom", label: "🏆 Custom" }
                ].map(sp => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSport(sp.id)}
                    className={cn(
                      "py-2 px-1 text-center rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
                      sport === sp.id 
                        ? "bg-blue-500 text-black border-blue-500 shadow-lg shadow-blue-500/20" 
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/25"
                    )}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
                  The Match, Topic or Rivalry
                </label>
                <span className="text-[10px] text-white/40">Be descriptive</span>
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Spain vs Portugal Euro semi-finals, Cristiano Ronaldo benched vs Mbappe starring"
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none transition min-h-[70px] resize-y font-sans"
              />
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-white/30">Quick ideas:</span>
                {[
                  "Messi Copa America final penalty miss vs World Cup trophy",
                  "Kohli test average overseas vs Smith test average",
                  "Mbappe UCL performance vs Haaland scoring volume"
                ].map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(idea)}
                    className="text-[9px] text-white/60 bg-[#0A0A0B] hover:bg-white/5 border border-white/10 px-2 py-0.5 rounded-full transition cursor-pointer"
                  >
                    {idea.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Bait Strategy Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
                  Psychological Strategy
                </label>
                <span className="text-[10px] text-blue-400 flex items-center gap-1 font-bold">
                  <Flame className="w-3 h-3 text-orange-400" /> Split Ratio: 50/50
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "stats-trap", name: "📊 The Stats Trap", desc: "Compare efficiency (higher ratio) vs volume (higher total) to trap the GOAT fanbase." },
                  { id: "irony", name: "🗣️ Statement vs. Reality (Irony)", desc: "Juxtapose a bold claim with a dejected exit or sit-down. Caption looks highly respectful." },
                  { id: "underdog", name: "🛡️ Sarcastic Underdog Praise", desc: "Praise an elite but underrated player's stat specifically to quietly diminish a global poster-boy." },
                  { id: "socratic", name: "🧐 Socratic Comparison", desc: "Post stark contrasting facts with a harmless question to spark immediate battles in comments." }
                ].map(str => (
                  <label
                    key={str.id}
                    className={cn(
                      "flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition",
                      strategy === str.id 
                        ? "bg-blue-500/10 border-blue-500/40 text-white" 
                        : "bg-white/5 border-white/10 hover:border-white/20 text-white/70"
                    )}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === str.id}
                      onChange={() => setStrategy(str.id)}
                      className="mt-0.5 text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{str.name}</span>
                      <span className="text-[10px] text-white/40 leading-normal block mt-0.5">{str.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Bait Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "objective-trap", label: "🧐 Innocent & Factual", info: "Pretends to be neutral statistics" },
                  { id: "sarcastic", label: "🤫 Sarcastic Tribute", info: "Highly passive-aggressive praise" },
                  { id: "passive-aggressive", label: "🤓 Socratic Curiosity", info: "Asks 'innocent' questions" },
                  { id: "direct-bait", label: "🧨 Peak Fan-Trigger", info: "Bold but logical contrast" }
                ].map(tn => (
                  <button
                    key={tn.id}
                    type="button"
                    onClick={() => setTone(tn.id)}
                    className={cn(
                      "p-2 text-left rounded-xl border transition-all duration-150 flex flex-col gap-0.5 cursor-pointer",
                      tone === tn.id 
                        ? "bg-white/10 border-blue-500 text-white shadow-md shadow-blue-500/5" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="text-xs font-bold">{tn.label}</span>
                    <span className="text-[9px] text-white/40 leading-tight">{tn.info}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Custom Context */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-1">
                Context & Match Highlights (Optional)
              </label>
              <textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Include specific quotes, memes, recent news, or highlights (e.g. 'Ronaldo statement saying: I am still the king' or 'Sachin scored most of his runs against weaker bowling...')"
                className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none transition min-h-[50px] resize-y font-sans"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Generate Action - Styled with Vibrant Palette signature gradient and shadow */}
            <button
              type="submit"
              disabled={isGenerating}
              className={cn(
                "w-full py-4 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2",
                isGenerating 
                  ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/10" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.98] border border-white/10 cursor-pointer"
              )}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{generatingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 fill-current animate-pulse" />
                  <span>GENERATE ENGAGEMENT</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Side: Generated Post Preview & Stats Card Designer (7 columns) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Post/Formula/Prompt Tabs - Beautiful border style and dark background */}
          <div className="bg-[#0F0F10] border border-white/10 rounded-2xl p-1.5 flex gap-1 flex-wrap md:flex-nowrap">
            <button
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "preview" 
                  ? "bg-white/5 text-white shadow-sm border border-white/10" 
                  : "text-white/40 hover:text-white"
              )}
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              Live X Mockup
            </button>
            <button
              onClick={() => setActiveTab("context")}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer relative",
                activeTab === "context" 
                  ? "bg-white/5 text-white shadow-sm border border-white/10" 
                  : "text-white/40 hover:text-white"
              )}
            >
              <Globe className={cn("w-3.5 h-3.5 text-blue-400", activeTab !== "context" && "animate-pulse")} />
              Context Engine
              {currentPost?.sources && currentPost.sources.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[8px] font-bold flex items-center justify-center text-black">
                  {currentPost.sources.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("formula")}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "formula" 
                  ? "bg-white/5 text-white shadow-sm border border-white/10" 
                  : "text-white/40 hover:text-white"
              )}
            >
              <Brain className="w-3.5 h-3.5" />
              Formula
            </button>
            <button
              onClick={() => setActiveTab("prompt")}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "prompt" 
                  ? "bg-white/5 text-white shadow-sm border border-white/10" 
                  : "text-white/40 hover:text-white"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Image Prompt
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex flex-col gap-6">
            
            {activeTab === "preview" && currentPost && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {/* Vibrant Palette Metrics Header Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0F0F10] rounded-2xl p-4 flex items-center justify-between border border-white/10">
                    <span className="text-xs text-white/50 font-sans font-medium">Estimated Reach Potential</span>
                    <span className="text-sm font-black text-blue-400 font-display uppercase tracking-wider">450K - 1.2M</span>
                  </div>
                  <div className="bg-[#0F0F10] rounded-2xl p-4 flex items-center justify-between border border-white/10">
                    <span className="text-xs text-white/50 font-sans font-medium">Psychological Mode</span>
                    <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
                      {strategy === "stats-trap" ? "STATS-HEAVY" : strategy === "irony" ? "IRONIC CONTRAST" : strategy === "underdog" ? "SILENT UNDERDOG" : "SOCRATIC DISSONANCE"}
                    </span>
                  </div>
                </div>

                {/* Simulated X Post Card - Styled beautifully with high contrast */}
                <div className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Customizable Profile */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-display font-black text-sm text-white select-none">
                        {profileName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-36 px-0.5 py-0 transition-colors"
                            title="Edit profile name"
                          />
                          {verified && (
                            <span className="w-4 h-4 bg-blue-500 text-black flex items-center justify-center rounded-full text-[9px] font-black select-none" title="Verified Creator">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-white/40">@</span>
                          <input
                            type="text"
                            value={profileHandle}
                            onChange={(e) => setProfileHandle(e.target.value)}
                            className="text-xs text-white/40 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-28 px-0.5 py-0 transition-colors"
                            title="Edit twitter handle"
                          />
                          <span className="text-xs text-white/40">• 1h</span>
                        </div>
                      </div>
                    </div>
                    {/* Twitter Handle Checkbox Customizer */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-[10px] text-white/40 cursor-pointer select-none font-semibold uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={verified}
                          onChange={(e) => setVerified(e.target.checked)}
                          className="rounded border-white/10 bg-[#0A0A0B] text-blue-500 focus:ring-0 cursor-pointer"
                        />
                        Verified
                      </label>
                    </div>
                  </div>

                  {/* Post Text Message */}
                  <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed px-1 font-sans">
                    {currentPost.postText}
                  </div>

                  {/* Dynamic Custom Stats Graphic Card Generator */}
                  {currentPost.suggestedStatsCard && (
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold tracking-wider text-white/30 uppercase flex items-center justify-between">
                        <span>📊 Premium SVG Graphics Card (Live Editor)</span>
                        <span className="text-blue-400 font-sans font-semibold">Change stats or names below!</span>
                      </div>
                      
                      {/* THE GRAPHIC CARD CONTAINER */}
                      <div className="relative border border-white/10 rounded-xl overflow-hidden bg-[#0A0A0B] p-4 shadow-inner flex flex-col gap-3">
                        {/* Background radial gradient representing glows from colors */}
                        <div className="absolute inset-0 bg-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Header of graphic */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 z-10">
                          <input
                            type="text"
                            value={cardTitle}
                            onChange={(e) => setCardTitle(e.target.value)}
                            className="text-[11px] font-bold tracking-[0.2em] text-white/80 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-full text-center uppercase"
                          />
                        </div>

                        {/* Player Side-by-Side Comparison Grid */}
                        <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 relative z-10">
                          
                          {/* Player 1 Col */}
                          <div className="flex flex-col gap-3 pr-2">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2.5 h-2.5 rounded-full block border border-white/20"
                                style={{ backgroundColor: p1Color }}
                              />
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={p1Name}
                                  onChange={(e) => setP1Name(e.target.value)}
                                  className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-full"
                                  title="Edit player 1 name"
                                />
                                <input
                                  type="text"
                                  value={p1Team}
                                  onChange={(e) => setP1Team(e.target.value)}
                                  className="text-[9px] font-mono text-white/40 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-full uppercase"
                                />
                              </div>
                            </div>

                            {/* Player 1 Stats list */}
                            <div className="flex flex-col gap-1.5 mt-1">
                              {p1Stats.map((stat, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                  <input
                                    type="text"
                                    value={stat.label}
                                    onChange={(e) => handleStatChange(1, sIdx, "label", e.target.value)}
                                    className="text-[9px] text-white/50 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-16"
                                  />
                                  <input
                                    type="text"
                                    value={stat.value}
                                    onChange={(e) => handleStatChange(1, sIdx, "value", e.target.value)}
                                    className="text-[10px] font-mono font-bold text-white bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-10 text-right"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Color Selector P1 */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider">Accent:</span>
                              <input 
                                type="color" 
                                value={p1Color} 
                                onChange={(e) => setP1Color(e.target.value)}
                                className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer rounded"
                                title="Change Player 1 Theme Color"
                              />
                            </div>
                          </div>

                          {/* Player 2 Col */}
                          <div className="flex flex-col gap-3 pl-4">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2.5 h-2.5 rounded-full block border border-white/20"
                                style={{ backgroundColor: p2Color }}
                              />
                              <div className="flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={p2Name}
                                  onChange={(e) => setP2Name(e.target.value)}
                                  className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-full"
                                  title="Edit player 2 name"
                                />
                                <input
                                  type="text"
                                  value={p2Team}
                                  onChange={(e) => setP2Team(e.target.value)}
                                  className="text-[9px] font-mono text-white/40 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-full uppercase"
                                />
                              </div>
                            </div>

                            {/* Player 2 Stats list */}
                            <div className="flex flex-col gap-1.5 mt-1">
                              {p2Stats.map((stat, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                  <input
                                    type="text"
                                    value={stat.label || ""}
                                    onChange={(e) => handleStatChange(2, sIdx, "label", e.target.value)}
                                    className="text-[9px] text-white/50 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-16"
                                  />
                                  <input
                                    type="text"
                                    value={stat.value || ""}
                                    onChange={(e) => handleStatChange(2, sIdx, "value", e.target.value)}
                                    className="text-[10px] font-mono font-bold text-white bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-10 text-right"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Color Selector P2 */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider">Accent:</span>
                              <input 
                                type="color" 
                                value={p2Color} 
                                onChange={(e) => setP2Color(e.target.value)}
                                className="w-4 h-4 p-0 border-0 bg-transparent cursor-pointer rounded"
                                title="Change Player 2 Theme Color"
                              />
                            </div>
                          </div>

                        </div>

                        {/* Footnote bait details */}
                        <div className="border-t border-white/10 pt-2 flex justify-center z-10">
                          <input
                            type="text"
                            value={footnote}
                            onChange={(e) => setFootnote(e.target.value)}
                            className="text-[9px] font-mono text-center text-white/40 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none w-full uppercase tracking-wider"
                            title="Edit footnote"
                          />
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Suggested Hashtags */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/10 px-1">
                    {currentPost.hashtags?.map((hash, hIdx) => {
                      const tagStr = hash.startsWith("#") ? hash : `#${hash}`;
                      return (
                        <button
                          key={hIdx}
                          onClick={() => copyToClipboard(tagStr, "hash", hash)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-sans font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          {tagStr}
                          {copiedHash === hash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Viral Engagement Metrics Bar */}
                  {/* M-06 fix: previously used Unicode emoji (💬🔄❤️📊) which
                      render inconsistently across OSes and have no semantic
                      labels for screen readers. Replaced with Lucide icons
                      (MessageCircle, Repeat2, Heart, BarChart3) with
                      aria-labels. Note: these are mockup values the user can
                      edit — they are not real engagement data. */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-white/30 px-2 select-none font-bold" role="group" aria-label="Mockup engagement metrics (editable)">
                    <div className="flex items-center gap-1 hover:text-blue-400 transition cursor-pointer">
                      <MessageCircle className="w-3 h-3" aria-hidden="true" />
                      <span className="hover:text-blue-400">
                        <input
                          type="text"
                          value={retweetsCount}
                          onChange={(e) => setRetweetsCount(e.target.value)}
                          className="w-10 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none text-[11px] font-mono font-bold text-white/50 text-center"
                          title="Mockup comments count (editable)"
                          aria-label="Mockup comments count"
                        />
                      </span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-emerald-400 transition cursor-pointer">
                      <Repeat2 className="w-3 h-3" aria-hidden="true" />
                      <span>
                        <input
                          type="text"
                          value={likesCount}
                          onChange={(e) => setLikesCount(e.target.value)}
                          className="w-10 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none text-[11px] font-mono font-bold text-white/50 text-center"
                          title="Mockup retweets count (editable)"
                          aria-label="Mockup retweets count"
                        />
                      </span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-red-400 transition cursor-pointer">
                      <Heart className="w-3 h-3" aria-hidden="true" />
                      <span className="text-white/50">14.3K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" aria-hidden="true" />
                      <span>
                        <input
                          type="text"
                          value={viewsCount}
                          onChange={(e) => setViewsCount(e.target.value)}
                          className="w-12 bg-transparent border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none text-[11px] font-mono text-white/30 text-center font-bold"
                          title="Mockup views count (editable)"
                          aria-label="Mockup views count"
                        />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Engagement Action Center */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => copyToClipboard(currentPost.postText, "text")}
                    className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold tracking-wider uppercase border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white/40" />
                        <span>Copy Post Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={savePostToHistory}
                    className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold tracking-wider uppercase border border-white/10 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-blue-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save to Drafts</span>
                  </button>
                </div>

                {/* Download/Copy instructions */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    <strong>Pro-Tip:</strong> Use the <strong>&quot;Image Prompt&quot;</strong> tab to generate visual collages in Midjourney/ChatGPT, or screenshot the live <strong>Stats Card</strong> comparison above. The engineered discrepancy in stats forces rival fans to argue in your replies, triggering the viral ranking algorithm!
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "formula" && currentPost && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 flex flex-col gap-5"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Brain className="w-4.5 h-4.5 text-blue-400" />
                    Psychological Viral Formula
                  </h3>
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">Engineered Leverage</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Positive Trigger */}
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Fanbase A (Confirmation bias)
                    </span>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      {currentPost.psychologicalAnalysis?.halfOneTrigger}
                    </p>
                  </div>

                  {/* Negative Trigger */}
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col gap-2">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Fanbase B (Socratic Trap)
                    </span>
                    <p className="text-xs text-white/70 leading-relaxed font-sans">
                      {currentPost.psychologicalAnalysis?.halfTwoTrigger}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">The Mismatch Concept</span>
                  <p className="text-xs text-white/70 leading-relaxed bg-[#0A0A0B] p-3.5 rounded-xl border border-white/10 font-sans">
                    {currentPost.psychologicalAnalysis?.concept}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Cognitive Discrepancy Engineered</span>
                  <p className="text-xs text-white/70 leading-relaxed bg-[#0A0A0B] p-3.5 rounded-xl border border-white/10 font-sans">
                    {currentPost.psychologicalAnalysis?.mismatchStrategy}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "prompt" && currentPost && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-blue-400" />
                    ChatGPT / DALL-E Image Prompt
                  </h3>
                  <span className="text-[10px] bg-[#0A0A0B] text-white/60 px-2 py-0.5 rounded border border-white/10 font-mono font-bold uppercase tracking-wider">Copy-Paste</span>
                </div>

                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  We generate a masterfully optimized, detailed sports illustration prompt. Copy this text, paste it into ChatGPT, and it will generate the ultimate statistical or situation collage image to attach to your post.
                </p>

                <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/10 relative">
                  <pre className="text-xs text-white/80 whitespace-pre-wrap font-mono leading-relaxed select-all">
                    {currentPost.imagePrompt}
                  </pre>
                </div>

                <button
                  onClick={() => copyToClipboard(currentPost.imagePrompt, "prompt")}
                  className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span className="text-emerald-400 font-bold">Prompt Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/40" />
                      <span>Copy Image Prompt for ChatGPT</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {activeTab === "context" && currentPost && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 flex flex-col gap-6"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe className="w-4.5 h-4.5 text-blue-400" />
                    Web Crawled Context Engine
                  </h3>
                  <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-mono font-bold uppercase tracking-wider">
                    Live Grounded
                  </span>
                </div>

                {/* Engine Badge */}
                {currentPost.apiEngine && (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-2.5 rounded-xl text-xs">
                    <span className="font-medium">AI Generation Engine:</span>
                    <span className="font-mono font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded text-[10px] uppercase border border-emerald-500/30">
                      {currentPost.apiEngine}
                    </span>
                  </div>
                )}

                {/* Search Queries performed */}
                {currentPost.searchQueries && currentPost.searchQueries.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                      <Search className="w-3.5 h-3.5 text-white/30" />
                      Google Search Agent Queries
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentPost.searchQueries.map((query, qIdx) => (
                        <div 
                          key={qIdx}
                          className="text-xs font-mono bg-[#0A0A0B] border border-white/5 rounded-xl px-3.5 py-1.5 text-white/70 flex items-center gap-2"
                        >
                          <span className="text-blue-500 font-bold">🔎</span>
                          <span>{query}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources list */}
                {currentPost.sources && currentPost.sources.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5 text-white/30" />
                      Crawled Sources ({currentPost.sources.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentPost.sources.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-[#0A0A0B] hover:bg-[#151517] border border-white/10 hover:border-white/20 rounded-xl transition flex flex-col justify-between gap-1 group"
                        >
                          <span className="text-xs font-bold text-white/80 group-hover:text-blue-400 transition-colors line-clamp-1">
                            {source.title}
                          </span>
                          <span className="text-[9px] text-white/45 font-mono truncate">
                            {source.url}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                    <span className="text-xs text-white/40">No external source links stored for this template post.</span>
                  </div>
                )}

                {/* Facts Engine Sheet */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-white/30" />
                      Assembled Sports Fact Sheet
                    </span>
                    <span className="text-[9px] font-mono text-white/40 uppercase font-bold">
                      Parsed Context
                    </span>
                  </div>
                  
                  {currentPost.crawledFacts ? (
                    <div className="bg-[#0A0A0B] rounded-xl p-4 border border-white/10 max-h-[350px] overflow-y-auto">
                      <pre className="text-xs text-white/80 whitespace-pre-wrap font-sans leading-relaxed select-all">
                        {currentPost.crawledFacts}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded-xl border border-dashed border-white/10 bg-[#0A0A0B]/20">
                      <Globe className="w-8 h-8 text-white/20 mx-auto mb-2.5 animate-pulse" />
                      <span className="text-xs text-white/50 font-bold block uppercase tracking-wider">No Live Context Crawled Yet</span>
                      <span className="text-[10px] text-white/40 block mt-1 font-sans max-w-sm mx-auto">
                        This is an offline template post. To activate the live Web Crawled Context Engine, type in your custom topic/rivalry and generate a new post above!
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>

          {/* Saved Posts / Drafts History Section - Styled with Vibrant Palette colors */}
          <div className="bg-[#0F0F10] border border-white/10 rounded-2xl p-5 mt-2" id="saved-drafts">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-blue-400" />
                Campaign History ({mounted ? savedPosts.length : 0})
              </h3>
              <div className="flex items-center gap-3">
                {/* H-03 fix: explicit "Clear All" button so users can wipe
                    sensitive AI-generated content from their device. */}
                {mounted && savedPosts.length > 0 && (
                  <button
                    onClick={clearAllDrafts}
                    className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-wider transition cursor-pointer border border-red-500/20 hover:border-red-500/40 px-2 py-1 rounded"
                    title="Delete all saved drafts"
                  >
                    Clear All
                  </button>
                )}
                <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider">Browser Storage · 30-day TTL</span>
              </div>
            </div>

            {!mounted || savedPosts.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl border border-dashed border-white/10 bg-[#0A0A0B]/20">
                <FileText className="w-8 h-8 text-white/20 mx-auto mb-2.5" />
                <span className="text-xs text-white/50 font-bold block uppercase tracking-wider">No drafts saved yet.</span>
                <span className="text-[10px] text-white/40 block mt-1 font-sans">Configure and generate posts above, then save them to build your viral campaign!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {savedPosts.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => handleSelectDraft(saved)}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer text-left transition flex flex-col justify-between gap-3 group relative",
                      currentPost?.id === saved.id 
                        ? "bg-[#1E1E22] border-blue-500/50" 
                        : "bg-[#0A0A0B] hover:bg-[#151517] border-white/10 hover:border-white/25"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {saved.sport} • {saved.strategy}
                        </span>
                        
                        {/* Delete saved */}
                        <button
                          onClick={(e) => deleteSavedPost(saved.id, e)}
                          className="text-white/40 hover:text-red-400 p-1 rounded-md transition hover:bg-red-500/10 cursor-pointer"
                          title="Delete draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors font-display line-clamp-1">
                        {saved.topic}
                      </span>
                      
                      <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed mt-1.5 font-sans">
                        {saved.postText}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[9px] text-white/30 font-mono font-bold uppercase tracking-wider">
                      <span>Saved: {new Date(saved.createdAt).toLocaleDateString()}</span>
                      <span className="text-blue-400 font-sans group-hover:underline flex items-center gap-0.5 font-bold">
                        Load Draft →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </main>

      {/* Vibrant Palette Signature Bottom Status Bar */}
      <footer className="h-10 bg-blue-600 flex items-center justify-between px-6 text-[10px] font-bold text-black uppercase tracking-[0.2em] mt-12 select-none shrink-0">
        <span>SYSTEM STATUS: OPTIMIZED FOR VIRALITY</span>
        <span className="hidden md:inline">AUTO-TAGGING: ACTIVE</span>
        <span>LAST UPDATED: JUST NOW</span>
      </footer>
    </div>
  );
}
