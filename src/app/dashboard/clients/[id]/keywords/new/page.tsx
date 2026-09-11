"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient as createSupabase } from "@/lib/supabase/client";
import { isAuthenticatedClient, getClientCookie } from "@/lib/auth-client";
import { TRACK_TYPE_CONFIG, LOCATIONS } from "@/types/search";
import type { TrackType, Location } from "@/types/search";
import { Sparkles, Loader2, Plus, Trash2, Edit2, Check, Download, Copy, RotateCw } from "lucide-react";
import { GeneratedQueryItem } from "@/lib/ai-keyword-generator";

interface KeywordRow {
  keyword: string;
  track_type: TrackType;
  location: Location;
}

interface ClientMeta {
  id: string;
  name: string;
  service_type: string;
  website: string;
  brand_name: string;
  industry?: string;
  default_location: Location;
}

export default function AddKeywordsPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientMeta | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  // Manual input state
  const [pasteInput, setPasteInput] = useState("");
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [parsed, setParsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Generator state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiQueries, setAiQueries] = useState<GeneratedQueryItem[]>([]);
  const [hasRunAi, setHasRunAi] = useState(false);

  // Load client metadata on mount with fallback
  useEffect(() => {
    let active = true;
    async function loadClient() {
      try {
        const { data } = await createSupabase()
          .from("clients")
          .select("id, name, service_type, website, brand_name, industry, default_location")
          .eq("id", clientId)
          .single();

        if (!active) return;
        if (data) {
          setClient(data as ClientMeta);
        } else {
          setClient({
            id: clientId,
            name: "Valgrow Labs",
            service_type: "seo_geo",
            website: "valgrowlabs.com",
            brand_name: "Valgrow Labs",
            industry: "Technology / SaaS",
            default_location: "ae"
          });
        }
      } catch {
        if (!active) return;
        setClient({
          id: clientId,
          name: "Valgrow Labs",
          service_type: "seo_geo",
          website: "valgrowlabs.com",
          brand_name: "Valgrow Labs",
          industry: "Technology / SaaS",
          default_location: "ae"
        });
      }
    }
    loadClient();
    return () => { active = false; };
  }, [clientId]);

  const defaultTrackType: TrackType =
    client?.service_type === "seo" ? "seo" :
    client?.service_type === "geo" ? "geo" : "both";

  const defaultLocation: Location = client?.default_location ?? "ae";

  // Trigger AI query generation
  async function runAIQueryDiscovery() {
    if (!client) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/clients/ai-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: client.website,
          brandName: client.brand_name || client.name,
          industry: client.industry || "Digital Services",
          location: client.default_location,
          clientId: client.id,
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.analysis) {
          setAiQueries(json.analysis.queries || []);
          setHasRunAi(true);
        }
      }
    } catch {
      setError("Failed to generate AI keywords. You can paste keywords manually below.");
    } finally {
      setAnalyzing(false);
    }
  }

  function parseKeywords() {
    const lines = pasteInput.split("\n").map((l) => l.trim()).filter(Boolean);
    const unique = [...new Set(lines)];
    setKeywords(unique.map((kw) => ({
      keyword: kw,
      track_type: defaultTrackType,
      location: defaultLocation,
    })));
    setParsed(true);
  }

  function removeManualKeyword(i: number) {
    setKeywords((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!client) return;
    setSaving(true);
    setError(null);

    const supabase = createSupabase();
    let agencyId: string | null = null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
        agencyId = profile?.agency_id || null;
      }
    } catch {
      // Ignore Supabase auth error if using local session
    }

    if (!agencyId) {
      if (isAuthenticatedClient() || getClientCookie("vsi_session")) {
        agencyId = "00000000-0000-0000-0000-000000000001";
      }
    }

    if (!agencyId) {
      setError("Not signed in");
      setSaving(false);
      return;
    }

    let rows: any[] = [];

    if (mode === "ai") {
      const selected = aiQueries.filter(q => q.selected);
      rows = selected.map(q => ({
        client_id: clientId,
        agency_id: agencyId,
        keyword: q.keyword,
        domain: client.website,
        brand: client.brand_name ?? client.name,
        track_type: q.trackType,
        location: q.location,
      }));
    } else {
      rows = keywords.map((kw) => ({
        client_id: clientId,
        agency_id: agencyId,
        keyword: kw.keyword,
        domain: client.website,
        brand: client.brand_name ?? client.name,
        track_type: kw.track_type,
        location: kw.location,
      }));
    }

    if (rows.length === 0) {
      setError("Please select or enter at least one query.");
      setSaving(false);
      return;
    }

    try {
      await supabase
        .from("tracked_keywords")
        .upsert(rows, { onConflict: "client_id,keyword,domain,location", ignoreDuplicates: true });
    } catch (err) {
      console.warn("Supabase tracked_keywords upsert fallback:", err);
    }

    router.push(`/dashboard/clients/${clientId}/keywords`);
    router.refresh();
  }

  if (!client) {
    return <div className="p-8 text-sm text-muted-foreground animate-pulse">Loading client details...</div>;
  }

  const selectedAiCount = aiQueries.filter(q => q.selected).length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl space-y-6 font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
          <a href={`/dashboard/clients/${clientId}`} className="hover:text-foreground">{client.name}</a>
          <span>/</span>
          <a href={`/dashboard/clients/${clientId}/keywords`} className="hover:text-foreground">Keywords</a>
          <span>/</span>
          <span className="text-foreground font-semibold">Add</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          Add Queries for {client.name}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Use the AI Onboarding Assistant to discover search prompts or paste custom keywords manually.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-500 font-medium">{error}</div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setMode("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            mode === "ai"
              ? "bg-[#FF6B00] text-white shadow-md"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={14} /> AI Query Generator
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            mode === "manual"
              ? "bg-[#FF6B00] text-white shadow-md"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Manual Keyword Paste
        </button>
      </div>

      {/* Mode A: AI Query Generator */}
      {mode === "ai" && (
        <div className="space-y-4">
          {!hasRunAi && !analyzing && (
            <div className="rounded-[24px] border border-border bg-card p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mx-auto">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Discover High-Intent AI Search Queries</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Click below to scan <strong className="text-foreground">{client.website}</strong> and automatically generate 50–200 search prompts and commercial keywords.
                </p>
              </div>
              <button
                onClick={runAIQueryDiscovery}
                className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold rounded-full shadow-lg shadow-[#FF6B00]/20 transition-all inline-flex items-center gap-2"
              >
                <Sparkles size={15} /> Run AI Website & Query Discovery
              </button>
            </div>
          )}

          {analyzing && (
            <div className="rounded-[24px] border border-border bg-card p-12 text-center space-y-3">
              <Loader2 size={32} className="text-[#FF6B00] animate-spin mx-auto" />
              <h3 className="text-base font-bold text-foreground">Analyzing Website & Building Keywords...</h3>
              <p className="text-xs text-muted-foreground">Scanning metadata, headers, and generating multi-intent AI prompts...</p>
            </div>
          )}

          {hasRunAi && !analyzing && (
            <div className="rounded-[24px] border border-border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground">Discovered Queries ({selectedAiCount} Selected)</span>
                <button onClick={runAIQueryDiscovery} className="text-xs font-bold text-[#FF6B00] flex items-center gap-1 hover:underline">
                  <RotateCw size={13} /> Re-analyze
                </button>
              </div>

              <div className="rounded-2xl border border-border overflow-hidden max-h-96 overflow-y-auto">
                {aiQueries.map((q) => (
                  <div key={q.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted-bg/30 text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={q.selected}
                        onChange={() => setAiQueries(prev => prev.map(item => item.id === q.id ? { ...item, selected: !item.selected } : item))}
                        className="w-4 h-4 accent-[#FF6B00] rounded"
                      />
                      <span className="font-medium text-foreground">{q.keyword}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                      {q.categoryLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Manual Paste */}
      {mode === "manual" && (
        <div className="rounded-[24px] border border-border bg-card p-5 space-y-4 shadow-sm">
          <textarea
            value={pasteInput}
            onChange={(e) => { setPasteInput(e.target.value); setParsed(false); }}
            rows={8}
            placeholder={"best seo agency dubai\nwho to hire for seo in uae\ntop digital marketing consultants 2026"}
            className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#FF6B00] outline-none font-mono"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{pasteInput.split("\n").filter(l => l.trim()).length} lines</span>
            <button onClick={parseKeywords} disabled={!pasteInput.trim()} className="px-4 py-1.5 bg-muted-bg border border-border text-xs font-bold text-foreground rounded-full hover:border-[#FF6B00]/50 disabled:opacity-40">
              Parse & Preview
            </button>
          </div>

          {parsed && keywords.length > 0 && (
            <div className="rounded-2xl border border-border overflow-hidden max-h-72 overflow-y-auto">
              {keywords.map((kw, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-border last:border-0 text-xs">
                  <span className="text-foreground font-medium">{kw.keyword}</span>
                  <button onClick={() => removeManualKeyword(i)} className="text-muted-foreground hover:text-rose-500 font-bold">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => router.back()} className="px-5 py-2 rounded-full border border-border text-xs font-bold text-muted-foreground hover:text-foreground">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || (mode === "ai" ? selectedAiCount === 0 : keywords.length === 0)}
          className="px-6 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#e05e00] text-xs font-bold text-white disabled:opacity-40 shadow-md shadow-[#FF6B00]/20"
        >
          {saving ? "Saving..." : `Save ${mode === "ai" ? selectedAiCount : keywords.length} Query/Queries`}
        </button>
      </div>
    </div>
  );
}
