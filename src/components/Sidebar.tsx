"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, Search, Plus, LogOut, ShieldCheck, Menu, Settings, 
  CheckSquare, ChevronRight, Users, Terminal, MessageSquare, Sun, Moon,
  Sparkles, Layers, PanelLeftClose, PanelLeftOpen, FileText, PieChart, HelpCircle, TrendingUp
} from "lucide-react";
import { SERVICE_TYPE_LABELS, ServiceType } from "@/types/search";
import type { UserRole } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import { logoutAndRedirect, getClientUser } from "@/lib/auth-client";
import { getCustomClients } from "@/lib/client-store";

interface ClientEntry {
  id: string;
  name: string;
  service_type: ServiceType;
  agencyName?: string | null;
}

interface Props {
  agencyName: string;
  agencyLogoUrl?: string | null;
  clients: ClientEntry[];
  userRole: UserRole;
  userEmail: string;
  atClientCap?: boolean;
  showSidebarProfile?: boolean;
}

const navGroups = [
  {
    title: "MAIN",
    items: [
      { href: "/dashboard", label: "Overview", tooltip: "Dashboard command center", Icon: LayoutDashboard },
      { href: "/dashboard/research", label: "Find Keywords", tooltip: "Discover keywords people search for", Icon: Search },
      { href: "/dashboard/check?tab=diagnostics", label: "SEO Checkup", tooltip: "Find SEO problems on your website", Icon: ShieldCheck },
      { href: "/dashboard/competitors", label: "Competitors", tooltip: "Compare your website with competitors", Icon: Users },
      { href: "/dashboard/tasks", label: "Rank Tracking", tooltip: "Track your Google rankings", Icon: CheckSquare },
    ],
  },
  {
    title: "AI SEARCH",
    items: [
      { href: "/dashboard/check?tab=aivisibility", label: "AI Visibility", tooltip: "See how often AI mentions your brand", Icon: Sparkles },
      { href: "/dashboard/prompts", label: "AI Prompts", tooltip: "Explore questions people ask AI", Icon: Terminal },
      { href: "/dashboard/prompts?tab=mentions", label: "Brand Mentions", tooltip: "Track AI mentions of your brand", Icon: Layers },
      { href: "/dashboard/check?tab=citations", label: "Citation Analysis", tooltip: "See sources AI relies on", Icon: FileText },
    ],
  },
  {
    title: "REPORTS",
    items: [
      { href: "/dashboard/clients", label: "Reports", tooltip: "View client & project SEO reports", Icon: PieChart },
      { href: "/dashboard/tasks", label: "Tasks & Audits", tooltip: "SEO to-do list & site audits", Icon: CheckSquare },
    ],
  },
  {
    title: "CLIENTS",
    items: [
      { href: "/dashboard/clients", label: "My Clients", tooltip: "Manage SEO projects for clients", Icon: Users },
      { href: "/dashboard/clients/new", label: "Add Client", tooltip: "Create a new client project", Icon: Plus },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { href: "/dashboard/feedback", label: "Feedback", tooltip: "Share feedback or feature requests", Icon: MessageSquare },
      { href: "/dashboard/messages", label: "Help Center", tooltip: "Get help & view system messages", Icon: HelpCircle },
      { href: "/dashboard/settings", label: "Settings", tooltip: "Manage agency profile & settings", Icon: Settings },
    ],
  },
];

export default function Sidebar({
  agencyName,
  agencyLogoUrl,
  clients,
  userRole,
  userEmail,
  atClientCap = false,
  showSidebarProfile = false,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail);
  const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null);
  const [localAgencyName, setLocalAgencyName] = useState<string | null>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  const [displayedClients, setDisplayedClients] = useState<ClientEntry[]>(clients);

  useEffect(() => {
    const updateClients = () => {
      const custom = getCustomClients();
      const customEntries: ClientEntry[] = custom.map((c) => ({
        id: c.id,
        name: c.name,
        service_type: (c.service_type || "geo") as ServiceType,
        agencyName: null,
      }));
      const serverIds = new Set(clients.map((c) => c.id));
      const combined = [...clients, ...customEntries.filter((c) => !serverIds.has(c.id))];
      setDisplayedClients(combined);
    };

    updateClients();

    window.addEventListener("storage", updateClients);
    window.addEventListener("clients_updated", updateClients);
    return () => {
      window.removeEventListener("storage", updateClients);
      window.removeEventListener("clients_updated", updateClients);
    };
  }, [clients]);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const clientUser = getClientUser();
    if (clientUser?.email) {
      setCurrentUserEmail(clientUser.email);
    } else if (userEmail) {
      setCurrentUserEmail(userEmail);
    }
  }, [userEmail]);

  // Read agency logo and name from localStorage (set by Settings page)
  useEffect(() => {
    const readBranding = () => {
      const storedLogo = localStorage.getItem("searchintel_agency_logo");
      const storedName = localStorage.getItem("searchintel_agency_name");
      setLocalLogoUrl(storedLogo ?? null);
      setLocalAgencyName(storedName ?? null);
    };
    readBranding();
    window.addEventListener("storage", readBranding);
    return () => window.removeEventListener("storage", readBranding);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  function handleSignOut() {
    logoutAndRedirect();
  }

  const isActive = (href: string) => pathname === href;
  const isClientOn = (id: string) => pathname.startsWith(`/dashboard/clients/${id}`);
  const onAdmin = pathname.startsWith("/admin");

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden bg-card">
      {/* 1. Brand Header */}
      <div className={`flex items-center ${isCollapsed ? "justify-center flex-col gap-3 py-3 px-2" : "justify-between px-5 py-4"} border-b border-border/80 bg-card shrink-0 z-10 transition-all`}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0 group" title={isCollapsed ? "SearchIntel PRO" : undefined}>
          <div className="relative flex-shrink-0 p-1 rounded-[12px] bg-amber-500/10 border border-amber-500/20">
            <Image src="/vg-logo.png" alt="SearchIntel" width={28} height={28} className="shrink-0 rounded-md object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                  SearchIntel
                </p>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  PRO
                </span>
              </div>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate leading-none">
                AI Search Intelligence
              </p>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(false)}
            className="md:hidden rounded-[20px] p-1.5 text-muted-foreground hover:bg-muted-bg hover:text-foreground transition-colors"
            title="Collapse Sidebar"
          >
            <span className="text-xs font-mono">←</span>
          </button>
          <button
            onClick={toggleCollapse}
            type="button"
            className="hidden md:flex items-center justify-center rounded-xl p-1.5 text-muted-foreground hover:bg-muted-bg hover:text-primary transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </div>

      {/* 2. Agency Workspace Card */}
      <div className={`py-3 border-b border-border/80 bg-card/60 shrink-0 z-10 transition-all ${isCollapsed ? "px-2" : "px-4"}`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center p-1.5" : "justify-between gap-2 p-2"} rounded-[16px] bg-card border border-border/80 shadow-2xs`}>
          <Link href="/dashboard/settings" title={`${localAgencyName || agencyName} (Enterprise Workspace)`} className="flex items-center gap-2.5 min-w-0">
            {(localLogoUrl || agencyLogoUrl) ? (
              <Image src={(localLogoUrl || agencyLogoUrl)!} alt={localAgencyName || agencyName} width={24} height={24} className="rounded-lg shrink-0 object-contain shadow-2xs border border-border" unoptimized />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {(localAgencyName || agencyName).slice(0, 1).toUpperCase()}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{localAgencyName || agencyName}</p>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Enterprise Workspace</p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <Link
              href="/dashboard/settings"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted-bg transition-colors shrink-0"
              title="Workspace Settings"
            >
              <Settings size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* 3. Navigation & Portfolio Section (Full height, natural bottom scroll) */}
      <nav className={`flex-1 min-h-0 overflow-y-auto ${isCollapsed ? "px-2" : "px-3.5"} py-4 space-y-6 custom-scrollbar ${showSidebarProfile ? (isCollapsed ? "pb-[100px]" : "pb-[140px]") : "pb-6"}`}>
        {userRole === "super_admin" && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">ADMINISTRATION</p>
            )}
            <Link
              href="/admin"
              title={isCollapsed ? "Super Admin Console" : undefined}
              className={`flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-between gap-2.5 px-4 py-2.5"} rounded-[14px] text-xs transition-all ${
                onAdmin
                  ? "bg-amber-500 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:bg-muted-bg hover:text-foreground font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className={onAdmin ? "text-white" : "text-muted-foreground"} />
                {!isCollapsed && <span>Super Admin Console</span>}
              </div>
              {!isCollapsed && <ChevronRight size={14} className={onAdmin ? "text-white" : "text-muted-foreground"} />}
            </Link>
          </div>
        )}

        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{group.title}</p>
            )}
            <div className="space-y-1">
              {group.items.map(({ href, label, tooltip, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={tooltip || label}
                    className={`flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-between gap-2.5 px-4 py-2.5"} rounded-[14px] text-xs transition-all ${
                      active
                        ? "bg-amber-500 text-white font-bold shadow-sm"
                        : "text-muted-foreground hover:bg-muted-bg hover:text-foreground font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} className={active ? "text-white" : "text-muted-foreground group-hover:text-foreground"} />
                      {!isCollapsed && <span>{label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Client Portfolio Section */}
        <div className="space-y-2 pt-3 border-t border-border/80">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                {userRole === "super_admin" ? `CLIENTS (${displayedClients.length})` : `PORTFOLIO (${displayedClients.length})`}
              </p>
              <Link
                href="/dashboard/clients"
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-colors"
              >
                ALL →
              </Link>
            </div>
          ) : (
            <div className="text-center" title="Portfolio Clients">
              <p className="text-[9px] font-extrabold text-muted-foreground uppercase">PORT</p>
            </div>
          )}

          {displayedClients.length === 0 ? (
            !isCollapsed && (
              <div className="px-3 py-3 rounded-xl border border-dashed border-border text-center">
                <p className="text-xs text-muted-foreground font-medium">No clients tracked</p>
              </div>
            )
          ) : (
            <ClientList clients={displayedClients} isClientOn={isClientOn} isCollapsed={isCollapsed} />
          )}

          <Link
            href="/dashboard/clients/new"
            title={isCollapsed ? "Add Client" : undefined}
            className={`mt-2 flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"} rounded-xl border border-dashed border-border hover:border-amber-500 bg-card hover:bg-amber-500/10 text-xs font-semibold text-foreground hover:text-amber-500 transition-all group`}
          >
            <span className="flex items-center gap-2">
              <Plus size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
              {!isCollapsed && "Add Client"}
            </span>
            {!isCollapsed && <span className="text-[10px] text-muted-foreground font-mono">+</span>}
          </Link>
        </div>
      </nav>

      {/* 4. Bottom User Profile Card (Conditionally rendered, disabled by default) */}
      {showSidebarProfile && (
        <div className={`sticky bottom-0 left-0 right-0 z-20 ${isCollapsed ? "px-2 py-3" : "px-4 py-3"} border-t border-border/80 bg-card/95 backdrop-blur-md shrink-0 shadow-lg`}>
          <div className={`p-2.5 bg-muted-bg/60 rounded-[18px] border border-border/80 ${isCollapsed ? "flex flex-col items-center gap-2" : "space-y-2.5"} shadow-2xs`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate" title={currentUserEmail}>
                      {currentUserEmail}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize font-bold tracking-wide">
                      {userRole.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-card hover:bg-muted-bg border border-border px-3 py-2 text-xs font-bold text-foreground shadow-2xs transition-all cursor-pointer"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignOut}
                  type="button"
                  className="p-2 rounded-lg bg-card hover:bg-muted-bg border border-border text-muted-foreground hover:text-destructive shadow-2xs transition-all cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="rounded-[20px] p-2 text-muted-foreground bg-card hover:bg-muted-bg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Image src="/vg-logo.png" alt="SearchIntel" width={26} height={26} className="rounded object-contain" />
          <p className="text-sm font-bold text-foreground tracking-tight">SearchIntel</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground truncate max-w-[40%]">{agencyName}</p>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          aria-hidden
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          flex flex-col bg-card border-r border-border/80 
          fixed md:sticky top-0 inset-y-0 left-0 z-50
          ${isCollapsed ? "md:w-16 w-64" : "w-64"} h-screen max-h-screen shrink-0 overflow-hidden
          transition-all duration-200 ease-out shadow-xl md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        suppressHydrationWarning
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function ClientList({
  clients,
  isClientOn,
  isCollapsed = false,
}: {
  clients: ClientEntry[];
  isClientOn: (id: string) => boolean;
  isCollapsed?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const showSearch = clients.length > 5;
  const q = filter.trim().toLowerCase();
  const filtered = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.agencyName ?? "").toLowerCase().includes(q),
      )
    : clients;

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {filtered.map((client) => {
          const svc = SERVICE_TYPE_LABELS[client.service_type || "seo_geo"];
          const active = isClientOn(client.id);
          const initial = client.name.slice(0, 1).toUpperCase();
          return (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              title={`${client.name} (${svc?.short || "SEO"})`}
              className={`flex items-center justify-center p-2 rounded-[14px] text-xs font-bold transition-all group ${
                active
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted-bg hover:text-foreground bg-muted-bg/50 border border-border/50"
              }`}
            >
              <span>{initial}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {showSearch && (
        <div className="px-0.5">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter clients..."
            className="w-full rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      )}
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground italic">No matching clients.</p>
        ) : (
          filtered.map((client) => {
            const svc = SERVICE_TYPE_LABELS[client.service_type || "seo_geo"];
            const active = isClientOn(client.id);
            return (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className={`flex items-center justify-between gap-2 rounded-[14px] px-3 py-2.5 text-xs transition-all group ${
                  active
                    ? "bg-amber-500 text-white font-bold rounded-[14px] shadow-sm"
                    : "text-muted-foreground hover:bg-muted-bg hover:text-foreground rounded-[14px]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-xs">{client.name}</p>
                  <p className="text-[10px] font-medium opacity-80 truncate">
                    {client.agencyName ? client.agencyName : "Active"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    active ? "bg-white/20 text-white" : "bg-muted-bg text-muted-foreground border border-border"
                  }`}>
                    {svc?.short || "SEO"}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

