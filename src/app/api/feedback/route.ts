import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

interface Payload {
  rating?: number;
  comment?: string;
  attachment_name?: string | null;
  attachment_data?: string | null;
  page?: string | null;
  browser?: string | null;
  device?: string | null;
  os?: string | null;
  screen?: string | null;
  viewport?: string | null;
  timezone?: string | null;
  theme?: string | null;
  timestamp?: string | null;
  category?: string;
  message?: string;
  page_url?: string | null;
  context_data?: Record<string, unknown> | null;
}

type Category = "bug" | "idea" | "question" | "praise" | "general";
const VALID: Category[] = ["bug", "idea", "question", "praise", "general"];

function ratingToCategory(rating: number): Category {
  if (rating >= 4) return "praise";
  if (rating === 3) return "general";
  return "bug";
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAgency();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[feedback] GET failed:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let session: { agencyId: string; userId: string } | null = null;
    try { session = await requireAgency(); } catch { /* allow anonymous feedback */ }
    const supabase = await createClient();
    const body     = (await req.json()) as Payload;
    const isNew    = typeof body.rating === "number";

    if (isNew) {
      const rating  = body.rating as number;
      const comment = (body.comment ?? "").trim();
      if (rating < 1 || rating > 5)
        return NextResponse.json({ error: "Invalid rating (1-5 required)" }, { status: 400 });
      if (comment.length < 4)
        return NextResponse.json({ error: "Comment must be at least 4 characters" }, { status: 400 });
      if (comment.length > 2000)
        return NextResponse.json({ error: "Comment too long (max 2000 characters)" }, { status: 400 });

      const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;
      const contextDataObj = body.context_data ?? {
        rating,
        device:          body.device    ?? null,
        os:              body.os         ?? null,
        screen:          body.screen     ?? null,
        viewport:        body.viewport   ?? null,
        timezone:        body.timezone   ?? null,
        theme:           body.theme      ?? null,
        timestamp:       body.timestamp  ?? null,
        attachment_name: body.attachment_name ?? null,
      };

      const insertPayload = {
        agency_id:    session?.agencyId ?? null,
        user_id:      session?.userId ?? null,
        category:     ratingToCategory(rating),
        rating:       String(rating),
        subject:      comment.length > 80 ? comment.slice(0, 80) + "..." : comment,
        message:      comment,
        attachment_url: body.attachment_name ?? null,
        page_url:     (body.page ?? body.page_url ?? "").slice(0, 500) || null,
        user_agent:   body.browser?.slice(0, 500) ?? ua,
        context_data: contextDataObj,
        status:       "new",
      };

      const { data, error } = await supabase
        .from("feedback")
        .insert(insertPayload)
        .select("id")
        .single();

      if (error || !data) {
        console.warn("[feedback] DB insert failed:", error?.message);
        return NextResponse.json({ ok: false, error: error?.message ?? "Database insert failed" }, { status: 500 });
      }

      if (session) {
        track({
          agencyId: session.agencyId,
          userId:   session.userId,
          type:     "feedback_submitted",
          payload:  { rating, page_url: body.page ?? null, comment_length: comment.length,
                      has_attachment: !!body.attachment_name, device: body.device ?? null },
        });
      }

      return NextResponse.json({ ok: true, id: data.id });
    }

    // Legacy category+message path
    const category = body.category as Category;
    const message  = (body.message ?? "").trim();
    if (!VALID.includes(category))
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    if (message.length < 4)
      return NextResponse.json({ error: "Please write a short message (4+ characters)" }, { status: 400 });
    if (message.length > 5000)
      return NextResponse.json({ error: "Message is too long (5000 char max)" }, { status: 400 });

    const ua = req.headers.get("user-agent")?.slice(0, 500) ?? null;
    const legacyPayload = {
      agency_id:    session?.agencyId ?? null,
      user_id:      session?.userId ?? null,
      category,
      rating:       null,
      subject:      null,
      message,
      attachment_url: null,
      page_url:     body.page_url?.slice(0, 500) ?? null,
      user_agent:   ua,
      context_data: body.context_data ?? null,
      status:       "new",
    };

    const { data, error } = await supabase
      .from("feedback")
      .insert(legacyPayload)
      .select("id")
      .single();

    if (error || !data) {
      console.warn("[feedback] DB insert failed:", error?.message);
      return NextResponse.json({ ok: false, error: error?.message ?? "Database insert failed" }, { status: 500 });
    }

    if (session) {
      track({
        agencyId: session.agencyId,
        userId:   session.userId,
        type:     "feedback_submitted",
        payload:  { category, page_url: body.page_url ?? null, message_length: message.length },
      });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
