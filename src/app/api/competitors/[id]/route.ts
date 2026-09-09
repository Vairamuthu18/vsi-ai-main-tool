import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAgency, isDummySupabase } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgency();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Competitor ID is required" }, { status: 400 });
    }

    if (isDummySupabase()) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("tracked_competitors")
      .delete()
      .eq("id", id)
      .eq("agency_id", session.agencyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete competitor" },
      { status: 500 }
    );
  }
}
