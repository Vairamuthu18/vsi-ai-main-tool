"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, ShieldAlert, ArrowUpRight, TrendingUp, Search, Plus, 
  ChevronRight, Award, BarChart3, AlertCircle, ExternalLink, Filter,
  Trash2, RefreshCw, Sparkles, CheckCircle2, Zap, X, Info
} from "lucide-react";

interface CompetitorData {
  id: string;
  name: string;
  domain: string;
  visibilityScore: number;
  aiMentionsCount: number;
  topEngine: string;
  gapStatus: "Leading" | "Tied" | "Lagging";
  sentiment: string;
  engineBreakdown?: {
    googleAio: number;
    chatgpt: number;
    perplexity: number;
    gemini: number;
  };
  topQueries?: string[];
}

const mockCompetitors: CompetitorData[] = [
  {
    id: "comp-1",
    name: "Apex Search Corp",
    domain: "apexsearch.com",
    visibilityScore: 84.2,
    aiMentionsCount: 342,
    topEngine: "Google AIO",
    gapStatus: "Leading",
    sentiment: "96% Positive",
    engineBreakdown: { googleAio: 42, chatgpt: 28, perplexity: 18, gemini: 12 },
    topQueries: [
      "best enterprise AI search tools",
      "apexsearch vs valgrow feature breakdown",
      "top generative search optimization software"
    ]
  },
  {
    id: "comp-2",
    name: "BrightPulse AI",
    domain: "brightpulse.io",
    visibilityScore: 71.8,
    aiMentionsCount: 289,
    topEngine: "ChatGPT (GPT-4o)",
    gapStatus: "Tied",
    sentiment: "91% Positive",
    engineBreakdown: { googleAio: 30, chatgpt: 45, perplexity: 15, gemini: 10 },
    topQueries: [
      "brightpulse ai citation index ranking",
      "how to optimize for ChatGPT search overview",
      "brightpulse vs industry AI visibility benchmark"
    ]
  },
  {
    id: "comp-3",
    name: "VectorRank Labs",
    domain: "vectorrank.ai",
    visibilityScore: 58.4,
    aiMentionsCount: 194,
    topEngine: "Gemini 1.5 Pro",
    gapStatus: "Lagging",
    sentiment: "88% Neutral",
    engineBreakdown: { googleAio: 25, chatgpt: 20, perplexity: 15, gemini: 40 },
    topQueries: [
      "vectorrank.ai LLM search presence",
      "gemini top cited domains list",
      "vectorrank citation gap comparison"
    ]
  },
  {
    id: "comp-4",
    name: "Synthetix Growth",
    domain: "synthetixgrowth.com",
    visibilityScore: 42.1,
    aiMentionsCount: 112,
    topEngine: "Perplexity AI",
    gapStatus: "Lagging",
    sentiment: "82% Neutral",
    engineBreakdown: { googleAio: 15, chatgpt: 20, perplexity: 50, gemini: 15 },
    topQueries: [
      "synthetixgrowth perplexity citation review",
      "synthetix alternative tools in AI mode"
    ]
  },
];

function generateCompetitorFromDomain(domainInput: string): CompetitorData {
  const cleanDomain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const baseName = cleanDomain.split(".")[0];

  // Hash function to get deterministic but distinct results based on domain string
  let hash = 0;
  for (let i = 0; i < cleanDomain.length; i++) {
    hash = (hash << 5) - hash + cleanDomain.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // Smart Brand Name Map or Dynamic Formatter
  const knownBrands: Record<string, string> = {
    dell: "Dell Technologies",
    ibm: "IBM Corp",
    hp: "HP Enterprise",
    apple: "Apple Inc",
    microsoft: "Microsoft Corp",
    google: "Google Cloud",
    amazon: "Amazon AWS",
    salesforce: "Salesforce",
    hubspot: "HubSpot AI",
    zendesk: "Zendesk",
    notion: "Notion Labs",
    figma: "Figma Inc",
    slack: "Slack Tech",
    shopify: "Shopify Global",
    stripe: "Stripe Payments",
    atlassian: "Atlassian",
    oracle: "Oracle Enterprise",
    sap: "SAP Solutions",
    adobe: "Adobe Systems",
  };

  const formattedName = knownBrands[baseName] || (
    baseName.charAt(0).toUpperCase() + baseName.slice(1) + 
    (posHash % 3 === 0 ? " AI" : posHash % 3 === 1 ? " Labs" : " Group")
  );

  const engines = [
    "Google AIO",
    "ChatGPT (GPT-4o)",
    "Perplexity AI",
    "Gemini 1.5 Pro",
    "Claude 3.5 Sonnet",
    "Bing Copilot",
  ];
  const topEngine = engines[posHash % engines.length];

  const visibilityScore = Math.min(96, Math.max(34, (posHash % 58) + 38));
  const aiMentionsCount = (posHash % 310) + 75;

  let gapStatus: "Leading" | "Tied" | "Lagging" = "Tied";
  if (visibilityScore >= 75) gapStatus = "Leading";
  else if (visibilityScore < 52) gapStatus = "Lagging";

  const sentiments = ["96% Positive", "92% Positive", "88% Positive", "84% Neutral", "79% Neutral", "95% Positive"];
  const sentiment = sentiments[posHash % sentiments.length];

  // Specific Engine Distribution breakdown
  const googleAio = (posHash % 25) + 25;
  const chatgpt = (posHash % 30) + 20;
  const perplexity = (posHash % 20) + 15;
  const gemini = 100 - (googleAio + chatgpt + perplexity);

  return {
    id: `comp-${cleanDomain}-${Date.now()}`,
    name: formattedName,
    domain: cleanDomain,
    visibilityScore,
    aiMentionsCount,
    topEngine,
    gapStatus,
    sentiment,
    engineBreakdown: {
      googleAio,
      chatgpt,
      perplexity,
      gemini: Math.max(5, gemini),
    },
    topQueries: [
      `top ${baseName} search visibility trends 2026`,
      `how ${cleanDomain} ranks in ${topEngine} answers`,
      `best ${baseName} alternatives & citation share breakdown`,
    ],
  };
}

export default function CompetitorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGap, setFilterGap] = useState<"ALL" | "Leading" | "Tied" | "Lagging">("ALL");
  const [competitors, setCompetitors] = useState<CompetitorData[]>(mockCompetitors);
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorData | null>(null);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorDomain.trim() || isAnalyzing) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const newComp = generateCompetitorFromDomain(newCompetitorDomain);
      
      // Prevent exact duplicate domains
      setCompetitors((prev) => [newComp, ...prev.filter((c) => c.domain.toLowerCase() !== newComp.domain.toLowerCase())]);
      setNewCompetitorDomain("");
      setIsAnalyzing(false);
      setShowAddModal(false);
    }, 1200);
  };

  const handleDeleteCompetitor = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    if (selectedCompetitor?.id === id) {
      setSelectedCompetitor(null);
    }
  };

  // Dynamic KPI calculation
  const topRival = competitors.reduce<CompetitorData | null>((top, current) => {
    if (!top || current.visibilityScore > top.visibilityScore) return current;
    return top;
  }, null);

  const avgVisibility = competitors.length > 0
    ? (competitors.reduce((acc, c) => acc + c.visibilityScore, 0) / competitors.length).toFixed(1)
    : "0.0";

  const filteredCompetitors = competitors.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topEngine.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterGap === "ALL") return matchesSearch;
    return matchesSearch && c.gapStatus === filterGap;
  });

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Users className="text-amber-500" size={28} />
            <span>Competitor Citation Benchmark</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor rival brand mentions, AI share-of-voice gaps, and prompt dominance across generative search engines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Track New Competitor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-[20px] p-6 border border-border shadow-xs hover:border-amber-500/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Your Brand AI Share
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-2">
            24.5%
          </p>
          <p className="text-[11px] text-[#22C55E] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            +14.2% higher than industry avg
          </p>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-xs hover:border-amber-500/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Tracked Competitors
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
            {competitors.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Active domain benchmark profiles</p>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-xs hover:border-amber-500/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Top Rival Domain
          </p>
          <p className="text-xl font-bold text-foreground mt-2 truncate">
            {topRival ? topRival.domain : "None"}
          </p>
          <p className="text-[11px] text-[#EF4444] font-semibold mt-1">
            {topRival ? `${topRival.visibilityScore}% AI Visibility` : "No rival data"}
          </p>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-xs hover:border-amber-500/30 transition-all">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Avg Rival AI Visibility
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-500 mt-2">
            {avgVisibility}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Across all tracked rival profiles</p>
        </div>
      </div>

      {/* Competitors List Table Section */}
      <div className="bg-card rounded-[20px] border border-border shadow-xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 text-muted-foreground" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search domain, name, or AI engine..."
              className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter size={13} /> Gap Status:
            </span>
            {(["ALL", "Leading", "Tied", "Lagging"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterGap(status)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filterGap === status
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-muted-bg text-muted-foreground hover:text-foreground hover:bg-muted-bg/80 border border-border"
                }`}
              >
                {status}
              </button>
            ))}
            <span className="text-xs font-medium text-muted-foreground ml-2">
              ({filteredCompetitors.length} listed)
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted-bg/40 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Competitor Name</th>
                <th className="px-6 py-3.5">Domain</th>
                <th className="px-6 py-3.5">AI Visibility Score</th>
                <th className="px-6 py-3.5">Total Mentions</th>
                <th className="px-6 py-3.5">Primary AI Engine</th>
                <th className="px-6 py-3.5">Gap Benchmark</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <AlertCircle className="mx-auto text-muted-foreground/50 mb-2" size={24} />
                    <p className="font-semibold text-sm">No competitor domain matches found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or tracking a new competitor domain.</p>
                  </td>
                </tr>
              ) : (
                filteredCompetitors.map((comp) => (
                  <tr key={comp.id} className="hover:bg-muted-bg/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span>{comp.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted-bg text-muted-foreground border border-border">
                          {comp.sentiment}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">{comp.domain}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted-bg rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              comp.visibilityScore >= 75 ? "bg-[#EF4444]" :
                              comp.visibilityScore >= 50 ? "bg-amber-500" : "bg-[#22C55E]"
                            }`}
                            style={{ width: `${comp.visibilityScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-foreground">{comp.visibilityScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{comp.aiMentionsCount}</td>
                    <td className="px-6 py-4">
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-md font-mono text-[10px] border border-amber-500/20 font-bold">
                        {comp.topEngine}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        comp.gapStatus === "Leading" ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20" :
                        comp.gapStatus === "Tied" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                      }`}>
                        {comp.gapStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedCompetitor(comp)}
                          className="text-amber-500 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Info size={13} />
                          <span>Inspect</span>
                        </button>
                        <a
                          href={`https://${comp.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground font-bold inline-flex items-center gap-0.5"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          onClick={() => handleDeleteCompetitor(comp.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/10 cursor-pointer"
                          title="Remove competitor"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedCompetitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card rounded-[24px] border border-border max-w-xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <span>{selectedCompetitor.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                    {selectedCompetitor.domain}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Generative Search Engine Breakdown & Citation Intelligence
                </p>
              </div>
              <button
                onClick={() => setSelectedCompetitor(null)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted-bg/50 p-3 rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">AI Visibility</p>
                <p className="text-lg font-extrabold text-amber-500 mt-0.5">{selectedCompetitor.visibilityScore}%</p>
              </div>
              <div className="bg-muted-bg/50 p-3 rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">AI Mentions</p>
                <p className="text-lg font-extrabold text-foreground mt-0.5">{selectedCompetitor.aiMentionsCount}</p>
              </div>
              <div className="bg-muted-bg/50 p-3 rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Primary Engine</p>
                <p className="text-xs font-extrabold text-indigo-500 truncate mt-1">{selectedCompetitor.topEngine}</p>
              </div>
            </div>

            {/* AI Engine Citation Share Distribution */}
            {selectedCompetitor.engineBreakdown && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Engine Share of Mentions Distribution
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground font-medium">Google AI Overviews</span>
                      <span className="font-bold text-foreground">{selectedCompetitor.engineBreakdown.googleAio}%</span>
                    </div>
                    <div className="w-full bg-muted-bg h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${selectedCompetitor.engineBreakdown.googleAio}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground font-medium">ChatGPT (GPT-4o)</span>
                      <span className="font-bold text-foreground">{selectedCompetitor.engineBreakdown.chatgpt}%</span>
                    </div>
                    <div className="w-full bg-muted-bg h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedCompetitor.engineBreakdown.chatgpt}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground font-medium">Perplexity AI</span>
                      <span className="font-bold text-foreground">{selectedCompetitor.engineBreakdown.perplexity}%</span>
                    </div>
                    <div className="w-full bg-muted-bg h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${selectedCompetitor.engineBreakdown.perplexity}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground font-medium">Gemini 1.5 Pro</span>
                      <span className="font-bold text-foreground">{selectedCompetitor.engineBreakdown.gemini}%</span>
                    </div>
                    <div className="w-full bg-muted-bg h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedCompetitor.engineBreakdown.gemini}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Sample Queries */}
            {selectedCompetitor.topQueries && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  Top Search Triggers Dominating AI Answers
                </h4>
                <ul className="space-y-1.5">
                  {selectedCompetitor.topQueries.map((q, idx) => (
                    <li key={idx} className="bg-muted-bg/40 px-3 py-2 rounded-lg text-xs font-mono text-muted-foreground border border-border flex items-center gap-2">
                      <ChevronRight size={13} className="text-amber-500 shrink-0" />
                      <span className="truncate">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setSelectedCompetitor(null)}
                className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card rounded-[24px] border border-border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Plus size={18} className="text-amber-500" />
                Track Competitor Domain
              </h3>
              <button
                onClick={() => !isAnalyzing && setShowAddModal(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter any competitor domain to trigger real-time AI engine scanning (Google AIO, ChatGPT, Perplexity, Gemini).
            </p>

            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Competitor Domain URL
                </label>
                <input
                  type="text"
                  required
                  disabled={isAnalyzing}
                  placeholder="e.g. dell.com, ibm.com, salesforce.com..."
                  value={newCompetitorDomain}
                  onChange={(e) => setNewCompetitorDomain(e.target.value)}
                  className="w-full rounded-[14px] border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-muted-foreground hover:bg-muted-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Scanning AI Engines...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Start Live Tracking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
