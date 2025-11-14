-- Migration: Extend Campaigns Table for Track15 Methodology
-- Created: 2025-01-13
-- Purpose: Add Track15-specific fields to campaigns table

-- ============================================================================
-- ADD TRACK15 CAMPAIGN FIELDS
-- ============================================================================

-- Campaign season (Spring, Summer, NTXGD, End-of-Year, Custom)
alter table public.campaigns add column if not exists season text
  check (season in ('spring', 'summer', 'ntxgd', 'eoy', 'custom'));

-- Core story components
alter table public.campaigns add column if not exists core_story jsonb default '{}'::jsonb;
-- Structure: {
--   anchor: string,              // Central narrative hook
--   imagery_direction: string,   // Visual/sensory language guidance
--   emotional_center: string     // Primary emotional tone (hope, urgency, etc.)
-- }

-- Narrative arc for cultivation and solicitation sequences
alter table public.campaigns add column if not exists narrative_arc jsonb default '{}'::jsonb;
-- Structure: {
--   story_statement: string,           // Overall campaign story
--   cultivation_sequence: string[],    // Array of cultivation touch narratives
--   solicitation_sequence: string[],   // Array of ask narratives
--   cta_logic: string,                 // Call-to-action strategy
--   donor_role: string                 // How donors see themselves (problem solver, champion, etc.)
-- }

-- Segmentation rules for different donor groups
alter table public.campaigns add column if not exists segmentation_rules jsonb default '{}'::jsonb;
-- Structure: {
--   current_donors: { criteria: {}, messaging: string },
--   lapsed_donors: { criteria: {}, messaging: string },
--   high_value_donors: { criteria: {}, messaging: string },
--   prospects: { criteria: {}, messaging: string },
--   monthly_candidates: { criteria: {}, messaging: string }
-- }

-- Multi-channel plan
alter table public.campaigns add column if not exists channel_plan jsonb default '{}'::jsonb;
-- Structure: {
--   emails: [{ sequence_order: number, subject: string, send_date: string, segment: string }],
--   social: [{ platform: string, content_type: string, post_date: string }],
--   mail: [{ piece_type: string, mail_date: string, segment: string }],
--   ads: [{ platform: string, ad_type: string, start_date: string, end_date: string }],
--   events: [{ event_type: string, event_date: string, description: string }]
-- }

-- Required assets for campaign execution
alter table public.campaigns add column if not exists assets_required jsonb default '{}'::jsonb;
-- Structure: {
--   photos: [{ description: string, purpose: string, acquired: boolean }],
--   testimonials: [{ type: string, source: string, acquired: boolean }],
--   brand_kit: [{ asset_type: string, file_url: string }],
--   templates: [{ template_type: string, channel: string, status: string }]
-- }

-- ============================================================================
-- ADD INDEXES
-- ============================================================================

create index if not exists idx_campaigns_season on public.campaigns(season);

-- GIN indexes for JSONB queries
create index if not exists idx_campaigns_core_story on public.campaigns using gin(core_story);
create index if not exists idx_campaigns_narrative_arc on public.campaigns using gin(narrative_arc);
create index if not exists idx_campaigns_segmentation_rules on public.campaigns using gin(segmentation_rules);
create index if not exists idx_campaigns_channel_plan on public.campaigns using gin(channel_plan);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

comment on column public.campaigns.season is 'Campaign seasonal alignment: spring, summer, ntxgd (North Texas Giving Day), eoy (End of Year), or custom';
comment on column public.campaigns.core_story is 'Track15 core story elements: anchor, imagery_direction, emotional_center';
comment on column public.campaigns.narrative_arc is 'Track15 narrative structure: story_statement, cultivation/solicitation sequences, cta_logic, donor_role';
comment on column public.campaigns.segmentation_rules is 'Donor segmentation criteria and messaging strategies for different groups';
comment on column public.campaigns.channel_plan is 'Multi-channel execution plan across email, social, mail, ads, and events';
comment on column public.campaigns.assets_required is 'Asset inventory needed for campaign execution';
