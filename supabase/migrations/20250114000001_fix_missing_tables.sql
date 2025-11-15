-- Fix missing tables by creating them if they don't exist
-- This file consolidates the missing tables from brand_bible.sql and track15_extensions.sql

-- ============================================================================
-- BRAND PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Identity
    name TEXT NOT NULL,
    mission_statement TEXT,

    -- Voice & Tone
    tone_of_voice TEXT,
    brand_personality TEXT,
    style_keywords TEXT[],

    -- Visual Identity
    primary_colors TEXT[],
    typography JSONB,
    logo_url TEXT,

    -- Guidelines
    guidelines_url TEXT,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT brand_profiles_name_check CHECK (length(name) >= 1)
);

-- ============================================================================
-- BRAND ASSETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,

    -- Asset details
    asset_type TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    metadata JSONB,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT brand_assets_type_check CHECK (
        asset_type IN ('logo', 'photo', 'template', 'example_doc', 'palette', 'typography')
    )
);

-- ============================================================================
-- BRAND CORPUS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS brand_corpus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,

    -- Source info
    source_type TEXT NOT NULL,
    source_url TEXT,
    title TEXT,
    checksum TEXT NOT NULL,

    -- Content
    content TEXT NOT NULL,
    embedding vector(1536),
    tokens INTEGER,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT brand_corpus_source_check CHECK (
        source_type IN ('website', 'social', 'report', 'campaign', 'manual')
    ),
    UNIQUE (brand_id, checksum)
);

-- ============================================================================
-- TRACK15 NARRATIVE STEPS
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

-- ============================================================================
-- TRACK15 CAMPAIGN METRICS
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

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Brand profiles indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_client_id ON brand_profiles(client_id);

-- Brand assets indexes
CREATE INDEX IF NOT EXISTS idx_brand_assets_client_id ON brand_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_brand_id ON brand_assets(brand_id);

-- Brand corpus indexes
CREATE INDEX IF NOT EXISTS idx_brand_corpus_client_id ON brand_corpus(client_id);
CREATE INDEX IF NOT EXISTS idx_brand_corpus_brand_id ON brand_corpus(brand_id);

-- Track15 narrative steps indexes
CREATE INDEX IF NOT EXISTS idx_track15_steps_campaign_id ON track15_narrative_steps(campaign_id);
CREATE INDEX IF NOT EXISTS idx_track15_steps_campaign_stage ON track15_narrative_steps(campaign_id, stage);
CREATE INDEX IF NOT EXISTS idx_track15_steps_sequence ON track15_narrative_steps(campaign_id, sequence);

-- Track15 metrics indexes
CREATE INDEX IF NOT EXISTS idx_track15_metrics_campaign_id ON track15_campaign_metrics(campaign_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE track15_narrative_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE track15_campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Brand profiles policies
CREATE POLICY "Users can view brand profiles for their clients" ON brand_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = brand_profiles.client_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert brand profiles for their clients" ON brand_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = brand_profiles.client_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update brand profiles for their clients" ON brand_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = brand_profiles.client_id
        AND cm.user_id = auth.uid()
    )
  );

-- Brand assets policies
CREATE POLICY "Users can view brand assets for their clients" ON brand_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = brand_assets.client_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert brand assets for their clients" ON brand_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = brand_assets.client_id
        AND cm.user_id = auth.uid()
    )
  );

-- Brand corpus policies
CREATE POLICY "Users can view brand corpus for their clients" ON brand_corpus
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = brand_corpus.client_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert brand corpus for their clients" ON brand_corpus
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = brand_corpus.client_id
        AND cm.user_id = auth.uid()
    )
  );

-- Track15 narrative steps policies
CREATE POLICY "Users can view narrative steps for their campaigns" ON track15_narrative_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_narrative_steps.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert narrative steps for their campaigns" ON track15_narrative_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_narrative_steps.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update narrative steps for their campaigns" ON track15_narrative_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_narrative_steps.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- Track15 campaign metrics policies
CREATE POLICY "Users can view metrics for their campaigns" ON track15_campaign_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      JOIN client_memberships cm ON cm.client_id = c.client_id
      WHERE c.id = track15_campaign_metrics.campaign_id
        AND cm.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

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
