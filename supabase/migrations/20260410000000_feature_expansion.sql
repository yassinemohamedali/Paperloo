-- Client portal users
create table if not exists public.client_users (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade,
  email text not null,
  access_token text unique default gen_random_uuid()::text,
  created_at timestamptz default now()
);

-- Compliance scores
create table if not exists public.compliance_scores (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade,
  score integer default 0,
  grade text default 'F',
  breakdown jsonb default '{}',
  updated_at timestamptz default now()
);

-- Custom clauses
create table if not exists public.custom_clauses (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade,
  document_type text not null,
  title text not null,
  content text not null,
  position text default 'end',
  created_at timestamptz default now()
);

-- Site comments
create table if not exists public.site_comments (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade,
  user_id uuid references public.profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- Compliance certificates
create table if not exists public.certificates (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade,
  issued_at timestamptz default now(),
  valid_until timestamptz,
  certificate_id text unique default gen_random_uuid()::text
);

-- Add columns to existing tables
alter table public.sites add column if not exists compliance_grade text default 'F';
alter table public.sites add column if not exists last_reviewed_at timestamptz;
alter table public.sites add column if not exists white_label_name text;
alter table public.sites add column if not exists white_label_logo text;
alter table public.documents add column if not exists language text default 'en';
alter table public.profiles add column if not exists white_label_enabled boolean default false;
alter table public.profiles add column if not exists weekly_digest_enabled boolean default true;
alter table public.profiles add column if not exists review_interval_days integer default 90;

-- Add changelog_note to document_versions
alter table public.document_versions add column if not exists changelog_note text;

-- RLS
alter table public.client_users enable row level security;
alter table public.compliance_scores enable row level security;
alter table public.custom_clauses enable row level security;
alter table public.site_comments enable row level security;
alter table public.certificates enable row level security;

-- Policies
create policy "client_users: own sites" on public.client_users for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "compliance_scores: own sites" on public.compliance_scores for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "custom_clauses: own sites" on public.custom_clauses for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "site_comments: own sites" on public.site_comments for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "certificates: own sites" on public.certificates for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "certificates: public read" on public.certificates for select using (true);
create policy "client_users: public token read" on public.client_users for select using (true);
