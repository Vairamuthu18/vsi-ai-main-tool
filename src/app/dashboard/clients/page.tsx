"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Search, Globe, Tag, MapPin, Users, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCustomClients, saveCustomClient, ClientItem } from "@/lib/client-store";

const VALGROW_LABS_CLIENT: ClientItem = {
  id: "valgrow-labs-001",
  name: "Valgrow Labs",
  brand_name: "Valgrow Labs",
  website: "valgrowlabs.com",
  service_type: "seo_geo",
  country: "United Arab Emirates",
  industry: "Technology / SaaS",
  default_location: "ae",
  keywords: 0,
  winRate: 0,
  tasks: 0,
};

const SERVICE_BADGE: Record<string, { label: string; color: string }> = {
  seo: { label: "SEO", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  geo: { label: "GEO", color: "bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30" },
  seo_geo: { label: "SEO+GEO", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const AVATAR_COLORS = [
  "from-[#FF4500] to-[#FF6B35]",
  "from-blue-500 to-blue-600",
  "from-[#00E676] to-emerald-600",
  "from-purple-500 to-purple-600",
  "from-[#FFD600] to-yellow-600",
];

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);

  useEffect(() => {
    async function loadClients() {
      const custom = getCustomClients();
      const supabase = createClient();
      let dbClients: ClientItem[] = [];

      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name, brand_name, website, service_type, country, industry, default_location, created_at");

        if (!error && data) {
          dbClients = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            brand_name: c.brand_name || c.name,
            website: c.website || "",
            service_type: c.service_type || "seo_geo",
            country: c.country || "United Arab Emirates",
            industry: c.industry || "Technology / SaaS",
            default_location: c.default_location || "ae",
            keywords: 0,
            winRate: 0,
            tasks: 0,
            created_at: c.created_at,
          }));
        }
      } catch (err) {
        console.error("Error loading clients from Supabase:", err);
      }

      // Merge Supabase DB clients and local custom clients (deduplicated by ID)
      const mergedMap = new Map<string, ClientItem>();
      dbClients.forEach((c) => mergedMap.set(c.id, c));
      custom.forEach((c) => {
        if (!mergedMap.has(c.id)) {
          mergedMap.set(c.id, c);
        }
      });

      const DEMO_DOMAINS = new Set([
        "zomato.com", "vgdigital.ae", "seo.ae", "vgdigital.com", "athariw.com",
        "tap.company", "alex.sa", "trial.valgrow.com", "menacyberwire.com",
        "testb4pilot.com", "chrismcelroy.com", "acme.com", "unitedseo.ae", "valgrowing.com"
      ]);

      let list = Array.from(mergedMap.values()).filter((c) => {
        const w = (c.website || "").toLowerCase().trim();
        const n = (c.name || "").toLowerCase().trim();
        return !DEMO_DOMAINS.has(w) && n !== "zomato" && n !== "vg" && n !== "seo" && n !== "vg digital" && n !== "athariw" && n !== "tap payments" && n !== "alex";
      });

      // If list is empty, initialize our real client Valgrow Labs
      if (list.length === 0) {
        list = [VALGROW_LABS_CLIENT];
        saveCustomClient(VALGROW_LABS_CLIENT);

        // Try to also seed Valgrow Labs into Supabase DB if authenticated user profile agency exists
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", user.id).single();
            if (profile?.agency_id) {
              await supabase.from("clients").insert({
                name: VALGROW_LABS_CLIENT.name,
                brand_name: VALGROW_LABS_CLIENT.brand_name,
                website: VALGROW_LABS_CLIENT.website,
                service_type: VALGROW_LABS_CLIENT.service_type,
                country: VALGROW_LABS_CLIENT.country,
                industry: VALGROW_LABS_CLIENT.industry,
                default_location: VALGROW_LABS_CLIENT.default_location,
                agency_id: profile.agency_id,
              });
            }
          }
        } catch {}
      }

      setClientsList(list);
    }

    loadClients();

    window.addEventListener("storage", loadClients);
    window.addEventListener("clients_updated", loadClients);
    return () => {
      window.removeEventListener("storage", loadClients);
      window.removeEventListener("clients_updated", loadClients);
    };
  }, []);

 const filtered = clientsList.filter((c) => {
  const q = query.toLowerCase();
  return (
   c.name.toLowerCase().includes(q) ||
   (c.brand_name || "").toLowerCase().includes(q) ||
   (c.website || "").toLowerCase().includes(q) ||
   (c.industry || "").toLowerCase().includes(q) ||
   (c.country || "").toLowerCase().includes(q)
  );
 });

 const avgWin = clientsList.length > 0 ? Math.round(clientsList.reduce((s, c) => s + (c.winRate || 0), 0) / clientsList.length) : 0;
 const totalKw = clientsList.reduce((s, c) => s + (c.keywords || 0), 0);

 return (
 <div className="min-h-[calc(100vh-60px)] bg-background p-3 sm:p-6 font-sans text-foreground">
 <div className="max-w-[1400px] mx-auto bg-card rounded-[2rem] p-6 lg:p-8 shadow-2xl border border-border min-h-[calc(100vh-108px)]">

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h1 className="text-2xl font-bold text-foreground tracking-tight">Clients</h1>
 <p className="text-sm text-muted-foreground mt-0.5">{clientsList.length} clients across your agency</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
  type="text"
  placeholder="Search clients…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  className="bg-muted-bg/50 border border-border rounded-[20px] pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 w-52 shadow-2xs"
 />
 </div>
 <Link
 href="/dashboard/clients/new"
 className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-[20px] shadow-sm transition-colors"
 >
 <Plus className="w-4 h-4" />
 Add Client
 </Link>
 </div>
 </div>

 {/* Stats Row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 {[
  { label: "Total Clients", value: clientsList.length, sub: "across agency", Icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { label: "SEO Clients", value: clientsList.filter(c => c.service_type === "seo").length, sub: "search focused", Icon: Search, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { label: "GEO Clients", value: clientsList.filter(c => c.service_type === "geo").length, sub: "AI visibility", Icon: Globe, color: "text-[#FF4500]", bg: "bg-[#FF4500]/10", border: "border-[#FF4500]/20" },
  { label: "Avg Win Rate", value: `${avgWin}%`, sub: `${totalKw} keywords`, Icon: TrendingUp, color: "text-[#00E676]", bg: "bg-[#00E676]/10", border: "border-[#00E676]/20" },
 ].map(({ label, value, sub, Icon, color, bg, border }) => (
 <div key={label} className={`bg-card border ${border} rounded-[20px] p-5 flex items-center gap-4`}>
 <div className={`w-10 h-10 rounded-[20px] ${bg} flex items-center justify-center shrink-0`}>
  <Icon className={`w-5 h-5 ${color}`} />
 </div>
 <div>
  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
  <p className="text-2xl font-bold text-foreground leading-none mt-0.5">{value}</p>
  <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Client Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
 {filtered.map((client, idx) => {
 const svc = SERVICE_BADGE[client.service_type] ?? SERVICE_BADGE.seo;
 const winColor = client.winRate >= 60 ? "#00E676" : client.winRate >= 40 ? "#FFD600" : "#FF4500";
 const avatarGrad = AVATAR_COLORS[idx % AVATAR_COLORS.length];
 return (
 <Link
  key={client.id}
  href={`/dashboard/clients/${client.id}`}
  className="group bg-card border border-border hover:border-amber-500/50 rounded-[20px] p-5 transition-all duration-200 hover:shadow-md flex flex-col"
 >
  {/* Top row */}
  <div className="flex items-start justify-between mb-4">
  <div className={`w-11 h-11 rounded-[20px] bg-gradient-to-br ${avatarGrad} flex items-center justify-center shrink-0`}>
   <span className="text-[16px] font-bold text-white">{client.brand_name.charAt(0)}</span>
  </div>
  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${svc.color}`}>
   {svc.label}
  </span>
  </div>

  {/* Name + website */}
  <h3 className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-0.5">
  {client.brand_name}
  </h3>
  <p className="text-[12px] text-muted-foreground mb-3">{client.website}</p>

  {/* Meta tags */}
  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-4">
  {client.industry && (
   <span className="flex items-center gap-1 bg-muted-bg border border-border px-2.5 py-0.5 rounded-full font-medium">
   <Tag className="w-2.5 h-2.5" /> {client.industry}
   </span>
  )}
  {client.country && (
   <span className="flex items-center gap-1 bg-muted-bg border border-border px-2.5 py-0.5 rounded-full font-medium">
   <MapPin className="w-2.5 h-2.5" /> {client.country}
   </span>
  )}
  </div>

  {/* Win rate */}
  <div className="mt-auto">
  <div className="flex justify-between items-center mb-1.5">
   <span className="text-[11px] text-muted-foreground font-medium">Win Rate</span>
   <span className="text-[12px] font-bold" style={{ color: winColor }}>{client.winRate}%</span>
  </div>
  <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
   <div
   className="h-full rounded-full transition-all duration-500"
   style={{ width: `${client.winRate}%`, backgroundColor: winColor }}
   />
  </div>
  <div className="flex justify-between mt-2">
   <span className="text-[11px] text-muted-foreground">{client.keywords} keywords</span>
   {client.tasks > 0 && (
   <span className="text-[11px] text-amber-500 font-bold">{client.tasks} open tasks</span>
   )}
  </div>
  </div>
 </Link>
 );
 })}

 {/* Add Client Card */}
 <Link
 href="/dashboard/clients/new"
 className="group bg-card border border-dashed border-border hover:border-amber-500/50 rounded-[20px] p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 min-h-[220px]"
 >
 <div className="w-11 h-11 rounded-[20px] bg-muted-bg border border-border group-hover:border-amber-500/30 flex items-center justify-center transition-colors">
  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
 </div>
 <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">Add new client</p>
 </Link>
 </div>
 </div>
 </div>
 );
}
