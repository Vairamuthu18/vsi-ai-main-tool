import { NextRequest, NextResponse } from "next/server";
import { runCheckPipeline } from "@/lib/run-check";
import type { Location } from "@/types/search";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, domain, brand, location, language, provider, bypassCache } = body as {
      keyword: string;
      domain: string;
      brand?: string;
      location: Location;
      language?: string;
      provider?: string;
      bypassCache?: boolean;
    };

    if (!keyword?.trim() || !domain?.trim() || !location) {
      return NextResponse.json(
        { success: false, error: "Keyword, Domain, and Location parameters are required." },
        { status: 400 }
      );
    }

    const result = await runCheckPipeline({
      keyword,
      domain,
      brand: brand ?? "",
      location,
      language,
      provider,
      bypassCache,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to run Keyword Intelligence check.";
    console.error("[API /api/check Error]:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
