"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Search, ChevronDown, Info, ExternalLink, Globe, MapPin, 
  TrendingUp, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, 
  HelpCircle, Layers, PieChart, Users, Cpu, FileText
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

export default function DashboardClientView({
  isSuperAdmin,
  clientList,
  keywordCount,
  rawResults,
  maxClients,
}: DashboardClientViewProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Form states for top search header
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("English");
  const [location, setLocation] = useState("India");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    router.push(
      `/dashboard/research?q=${encodeURIComponent(searchQuery.trim())}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}`
    );
  };

  const handleQuickTry = (example: string) => {
    router.push(
      `/dashboard/research?q=${encodeURIComponent(example)}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}`
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans transition-colors bg-[#F8FAFC] min-h-screen">
      
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
              Start your SEO Research
            </h2>
            <Link
              href="/dashboard/research"
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
              "web development company"
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
          <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF5A1F] flex items-center justify-center font-bold">
                <Search size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground">Find Keywords</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Discover keywords your customers are searching for.
              </p>
            </div>
            <Link
              href="/dashboard/research"
              className="inline-flex items-center text-xs font-bold text-[#FF5A1F] hover:underline"
            >
              Find Keywords →
            </Link>
          </div>

            {/* Card 2: Check Your Website */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-base font-bold text-foreground">Check Your Website</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Find SEO problems that may be hurting your rankings.
                </p>
              </div>
              <Link
                href="/dashboard/check?tab=diagnostics"
                className="inline-flex items-center text-xs font-bold text-blue-600 hover:underline"
              >
                Run SEO Check →
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

    </div>
  );
}
