"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, Bell, Mail, Command, Sun, Moon, User, LogOut, Settings, ChevronDown, Building2, Shield, Loader2, ExternalLink 
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useMessages } from "@/contexts/MessagesContext";
import NotificationDropdown from "@/components/NotificationDropdown";
import { logoutAndRedirect, getClientUser, syncOAuthSession } from "@/lib/auth-client";

interface TopbarProps {
  userEmail: string;
  userRole: string;
  agencyName: string;
}

interface SerpResultItem {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  source?: string;
}

export default function Topbar({ userEmail, userRole, agencyName }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [liveResults, setLiveResults] = useState<SerpResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useMessages();

  // Sync authenticated user data from client auth state and OAuth payload
  useEffect(() => {
    const activeUser = syncOAuthSession() || getClientUser();
    if (activeUser?.email) {
      setCurrentUserEmail(activeUser.email);
    } else if (userEmail) {
      setCurrentUserEmail(userEmail);
    }
    if (activeUser?.name) {
      setCurrentUserName(activeUser.name);
    }
  }, [userEmail]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch SerpAPI live results securely through backend endpoint /api/search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery.trim() }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setLiveResults(data.results.slice(0, 4));
        } else {
          setLiveResults([]);
        }
      } catch {
        setLiveResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleSignOut() {
    setShowProfileMenu(false);
    logoutAndRedirect();
  }

  const displayName = React.useMemo(() => {
    if (currentUserName) return currentUserName;
    const localPart = (currentUserEmail || "").split("@")[0] || "";
    return localPart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [currentUserEmail, currentUserName]);

  const initials = React.useMemo(() => {
    const parts = displayName.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [displayName]);

  const quickNavItems = [
    { title: "Acme Corp — Overview", category: "Client", href: "/dashboard/clients/mock-client-1" },
    { title: "VG Digital — Keywords", category: "Client", href: "/dashboard/clients/1" },
    { title: "Athariw — Tasks", category: "Client", href: "/dashboard/clients/2" },
    { title: "Quick Diagnostics Engine", category: "Tool", href: "/dashboard/check" },
    { title: "Competitor Benchmark", category: "Intelligence", href: "/dashboard/competitors" },
    { title: "Tasks & Execution Audits", category: "Tasks", href: "/dashboard/tasks" },
    { title: "AI Prompt Manager", category: "Prompts", href: "/dashboard/prompts" },
  ].filter((item) => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3 bg-card/90 backdrop-blur-md border-b border-border transition-colors">
      {/* Left: Global Search input */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center w-full">
          {isSearching ? (
            <Loader2 size={15} className="absolute left-3.5 text-amber-500 animate-spin pointer-events-none" />
          ) : (
            <Search size={15} className="absolute left-3.5 text-muted-foreground pointer-events-none" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, clients, AI citations..."
            className="w-full bg-muted-bg/40 border border-border rounded-[20px] pl-9 pr-14 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 focus:bg-card focus:ring-2 focus:ring-amber-500/10 transition-all shadow-2xs"
          />
          {!searchQuery ? (
            <div className="absolute right-3 pointer-events-none hidden sm:flex items-center gap-0.5 text-[10px] font-mono font-semibold text-muted-foreground bg-muted-bg border border-border px-1.5 py-0.5 rounded-md">
              <Command size={10} /> K
            </div>
          ) : (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted-bg cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Global Search Results Overlay */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-2 rounded-[20px] bg-card border border-border p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
            
            {/* Quick Navigation Section */}
            {quickNavItems.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-1.5">
                  <span>Navigation Shortcuts</span>
                  <span>ESC to close</span>
                </div>
                {quickNavItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center justify-between px-3 py-1.5 rounded-[12px] text-xs font-semibold text-foreground hover:bg-muted-bg transition-colors"
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 ml-2">
                      {item.category}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* SerpAPI Live Search Results Section */}
            <div className="space-y-1 pt-1">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-amber-500 uppercase tracking-wider border-b border-border/60 pb-1.5">
                <span className="flex items-center gap-1.5">
                  Live SerpAPI Search Results
                  {isSearching && <Loader2 size={10} className="animate-spin text-amber-500" />}
                </span>
                <span className="text-[9px] text-muted-foreground">Backend /api/search</span>
              </div>

              {isSearching && liveResults.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  Searching live web via SerpAPI...
                </div>
              ) : liveResults.length > 0 ? (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1">
                  {liveResults.map((result, idx) => (
                    <a
                      key={idx}
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-[12px] hover:bg-muted-bg transition-colors group border border-transparent hover:border-border/50"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-amber-500 transition-colors">
                        <span className="truncate pr-2">{result.title}</span>
                        <ExternalLink size={12} className="shrink-0 text-muted-foreground group-hover:text-amber-500" />
                      </div>
                      {result.snippet && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                          {result.snippet}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  No live web results found for &quot;{searchQuery}&quot;
                </div>
              ) : null}
            </div>

          </div>
        )}
      </div>

      {/* Right: Quick actions, live status pill, theme toggle & user profile */}
      <div className="flex items-center gap-3">
        {/* Live AI Engine Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>AI Engine Active</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <NotificationDropdown />

          <Link
            href="/dashboard/messages"
            className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted-bg transition-colors"
            aria-label="Messages"
          >
            <Mail size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-full border border-border bg-muted-bg/30 hover:bg-muted-bg transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center shadow-2xs">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-none">{displayName}</span>
              <span className="text-[10px] text-muted-foreground capitalize leading-tight mt-0.5">{userRole}</span>
            </div>
            <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs font-bold text-foreground">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentUserEmail}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <Building2 size={10} />
                  <span>{agencyName}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted-bg rounded-xl transition-colors"
                >
                  <Settings size={14} />
                  <span>Settings & Agency Profile</span>
                </Link>

                {userRole === "super_admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors"
                  >
                    <Shield size={14} />
                    <span>Super Admin Console</span>
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
