"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, Search, ChevronDown, Info, ExternalLink, Globe, MapPin, 
  TrendingUp, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, 
  HelpCircle, Layers, PieChart, Users, Cpu, FileText, ArrowLeft, X, AlertCircle
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ClientRecord {
  id: string;
  name: string;
  service_type: string;
  website: string;
  agency_id: string;
  agencies?: { name?: string | null; display_name?: string | null } | { name?: string | null; display_name?: string | null }[] | null;
}

interface ResultRecord {
  client_id: string;
  keyword: string;
  track_type: string;
  gap_label: string;
  rank_position?: number | null;
  aio_present?: boolean | null;
  client_cited?: boolean | null;
  mentioned_in_text?: boolean | null;
  created_at: string;
}

interface DashboardClientViewProps {
  isSuperAdmin: boolean;
  clientList: ClientRecord[];
  keywordCount: number;
  rawResults: ResultRecord[];
  maxClients?: number | null;
}

interface ResearchData {
  success: boolean;
  keyword: string;
  location: string;
  language: string;
  dataSource: string;
  metrics: {
    searches: {
      value: string;
      tag: string;
      tagColor: string;
      description: string;
    };
    difficulty: {
      score: number;
      tag: string;
      tagColor: string;
      description: string;
    };
    aiVisibility: {
      percent: string;
      tag: string;
      tagColor: string;
      description: string;
    };
    intent: {
      primary: string;
      description: string;
    };
  };
  prompts: string[];
  trend: {
    yoy: string;
    isPositive: boolean;
    monthlyPoints: number[];
  };
  aiOverview?: string;
  inclusionRates: {
    engine: string;
    percent: string;
  }[];
}

export default function DashboardClientView({
  isSuperAdmin,
  clientList,
  keywordCount,
  rawResults,
  maxClients,
}: DashboardClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const queryParam = searchParams.get("q") || "";
  const langParam = searchParams.get("lang") || "English";
  const locParam = searchParams.get("loc") || "India";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [language, setLanguage] = useState(langParam);
  const [location, setLocation] = useState(locParam);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeKeyword = queryParam.trim();

  useEffect(() => {
    setSearchQuery(queryParam);
    if (searchParams.get("lang")) setLanguage(searchParams.get("lang")!);
    if (searchParams.get("loc")) setLocation(searchParams.get("loc")!);
  }, [queryParam, searchParams]);

  const fetchKeywordResearch = async (kw: string, lang: string, loc: string) => {
    setResearchData(null);
    setIsLoadingResearch(true);
    setResearchError(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw, language: lang, location: loc }),
      });

      if (!res.ok) {
        throw new Error("Unable to load keyword data");
      }

      const data = await res.json();
      if (data.success) {
        setResearchData(data);
      } else {
        setResearchError(data.error || "Unable to load keyword data");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to load keyword data";
      setResearchError(msg);
    } finally {
      setIsLoadingResearch(false);
    }
  };

  useEffect(() => {
    if (activeKeyword) {
      fetchKeywordResearch(activeKeyword, language, location);
    } else {
      setResearchData(null);
      setIsLoadingResearch(false);
      setResearchError(null);
    }
  }, [activeKeyword, language, location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    router.push(
      `/dashboard?q=${encodeURIComponent(searchQuery.trim())}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}`
    );
    setIsAnalyzing(false);
  };

  const handleQuickTry = (example: string) => {
    setSearchQuery(example);
    setIsAnalyzing(true);
    router.push(
      `/dashboard?q=${encodeURIComponent(example)}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}`
    );
    setIsAnalyzing(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    router.push("/dashboard");
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const buildSvgPath = (points: number[]) => {
    if (!points || points.length === 0) return "M 0 40 L 200 40";
    const width = 200;
    const step = width / Math.max(1, points.length - 1);
    return points
      .map((p, i) => {
        const x = Math.round(i * step);
        const y = Math.round(45 - (p / 100) * 35);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans transition-colors bg-[#F8FAFC] min-h-screen">
      
      {/* ── Active Keyword Results View (When q is present) ── */}
      {activeKeyword ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Control Bar */}
          <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 shrink-0 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Overview</span>
              </button>
              <div className="hidden sm:block text-xs font-semibold text-muted-foreground border-l border-slate-200 pl-3">
                SEO & AI Keyword Research Engine
              </div>
            </div>

            {/* Search Form */}
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
                <option value="German">German</option>
                <option value="Tamil">Tamil</option>
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
                disabled={isAnalyzing || isLoadingResearch}
                className="bg-[#FF5A1F] hover:bg-[#E54E17] text-white font-bold px-4 py-2 rounded-xl transition-all text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles size={14} className={isLoadingResearch || isAnalyzing ? "animate-spin" : "animate-pulse"} />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Active Keyword Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-border p-5 rounded-2xl shadow-2xs gap-3">
            <div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Keyword Research:</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2.5 mt-1 flex-wrap">
                <span>&quot;{activeKeyword}&quot;</span>
                <span className="text-xs bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20 px-3 py-1 rounded-full font-bold">
                  {location} • {language}
                </span>
                {researchData?.dataSource && (
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    <Globe size={12} className="text-[#FF5A1F]" /> {researchData.dataSource}
                  </span>
                )}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-border rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              ← Back to Overview
            </button>
          </div>

          {/* Research State: Loading Skeleton */}
          {isLoadingResearch ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-border p-5 rounded-2xl space-y-3 shadow-2xs animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-8 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-150 rounded w-full" />
                  </div>
                ))}
              </div>
              <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : researchError ? (
            /* Error State UI */
            <div className="bg-red-50 border border-red-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
              <AlertCircle size={36} className="text-red-500" />
              <h3 className="text-base font-bold text-red-900">Unable to load keyword data</h3>
              <p className="text-xs text-red-700 font-medium max-w-md">{researchError}</p>
              <button
                type="button"
                onClick={() => fetchKeywordResearch(activeKeyword, language, location)}
                className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : researchData ? (
            /* Loaded Keyword Research Results */
            <>
              {/* 4 Dynamic Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Monthly Searches */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Searches</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    {researchData.metrics.searches.value}{" "}
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      researchData.metrics.searches.tagColor === "emerald"
                        ? "text-emerald-600 bg-emerald-50"
                        : researchData.metrics.searches.tagColor === "amber"
                        ? "text-amber-600 bg-amber-50"
                        : "text-slate-600 bg-slate-100"
                    }`}>
                      {researchData.metrics.searches.tag}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.searches.description}</p>
                </div>

                {/* How Hard to Rank */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How Hard to Rank</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    {researchData.metrics.difficulty.score}{" "}
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      researchData.metrics.difficulty.tagColor === "red"
                        ? "text-red-600 bg-red-50"
                        : researchData.metrics.difficulty.tagColor === "amber"
                        ? "text-amber-600 bg-amber-50"
                        : "text-emerald-600 bg-emerald-50"
                    }`}>
                      {researchData.metrics.difficulty.tag}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.difficulty.description}</p>
                </div>

                {/* AI Visibility Trigger */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Visibility Trigger</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    {researchData.metrics.aiVisibility.percent}{" "}
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
                      {researchData.metrics.aiVisibility.tag}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.aiVisibility.description}</p>
                </div>

                {/* Primary Intent */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Intent</p>
                  <p className="text-3xl font-extrabold text-[#FF5A1F]">{researchData.metrics.intent.primary}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.intent.description}</p>
                </div>
              </div>

              {/* Localized AI Intelligence Overview */}
              {researchData.aiOverview && (
                <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200 rounded-2xl p-5 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-[#FF5A1F] animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === "Tamil"
                        ? "AI பகுப்பாய்வு சுருக்கம் (AI Summary)"
                        : language === "German"
                        ? "KI-Analyseübersicht (AI Summary)"
                        : language === "Sinhala"
                        ? "AI විශ්ලේෂණ සාරාංශය (AI Summary)"
                        : "AI Intelligence Overview"}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    {researchData.aiOverview}
                  </p>
                </div>
              )}

              {/* Dynamic Suggested AI Prompts */}
              <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Sparkles size={20} className="text-[#FF5A1F]" />
                  {language === "Tamil"
                    ? "பரிந்துரைக்கப்பட்ட உயர் AI தூண்டுதல்கள் & வேறுபாடுகள்"
                    : language === "German"
                    ? "Vorgeschlagene KI-Prompts & Variationen"
                    : language === "Sinhala"
                    ? "යෝජිත ඉහළ විභව AI විමසීම් සහ වෙනස්කම්"
                    : "Suggested High-Potential AI Prompts & Variations"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {researchData.prompts.map((prompt, i) => (
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
                {/* Dynamic Search Volume Trend */}
                <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" />
                      Search Volume Trend
                    </h4>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      researchData.trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                    }`}>
                      {researchData.trend.yoy}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Historical search interest for &quot;{activeKeyword}&quot; over the last 12 months.</p>
                  
                  <div className="pt-2">
                    <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                      <defs>
                        <linearGradient id="researchGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${buildSvgPath(researchData.trend.monthlyPoints)} L 200 60 L 0 60 Z`}
                        fill="url(#researchGrad)"
                      />
                      <path
                        d={buildSvgPath(researchData.trend.monthlyPoints)}
                        fill="none"
                        stroke="#FF5A1F"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-2">
                      <span>Q1</span>
                      <span>Q2</span>
                      <span>Q3</span>
                      <span>Q4</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic AI Engine Inclusion Rates */}
                <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Cpu size={16} className="text-purple-500" />
                      AI Engine Inclusion Rate
                    </h4>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Live AI Probability</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Likelihood of AI engines (ChatGPT, Claude, Gemini) citing sources for &quot;{activeKeyword}&quot;.</p>
                  <div className="space-y-2.5 pt-1">
                    {researchData.inclusionRates.map((item, idx) => (
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
            </>
          ) : null}
        </div>
      ) : (
        <>
          {/* ── 1. Dashboard Hero Section ── */}
      <div className="bg-[#FFF5F2] border border-[#FFE4DA] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden space-y-6">
        {/* Decorative ambient glow */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Grow Your Website with Smarter SEO
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            Find the right keywords, understand your competitors, track your rankings, and see how AI search engines discover your brand — all in one place.
          </p>
        </div>

        {/* Primary Search Card Container */}
        <div className="relative z-10 bg-white border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Search size={14} className="text-[#FF5A1F]" />
              SEO & AI Keyword Research Engine
            </h2>
            <Link
              href="/dashboard/check"
              className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
            >
              Bulk Keyword Analysis →
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3.5">
            {/* Search Input Box */}
            <div className="flex-1 min-w-[280px] relative">
              <label className="block text-[11px] font-bold text-foreground mb-1">
                Keyword / Website <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-muted-foreground pointer-events-none bg-transparent" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter a keyword or website..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Language Selector */}
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
                  <option value="German">German</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Sinhala">Sinhala</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none bg-transparent" />
              </div>
            </div>

            {/* Location Selector */}
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

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="bg-[#FF5A1F] hover:bg-[#E54E17] text-white font-bold px-7 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer disabled:opacity-70 active:scale-95 shadow-[#FF5A1F]/20"
            >
              <Sparkles size={16} className={isAnalyzing ? "animate-spin text-white" : "animate-pulse text-white"} />
              <span>{isAnalyzing ? "Analyzing..." : "Start Research"}</span>
            </button>
          </form>

          {/* Quick Example Chips */}
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

          {/* Beginner Hint Box */}
          <div className="p-3 bg-[#FFF5F2] border border-[#FFE4DA] rounded-xl flex items-center gap-2 text-xs text-slate-700">
            <span className="text-base shrink-0">💡</span>
            <p className="font-medium">
              <strong>Not sure what to search?</strong> Enter a keyword related to your business and we&apos;ll do the rest.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Command Center Overview Section ── */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Welcome to SearchIntel
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Let&apos;s improve your website visibility.
          </p>
        </div>

        {/* 4 Simple Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Find Keywords */}
          <div
            onClick={focusSearchInput}
            className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF5A1F] flex items-center justify-center font-bold">
                <Search size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground">Find Keywords</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Discover keywords your customers are searching for.
              </p>
            </div>
            <button
              type="button"
              onClick={focusSearchInput}
              className="inline-flex items-center text-xs font-bold text-[#FF5A1F] hover:underline cursor-pointer text-left"
            >
              Find Keywords →
            </button>
          </div>

            {/* Card 2: AI Visibility Check */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">AI Visibility Check</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Check search rank & AI Mode visibility for any keyword.
                </p>
              </div>
              <Link
                href="/dashboard/check?tab=aivisibility"
                className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline"
              >
                Run AI Visibility Check →
              </Link>
            </div>

            {/* Card 3: Check Your Competitors */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">Check Your Competitors</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  See what your competitors are doing better.
                </p>
              </div>
              <Link
                href="/dashboard/competitors"
                className="inline-flex items-center text-xs font-bold text-emerald-600 hover:underline"
              >
                Compare Competitors →
              </Link>
            </div>

            {/* Card 4: Check AI Visibility */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">Check AI Visibility</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  See whether ChatGPT and other AI search engines mention your brand.
                </p>
              </div>
              <Link
                href="/dashboard/prompts"
                className="inline-flex items-center text-xs font-bold text-purple-600 hover:underline"
              >
                Check AI Visibility →
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mb-4">
              AI-powered keyword research
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* ── CARD 1: Find secret SEO gems ── */}
            <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between hover:border-border/80 transition-all">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Find secret SEO gems
                </h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Search and find suggestions of high-potential keywords with the perfect balance of search volume and low competition.
                </p>
              </div>

              {/* Graphic Canvas Box */}
              <div className="bg-[#EAF8F6] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 relative overflow-hidden min-h-[300px] flex items-center justify-center">
                {/* Background organic shape */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-transparent dark:from-emerald-900/20 dark:via-transparent rounded-2xl" />

                <div className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Search Volume Box */}
                  <div className="sm:col-span-1 bg-white dark:bg-card border border-border/80 rounded-2xl p-4 shadow-md space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span className="w-4 h-4 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[10px]">G</span>
                        <span>Search Volume</span>
                      </div>
                      <Info size={13} className="text-muted-foreground" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-foreground">9,9M</span>
                      <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        HIGH
                      </span>
                    </div>

                    {/* Smooth Trend Line Chart SVG */}
                    <div className="pt-2">
                      <svg viewBox="0 0 200 60" className="w-full h-12 overflow-visible">
                        <defs>
                          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 45 Q 30 50, 50 35 T 100 40 T 140 15 T 180 20 T 200 5 L 200 60 L 0 60 Z" fill="url(#volGrad)" />
                        <path d="M 0 45 Q 30 50, 50 35 T 100 40 T 140 15 T 180 20 T 200 5" fill="none" stroke="#FF5A1F" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      <div className="flex justify-between text-[9px] text-muted-foreground font-semibold pt-1">
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>Jun</span>
                        <span>Aug</span>
                        <span>Set</span>
                      </div>
                    </div>
                  </div>

                  {/* Side Stats */}
                  <div className="sm:col-span-1 space-y-3 flex flex-col justify-between">
                    
                    {/* SEO Difficulty */}
                    <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-3.5 shadow-md space-y-1">
                      <p className="text-[11px] font-bold text-muted-foreground">SEO Difficulty</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-extrabold text-foreground">88</span>
                        <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          📊 MEDIUM
                        </span>
                      </div>
                    </div>

                    {/* Top Page Backlinks */}
                    <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-3.5 shadow-md space-y-1">
                      <p className="text-[11px] font-bold text-muted-foreground">Top Page Backlinks</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-extrabold text-foreground">50,5K</span>
                        <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          🏷️ HIGH
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* ── CARD 2: Research AI prompts and responses ── */}
            <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between hover:border-border/80 transition-all">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Research AI prompts and responses
                </h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  AI searches are growing fast. Stay relevant checking what users are asking.
                </p>
              </div>

              {/* Graphic Canvas Box */}
              <div className="bg-[#F4EEFF] border border-purple-100 rounded-2xl p-5 relative overflow-hidden min-h-[300px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/40 via-indigo-100/30 to-transparent rounded-2xl" />

                <div className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Brands & Sources Box */}
                  <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-md space-y-3">
                    <div>
                      <p className="text-[10px] font-extrabold text-muted-foreground uppercase">Brands Mentioned</p>
                      <ol className="text-xs font-semibold text-foreground space-y-1 mt-1">
                        <li className="flex items-center gap-1.5"><span className="text-muted-foreground text-[10px]">1.</span> Brand One</li>
                        <li className="flex items-center gap-1.5"><span className="text-muted-foreground text-[10px]">2.</span> Second</li>
                        <li className="flex items-center gap-1.5"><span className="text-muted-foreground text-[10px]">3.</span> Third Brand</li>
                        <li className="flex items-center gap-1.5"><span className="text-muted-foreground text-[10px]">4.</span> Brand Four</li>
                      </ol>
                    </div>

                    <div className="border-t border-border pt-2">
                      <p className="text-[10px] font-extrabold text-muted-foreground uppercase mb-1.5">Top Sources</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["🔴 YouTube", "🔵 Facebook", "📷 Instagram", "🎵 TikTok", "💼 LinkedIn", "🌐 Google", "🤖 ChatGPT"].map((src, idx) => (
                          <span key={idx} className="text-[9px] font-bold bg-muted-bg px-2 py-0.5 rounded border border-border text-foreground">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Prompts Intent Radar Chart Box */}
                  <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-md space-y-2 flex flex-col justify-between">
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase">Prompts Intent</p>
                    
                    {/* Concentric Radar Polygon SVG */}
                    <div className="relative flex items-center justify-center my-1">
                      <svg viewBox="0 0 140 140" className="w-28 h-28 bg-transparent">
                        {/* Outer polygon grid */}
                        <polygon points="70,10 130,70 70,130 10,70" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                        <polygon points="70,30 110,70 70,110 30,70" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                        <polygon points="70,50 90,70 70,90 50,70" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                        {/* Axis lines */}
                        <line x1="70" y1="10" x2="70" y2="130" stroke="#E2E8F0" strokeWidth="1" />
                        <line x1="10" y1="70" x2="130" y2="70" stroke="#E2E8F0" strokeWidth="1" />
                        {/* Active Radar Shape */}
                        <polygon points="70,22 118,70 70,105 28,70" fill="rgba(124, 58, 237, 0.25)" stroke="#7C3AED" strokeWidth="2" />
                      </svg>

                      {/* Intent Labels overlay */}
                      <span className="absolute -top-1 text-[9px] font-bold text-foreground">Informational 38%</span>
                      <span className="absolute -bottom-1 text-[9px] font-bold text-foreground">Transactional 33%</span>
                      <span className="absolute -left-2 text-[9px] font-bold text-foreground">Navigational 21%</span>
                      <span className="absolute -right-2 text-[9px] font-bold text-foreground">Commercial 8%</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── CARD 3: Optimize for search intent ── */}
            <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between hover:border-border/80 transition-all">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Optimize for search intent
                </h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Focus on conversion-friendly keywords that align with user intent, not just high search volume.
                </p>
              </div>

              {/* Graphic Canvas Box */}
              <div className="bg-[#EEF6FF] border border-blue-100 rounded-2xl p-5 relative overflow-hidden min-h-[300px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 via-cyan-100/30 to-transparent rounded-2xl" />

                <div className="relative z-10 w-full space-y-3 max-w-sm mx-auto">
                  
                  {/* Floating Search Intent Tooltip Box */}
                  <div className="bg-white border border-border rounded-2xl p-4 shadow-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <span>SEARCH INTENT</span>
                      <Info size={13} className="text-muted-foreground" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      The main intent for this keyword is informational meaning users are in discovery stage seeking knowledge or details about the topic
                    </p>
                  </div>

                  {/* Intent Funnel Pyramid with Beginner Explanations */}
                  <div className="space-y-1.5 pt-1 text-center">
                    {/* Informational */}
                    <div className="w-full bg-[#FF5A1F] text-white py-2 px-3 rounded-xl text-xs font-bold shadow-sm flex items-center justify-between">
                      <span className="font-extrabold">Informational</span>
                      <span className="text-[10px] opacity-90 font-normal">People want to learn something</span>
                    </div>
                    {/* Commercial */}
                    <div className="w-[92%] mx-auto bg-white border border-[#FF5A1F]/40 text-[#FF5A1F] py-1.5 px-2.5 rounded-lg text-[11px] font-bold shadow-2xs flex items-center justify-between">
                      <span>Commercial</span>
                      <span className="text-[9px] text-muted-foreground font-normal">Comparing options before buying</span>
                    </div>
                    {/* Transactional */}
                    <div className="w-[82%] mx-auto bg-white/80 border border-border text-slate-700 py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-between">
                      <span>Transactional</span>
                      <span className="text-[9px] text-muted-foreground font-normal">Ready to buy / take action</span>
                    </div>
                    {/* Navigational */}
                    <div className="w-[70%] mx-auto bg-white/60 border border-border text-slate-600 py-1 px-2 rounded-md text-[10px] font-medium flex items-center justify-between">
                      <span>Navigational</span>
                      <span className="text-[9px] text-muted-foreground font-normal">Looking for a specific brand</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── CARD 4: Master local search ── */}
            <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between hover:border-border/80 transition-all">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Master local search
                </h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Rank higher in location-based searches (e.g., &quot;best coffee shop in Jacksonville&quot;) to drive more traffic and customers.
                </p>
              </div>

              {/* Graphic Canvas Box */}
              <div className="bg-[#FFFBEB] border border-amber-100 rounded-2xl p-5 relative overflow-hidden min-h-[300px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/40 via-yellow-100/30 to-transparent rounded-2xl" />

                <div className="relative z-10 w-full max-w-sm mx-auto space-y-2">
                  
                  {/* Location Label */}
                  <label className="block text-[11px] font-bold text-foreground">Location</label>

                  {/* Active Highlighted Input Box */}
                  <div className="bg-white border-2 border-[#FF5A1F] rounded-xl p-3 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <span>🇺🇸</span>
                      <span>Jackson</span>
                      <span className="w-0.5 h-4 bg-[#FF5A1F] animate-pulse inline-block" />
                    </div>
                    <ChevronDown size={16} className="text-muted-foreground bg-transparent" />
                  </div>

                  {/* Dropdown Options List */}
                  <div className="bg-white border border-border rounded-xl shadow-xl overflow-hidden text-xs divide-y divide-border">
                    <div className="p-2.5 flex items-center gap-2 hover:bg-slate-50 text-foreground font-semibold cursor-pointer">
                      <span>🇺🇸</span>
                      <span>Jacksonville, Florida, United States</span>
                    </div>
                    <div className="p-2.5 flex items-center gap-2 hover:bg-slate-50 text-foreground font-medium cursor-pointer">
                      <span>🇺🇸</span>
                      <span>Jacksonville Beach, Florida, United States</span>
                    </div>
                    <div className="p-2.5 flex items-center gap-2 hover:bg-slate-50 text-foreground font-medium cursor-pointer">
                      <span>🇺🇸</span>
                      <span>Jacksonville, Alabama, United States</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
        </>
      )}

    </div>
  );
}
