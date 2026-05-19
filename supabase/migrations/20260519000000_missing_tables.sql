
-- Migration to fix missing tables and columns for compliance tracking

-- 1. Update sites table with compliance metadata
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS compliance_grade TEXT DEFAULT 'F';
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Expand document types in check constraint
-- First drop existing constraint if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_type_check') THEN
        ALTER TABLE public.documents DROP CONSTRAINT documents_type_check;
    END IF;
END $$;

-- 3. Create compliance_scores table
CREATE TABLE IF NOT EXISTS public.compliance_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  grade TEXT DEFAULT 'F',
  breakdown JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create document_versions table
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  changelog_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create custom_clauses table
CREATE TABLE IF NOT EXISTS public.custom_clauses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  position TEXT DEFAULT 'end' CHECK (position IN ('beginning', 'end')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE public.compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_clauses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_scores: own sites" ON public.compliance_scores 
  USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

CREATE POLICY "document_versions: own sites" ON public.document_versions 
  USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));

CREATE POLICY "custom_clauses: own sites" ON public.custom_clauses 
  USING (site_id IN (SELECT id FROM public.sites WHERE agency_id = auth.uid()));
