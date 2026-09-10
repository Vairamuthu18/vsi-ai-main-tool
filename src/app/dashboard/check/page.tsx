"use client";

import { useState } from "react";
import type { Location, RunCheckResult } from "@/types/search";
import { LOCATIONS } from "@/types/search";
import CitationCard from "@/components/CitationCard";
import GapMetrics from "@/components/GapMetrics";
import type { CitationContent } from "@/app/api/citation-content/route";
import { normaliseDomain } from "@/lib/url-input";
import { Search, Zap, Globe, TrendingUp, AlertCircle, XCircle, Loader2 } from "lucide-react";

type CitationMap = Record<string, CitationContent | "loading" | "error">;

const GAP_STYLES: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
  strong_visibility: { border: "border-[#22C55E]/30", bg: "bg-[#22C55E]/5", badge: "bg-[#22C55E]/10 text-[#22C55E]", dot: "bg-[#22C55E]" },
  seo_plus_citation: { border: "border-[#22C55E]/30", bg: "bg-[#22C55E]/5", badge: "bg-[#22C55E]/10 text-[#22C55E]", dot: "bg-[#22C55E]" },
  ai_visible: { border: "border-[#22C55E]/30", bg: "bg-[#22C55E]/5", badge: "bg-[#22C55E]/10 text-[#22C55E]", dot: "bg-[#22C55E]" },
  partial_visibility: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  ai_mention_only: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  citation_only: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  seo_only: { border: "border-[#FFD600]/30", bg: "bg-[#FFD600]/5", badge: "bg-[#FFD600]/10 text-[#FFD600]", dot: "bg-[#FFD600]" },
  weak_double_loss: { border: "border-rose-500/30", bg: "bg-rose-500/5", badge: "bg-rose-500/10 text-rose-400", dot: "bg-rose-500" },
};

const getGapStyle = (label: string) => GAP_STYLES[label] ?? GAP_STYLES.weak_double_loss;

export default function QuickCheckPage() {
  const [keyword, setKeyword] = useState("");
  const [domain, setDomain] = useState("");
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState<Location>("ae");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunCheckResult | null>(null);
  const [citationMap, setCitationMap] = useState<CitationMap>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) {
      setError("Keyword is required.");
      return;
    }
    if (!domain.trim()) {
      setError("Domain is required.");
      return;
    }
    if (!brand.trim()) {
      setError("Brand Name is required.");
      return;
    }

    const normalisedDomain = normaliseDomain(domain);
    if (!normalisedDomain) {
      setError("Enter a valid domain like example.com");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCitationMap({});

    try {
      const payload = {
        keyword: keyword.trim(),
        domain: normalisedDomain.domain,
        brand: brand.trim(),
        location,
      };

      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Data unavailable: Request failed (${res.status})`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Data unavailable");
      }

      setResult(data as RunCheckResult);

      // Preload citation content analysis asynchronously if citations exist
      if (data.citations?.length) {
        const initialMap: CitationMap = {};
        data.citations.forEach((c: { url: string }) => { initialMap[c.url] = "loading"; });
        setCitationMap(initialMap);

        data.citations.forEach((c: { url: string; sourceName: string }) => {
          fetch("/api/citation-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: c.url, analyze: false }),
          })
            .then((r) => r.ok ? r.json() : Promise.reject())
            .then((content: CitationContent) => {
              setCitationMap((prev) => ({ ...prev, [c.url]: content }));
            })
            .catch(() => {
              setCitationMap((prev) => ({ ...prev, [c.url]: "error" }));
            });
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Data unavailable. Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const gap = result?.status ?? null;
  const gapStyle = gap ? getGapStyle(gap.label) : null;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-background p-3 sm:p-6 font-sans text-foreground">
      <div className="max-w-[1400px] mx-auto bg-card rounded-[20px] p-6 lg:p-8 shadow-2xl border border-border min-h-[calc(100vh-108px)]">

        {/* Page title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-[20px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Keyword Intelligence & AI Check</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Check search rank & AI Mode visibility for any keyword</p>
          </div>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[20px] p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
                Keyword <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. best SEO agency dubai"
                required
                className="w-full bg-background border border-border focus:border-amber-500 rounded-[20px] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
                Domain <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. unitedseo.ae"
                required
                className={`w-full bg-background border rounded-[20px] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors ${
                  domain.trim() && !normaliseDomain(domain)
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-border focus:border-amber-500"
                }`}
              />
              {domain.trim() && !normaliseDomain(domain) && (
                <p className="mt-1 text-xs text-rose-500">Enter a domain like <span className="font-mono">example.com</span></p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. United SEO"
                required
                className="w-full bg-background border border-border focus:border-amber-500 rounded-[20px] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
                Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as Location)}
                className="w-full bg-background border border-border focus:border-amber-500 rounded-[20px] px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors appearance-none font-medium"
              >
                {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([key, val]) => (
                  <option key={key} value={key} className="bg-card text-foreground">{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm transition-colors cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
              ) : (
                <><Zap className="w-4 h-4" /> Run Check</>
              )}
            </button>
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-[20px] px-5 py-4 mb-6 text-sm text-rose-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <div>
              <p className="font-bold text-rose-500">Data unavailable</p>
              <p className="text-xs text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 shadow-xs">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm font-medium">Enter keyword, domain, brand name, and location above to run an exact live intelligence check.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 w-full max-w-xl">
              {[
                { icon: TrendingUp, label: "Google Rank", desc: "Determines organic position for normalized domain" },
                { icon: Zap, label: "AI Mode Visibility", desc: "Checks brand mentions & source citation links" },
                { icon: Globe, label: "Competitor Extraction", desc: "Deduplicates competitor domains across search & AI" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-slate-50 border border-slate-200 rounded-[20px] p-4 text-left shadow-xs hover:border-slate-300 transition-colors">
                  <Icon className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="text-xs font-bold text-slate-900 mb-1">{label}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results view */}
        {result && gap && gapStyle && (
          <div className="space-y-5">

            {/* Gap classification banner */}
            <div className={`rounded-[20px] border ${gapStyle.border} ${gapStyle.bg} px-6 py-4 flex items-center justify-between gap-4 shadow-md flex-wrap`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${gapStyle.dot}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900">{gap.title}</p>
                    {result.isDemo && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">Demo Data</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{gap.description}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3.5 py-1 rounded-full ${gapStyle.badge} uppercase tracking-wider`}>
                {gap.label.replace(/_/g, " ")}
              </span>
            </div>

            {/* SERP + AIO side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* SERP card */}
              <div className="bg-card border border-border/80 rounded-[20px] p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Google Ranking</h3>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>

                {result.googleRank !== null ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">#{result.googleRank}</span>
                    <span className="text-sm font-medium text-slate-500">for {result.domain}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-sm font-semibold text-slate-700">Not found in top Google organic search results</p>
                  </div>
                )}

                {result.organicResults.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {result.organicResults.map((r) => (
                      <div
                        key={r.url}
                        className={`flex items-start gap-3 rounded-[16px] px-3.5 py-2.5 transition-all ${
                          r.isClient ? "bg-amber-500/10 border border-amber-500/30 shadow-xs" : "bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80"
                        }`}
                      >
                        <span className={`shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                          r.isClient ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700 border border-slate-300"
                        }`}>
                          {r.position}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${r.isClient ? "text-amber-600 font-bold" : "text-slate-800"}`}>{r.title}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">{r.domain}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AIO card */}
              <div className="bg-card border border-border/80 rounded-[20px] p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">AI Mode Visibility</h3>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${result.aioPresent ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-rose-500"}`} />
                  <span className="text-sm font-bold text-slate-900">
                    {result.aioPresent ? "AI Mode triggered" : "No AI Mode triggered for this query"}
                  </span>
                </div>

                {result.aioPresent && (
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      result.brandCited
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {result.brandCited ? `✓ Cited as source (#${result.clientCitationPosition})` : "✗ Not a cited source link"}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      result.brandMentioned
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {result.brandMentioned ? "✓ Mentioned in AI text" : "✗ Not mentioned in text"}
                    </span>
                  </div>
                )}

                {result.aioBlocks.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-border/60">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Answer Preview</p>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-[16px] p-4 space-y-2 max-h-64 overflow-y-auto">
                      {result.aioBlocks.map((block, i) => (
                        block.type === "paragraph" ? (
                          <p key={i} className="text-xs text-slate-700 leading-relaxed font-normal">{block.snippet}</p>
                        ) : block.type === "list" && block.list ? (
                          <ul key={i} className="space-y-1.5 pl-1">
                            {block.list.map((item, j) => (
                              <li key={j} className="flex gap-2 text-xs text-slate-700 leading-relaxed">
                                <span className="text-amber-500 shrink-0 font-bold">•</span>
                                <span>{item.snippet}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gap Metrics Component */}
            <GapMetrics
              serp={result.serp}
              aio={result.aio}
              uniqueCompetitorsCount={result.uniqueCompetitorsCount}
              totalCitationsCount={result.totalCitationsCount}
            />

            {/* Citations List */}
            {result.aioPresent && result.citations.length > 0 && (
              <div className="bg-card border border-border/80 rounded-[20px] p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">AI Mode Citations</h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {result.uniqueCompetitorsCount} unique competitors across {result.totalCitationsCount} source citations
                  </span>
                </div>
                <div className="space-y-2.5">
                  {result.citations.map((c) => {
                    const cData = citationMap[c.url];
                    return (
                      <CitationCard
                        key={c.url}
                        citation={c}
                        keyword={keyword}
                        clientBrand={brand || domain}
                        preloaded={cData instanceof Object && cData !== null && typeof cData !== "string" ? cData as CitationContent : null}
                        loadingPreload={cData === "loading"}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
