-- CMP Features Migration

-- Banner Configurations
create table if not exists public.banner_configs (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade unique,
  position text default 'bottom-bar',
  theme text default 'dark',
  accept_text text default 'Accept All',
  reject_text text default 'Reject All',
  manage_text text default 'Manage Preferences',
  primary_color text default '#7000FF',
  logo_url text,
  show_logo boolean default false,
  enable_auto_blocker boolean default false,
  enable_gcm_v2 boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cookie Scans
create table if not exists public.cookie_scans (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade,
  scanned_at timestamptz default now(),
  cookies jsonb default '[]',
  status text default 'completed'
);

-- DSAR Requests
create table if not exists public.dsar_requests (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade,
  full_name text not null,
  email text not null,
  request_type text not null,
  message text,
  status text default 'pending',
  submitted_at timestamptz default now()
);

-- Regulations
create table if not exists public.regulations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  jurisdiction text,
  effective_date date,
  last_updated timestamptz default now(),
  status text default 'active',
  summary text,
  affects_jurisdictions text[]
);

-- RLS
alter table public.banner_configs enable row level security;
alter table public.cookie_scans enable row level security;
alter table public.dsar_requests enable row level security;
alter table public.regulations enable row level security;

-- Policies
create policy "banner_configs: own sites" on public.banner_configs for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "cookie_scans: own sites" on public.cookie_scans for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "dsar_requests: own sites" on public.dsar_requests for all using (
  site_id in (select id from public.sites where agency_id = auth.uid())
);
create policy "regulations: public read" on public.regulations for select using (true);

-- Functions
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_banner_configs_updated_at
before update on public.banner_configs
for each row execute function public.update_updated_at_column();

-- Seed Regulations
insert into public.regulations (name, jurisdiction, status, summary, affects_jurisdictions)
values 
('GDPR', 'European Union', 'active', 'The General Data Protection Regulation is a regulation in EU law on data protection and privacy.', array['GDPR']),
('CCPA', 'California, USA', 'active', 'The California Consumer Privacy Act is a state statute intended to enhance privacy rights and consumer protection.', array['CCPA']),
('LGPD', 'Brazil', 'active', 'The Lei Geral de Proteção de Dados is a data protection law in Brazil.', array['LGPD']),
('PIPEDA', 'Canada', 'active', 'The Personal Information Protection and Electronic Documents Act is a Canadian law relating to data privacy.', array['PIPEDA'])
on conflict do nothing;
