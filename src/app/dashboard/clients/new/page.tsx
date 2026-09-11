"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAuthenticatedClient, getClientCookie } from "@/lib/auth-client";
import { normaliseDomain } from "@/lib/url-input";
import { saveCustomClient, ClientItem } from "@/lib/client-store";
import {
  SERVICE_TYPE_LABELS, TRACK_TYPE_CONFIG,
  INDUSTRIES, COUNTRIES, LOCATIONS,
} from "@/types/search";
import type { ServiceType, TrackType, Location } from "@/types/search";
import { GeneratedQueryItem, WebsiteMetadata } from "@/lib/ai-keyword-generator";
import { 
  Sparkles, CheckCircle2, Loader2, Search as SearchIcon, Copy, Download, 
  Plus, Trash2, Edit2, RotateCw, AlertTriangle, ShieldCheck, ArrowRight, Check
} from "lucide-react";

interface ClientDetails {
  name: string;
  website: string;
  brand_name: string;
  industry: string;
  country: string;
  default_location: Location;
}

function StepIndicator({ current }: { current: number }) {
  const steps = ["Client Details", "AI Query Analysis"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all border ${
                done ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm" :
                active ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md ring-4 ring-[#FF6B00]/20" :
                "bg-card text-muted-foreground border-border"
              }`}>
                {done ? "✓" : n}
              </div>
              <span className={`mt-1.5 text-xs font-semibold ${active || done ? "text-foreground font-bold" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-20 mx-3 mb-4 ${done ? "bg-[#FF6B00]" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NewClientPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 State
  const [details, setDetails] = useState<ClientDetails>({
    name: "", website: "", brand_name: "",
    industry: "Marketing & Advertising", country: "United Arab Emirates",
    default_location: "ae",
  });

  const serviceType: ServiceType = "geo";

  // Step 2 AI Generator State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgressIndex, setAnalysisProgressIndex] = useState(0);
  const [analysisMetadata, setAnalysisMetadata] = useState<WebsiteMetadata | null>(null);
  const [generatedQueries, setGeneratedQueries] = useState<GeneratedQueryItem[]>([]);

  // Filtering & Management State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQueryFilter, setSearchQueryFilter] = useState("");
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [newCustomQueryText, setNewCustomQueryText] = useState("");
  const [showAddCustomInput, setShowAddCustomInput] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const progressSteps = [
    "Analyzing website structure...",
    "Reading title & metadata tags...",
    "Detecting services & niche...",
    "Finding business category...",
    "Generating AI search prompts (Gemini / ChatGPT / Perplexity)...",
    "Finding long-tail keywords...",
    "Checking location relevance...",
    "Building keyword clusters...",
    "Complete!",
  ];

  function handleDetailsChange(field: keyof ClientDetails, value: string) {
    setDetails((d) => ({ ...d, [field]: value }));
    if (field === "name" && !details.brand_name) {
      setDetails((d) => ({ ...d, name: value, brand_name: value }));
    }
  }

  function step1Valid() {
    return !!details.name.trim() && normaliseDomain(details.website) !== null;
  }

  // Trigger AI Analysis
  async function runAIAnalysis() {
    setStep(2);
    setAnalyzing(true);
    setError(null);
    setAnalysisProgressIndex(0);

    // Simulate step progress animation
    const progressInterval = setInterval(() => {
      setAnalysisProgressIndex((prev) => {
        if (prev < progressSteps.length - 2) return prev + 1;
        clearInterval(progressInterval);
        return prev;
      });
    }, 450);

    try {
      const normalised = normaliseDomain(details.website);
      const cleanWebsite = normalised ? normalised.domain : details.website;

      const res = await fetch("/api/clients/ai-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: cleanWebsite,
          brandName: details.brand_name.trim() || details.name.trim(),
          industry: details.industry,
          location: details.default_location,
        })
      });

      clearInterval(progressInterval);
      setAnalysisProgressIndex(progressSteps.length - 1);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.analysis) {
          setAnalysisMetadata(json.analysis.metadata);
          setGeneratedQueries(json.analysis.queries || []);
        }
      } else {
        throw new Error("Analysis completed with fallback");
      }
    } catch {
      // Fallback generator in case of network issue
      const cleanWebsite = details.website.replace(/^https?:\/\//i, '');
      const fallbackList: GeneratedQueryItem[] = [
        { id: "f1", keyword: `best ${details.industry.toLowerCase()} in ${details.default_location.toUpperCase()}`, category: "primary", categoryLabel: "Primary Keyword", intent: "commercial", trackType: "geo", location: details.default_location, selected: true },
        { id: "f2", keyword: `top ${details.brand_name || details.name} services`, category: "primary", categoryLabel: "Primary Keyword", intent: "commercial", trackType: "geo", location: details.default_location, selected: true },
        { id: "f3", keyword: `how to hire ${details.industry.toLowerCase()} expert`, category: "long_tail", categoryLabel: "Long-tail Keyword", intent: "transactional", trackType: "geo", location: details.default_location, selected: true },
        { id: "f4", keyword: `who is the best ${details.industry.toLowerCase()} provider in ${details.default_location.toUpperCase()}`, category: "ai_search", categoryLabel: "AI Search Prompt", intent: "conversational", trackType: "geo", location: details.default_location, selected: true },
      ];
      setGeneratedQueries(fallbackList);
    } finally {
      setTimeout(() => {
        setAnalyzing(false);
      }, 500);
    }
  }

  // Filtered Queries List
  const filteredQueries = useMemo(() => {
    return generatedQueries.filter((q) => {
      const matchCat = selectedCategory === "all" || q.category === selectedCategory;
      const matchSearch = !searchQueryFilter || q.keyword.toLowerCase().includes(searchQueryFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [generatedQueries, selectedCategory, searchQueryFilter]);

  const selectedCount = useMemo(() => generatedQueries.filter(q => q.selected).length, [generatedQueries]);

  // Query Management Handlers
  const toggleSelectAll = (selectState: boolean) => {
    setGeneratedQueries(prev => prev.map(q => ({ ...q, selected: selectState })));
  };

  const toggleQuerySelected = (id: string) => {
    setGeneratedQueries(prev => prev.map(q => q.id === id ? { ...q, selected: !q.selected } : q));
  };

  const removeQuery = (id: string) => {
    setGeneratedQueries(prev => prev.filter(q => q.id !== id));
  };

  const startEditQuery = (id: string, text: string) => {
    setEditingQueryId(id);
    setEditingText(text);
  };

  const saveEditQuery = (id: string) => {
    if (editingText.trim()) {
      setGeneratedQueries(prev => prev.map(q => q.id === id ? { ...q, keyword: editingText.trim().toLowerCase() } : q));
    }
    setEditingQueryId(null);
  };

  const addCustomQuery = () => {
    if (!newCustomQueryText.trim()) return;
    const newQuery: GeneratedQueryItem = {
      id: `custom_${Date.now()}`,
      keyword: newCustomQueryText.trim().toLowerCase(),
      category: "primary",
      categoryLabel: "Custom Keyword",
      intent: "commercial",
      trackType: "geo",
      location: details.default_location,
      selected: true,
      isNew: true,
    };
    setGeneratedQueries(prev => [newQuery, ...prev]);
    setNewCustomQueryText("");
    setShowAddCustomInput(false);
  };

  const copySelectedToClipboard = () => {
    const selectedText = generatedQueries.filter(q => q.selected).map(q => q.keyword).join("\n");
    navigator.clipboard.writeText(selectedText).then(() => {
      setCopyToast("Selected queries copied to clipboard!");
      setTimeout(() => setCopyToast(null), 3000);
    });
  };

  const downloadCSV = () => {
    const selected = generatedQueries.filter(q => q.selected);
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Keyword,Category,Intent,Location\n"
      + selected.map(q => `"${q.keyword}","${q.categoryLabel}","${q.intent}","${q.location}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${details.brand_name || "client"}_queries.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Client & Tracked Queries to DB
  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      let agencyId: string | null = null;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
          agencyId = profile?.agency_id || null;
        }
      } catch {
        // Ignore Supabase auth error if using local/dummy session
      }

      if (!agencyId) {
        if (isAuthenticatedClient() || getClientCookie("vsi_session")) {
          agencyId = "00000000-0000-0000-0000-000000000001";
        }
      }

      if (!agencyId) throw new Error("Not signed in");

      const normalised = normaliseDomain(details.website);
      if (!normalised) throw new Error("Enter a valid website like example.com");
      const cleanWebsite = normalised.domain;

      let clientId: string | null = null;

      // 1. Insert Client
      try {
        const { data: client, error: clientErr } = await supabase
          .from("clients")
          .insert({
            name: details.name.trim(),
            website: cleanWebsite,
            brand_name: details.brand_name.trim() || details.name.trim(),
            service_type: serviceType,
            country: details.country || null,
            industry: details.industry || null,
            default_location: details.default_location,
            agency_id: agencyId,
          })
          .select("id")
          .single();

        if (!clientErr && client?.id) {
          clientId = client.id;
        }
      } catch (err) {
        console.warn("Supabase client insertion fallback:", err);
      }

      if (!clientId) {
        clientId = `client-${Date.now()}`;
      }

      // 2. Insert Tracked Keywords
      const activeQueries = generatedQueries.filter(q => q.selected);
      if (activeQueries.length > 0) {
        const rows = activeQueries.map((kw) => ({
          client_id: clientId,
          agency_id: agencyId,
          keyword: kw.keyword,
          domain: cleanWebsite,
          brand: details.brand_name.trim() || details.name.trim(),
          track_type: kw.trackType,
          location: kw.location,
        }));

        try {
          await supabase.from("tracked_keywords").insert(rows);
        } catch (err) {
          console.warn("Supabase tracked_keywords insertion fallback:", err);
        }
      }

      // Save custom client into localStorage and trigger live update events
      const customClientItem: ClientItem = {
        id: clientId,
        name: details.name.trim(),
        brand_name: details.brand_name.trim() || details.name.trim(),
        website: cleanWebsite,
        service_type: serviceType,
        country: details.country || "United Arab Emirates",
        industry: details.industry || "Marketing & Advertising",
        default_location: details.default_location,
        keywords: activeQueries.length,
        winRate: 0,
        tasks: 0,
        created_at: new Date().toISOString(),
      };
      saveCustomClient(customClientItem, activeQueries);

      router.push(`/dashboard/clients/${clientId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client");
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Add New Client <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold uppercase tracking-wider border border-[#FF6B00]/20 flex items-center gap-1"><Sparkles size={13} /> AI Onboarding</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Automated AI search intelligence & query discovery onboarding assistant</p>
        </div>
      </div>

      <StepIndicator current={step} />

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500 font-medium flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* ── Step 1: Client Details Input ── */}
      {step === 1 && (
        <div className="rounded-[24px] border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-bold text-foreground">Client Profile & Target Region</h2>
            <p className="text-xs text-muted-foreground mt-1">Submit basic business info to trigger automatic AI query discovery</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Client / Company Name *</label>
              <input
                type="text"
                value={details.name}
                onChange={(e) => handleDetailsChange("name", e.target.value)}
                placeholder="e.g. Valgrow Labs"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Website / Domain *</label>
              <input
                type="text"
                value={details.website}
                onChange={(e) => handleDetailsChange("website", e.target.value)}
                placeholder="e.g. valgrowlabs.com"
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors ${
                  details.website.trim() && !normaliseDomain(details.website)
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-border focus:border-[#FF6B00]"
                }`}
              />
              {details.website.trim() && !normaliseDomain(details.website) && (
                <p className="mt-1 text-xs text-rose-500">
                  Enter a full domain like <span className="font-mono">example.com</span>.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Brand Name <span className="text-muted-foreground font-normal">(for AIO detection)</span>
              </label>
              <input
                type="text"
                value={details.brand_name}
                onChange={(e) => handleDetailsChange("brand_name", e.target.value)}
                placeholder="e.g. Valgrow Labs"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[#FF6B00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Industry / Niche</label>
              <select
                value={details.industry}
                onChange={(e) => handleDetailsChange("industry", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-[#FF6B00] focus:outline-none transition-colors"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Target Country</label>
              <select
                value={details.country}
                onChange={(e) => handleDetailsChange("country", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-[#FF6B00] focus:outline-none transition-colors"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Default Search Location</label>
              <select
                value={details.default_location}
                onChange={(e) => handleDetailsChange("default_location", e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-[#FF6B00] focus:outline-none transition-colors"
              >
                {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={runAIAnalysis}
              disabled={!step1Valid()}
              className="flex items-center gap-2 rounded-full bg-[#FF6B00] hover:bg-[#e05e00] px-7 py-3 text-xs font-bold text-white disabled:opacity-40 shadow-lg shadow-[#FF6B00]/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles size={16} /> Analyze Website & Generate Queries →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: AI Progress Animation & Dashboard ── */}
      {step === 2 && (
        <div className="space-y-6">
          {analyzing ? (
            // Live Progress Animation Screen
            <div className="rounded-[24px] border border-border bg-card p-8 sm:p-12 text-center shadow-lg space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto animate-bounce">
                <Sparkles size={32} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">AI Onboarding Assistant Active</h2>
                <p className="text-xs text-muted-foreground">Extracting website metadata, headings, and building multi-intent search prompt clusters...</p>
              </div>

              {/* Progress Steps */}
              <div className="max-w-md mx-auto space-y-2 text-left bg-muted-bg/50 p-4 rounded-2xl border border-border">
                {progressSteps.map((stepText, idx) => {
                  const isDone = idx < analysisProgressIndex;
                  const isCurrent = idx === analysisProgressIndex;
                  return (
                    <div key={stepText} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="text-[#FF6B00] animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                      )}
                      <span className={isDone ? "text-foreground font-semibold" : isCurrent ? "text-[#FF6B00] font-bold" : "text-muted-foreground"}>
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // AI Analysis Dashboard & Editable Query List
            <>
              {/* Toast banner for copy */}
              {copyToast && (
                <div className="p-3 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg text-center flex items-center justify-center gap-2">
                  <Check size={16} /> {copyToast}
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <span className="text-2xl font-bold text-[#FF6B00]">{generatedQueries.length}</span>
                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">Total Queries</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <span className="text-2xl font-bold text-emerald-500">{generatedQueries.filter(q => q.category === "primary").length}</span>
                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">Primary Keywords</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <span className="text-2xl font-bold text-blue-400">{generatedQueries.filter(q => q.category === "long_tail").length}</span>
                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">Long-tail Keywords</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <span className="text-2xl font-bold text-purple-400">{generatedQueries.filter(q => q.category === "geo").length}</span>
                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">GEO Keywords</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border text-center col-span-2 sm:col-span-1">
                  <span className="text-2xl font-bold text-amber-400">{generatedQueries.filter(q => q.category === "ai_search").length}</span>
                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">AI Search Prompts</p>
                </div>
              </div>

              {/* Scraped Website Metadata Banner */}
              {analysisMetadata && (
                <div className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3">
                  <ShieldCheck size={20} className="text-[#FF6B00] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-foreground">AI Intelligence Domain Context: </span>
                    <span className="text-muted-foreground">{analysisMetadata.title || details.website}</span>
                    {analysisMetadata.description && (
                      <p className="text-muted-foreground/80 mt-1 line-clamp-1">"{analysisMetadata.description}"</p>
                    )}
                  </div>
                </div>
              )}

              {/* Control Toolbar */}
              <div className="rounded-[24px] border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground">Discovered Queries</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                      {selectedCount} of {generatedQueries.length} Selected
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleSelectAll(selectedCount !== generatedQueries.length)}
                      className="px-3 py-1.5 rounded-full bg-muted-bg border border-border text-xs font-bold text-foreground hover:bg-card transition-colors"
                    >
                      {selectedCount === generatedQueries.length ? "Deselect All" : "Select All"}
                    </button>
                    <button
                      onClick={runAIAnalysis}
                      className="px-3 py-1.5 rounded-full bg-muted-bg border border-border text-xs font-bold text-foreground hover:border-[#FF6B00]/50 transition-colors flex items-center gap-1"
                    >
                      <RotateCw size={13} /> Regenerate
                    </button>
                    <button
                      onClick={copySelectedToClipboard}
                      className="px-3 py-1.5 rounded-full bg-muted-bg border border-border text-xs font-bold text-foreground hover:border-[#FF6B00]/50 transition-colors flex items-center gap-1"
                    >
                      <Copy size={13} /> Copy
                    </button>
                    <button
                      onClick={downloadCSV}
                      className="px-3 py-1.5 rounded-full bg-muted-bg border border-border text-xs font-bold text-foreground hover:border-[#FF6B00]/50 transition-colors flex items-center gap-1"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                    <button
                      onClick={() => setShowAddCustomInput(!showAddCustomInput)}
                      className="px-3 py-1.5 rounded-full bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#e05e00] transition-colors flex items-center gap-1"
                    >
                      <Plus size={13} /> Add Query
                    </button>
                  </div>
                </div>

                {/* Add Custom Query Input */}
                {showAddCustomInput && (
                  <div className="flex gap-2 p-3 bg-muted-bg/50 rounded-xl border border-border">
                    <input
                      type="text"
                      value={newCustomQueryText}
                      onChange={(e) => setNewCustomQueryText(e.target.value)}
                      placeholder="Type custom search query or AI prompt..."
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-[#FF6B00]"
                      onKeyDown={(e) => { if (e.key === 'Enter') addCustomQuery(); }}
                    />
                    <button onClick={addCustomQuery} className="px-4 py-1.5 bg-[#FF6B00] text-white text-xs font-bold rounded-lg hover:bg-[#e05e00]">
                      Add
                    </button>
                  </div>
                )}

                {/* Search & Category Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: "all", label: "All" },
                      { id: "primary", label: "Primary" },
                      { id: "long_tail", label: "Long-tail" },
                      { id: "geo", label: "GEO / Location" },
                      { id: "ai_search", label: "AI Prompts" },
                      { id: "branded", label: "Branded" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedCategory === cat.id
                            ? "bg-[#FF6B00] text-white"
                            : "bg-muted-bg text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter queries..."
                      value={searchQueryFilter}
                      onChange={(e) => setSearchQueryFilter(e.target.value)}
                      className="w-full bg-background border border-border rounded-full pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                {/* Query List Table */}
                <div className="rounded-2xl border border-border overflow-hidden max-h-[420px] overflow-y-auto">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted-bg text-[11px] text-muted-foreground font-bold uppercase sticky top-0 border-b border-border z-10">
                    <div className="col-span-1">Select</div>
                    <div className="col-span-6">Query / Search Prompt</div>
                    <div className="col-span-3">Category & Track</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  {filteredQueries.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No queries matching the current filter.
                    </div>
                  ) : (
                    filteredQueries.map((q) => (
                      <div key={q.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border items-center last:border-0 hover:bg-muted-bg/40 transition-colors">
                        {/* Checkbox */}
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={q.selected}
                            onChange={() => toggleQuerySelected(q.id)}
                            className="w-4 h-4 accent-[#FF6B00] rounded cursor-pointer"
                          />
                        </div>

                        {/* Query Text / Editable */}
                        <div className="col-span-6 pr-2">
                          {editingQueryId === q.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 bg-background border border-[#FF6B00] rounded px-2 py-1 text-xs text-foreground outline-none"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') saveEditQuery(q.id); }}
                              />
                              <button onClick={() => saveEditQuery(q.id)} className="px-2 py-1 bg-[#FF6B00] text-white text-xs font-bold rounded">
                                Save
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-foreground leading-relaxed block">
                              {q.keyword}
                              {q.isTrending && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase">
                                  🔥 Trending
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Category & Track Type Badge */}
                        <div className="col-span-3 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                            AI Mode
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted-bg text-muted-foreground border border-border">
                            {q.categoryLabel}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEditQuery(q.id, q.keyword)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                            title="Edit query"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => removeQuery(q.id)}
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete query"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-border bg-card px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back to Details
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full border border-border bg-muted-bg px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {saving ? "Saving..." : "Skip queries for now"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || selectedCount === 0}
                    className="rounded-full bg-[#FF6B00] hover:bg-[#e05e00] px-7 py-2.5 text-xs font-bold text-white disabled:opacity-40 shadow-lg shadow-[#FF6B00]/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    {saving ? "Saving..." : `Save Client + ${selectedCount} Quer${selectedCount !== 1 ? "ies" : "y"}`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
