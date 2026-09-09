import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency, isDummySupabase } from "@/lib/auth";

export const dynamic = "force-dynamic";

// In-memory fallback for dummy Supabase mode
let dummyCompetitorsStore: Array<{
  id: string;
  agency_id: string;
  name: string;
  domain: string;
  visibility_score: number | null;
  ai_mentions_count: number | null;
  top_engine: string | null;
  gap_status: "Leading" | "Tied" | "Lagging" | null;
  sentiment: string | null;
  status: "pending" | "analyzing" | "active" | "failed";
  created_at: string;
  updated_at: string;
}> = [];

function cleanDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.replace(/^www\./i, "");
  domain = domain.split("/")[0].split("?")[0].split("#")[0];
  return domain;
}

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length < 3 || domain.length > 253) return false;
  // Domain regex: standard domain with valid extension
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,63}$/i;
  return domainRegex.test(domain);
}

function formatNameFromDomain(domain: string): string {
  const parts = domain.split(".");
  const mainPart = parts[0] || domain;
  return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAgency();

    if (isDummySupabase()) {
      const agencyComps = dummyCompetitorsStore.filter(c => c.agency_id === session.agencyId);
      
      const activeWithVis = agencyComps.filter(c => c.visibility_score !== null);
      const topRival = activeWithVis.sort((a, b) => (b.visibility_score ?? 0) - (a.visibility_score ?? 0))[0];

      return NextResponse.json({
        competitors: agencyComps,
        kpis: {
          trackedCount: agencyComps.length,
          topRivalDomain: topRival ? topRival.domain : "N/A",
          topRivalVisibility: topRival && topRival.visibility_score !== null ? `${topRival.visibility_score}%` : "Pending",
          brandAiShare: "0.0%",
          citationGapAdvantage: "+0.0%"
        }
      });
    }

    const supabase = await createClient();
    const { data: competitors, error } = await supabase
      .from("tracked_competitors")
      .select("*")
      .eq("agency_id", session.agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet or DB fails, fallback gracefully
      console.error("Supabase competitors query error:", error);
      return NextResponse.json({
        competitors: [],
        kpis: {
          trackedCount: 0,
          topRivalDomain: "N/A",
          topRivalVisibility: "Pending",
          brandAiShare: "0.0%",
          citationGapAdvantage: "+0.0%"
        }
      });
    }

    const compList = competitors || [];
    const activeWithVis = compList.filter(c => c.visibility_score !== null && c.visibility_score !== undefined);
    const topRival = activeWithVis.sort((a, b) => Number(b.visibility_score) - Number(a.visibility_score))[0];

    return NextResponse.json({
      competitors: compList,
      kpis: {
        trackedCount: compList.length,
        topRivalDomain: topRival ? topRival.domain : (compList.length > 0 ? "Pending Analysis" : "N/A"),
        topRivalVisibility: topRival && topRival.visibility_score !== null ? `${topRival.visibility_score}%` : "Analysis pending",
        brandAiShare: "0.0%",
        citationGapAdvantage: "+0.0%"
      }
    });

  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch competitors" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAgency();
    const body = await req.json();

    const rawDomain = body.domain;
    if (!rawDomain || typeof rawDomain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const domain = cleanDomain(rawDomain);
    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format. Example: competitor.com" },
        { status: 400 }
      );
    }

    const name = body.name?.trim() || formatNameFromDomain(domain);

    if (isDummySupabase()) {
      const existing = dummyCompetitorsStore.find(
        c => c.agency_id === session.agencyId && c.domain.toLowerCase() === domain.toLowerCase()
      );
      if (existing) {
        return NextResponse.json({ error: "Competitor already tracked" }, { status: 409 });
      }

      const newComp = {
        id: `comp-${Date.now()}`,
        agency_id: session.agencyId,
        name,
        domain,
        visibility_score: null,
        ai_mentions_count: null,
        top_engine: null,
        gap_status: null,
        sentiment: null,
        status: "pending" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      dummyCompetitorsStore.unshift(newComp);
      return NextResponse.json(newComp, { status: 201 });
    }

    const supabase = await createClient();

    // Check duplicate
    const { data: existing } = await supabase
      .from("tracked_competitors")
      .select("id")
      .eq("agency_id", session.agencyId)
      .eq("domain", domain)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Competitor already tracked" }, { status: 409 });
    }

    const newRecord = {
      agency_id: session.agencyId,
      name,
      domain,
      status: "pending",
      visibility_score: null,
      ai_mentions_count: null,
      top_engine: null,
      gap_status: null,
      sentiment: null
    };

    const { data, error } = await supabase
      .from("tracked_competitors")
      .insert(newRecord)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Competitor already tracked" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create competitor" },
      { status: 500 }
    );
  }
}
