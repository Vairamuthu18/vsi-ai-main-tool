"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Sparkles, Search, ChevronDown, Info, ExternalLink, Globe, MapPin, 
  TrendingUp, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, 
  HelpCircle, Layers, PieChart, Users, Cpu, FileText, ArrowLeft, X
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

function ResearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const queryParam = searchParams.get("q") || "";
  const langParam = searchParams.get("lang") || "English";
  const locParam = searchParams.get("loc") || "India";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [language, setLanguage] = useState(langParam);
  const [location, setLocation] = useState(locParam);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setSearchQuery(queryParam);
    if (searchParams.get("lang")) setLanguage(searchParams.get("lang")!);
    if (searchParams.get("loc")) setLocation(searchParams.get("loc")!);
  }, [queryParam, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAnalyzing(true);
    router.push(
      `/dashboard/research?q=${encodeURIComponent(searchQuery.trim())}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}`
    );
    setIsAnalyzing(false);
  };

  const handleQuickTry = (example: string) => {
    setSearchQuery(example);
    setIsAnalyzing(true);
    router.push(
      `/dashboard/research?q=${encodeURIComponent(example)}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}`
    );
    setIsAnalyzing(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    router.push("/dashboard/research");
  };

  const activeKeyword = queryParam.trim();

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto font-sans bg-[#F8FAFC] min-h-screen">
      {activeKeyword ? (
        /* ── Active Search Results Page View (3rd Image Answer as New Page) ── */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Compact Control Bar */}
          <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 shrink-0"
              >
                <ArrowLeft size={14} />
                <span>Back to Overview</span>
              </Link>
              <div className="hidden sm:block text-xs font-semibold text-muted-foreground border-l border-slate-200 pl-3">
                Keyword Research Engine
              </div>
            </div>

            {/* Compact Top Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap md:flex-nowrap items-center gap-2 flex-1 max-w-3xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter keyword or website..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-border rounded-xl text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
                <option value="Sinhala">Sinhala</option>
              </select>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30"
              >
                <option value="India">🇮🇳 India</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="Singapore">🇸🇬 Singapore</option>
                <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                <option value="UAE">🇦🇪 UAE</option>
              </select>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="bg-[#FF5A1F] hover:bg-[#E54E17] text-white font-bold px-4 py-2 rounded-xl transition-all text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles size={14} className={isAnalyzing ? "animate-spin" : "animate-pulse"} />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Active Keyword Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-border p-5 rounded-2xl shadow-2xs gap-3">
            <div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Keyword Research:</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2.5 mt-1 flex-wrap">
                <span>&quot;{activeKeyword}&quot;</span>
                <span className="text-xs bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20 px-3 py-1 rounded-full font-bold">
                  {location} • {language}
                </span>
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-border rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              ← Back to Overview
            </Link>
          </div>

          {/* 4 Quick Metrics Cards (3rd Image Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Searches</p>
              <p className="text-3xl font-extrabold text-foreground">12.4K <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">HIGH</span></p>
              <p className="text-[11px] text-muted-foreground font-medium">Approximate searches each month</p>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How Hard to Rank</p>
              <p className="text-3xl font-extrabold text-foreground">42 <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-bold">MEDIUM</span></p>
              <p className="text-[11px] text-muted-foreground font-medium">How difficult to rank on Google</p>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Visibility Trigger</p>
              <p className="text-3xl font-extrabold text-foreground">84% <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">ACTIVE</span></p>
              <p className="text-[11px] text-muted-foreground font-medium">AI search mention frequency</p>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Intent</p>
              <p className="text-3xl font-extrabold text-[#FF5A1F]">Informational</p>
              <p className="text-[11px] text-muted-foreground font-medium">People want to learn</p>
            </div>
          </div>

          {/* Suggested High-Potential AI Prompts & Variations */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <Sparkles size={20} className="text-[#FF5A1F]" />
              Suggested High-Potential AI Prompts & Variations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[
                `what is the best ${activeKeyword} for businesses?`,
                `top rated ${activeKeyword} features and pricing comparison`,
                `how to optimize ${activeKeyword} for maximum AI visibility`,
                `best ${activeKeyword} alternatives according to AI search`,
              ].map((prompt, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-medium text-foreground hover:border-[#FF5A1F]/50 hover:bg-orange-50/20 transition-all">
                  <span className="font-semibold text-slate-800">&quot;{prompt}&quot;</span>
                  <Link href={`/dashboard/check?q=${encodeURIComponent(prompt)}`} className="text-[#FF5A1F] font-bold hover:underline flex items-center gap-1 shrink-0 ml-3">
                    Analyze <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Keyword & AI Intelligence Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Volume Trend */}
            <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  Search Volume Trend
                </h4>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+18% YoY</span>
              </div>
              <p className="text-xs text-muted-foreground">Historical search interest for &quot;{activeKeyword}&quot; over the last 12 months.</p>
              
              {/* Trend SVG */}
              <div className="pt-2">
                <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                  <defs>
                    <linearGradient id="researchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 40 Q 30 45, 50 30 T 100 35 T 140 15 T 180 18 T 200 5 L 200 60 L 0 60 Z" fill="url(#researchGrad)" />
                  <path d="M 0 40 Q 30 45, 50 30 T 100 35 T 140 15 T 180 18 T 200 5" fill="none" stroke="#FF5A1F" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-2">
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Q3</span>
                  <span>Q4</span>
                </div>
              </div>
            </div>

            {/* AI Citation Frequency */}
            <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Cpu size={16} className="text-purple-500" />
                  AI Engine Inclusion Rate
                </h4>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">High Probability</span>
              </div>
              <p className="text-xs text-muted-foreground">Likelihood of AI engines (ChatGPT, Claude, Gemini) citing sources for &quot;{activeKeyword}&quot;.</p>
              <div className="space-y-2.5 pt-1">
                {[
                  { engine: "Google AI Overview", percent: "92%" },
                  { engine: "ChatGPT Web Search", percent: "84%" },
                  { engine: "Perplexity AI", percent: "88%" },
                  { engine: "Gemini Pro Grounding", percent: "76%" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.engine}</span>
                      <span className="text-[#FF5A1F] font-bold">{item.percent}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#FF5A1F] h-full rounded-full" style={{ width: item.percent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-500" />
                  Recommended Next Actions
                </h4>
                <p className="text-xs text-muted-foreground mt-1">Take action to capture traffic for &quot;{activeKeyword}&quot;.</p>
              </div>

              <div className="space-y-2.5">
                <Link
                  href={`/dashboard/check?q=${encodeURIComponent(activeKeyword)}`}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs flex items-center justify-between transition-colors"
                >
                  <span>Run Full SEO & AI Audit</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={`/dashboard/tasks?keyword=${encodeURIComponent(activeKeyword)}`}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold p-3 rounded-xl text-xs flex items-center justify-between transition-colors border border-slate-200"
                >
                  <span>Add to Rank Tracker</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={`/dashboard/prompts?q=${encodeURIComponent(activeKeyword)}`}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold p-3 rounded-xl text-xs flex items-center justify-between transition-colors border border-slate-200"
                >
                  <span>Explore AI Prompts & Mentions</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty Query State: Initial Search Form Page ── */
        <div className="space-y-8">
          <div className="bg-white border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Overview</span>
                </Link>
                <h1 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Search size={16} className="text-[#FF5A1F]" />
                  SEO & AI Keyword Research Engine
                </h1>
              </div>

              <Link
                href="/dashboard/check"
                className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
              >
                Bulk Keyword Analysis →
              </Link>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3.5 pt-1">
              <div className="flex-1 min-w-[280px] relative">
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Keyword / Website <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Search size={18} className="absolute left-4 text-muted-foreground pointer-events-none bg-transparent" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter a keyword or website..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] shadow-2xs transition-all"
                  />
                </div>
              </div>

              <div className="w-full lg:w-44 space-y-1">
                <label className="block text-[11px] font-bold text-foreground">
                  Language <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none bg-white border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] shadow-2xs cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Sinhala">Sinhala</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none bg-transparent" />
                </div>
              </div>

              <div className="w-full lg:w-52 space-y-1">
                <label className="block text-[11px] font-bold text-foreground">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full appearance-none bg-white border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] shadow-2xs cursor-pointer"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="Singapore">🇸🇬 Singapore</option>
                    <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                    <option value="UAE">🇦🇪 UAE</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none bg-transparent" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="bg-[#FF5A1F] hover:bg-[#E54E17] text-white font-bold px-7 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer disabled:opacity-70 active:scale-95 shadow-[#FF5A1F]/20"
              >
                <Sparkles size={16} className={isAnalyzing ? "animate-spin text-white" : "animate-pulse text-white"} />
                <span>{isAnalyzing ? "Analyzing..." : "Start Research"}</span>
              </button>
            </form>

            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-muted-foreground font-semibold">Try searching:</span>
              {[
                "digital marketing agency",
                "best SEO agency in Dubai",
                "web development company",
                "dell"
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleQuickTry(example)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FF5A1F]/10 text-slate-700 hover:text-[#FF5A1F] border border-slate-200 transition-colors font-medium cursor-pointer text-[11px]"
                >
                  Try: {example}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#FF5A1F] flex items-center justify-center mx-auto">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Start Searching Keywords</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter any keyword or website domain in the search box above to generate instant search volume, SEO difficulty, AI visibility triggers, and AI prompt ideas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResearchPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm font-semibold text-muted-foreground flex items-center justify-center min-h-[400px]">
        Loading Keyword Research Engine...
      </div>
    }>
      <ResearchContent />
    </Suspense>
  );
}
