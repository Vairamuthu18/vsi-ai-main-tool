import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Message } from "@/lib/types/messages";

export const dynamic = "force-dynamic";

// Seed data for fallback persistent store
const defaultMessages: Message[] = [];

// Fallback in-memory store
let fallbackMessages: Message[] = [];

function mapDbRowToMessage(row: any): Message {
  return {
    id: row.id,
    sender: row.sender || { name: "System Admin", email: "admin@searchintel.com" },
    recipient: row.recipient || { name: row.to_email || "Recipient", email: row.to_email || "recipient@example.com" },
    cc: row.cc,
    bcc: row.bcc,
    subject: row.subject || "",
    preview: row.preview || "",
    body: row.body || "",
    timestamp: row.created_at || row.timestamp || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    lastSaved: row.last_saved || row.lastSaved || new Date().toISOString(),
    status: row.status || "unread",
    priority: row.priority || "normal",
    folder: row.folder || "inbox",
    isStarred: row.is_starred ?? row.isStarred ?? false,
    labels: row.labels || [],
    relatedClient: row.related_client,
    aiSummary: row.ai_summary,
    attachments: row.attachments || [],
  };
}

// GET /api/messages
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapDbRowToMessage);
      return NextResponse.json({ success: true, messages: mapped });
    }
  } catch {}

  return NextResponse.json({ success: true, messages: fallbackMessages });
}

// POST /api/messages (Create message or draft)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const plainText = (body.body || "").replace(/<[^>]+>/g, '').trim();
    const newMsg: Message = {
      id: body.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: body.sender || { name: "Me (Admin)", email: "admin@searchintel.com" },
      recipient: body.recipient || { name: body.to || body.recipientEmail || "Recipient", email: body.to || body.recipientEmail || "recipient@example.com" },
      cc: body.cc || "",
      bcc: body.bcc || "",
      subject: body.subject || "(No Subject)",
      preview: plainText.substring(0, 90) || "(No content)",
      body: body.body || "",
      timestamp: body.timestamp || now,
      updatedAt: now,
      lastSaved: now,
      status: body.status || (body.folder === "drafts" ? "draft" : "unread"),
      priority: body.priority || "normal",
      folder: body.folder || "inbox",
      isStarred: body.isStarred || false,
      labels: body.labels || [],
      attachments: body.attachments || [],
    };

    // Try Supabase insert
    try {
      const supabase = await createClient();
      await supabase.from("messages").insert({
        id: newMsg.id,
        sender: newMsg.sender,
        recipient: newMsg.recipient,
        to_email: typeof newMsg.recipient === "string" ? newMsg.recipient : newMsg.recipient.email,
        cc: newMsg.cc,
        bcc: newMsg.bcc,
        subject: newMsg.subject,
        preview: newMsg.preview,
        body: newMsg.body,
        attachments: newMsg.attachments,
        status: newMsg.status,
        priority: newMsg.priority,
        folder: newMsg.folder,
        is_starred: newMsg.isStarred,
        labels: newMsg.labels,
        last_saved: newMsg.lastSaved,
        updated_at: newMsg.updatedAt,
      });
    } catch {}

    // Update fallback store
    fallbackMessages = [newMsg, ...fallbackMessages.filter(m => m.id !== newMsg.id)];

    return NextResponse.json({ success: true, message: newMsg }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Failed to create message" }, { status: 500 });
  }
}

// PATCH /api/messages (Update message / auto-save draft / folder change / star)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Message ID is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const patchData: Record<string, any> = { updatedAt: now };

    if (updates.subject !== undefined) patchData.subject = updates.subject;
    if (updates.body !== undefined) {
      patchData.body = updates.body;
      const plainText = updates.body.replace(/<[^>]+>/g, '').trim();
      patchData.preview = plainText.substring(0, 90) || "(No content)";
    }
    if (updates.to !== undefined || updates.recipient !== undefined) {
      patchData.recipient = typeof updates.recipient === "object" ? updates.recipient : { name: updates.to || "Recipient", email: updates.to || "recipient@example.com" };
    }
    if (updates.cc !== undefined) patchData.cc = updates.cc;
    if (updates.bcc !== undefined) patchData.bcc = updates.bcc;
    if (updates.folder !== undefined) patchData.folder = updates.folder;
    if (updates.status !== undefined) patchData.status = updates.status;
    if (updates.priority !== undefined) patchData.priority = updates.priority;
    if (updates.isStarred !== undefined) patchData.isStarred = updates.isStarred;
    if (updates.labels !== undefined) patchData.labels = updates.labels;
    if (updates.attachments !== undefined) patchData.attachments = updates.attachments;
    patchData.lastSaved = now;

    // Try Supabase update
    try {
      const supabase = await createClient();
      const dbUpdates: Record<string, any> = { updated_at: now, last_saved: now };
      if (patchData.subject !== undefined) dbUpdates.subject = patchData.subject;
      if (patchData.body !== undefined) dbUpdates.body = patchData.body;
      if (patchData.preview !== undefined) dbUpdates.preview = patchData.preview;
      if (patchData.recipient !== undefined) {
        dbUpdates.recipient = patchData.recipient;
        dbUpdates.to_email = patchData.recipient.email;
      }
      if (patchData.cc !== undefined) dbUpdates.cc = patchData.cc;
      if (patchData.bcc !== undefined) dbUpdates.bcc = patchData.bcc;
      if (patchData.folder !== undefined) dbUpdates.folder = patchData.folder;
      if (patchData.status !== undefined) dbUpdates.status = patchData.status;
      if (patchData.priority !== undefined) dbUpdates.priority = patchData.priority;
      if (patchData.isStarred !== undefined) dbUpdates.is_starred = patchData.isStarred;
      if (patchData.labels !== undefined) dbUpdates.labels = patchData.labels;
      if (patchData.attachments !== undefined) dbUpdates.attachments = patchData.attachments;

      await supabase.from("messages").update(dbUpdates).eq("id", id);
    } catch {}

    // Update in fallback store
    fallbackMessages = fallbackMessages.map(m => m.id === id ? { ...m, ...patchData } : m);
    const updatedMsg = fallbackMessages.find(m => m.id === id);

    return NextResponse.json({ success: true, message: updatedMsg || patchData });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Failed to update message" }, { status: 500 });
  }
}

// DELETE /api/messages (Delete message or draft)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing message ID" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      await supabase.from("messages").delete().eq("id", id);
    } catch {}

    fallbackMessages = fallbackMessages.filter(m => m.id !== id);

    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Failed to delete message" }, { status: 500 });
  }
}
