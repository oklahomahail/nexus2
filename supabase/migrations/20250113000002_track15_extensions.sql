-- Track15 Campaign Extensions Migration
-- Adds Track15-specific fields and tables to support Track15 methodology

-- ============================================================================
-- 1. Extend campaigns table with Track15 fields
-- ============================================================================

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS track15_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS track15_season text
    CHECK (track15_season IN ('spring','summer','fall','winter')),
  ADD COLUMN IF NOT EXISTS track15_template_key text,

  -- Core story fields
  ADD COLUMN IF NOT EXISTS track15_core_headline text,
  ADD COLUMN IF NOT EXISTS track15_core_summary text,
  ADD COLUMN IF NOT EXISTS track15_value_proposition text,
  ADD COLUMN IF NOT EXISTS track15_donor_motivation text,

  -- Workflow stage
  ADD COLUMN IF NOT EXISTS track15_stage text
    CHECK (
      track15_stage IN (
        'not_started',
        'core_story_draft',
        'arc_drafted',
        'ready_for_launch',
        'active',
        'completed'
      )
    ) DEFAULT 'not_started';

-- Add indexes for Track15 queries
CREATE INDEX IF NOT EXISTS idx_campaigns_track15_enabled
  ON campaigns(track15_enabled)
  WHERE track15_enabled = true;

CREATE INDEX IF NOT EXISTS idx_campaigns_track15_season
  ON campaigns(track15_season)
  WHERE track15_season IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_track15_stage
  ON campaigns(track15_stage)
  WHERE track15_stage IS NOT NULL;

-- ============================================================================
-- 2. Create track15_narrative_steps table
-- ============================================================================

CREATE TABLE IF NOT EXISTS track15_narrative_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Track15 narrative stage
  stage text NOT NULL CHECK (
    stage IN ('awareness','engagement','consideration','conversion','gratitude')
  ),

  title text NOT NULL,
  body text NOT NULL,

  -- Ordered sequence within the arc
  sequence int NOT NULL DEFAULT 0,

  -- Channels (array of channel names)
  channels text[] NOT NULL DEFAULT '{}',

  -- Optional targeting detail
  primary_segment text,
  call_to_action text,

  is_active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for narrative steps
CREATE INDEX IF NOT EXISTS idx_track15_steps_campaign_id
  ON track15_narrative_steps(campaign_id);

CREATE INDEX IF NOT EXISTS idx_track15_steps_campaign_stage
  ON track15_narrative_steps(campaign_id, stage);

CREATE INDEX IF NOT EXISTS idx_track15_steps_sequence
  ON track15_narrative_steps(campaign_id, sequence);

-- Updated_at trigger for narrative steps
CREATE OR REPLACE FUNCTION update_track15_narrative_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track15_narrative_steps_updated_at
  BEFORE UPDATE ON track15_narrative_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_track15_narrative_steps_updated_at();

-- ============================================================================
-- 3. Create track15_campaign_metrics table
-- ============================================================================

CREATE TABLE IF NOT EXISTS track15_campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Baseline metrics captured at campaign launch
  baseline_response_rate numeric,
  baseline_engagement_score numeric,
  baseline_velocity numeric,

  -- Current metrics for lift calculations
  current_response_rate numeric,
  current_engagement_score numeric,
  current_velocity numeric,

  -- Cached lift percentages (for quick dashboard reads)
  engagement_lift numeric,
  response_rate_lift numeric,
  velocity_lift numeric,

  calculated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_campaign_metrics UNIQUE(campaign_id)
);

-- Index for metrics lookups
CREATE INDEX IF NOT EXISTS idx_track15_metrics_campaign_id
  ON track15_campaign_metrics(campaign_id);

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE track15_narrative_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE track15_campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Narrative Steps Policies
-- Users can view narrative steps for campaigns they have access to
CREATE POLICY "Users can view narrative steps for their campaigns"
  ON track15_narrative_steps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_narrative_steps.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can insert narrative steps for campaigns they have access to
CREATE POLICY "Users can insert narrative steps for their campaigns"
  ON track15_narrative_steps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_narrative_steps.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can update narrative steps for campaigns they have access to
CREATE POLICY "Users can update narrative steps for their campaigns"
  ON track15_narrative_steps
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_narrative_steps.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can delete narrative steps for campaigns they have access to
CREATE POLICY "Users can delete narrative steps for their campaigns"
  ON track15_narrative_steps
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_narrative_steps.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- Campaign Metrics Policies
-- Users can view metrics for campaigns they have access to
CREATE POLICY "Users can view metrics for their campaigns"
  ON track15_campaign_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_campaign_metrics.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can insert metrics for campaigns they have access to
CREATE POLICY "Users can insert metrics for their campaigns"
  ON track15_campaign_metrics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_campaign_metrics.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can update metrics for campaigns they have access to
CREATE POLICY "Users can update metrics for their campaigns"
  ON track15_campaign_metrics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_campaign_metrics.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Function to initialize Track15 for a campaign
CREATE OR REPLACE FUNCTION initialize_track15_campaign(
  p_campaign_id uuid,
  p_season text,
  p_template_key text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE campaigns
  SET
    track15_enabled = true,
    track15_season = p_season,
    track15_template_key = p_template_key,
    track15_stage = 'not_started'
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get campaign completion status
CREATE OR REPLACE FUNCTION get_track15_completion_status(p_campaign_id uuid)
RETURNS TABLE (
  has_core_story boolean,
  has_narrative_steps boolean,
  step_count int,
  stage text,
  is_ready_for_launch boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (c.track15_core_headline IS NOT NULL
      AND c.track15_core_summary IS NOT NULL
      AND c.track15_value_proposition IS NOT NULL
      AND c.track15_donor_motivation IS NOT NULL) as has_core_story,
    (EXISTS (
      SELECT 1 FROM track15_narrative_steps ns
      WHERE ns.campaign_id = p_campaign_id AND ns.is_active = true
    )) as has_narrative_steps,
    (SELECT COUNT(*)::int FROM track15_narrative_steps ns
      WHERE ns.campaign_id = p_campaign_id AND ns.is_active = true) as step_count,
    c.track15_stage as stage,
    (c.track15_stage IN ('ready_for_launch', 'active')) as is_ready_for_launch
  FROM campaigns c
  WHERE c.id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
