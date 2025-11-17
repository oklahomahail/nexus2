-- Migration: Campaign Editor Tables
-- Created: 2025-01-18
-- Purpose: Add support for Campaign Editor with AI-generated deliverables

-- ============================================================================
-- EXTEND CAMPAIGNS TABLE FOR CAMPAIGN EDITOR
-- ============================================================================

-- Add Campaign Editor draft fields
alter table public.campaigns add column if not exists overview jsonb default '{}'::jsonb;
-- Structure: {
--   title: string,
--   season: string,
--   summary: string
-- }

alter table public.campaigns add column if not exists theme jsonb default '{}'::jsonb;
-- Structure: {
--   centralIdea: string,
--   tone: string,
--   visualNotes: string
-- }

alter table public.campaigns add column if not exists audience jsonb default '{}'::jsonb;
-- Structure: {
--   segments: string[],
--   notes: string
-- }

alter table public.campaigns add column if not exists deliverables jsonb default '{}'::jsonb;
-- Structure: {
--   emailCount: number,
--   socialCount: number,
--   includeDirectMail: boolean,
--   notes: string
-- }

alter table public.campaigns add column if not exists draft_preview text;
-- AI-generated campaign narrative preview

alter table public.campaigns add column if not exists creative_brief text;
-- AI-generated creative brief for team alignment

alter table public.campaigns add column if not exists published_at timestamp with time zone;
-- When campaign was published

-- ============================================================================
-- CAMPAIGN EMAILS TABLE
-- ============================================================================

create table if not exists public.campaign_emails (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,

  -- Email sequence
  sequence_number int not null,

  -- Email content
  subject text not null,
  preheader text,
  body text not null,

  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Ensure unique sequence numbers per campaign
  unique(campaign_id, sequence_number)
);

-- Index for fast campaign email lookups
create index if not exists idx_campaign_emails_campaign_id
  on public.campaign_emails(campaign_id);

create index if not exists idx_campaign_emails_sequence
  on public.campaign_emails(campaign_id, sequence_number);

-- ============================================================================
-- CAMPAIGN SOCIAL POSTS TABLE
-- ============================================================================

create table if not exists public.campaign_social_posts (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,

  -- Platform
  platform text not null check (platform in ('facebook', 'instagram', 'linkedin')),

  -- Post content
  body text not null,
  cta text,

  -- Scheduling
  scheduled_for timestamp with time zone,
  posted_at timestamp with time zone,

  -- Status
  status text default 'draft' check (status in ('draft', 'scheduled', 'posted')),

  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for fast campaign social post lookups
create index if not exists idx_campaign_social_posts_campaign_id
  on public.campaign_social_posts(campaign_id);

create index if not exists idx_campaign_social_posts_platform
  on public.campaign_social_posts(platform);

create index if not exists idx_campaign_social_posts_status
  on public.campaign_social_posts(status);

-- ============================================================================
-- CAMPAIGN DIRECT MAIL TABLE
-- ============================================================================

create table if not exists public.campaign_direct_mail (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,

  -- Mail piece content
  copy text not null,
  mail_type text default 'letter' check (mail_type in ('letter', 'postcard', 'brochure')),

  -- Versioning (for A/B testing)
  version int default 1,

  -- Status
  status text default 'draft' check (status in ('draft', 'approved', 'printed', 'mailed')),

  -- Mail dates
  mail_date date,

  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Ensure unique versions per campaign
  unique(campaign_id, version)
);

-- Index for fast campaign direct mail lookups
create index if not exists idx_campaign_direct_mail_campaign_id
  on public.campaign_direct_mail(campaign_id);

-- ============================================================================
-- ADD INDEXES FOR NEW JSONB COLUMNS
-- ============================================================================

create index if not exists idx_campaigns_overview
  on public.campaigns using gin(overview);

create index if not exists idx_campaigns_theme
  on public.campaigns using gin(theme);

create index if not exists idx_campaigns_audience
  on public.campaigns using gin(audience);

create index if not exists idx_campaigns_deliverables
  on public.campaigns using gin(deliverables);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
alter table public.campaign_emails enable row level security;
alter table public.campaign_social_posts enable row level security;
alter table public.campaign_direct_mail enable row level security;

-- Campaign Emails Policies
create policy "Users can view campaign emails for their clients"
  on public.campaign_emails for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_emails.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can insert campaign emails for their clients"
  on public.campaign_emails for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_emails.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can update campaign emails for their clients"
  on public.campaign_emails for update
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_emails.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can delete campaign emails for their clients"
  on public.campaign_emails for delete
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_emails.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

-- Campaign Social Posts Policies
create policy "Users can view campaign social posts for their clients"
  on public.campaign_social_posts for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_social_posts.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can insert campaign social posts for their clients"
  on public.campaign_social_posts for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_social_posts.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can update campaign social posts for their clients"
  on public.campaign_social_posts for update
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_social_posts.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can delete campaign social posts for their clients"
  on public.campaign_social_posts for delete
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_social_posts.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

-- Campaign Direct Mail Policies
create policy "Users can view campaign direct mail for their clients"
  on public.campaign_direct_mail for select
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_direct_mail.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can insert campaign direct mail for their clients"
  on public.campaign_direct_mail for insert
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_direct_mail.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can update campaign direct mail for their clients"
  on public.campaign_direct_mail for update
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_direct_mail.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

create policy "Users can delete campaign direct mail for their clients"
  on public.campaign_direct_mail for delete
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_direct_mail.campaign_id
      and c.client_id in (
        select client_id from public.client_users
        where user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

comment on column public.campaigns.overview is 'Campaign Editor overview step: title, season, summary';
comment on column public.campaigns.theme is 'Campaign Editor theme step: centralIdea, tone, visualNotes';
comment on column public.campaigns.audience is 'Campaign Editor audience step: segments array, notes';
comment on column public.campaigns.deliverables is 'Campaign Editor deliverables config: emailCount, socialCount, includeDirectMail, notes';
comment on column public.campaigns.draft_preview is 'AI-generated campaign narrative preview from Review Draft step';
comment on column public.campaigns.creative_brief is 'AI-generated creative brief for internal team alignment';
comment on column public.campaigns.published_at is 'Timestamp when campaign was published from Campaign Editor';

comment on table public.campaign_emails is 'AI-generated email series for campaigns';
comment on table public.campaign_social_posts is 'AI-generated social media posts for campaigns';
comment on table public.campaign_direct_mail is 'AI-generated direct mail copy for campaigns';
