-- Migration: Knowledge Base Tables for Track15 Integration
-- Created: 2025-01-13
-- Purpose: Add client_voice, client_messaging, and client_donor_narratives tables

-- ============================================================================
-- 1. CLIENT VOICE TABLE
-- ============================================================================
-- Stores voice and tone guidelines for each client organization

create table if not exists public.client_voice (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  voice_description text,
  tone_guidelines text,
  donor_language_rules text, -- Track15 specific: how to address donors
  examples jsonb default '{"positive": [], "negative": []}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id)
);

-- Add indexes for performance
create index idx_client_voice_client_id on public.client_voice(client_id);

-- Enable RLS
alter table public.client_voice enable row level security;

-- RLS Policies
create policy "Users can view voice for their clients"
  on public.client_voice for select
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_voice.client_id
      and client_memberships.user_id = auth.uid()
    )
  );

create policy "Users can update voice for their clients"
  on public.client_voice for all
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_voice.client_id
      and client_memberships.user_id = auth.uid()
      and client_memberships.role in ('owner', 'admin')
    )
  );

-- ============================================================================
-- 2. CLIENT MESSAGING TABLE
-- ============================================================================
-- Stores messaging pillars, positioning, and Track15 narrative framework

create table if not exists public.client_messaging (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  pillars jsonb default '[]'::jsonb, -- [{ title, description, examples }]
  impact_language text,
  value_proposition text,
  problem_statement text, -- Track15: clear articulation of need
  vision_statement text, -- Track15: aspirational future state
  point_of_view text, -- Track15: distinctive organizational stance
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id)
);

-- Add indexes
create index idx_client_messaging_client_id on public.client_messaging(client_id);

-- Enable RLS
alter table public.client_messaging enable row level security;

-- RLS Policies
create policy "Users can view messaging for their clients"
  on public.client_messaging for select
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_messaging.client_id
      and client_memberships.user_id = auth.uid()
    )
  );

create policy "Users can update messaging for their clients"
  on public.client_messaging for all
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_messaging.client_id
      and client_memberships.user_id = auth.uid()
      and client_memberships.role in ('owner', 'admin')
    )
  );

-- ============================================================================
-- 3. CLIENT DONOR NARRATIVES TABLE
-- ============================================================================
-- Repository of donor stories, testimonials, and impact narratives

create table if not exists public.client_donor_narratives (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  narrative text not null,
  donor_role text, -- Track15: compassionate problem solver, champion, ally, etc.
  emotional_center text, -- Track15: hope, urgency, belonging, gratitude, etc.
  story_type text, -- donor_story, impact_story, testimonial, case_study
  tags text[] default array[]::text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add indexes
create index idx_client_donor_narratives_client_id on public.client_donor_narratives(client_id);
create index idx_client_donor_narratives_story_type on public.client_donor_narratives(story_type);
create index idx_client_donor_narratives_tags on public.client_donor_narratives using gin(tags);

-- Enable RLS
alter table public.client_donor_narratives enable row level security;

-- RLS Policies
create policy "Users can view narratives for their clients"
  on public.client_donor_narratives for select
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_donor_narratives.client_id
      and client_memberships.user_id = auth.uid()
    )
  );

create policy "Users can manage narratives for their clients"
  on public.client_donor_narratives for all
  using (
    exists (
      select 1 from public.client_memberships
      where client_memberships.client_id = client_donor_narratives.client_id
      and client_memberships.user_id = auth.uid()
      and client_memberships.role in ('owner', 'admin')
    )
  );

-- ============================================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for client_voice
create trigger set_updated_at_client_voice
  before update on public.client_voice
  for each row
  execute function public.handle_updated_at();

-- Triggers for client_messaging
create trigger set_updated_at_client_messaging
  before update on public.client_messaging
  for each row
  execute function public.handle_updated_at();

-- Triggers for client_donor_narratives
create trigger set_updated_at_client_donor_narratives
  before update on public.client_donor_narratives
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- 5. SEED INITIAL DATA (OPTIONAL)
-- ============================================================================
-- Add default voice/messaging for existing clients if needed
-- Uncomment if you want to initialize empty KB entries for all existing clients

/*
insert into public.client_voice (client_id)
select id from public.clients
on conflict (client_id) do nothing;

insert into public.client_messaging (client_id)
select id from public.clients
on conflict (client_id) do nothing;
*/
