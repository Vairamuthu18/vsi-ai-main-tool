import { NextRequest, NextResponse } from "next/server";
import { fetchRank } from "@/lib/serper";
import { normaliseDomain } from "@/lib/url-input";
import type { Location } from "@/types/search";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, domain, brand, location } = body as {
      keyword: string;
      domain: string;
      brand?: string;
      location: Location;
    };

    if (!keyword?.trim() || !domain?.trim() || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const norm = normaliseDomain(domain);
    if (!norm) {
      return NextResponse.json({ error: "Enter a valid domain like example.com" }, { status: 400 });
    }

    const result = await fetchRank(keyword.trim(), norm.domain, location, brand?.trim() ?? norm.stem);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch ranking data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
