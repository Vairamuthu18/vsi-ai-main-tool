"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, Star, ThumbsUp, Filter, Search, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FeedbackItem {
 id: string;
 category: "Feature Request" | "Bug Report" | "UX Improvement";
 subject: string;
 message: string;
 author: string;
 createdAt: string;
 status: "Open" | "In Review" | "Resolved";
 upvotes: number;
}

const initialFeedback: FeedbackItem[] = [
 {
 id: "fb-1",
 category: "Feature Request",
 subject: "Add Claude 3.5 Sonnet Citations",
 message: "Would love to track citation links returned in Claude 3.5 Sonnet generative answers alongside ChatGPT.",
 author: "agency@valgrow.com",
 createdAt: "2026-07-21",
 status: "In Review",
 upvotes: 24,
 },
 {
 id: "fb-2",
 category: "UX Improvement",
 subject: "Dark Mode Contrast for Trajectory Chart",
 message: "The trajectory chart looks great in dark mode! Could we increase line width for winning citations?",
 author: "client@acme.com",
 createdAt: "2026-07-20",
 status: "Resolved",
 upvotes: 12,
 },
 {
 id: "fb-3",
 category: "Bug Report",
 subject: "PDF Report Title Overflow",
 message: "When exporting PDF for clients with long company names, title wraps onto second page.",
 author: "support@agency.org",
 createdAt: "2026-07-18",
 status: "Open",
 upvotes: 7,
 },
];

export default function FeedbackPage() {
 const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(initialFeedback);
 const [subject, setSubject] = useState("");
 const [message, setMessage] = useState("");
 const [category, setCategory] = useState<FeedbackItem["category"]>("Feature Request");
 const [submitted, setSubmitted] = useState(false);
 const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const isDummy = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    return url.includes("dummy") || url.includes("your-project.supabase.co") || url.includes("localhost:54321") || url === "";
  };

  const mapDatabaseCategory = (cat: string): "Feature Request" | "Bug Report" | "UX Improvement" => {
    if (cat === "bug") return "Bug Report";
    if (cat === "idea") return "Feature Request";
    return "UX Improvement";
  };

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

  const fetchMyFeedback = async () => {
    if (authLoading) return;

    try {
      checkSupabaseConfig();
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (data && Array.isArray(data)) {
        const mapped: FeedbackItem[] = data.map((item: any) => {
          const cat = mapDatabaseCategory(item.category);
          const subj = item.context_data?.subject || "Feedback Submission";
          const statusMap = (stat: string): FeedbackItem["status"] => {
            if (stat === "done" || stat === "Resolved") return "Resolved";
            if (stat === "triaged" || stat === "in_progress" || stat === "In Review") return "In Review";
            return "Open";
          };
          return {
            id: item.id,
            category: cat,
            subject: subj,
            message: item.message,
            author: "you@agency.com",
            createdAt: item.created_at ? item.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            status: statusMap(item.status),
            upvotes: 1,
          };
        });
        setMyFeedback(mapped);
      }
    } catch (e: any) {
      console.warn("Failed to fetch feedback from Supabase directly:", e);
      const msg = e instanceof Error && e.message === "fetch failed"
        ? "Database connection failed: The database server is unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL."
        : e.message || String(e);
      // Log to console for dev validation
      console.error("My Feedback load error:", msg);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (e) {
        console.error("Error loading session:", e);
      } finally {
        setAuthLoading(false);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchMyFeedback();
    }
  }, [authLoading]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    if (authLoading) {
      alert("Authentication is still loading. Please try again in a moment.");
      return;
    }

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      category,
      subject: subject.trim(),
      message: message.trim(),
      author: "you@agency.com",
      createdAt: new Date().toISOString().split("T")[0],
      status: "Open",
      upvotes: 1,
    };

    // Keep existing community list update
    setFeedbackList([newItem, ...feedbackList]);

    const apiCategory = 
      category === "Bug Report" ? "bug" : 
      category === "Feature Request" ? "idea" : "general";

    try {
      checkSupabaseConfig();
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated session found. Please sign in again.");
      }

      // Fetch user's profile to get agency_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }

      // Insert feedback directly using Supabase client
      const { data: insertedData, error: insertError } = await supabase
        .from("feedback")
        .insert({
          agency_id: profile?.agency_id ?? null,
          user_id: currentUser.id,
          category: apiCategory,
          message: message.trim(),
          context_data: {
            subject: subject.trim(),
          }
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const insertedId = insertedData?.id;
      const insertedItem: FeedbackItem = {
        id: insertedId || `fb-${Date.now()}`,
        category,
        subject: subject.trim(),
        message: message.trim(),
        author: "you@agency.com",
        createdAt: new Date().toISOString().split("T")[0],
        status: "Open",
        upvotes: 1,
      };

      // Immediately add the inserted record to list
      setMyFeedback((prev) => [insertedItem, ...prev]);

      // Clear form and show success
      setSubject("");
      setMessage("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);

      // Re-fetch to confirm/sync
      await fetchMyFeedback();
    } catch (err: any) {
      console.error("Feedback direct DB insert failed:", err);
      const msg = err instanceof Error && err.message === "fetch failed"
        ? "Database connection failed: The database server is unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL is correct and the database is active."
        : err.message || String(err);
      alert(`Error submitting feedback: ${msg}`);
    }
  };

  const handleUpvote = (id: string) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
  };

 return (
 <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
 {/* Page Header */}
 <div className="pb-6 border-b border-border">
 <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
 <MessageSquare className="text-primary" size={28} />
 <span>Feedback & Product Requests</span>
 </h1>
 <p className="text-sm text-[#666666] mt-1">
 Submit product feedback, request new AI engine integrations, and upvote agency feature suggestions.
 </p>
 </div>

 {submitted && (
 <div className="rounded-[20px] bg-[#22C55E]/10 border border-[#22C55E]/20 p-3.5 flex items-center gap-2 text-[#22C55E] text-xs font-medium">
 <CheckCircle2 size={16} />
 <span>Thank you! Your feedback has been submitted to the product team.</span>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Submit Form (5 Cols) */}
 <div className="lg:col-span-5 bg-card rounded-[20px] border border-border p-6 shadow-xs space-y-4">
 <h2 className="text-base font-bold text-foreground">Submit New Feedback</h2>

 <form onSubmit={handleSubmitFeedback} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Category
 </label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value as FeedbackItem["category"])}
 className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
 >
 <option value="Feature Request">Feature Request</option>
 <option value="Bug Report">Bug Report</option>
 <option value="UX Improvement">UX Improvement</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Subject Title
 </label>
 <input
 type="text"
 required
 placeholder="Brief summary of your feedback..."
 value={subject}
 onChange={(e) => setSubject(e.target.value)}
 className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-foreground mb-1">
 Detailed Explanation
 </label>
 <textarea
 rows={5}
 required
 placeholder="Describe how this feature will improve your workflow..."
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 className="w-full rounded-[20px] border border-border bg-background p-3.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
 />
 </div>

 <button
 type="submit"
 className="w-full flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-colors"
 >
 <Send size={14} />
 <span>Submit Feedback</span>
 </button>
 </form>
 </div>

 {/* Existing Feedback Board (7 Cols) */}
 <div className="lg:col-span-7 space-y-4">
 <h2 className="text-base font-bold text-foreground">Community & Agency Requests</h2>

 <div className="space-y-3">
 {feedbackList.map((item) => (
 <div
 key={item.id}
 className="bg-card rounded-[20px] border border-border p-5 shadow-xs flex items-start gap-4"
 >
 <button
 onClick={() => handleUpvote(item.id)}
 className="flex flex-col items-center justify-center rounded-[20px] bg-muted-bg hover:bg-amber-500/10 hover:text-amber-500 border border-border px-3 py-2 text-muted-foreground transition-colors shrink-0"
 >
 <ThumbsUp size={14} />
 <span className="text-xs font-bold mt-1">{item.upvotes}</span>
 </button>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap mb-1">
 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
 {item.category}
 </span>
 <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
 item.status === "Resolved" ? "bg-[#22C55E]/10 text-[#22C55E]" :
 item.status === "In Review" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
 "bg-[#F5F5F3] text-[#666666]"
 }`}>
 {item.status}
 </span>
 </div>

 <h3 className="text-sm font-bold text-foreground">{item.subject}</h3>
 <p className="text-xs text-[#666666] mt-1">{item.message}</p>

 <div className="mt-3 flex items-center justify-between text-[11px] text-[#666666]">
 <span>Submitted by {item.author}</span>
 <span>{item.createdAt}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* My Submitted Feedback Section */}
 <div className="mt-12 pt-8 border-t border-border space-y-6">
   <div className="flex items-center gap-3">
     <Clock className="text-primary" size={20} />
     <h2 className="text-lg font-bold text-foreground">My Submitted Feedback</h2>
   </div>
   
   {myFeedback.length === 0 ? (
     <div className="rounded-[20px] border border-dashed border-border p-10 text-center text-[#666666] text-sm">
       You haven't submitted any feedback yet.
     </div>
   ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {myFeedback.map((item) => (
         <div key={item.id} className="bg-card rounded-[20px] border border-border p-5 shadow-xs flex flex-col justify-between gap-4">
            <div className="space-y-3">
               <div className="flex items-center justify-between gap-2 flex-wrap">
                 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                   {item.category}
                 </span>
                 <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                   item.status === "Resolved" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                   item.status === "In Review" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                   "bg-[#F5F5F3] text-[#666666]"
                 }`}>
                   {item.status}
                 </span>
               </div>
               
               <div>
                 <h3 className="text-sm font-bold text-foreground">{item.subject}</h3>
                 <p className="text-xs text-[#666666] mt-1 whitespace-pre-wrap leading-relaxed">{item.message}</p>
               </div>
            </div>
            
            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-[#666666]">
               <span>Submitted by you</span>
               <span>{item.createdAt}</span>
            </div>
         </div>
       ))}
     </div>
   )}
 </div>
 </div>
 );
}
