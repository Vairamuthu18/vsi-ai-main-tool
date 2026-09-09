-- ============================================================
-- VSI Migration 035 — Tracked Competitors Table & RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tracked_competitors (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name              text NOT NULL,
  domain            text NOT NULL,
  visibility_score  numeric,
  ai_mentions_count integer,
  top_engine        text,
  gap_status        text CHECK (gap_status IS NULL OR gap_status IN ('Leading', 'Tied', 'Lagging')),
  sentiment         text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'active', 'failed')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tracked_competitors_agency_domain_key UNIQUE (agency_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_tc_agency_domain ON public.tracked_competitors (agency_id, domain);
CREATE INDEX IF NOT EXISTS idx_tc_created_at ON public.tracked_competitors (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.tracked_competitors ENABLE ROW LEVEL SECURITY;

-- RLS Policy for agency isolation
DROP POLICY IF EXISTS "tracked_competitors_agency_all" ON public.tracked_competitors;
CREATE POLICY "tracked_competitors_agency_all"
  ON public.tracked_competitors FOR ALL
  TO authenticated
  USING (
    agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    agency_id IN (SELECT agency_id FROM public.profiles WHERE id = auth.uid())
  );

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
