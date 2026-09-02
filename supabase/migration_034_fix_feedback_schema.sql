-- ============================================================
-- VSI Migration 034 — Ensure feedback table schema completeness
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  user_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category      text NOT NULL CHECK (category IN ('bug', 'idea', 'question', 'praise', 'general')),
  rating        text,
  subject       text,
  message       text NOT NULL,
  attachment_url text,
  page_url      text,
  user_agent    text,
  context_data  jsonb,
  status        text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in_progress', 'done', 'archived')),
  admin_notes   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Ensure all optional columns exist
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS rating text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS page_url text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS context_data jsonb;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS admin_notes text;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
