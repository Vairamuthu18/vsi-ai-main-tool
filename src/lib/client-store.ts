export interface ClientItem {
  id: string;
  name: string;
  brand_name: string;
  website: string;
  service_type: "seo" | "geo" | "seo_geo";
  country: string;
  industry: string;
  default_location?: string;
  keywords: number;
  winRate: number;
  tasks: number;
  created_at?: string;
}

export const VALGROW_LABS_CLIENT: ClientItem = {
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

const DEMO_DOMAINS = new Set([
  "zomato.com", "vgdigital.ae", "seo.ae", "vgdigital.com", "athariw.com",
  "tap.company", "alex.sa", "trial.valgrow.com", "menacyberwire.com",
  "testb4pilot.com", "chrismcelroy.com", "acme.com", "unitedseo.ae", "valgrowing.com"
]);

const CUSTOM_CLIENTS_KEY = "searchintel_custom_clients";

export function getCustomClients(): ClientItem[] {
  if (typeof window === "undefined") return [VALGROW_LABS_CLIENT];
  try {
    const raw = localStorage.getItem(CUSTOM_CLIENTS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify([VALGROW_LABS_CLIENT]));
      return [VALGROW_LABS_CLIENT];
    }
    const parsed = JSON.parse(raw) as ClientItem[];
    const cleaned = parsed.filter((c) => {
      const w = (c.website || "").toLowerCase().trim();
      const n = (c.name || "").toLowerCase().trim();
      return !DEMO_DOMAINS.has(w) && n !== "zomato" && n !== "vg" && n !== "seo" && n !== "vg digital" && n !== "athariw" && n !== "tap payments" && n !== "alex";
    });

    if (cleaned.length === 0) {
      localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify([VALGROW_LABS_CLIENT]));
      return [VALGROW_LABS_CLIENT];
    }

    // Persist cleaned list if demo clients were removed
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error("Failed to parse custom clients from localStorage:", err);
    return [VALGROW_LABS_CLIENT];
  }
}

export function saveCustomClient(client: ClientItem, keywords: any[] = []): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomClients();
    // Prepend or replace if ID exists
    const filtered = existing.filter((c) => c.id !== client.id);
    const updated = [client, ...filtered];
    localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify(updated));

    if (keywords.length > 0) {
      localStorage.setItem(`searchintel_keywords_${client.id}`, JSON.stringify(keywords));
    }

    // Trigger storage event for live reactive updates across components
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("clients_updated"));
  } catch (err) {
    console.error("Failed to save custom client to localStorage:", err);
  }
}

export function getAllClients(defaultClients: ClientItem[] = []): ClientItem[] {
  const custom = getCustomClients();
  const customIds = new Set(custom.map((c) => c.id));
  const filteredDefault = defaultClients.filter((c) => !customIds.has(c.id) && !DEMO_DOMAINS.has((c.website || "").toLowerCase()));
  const all = [...custom, ...filteredDefault];
  return all.length > 0 ? all : [VALGROW_LABS_CLIENT];
}
