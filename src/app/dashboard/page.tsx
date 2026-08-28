import { createClient } from "@/lib/supabase/server";
import { requireAgency, isDummySupabase } from "@/lib/auth";
import DashboardClientView from "@/components/DashboardClientView";

export default async function DashboardPage() {
  const session = await requireAgency();
  const isSuperAdmin = session.role === "super_admin";

  let clients: any[] = [];
  let keywordCount = 0;
  let recentResults: any[] = [];
  let agency: any = null;

  if (isDummySupabase()) {
    clients = [
      { id: "client-1", name: "Valgrow GEO Client 1", service_type: "geo", website: "https://valgrow.com", agency_id: "agency-001" },
      { id: "client-2", name: "Valgrow SEO Client 2", service_type: "seo", website: "https://valgrow.com", agency_id: "agency-001" },
    ];
    keywordCount = 15;
    recentResults = [
      {
        gap_label: "highly_cited",
        client_id: "client-1",
        keyword: "best CRM software",
        track_type: "geo",
        rank_position: 1,
        aio_present: true,
        client_cited: true,
        mentioned_in_text: true,
        created_at: new Date().toISOString(),
      },
      {
        gap_label: "mentioned",
        client_id: "client-1",
        keyword: "top sales tool",
        track_type: "geo",
        rank_position: 2,
        aio_present: true,
        client_cited: false,
        mentioned_in_text: true,
        created_at: new Date().toISOString(),
      },
    ];
    agency = { max_clients: 10, is_pilot: false };
  } else {
    const supabase = await createClient();
    const clientsSelect = isSuperAdmin
      ? supabase
          .from("clients")
          .select("id, name, service_type, website, agency_id, agencies(name, display_name)")
          .order("created_at", { ascending: true })
      : supabase
          .from("clients")
          .select("id, name, service_type, website, agency_id")
          .eq("agency_id", session.agencyId)
          .order("created_at", { ascending: true });

    const kwCountQuery = isSuperAdmin
      ? supabase.from("tracked_keywords").select("*", { count: "exact", head: true }).eq("is_active", true)
      : supabase.from("tracked_keywords").select("*", { count: "exact", head: true })
          .eq("agency_id", session.agencyId).eq("is_active", true);

    const resultsQuery = isSuperAdmin
      ? supabase.from("search_results")
          .select("gap_label, client_id, keyword, track_type, rank_position, aio_present, client_cited, mentioned_in_text, created_at")
          .order("created_at", { ascending: false }).limit(5000)
      : supabase.from("search_results")
          .select("gap_label, client_id, keyword, track_type, rank_position, aio_present, client_cited, mentioned_in_text, created_at")
          .eq("agency_id", session.agencyId);

    const [clientsRes, kwRes, resultsRes, agencyRes] = await Promise.all([
      clientsSelect,
      kwCountQuery,
      resultsQuery,
      supabase
        .from("agencies")
        .select("max_clients, is_pilot")
        .eq("id", session.agencyId)
        .maybeSingle(),
    ]);

    clients = clientsRes.data ?? [];
    keywordCount = kwRes.count ?? 0;
    recentResults = resultsRes.data ?? [];
    agency = agencyRes.data;
  }

  const maxClients = agency?.max_clients as number | null | undefined;
  const clientList = clients ?? [];
  const rawResults = recentResults ?? [];

  return (
    <DashboardClientView
      isSuperAdmin={isSuperAdmin}
      clientList={clientList}
      keywordCount={keywordCount || 0}
      rawResults={rawResults}
      maxClients={maxClients}
    />
  );
}
