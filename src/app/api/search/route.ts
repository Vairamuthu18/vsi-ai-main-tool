import { NextRequest, NextResponse } from "next/server";
import { searchSerpApi, SerpApiError } from "@/lib/serpapi-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, domain, brandName, location } = body as {
      keyword?: string;
      domain?: string;
      brandName?: string;
      location?: string;
    };

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { success: false, error: "Keyword parameter is required." },
        { status: 400 }
      );
    }

    const glMap: Record<string, string> = {
      "UAE": "ae",
      "United Arab Emirates": "ae",
      "ae": "ae",
      "United States": "us",
      "US": "us",
      "us": "us",
      "United Kingdom": "uk",
      "UK": "uk",
      "uk": "uk",
      "India": "in",
      "in": "in",
      "Sri Lanka": "lk",
      "lk": "lk",
      "Canada": "ca",
      "ca": "ca",
      "Australia": "au",
      "au": "au",
      "Germany": "de",
      "de": "de",
      "Singapore": "sg",
      "sg": "sg",
    };

    const gl = glMap[location || ""] || "ae";

    const response = await searchSerpApi(keyword.trim(), {
      engine: "google",
      gl,
      hl: "en",
      num: 10,
    });

    return NextResponse.json({
      success: true,
      query: response.query,
      domain: domain ?? null,
      brandName: brandName ?? null,
      location: location ?? "UAE",
      total_results: response.total_results,
      results: response.results,
    });
  } catch (error: unknown) {
    if (error instanceof SerpApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
