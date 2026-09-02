"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  X, Bold, Italic, Underline, List, ListOrdered,
  Link2, Code2, Quote, Minus, Paperclip, Loader2,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

const checkSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || url.includes("dummy") || url.includes("your-project.supabase.co")) {
    throw new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
  }
  if (!key || key.includes("anon_key_here")) {
    throw new Error("Supabase Anon Key is missing or invalid. Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
};

interface EmojiOption {
  emoji: string;
  label: string;
  value: number;
}

const EMOJI_OPTIONS: EmojiOption[] = [
  { emoji: "😡", label: "Very Poor",  value: 1 },
  { emoji: "😕", label: "Poor",       value: 2 },
  { emoji: "😐", label: "Average",    value: 3 },
  { emoji: "🙂", label: "Good",       value: 4 },
  { emoji: "😍", label: "Excellent",  value: 5 },
];

const MAX_FILE_SIZE   = 10 * 1024 * 1024;
const ACCEPTED_TYPES  = ["image/png", "image/jpeg", "application/pdf", "text/plain"];
const ACCEPTED_EXTS   = ".png,.jpg,.jpeg,.pdf,.txt";

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "fixed bottom-6 right-6 z-[9999] flex items-center gap-3",
        "rounded-2xl px-4 py-3.5 shadow-2xl border text-sm font-semibold",
        type === "success"
          ? "bg-emerald-500 border-emerald-400 text-white"
          : "bg-red-500   border-red-400   text-white",
      ].join(" ")}
      style={{ animation: "toastIn 300ms cubic-bezier(.22,1,.36,1) both" }}
    >
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-80 hover:opacity-100 transition-opacity" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      tabIndex={0}
      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-all duration-150"
    >
      {children}
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const pathname        = usePathname();
  const { resolvedTheme } = useTheme();

  const [rating,        setRating]        = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment,       setComment]       = useState("");
  const [attachment,    setAttachment]    = useState<File | null>(null);
  const [fileError,     setFileError]     = useState<string | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [toast,         setToast]         = useState<{ message: string; type: "success" | "error" } | null>(null);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const closeBtnRef  = useRef<HTMLButtonElement>(null);

  // ── Reset on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setRating(null);
      setHoveredRating(null);
      setComment("");
      setAttachment(null);
      setFileError(null);
      setSubmitting(false);
    } else {
      setTimeout(() => closeBtnRef.current?.focus(), 60);
    }
  }, [open]);

  // ── ESC to close ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  // ── Body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Focus trap ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const modal = document.getElementById("vsi-feedback-modal");
    if (!modal) return;
    const getFocusable = () =>
      Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]),textarea,input,[tabindex]:not([tabindex="-1"])'
        )
      );
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  // ── Toolbar helpers ──────────────────────────────────────────────────────
  const wrapSelection = useCallback((before: string, after = before) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e);
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    setComment(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    }, 0);
  }, []);

  const insertAtLineStart = useCallback((prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const ls = value.lastIndexOf("\n", s - 1) + 1;
    const next = value.slice(0, ls) + prefix + value.slice(ls);
    setComment(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, s + prefix.length); }, 0);
  }, []);

  const insertHR = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    setComment((v) => v.slice(0, s) + "\n\n---\n\n" + v.slice(s));
    setTimeout(() => ta.focus(), 0);
  }, []);

  const insertLink = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel  = value.slice(s, e) || "link text";
    const url  = prompt("Enter URL:");
    if (!url) return;
    const rep  = `[${sel}](${url})`;
    setComment(value.slice(0, s) + rep + value.slice(e));
    setTimeout(() => ta.focus(), 0);
  }, []);

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFile = (file?: File | null) => {
    setFileError(null);
    if (!file) { setAttachment(null); return; }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Unsupported file. Please upload PNG, JPG, JPEG, PDF, or TXT.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File too large. Maximum size is 10 MB.");
      return;
    }
    setAttachment(file);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const canSubmit = rating !== null && comment.trim().length >= 4 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const browser  = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : "";
      const device   = /Mobile|Android|iPhone|iPad/i.test(browser) ? "mobile" : "desktop";
      const screen   = typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "";
      const viewport = typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "";
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const os       = (() => {
        if (/Windows/.test(browser))      return "Windows";
        if (/Mac OS/.test(browser))       return "macOS";
        if (/Android/.test(browser))      return "Android";
        if (/iPhone|iPad/.test(browser))  return "iOS";
        if (/Linux/.test(browser))        return "Linux";
        return "Other";
      })();

      let attachmentName: string | null = null;
      let attachmentData: string | null = null;
      if (attachment) {
        attachmentName = attachment.name;
        attachmentData = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(attachment);
        });
      }

      checkSupabaseConfig();
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let profileAgencyId: string | null = null;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("agency_id")
          .eq("id", user.id)
          .single();
        profileAgencyId = profile?.agency_id ?? null;
      }

      const ratingCategory = (() => {
        if (rating !== null && rating >= 4) return "praise";
        if (rating === 3) return "general";
        return "bug";
      })();

      const contextDataObj = {
        rating: rating ?? null,
        device: device ?? null,
        os: os ?? null,
        screen: screen ?? null,
        viewport: viewport ?? null,
        timezone: timezone ?? null,
        theme: resolvedTheme ?? null,
        timestamp: new Date().toISOString(),
        attachment_name: attachmentName ?? null,
      };

      const fullPayload = {
        agency_id: profileAgencyId,
        user_id: user?.id ?? null,
        category: ratingCategory,
        rating: rating !== null ? String(rating) : null,
        subject: comment.trim().slice(0, 100) || null,
        message: comment.trim(),
        attachment_url: attachmentName ?? null,
        page_url: pathname ?? null,
        user_agent: browser ?? null,
        context_data: contextDataObj,
        status: "new",
      };

      let { data: insertedData, error: insertError } = await supabase
        .from("feedback")
        .insert(fullPayload)
        .select("id")
        .single();

      // If client-side direct insert fails (e.g., anon key permissions), try API route
      if (insertError) {
        console.warn("Direct Supabase insert returned error, calling /api/feedback API fallback:", insertError.message);
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            comment: comment.trim(),
            attachment_name: attachmentName,
            attachment_data: attachmentData,
            page: pathname,
            browser,
            device,
            os,
            screen,
            viewport,
            timezone,
            theme: resolvedTheme,
            timestamp: new Date().toISOString(),
            category: ratingCategory,
            message: comment.trim(),
            page_url: pathname,
            context_data: contextDataObj,
          }),
        });
        const apiRes = await res.json();
        if (!res.ok || !apiRes.ok) {
          throw new Error(apiRes.error || insertError.message || "Failed to submit feedback");
        }
      }

      setToast({ message: "Thank you! Your feedback has been submitted successfully.", type: "success" });
      onClose();
    } catch (err: any) {
      console.error("Feedback modal DB insert failed:", err);
      const msg = err instanceof Error && err.message === "fetch failed"
        ? "Database connection failed: The database server is unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL."
        : err.message || "Unable to submit feedback. Please try again.";
      setToast({ message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast lives outside modal so it persists after close */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
          aria-modal="true"
          role="dialog"
          aria-label="Send feedback"
        >
          <div
            id="vsi-feedback-modal"
            className="w-full bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
            style={{
              maxWidth: "520px",
              borderRadius: "20px",
              animation: "vsi-fm-scale 220ms cubic-bezier(0.34,1.56,0.64,1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-border">
              <h2 className="text-base font-bold text-foreground tracking-tight">Feedback</h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close feedback modal"
                className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Scrollable Body ─────────────────────────────────────── */}
            <div
              className="px-7 py-5 space-y-6 overflow-y-auto custom-scrollbar"
              style={{ maxHeight: "calc(100dvh - 180px)" }}
            >
              {/* ─ Emoji Rating ──────────────────────────────────────── */}
              <div>
                <p className="text-sm font-bold text-foreground leading-snug">
                  How would you rate your experience with SearchIntel?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your feedback helps us improve SearchIntel for everyone.
                </p>

                <div
                  className="flex items-center gap-2 mt-4"
                  role="radiogroup"
                  aria-label="Experience rating"
                >
                  {EMOJI_OPTIONS.map((opt) => {
                    const sel = rating === opt.value;
                    const hov = hoveredRating === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        aria-label={opt.label}
                        title={opt.label}
                        onClick={() => setRating(opt.value)}
                        onMouseEnter={() => setHoveredRating(opt.value)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="flex flex-col items-center gap-1.5 outline-none"
                      >
                        <span
                          className="flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-150"
                          style={{
                            fontSize: "26px",
                            lineHeight: 1,
                            padding: "10px",
                            transform: sel || hov ? "scale(1.2)" : "scale(1)",
                            boxShadow: sel
                              ? "0 0 0 2.5px #f59e0b, 0 4px 16px rgba(245,158,11,0.3)"
                              : hov
                              ? "0 4px 14px rgba(245,158,11,0.2)"
                              : "none",
                            background: sel
                              ? "rgba(245,158,11,0.13)"
                              : hov
                              ? "rgba(245,158,11,0.07)"
                              : "transparent",
                          }}
                        >
                          {opt.emoji}
                        </span>
                        <span
                          className="text-[10px] font-semibold transition-colors"
                          style={{ color: sel ? "#f59e0b" : "var(--color-muted-foreground, #888)" }}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─ Comment ───────────────────────────────────────────── */}
              <div>
                <label htmlFor="vsi-feedback-comment" className="block text-sm font-bold text-foreground mb-2">
                  Your feedback
                </label>

                {/* Rich Toolbar */}
                <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-muted-bg rounded-t-xl border border-border border-b-0">
                  <ToolbarBtn onClick={() => wrapSelection("**")}  title="Bold">       <Bold         size={12} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => wrapSelection("_")}   title="Italic">     <Italic       size={12} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => wrapSelection("__")}  title="Underline">  <Underline    size={12} /></ToolbarBtn>
                  <div className="w-px h-4 bg-border mx-1" aria-hidden />
                  <ToolbarBtn onClick={() => insertAtLineStart("- ")}  title="Bullet List">    <List         size={12} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => insertAtLineStart("1. ")} title="Numbered List">  <ListOrdered  size={12} /></ToolbarBtn>
                  <ToolbarBtn onClick={insertLink}                 title="Insert Link"> <Link2        size={12} /></ToolbarBtn>
                  <div className="w-px h-4 bg-border mx-1" aria-hidden />
                  <ToolbarBtn onClick={() => wrapSelection("`")}   title="Code">        <Code2        size={12} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => insertAtLineStart("> ")} title="Quote">   <Quote        size={12} /></ToolbarBtn>
                  <ToolbarBtn onClick={insertHR}                   title="Divider">    <Minus        size={12} /></ToolbarBtn>
                </div>

                <textarea
                  id="vsi-feedback-comment"
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => {
                    if (e.target.value.length <= 2000) setComment(e.target.value);
                  }}
                  placeholder="Tell us what you liked, what didn't work, or how we can improve..."
                  rows={5}
                  aria-describedby="vsi-char-count"
                  className="w-full rounded-b-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none transition-all"
                />

                <div className="flex items-center justify-between mt-1" id="vsi-char-count">
                  <span className="text-[11px] text-muted-foreground">
                    {comment.length > 0 && comment.trim().length < 4 && (
                      <span className="text-amber-500 font-medium">
                        {4 - comment.trim().length} more character{4 - comment.trim().length !== 1 ? "s" : ""} needed ·{" "}
                      </span>
                    )}
                    {comment.length} / 2000
                  </span>
                </div>
              </div>

              {/* ─ Attachment ─────────────────────────────────────────── */}
              <div>
                <p className="text-sm font-bold text-foreground mb-2">
                  Attachment{" "}
                  <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                </p>

                {attachment ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted-bg">
                    <Paperclip size={14} className="text-amber-500 shrink-0" />
                    <span className="text-sm text-foreground font-medium flex-1 truncate">{attachment.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(attachment.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => { setAttachment(null); setFileError(null); }}
                      aria-label="Remove attachment"
                      className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border hover:border-amber-500 bg-muted-bg/50 hover:bg-amber-500/5 text-sm text-muted-foreground hover:text-amber-600 transition-all group"
                  >
                    <Paperclip size={14} className="shrink-0 group-hover:text-amber-500 transition-colors" />
                    <span>Click to attach a file</span>
                    <span className="ml-auto text-xs text-muted-foreground">PNG, JPG, PDF, TXT · max 10 MB</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTS}
                  className="sr-only"
                  aria-label="Attach file"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                />

                {fileError && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={12} /> {fileError}
                  </p>
                )}
              </div>
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-border bg-muted-bg/40">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-muted-bg transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-amber-500/30"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting Feedback...
                  </>
                ) : (
                  "Send Feedback"
                )}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes vsi-fm-scale {
              from { opacity: 0; transform: scale(0.92) translateY(10px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes toastIn {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
