-- Migration: Add journey campaign fields
-- Description: Add support for multi-touch journey campaigns (upgrade, monthly, reactivation)
-- Date: 2025-01-16

-- Ensure uuid extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add journey fields to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS journey_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS origin_lab_run_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS origin_lab_run_summary TEXT;

-- Create campaign_deliverables table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaign_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  deliverable_type TEXT NOT NULL, -- 'email', 'direct_mail', 'sms', 'social', 'phone'
  deliverable_name TEXT NOT NULL,
  phase VARCHAR(255), -- Journey template phase name
  scheduled_send_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaign_deliverable_versions table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaign_deliverable_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES campaign_deliverables(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  segment_criteria_id TEXT NOT NULL,
  content_draft TEXT NOT NULL,
  subject_line TEXT,
  preview_text TEXT,
  estimated_recipients INTEGER,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add check constraint for journey_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'campaigns_journey_type_check'
  ) THEN
    ALTER TABLE campaigns
      ADD CONSTRAINT campaigns_journey_type_check
      CHECK (journey_type IS NULL OR journey_type IN ('upgrade', 'monthly', 'reactivation'));
  END IF;
END $$;

-- Add check constraint for deliverable status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'campaign_deliverables_status_check'
  ) THEN
    ALTER TABLE campaign_deliverables
      ADD CONSTRAINT campaign_deliverables_status_check
      CHECK (status IN ('draft', 'scheduled', 'sent'));
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_journey_type
  ON campaigns(journey_type)
  WHERE journey_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deliverables_campaign_id
  ON campaign_deliverables(campaign_id);

CREATE INDEX IF NOT EXISTS idx_deliverables_scheduled
  ON campaign_deliverables(scheduled_send_at)
  WHERE scheduled_send_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_versions_deliverable_id
  ON campaign_deliverable_versions(deliverable_id);

-- Add comments for documentation
COMMENT ON COLUMN campaigns.journey_type IS 'Type of multi-touch journey: upgrade, monthly, or reactivation';
COMMENT ON COLUMN campaigns.origin_lab_run_id IS 'ID of Data Lab run that generated segments for this campaign';
COMMENT ON COLUMN campaigns.origin_lab_run_summary IS 'Human-readable description of the Data Lab run origin';
COMMENT ON COLUMN campaign_deliverables.phase IS 'Journey template phase name (e.g., "Touch #1: Gratitude")';
COMMENT ON COLUMN campaign_deliverables.scheduled_send_at IS 'When this deliverable is scheduled to be sent';
COMMENT ON COLUMN campaign_deliverables.status IS 'Current status: draft, scheduled, or sent';
COMMENT ON COLUMN campaign_deliverable_versions.segment_criteria_id IS 'ID of behavioral segment this version targets';
COMMENT ON COLUMN campaign_deliverable_versions.content_draft IS 'Draft content (body) for this deliverable version';

-- Enable RLS on new tables
ALTER TABLE campaign_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_deliverable_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_deliverables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverables' AND policyname = 'Users can view deliverables for their campaigns'
  ) THEN
    CREATE POLICY "Users can view deliverables for their campaigns"
      ON campaign_deliverables FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM campaigns c
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE c.id = campaign_deliverables.campaign_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverables' AND policyname = 'Users can insert deliverables for their campaigns'
  ) THEN
    CREATE POLICY "Users can insert deliverables for their campaigns"
      ON campaign_deliverables FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM campaigns c
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE c.id = campaign_deliverables.campaign_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverables' AND policyname = 'Users can update deliverables for their campaigns'
  ) THEN
    CREATE POLICY "Users can update deliverables for their campaigns"
      ON campaign_deliverables FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM campaigns c
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE c.id = campaign_deliverables.campaign_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverables' AND policyname = 'Users can delete deliverables for their campaigns'
  ) THEN
    CREATE POLICY "Users can delete deliverables for their campaigns"
      ON campaign_deliverables FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM campaigns c
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE c.id = campaign_deliverables.campaign_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RLS policies for campaign_deliverable_versions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverable_versions' AND policyname = 'Users can view versions for their campaign deliverables'
  ) THEN
    CREATE POLICY "Users can view versions for their campaign deliverables"
      ON campaign_deliverable_versions FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM campaign_deliverables d
          JOIN campaigns c ON c.id = d.campaign_id
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE d.id = campaign_deliverable_versions.deliverable_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverable_versions' AND policyname = 'Users can insert versions for their campaign deliverables'
  ) THEN
    CREATE POLICY "Users can insert versions for their campaign deliverables"
      ON campaign_deliverable_versions FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM campaign_deliverables d
          JOIN campaigns c ON c.id = d.campaign_id
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE d.id = campaign_deliverable_versions.deliverable_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverable_versions' AND policyname = 'Users can update versions for their campaign deliverables'
  ) THEN
    CREATE POLICY "Users can update versions for their campaign deliverables"
      ON campaign_deliverable_versions FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM campaign_deliverables d
          JOIN campaigns c ON c.id = d.campaign_id
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE d.id = campaign_deliverable_versions.deliverable_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_deliverable_versions' AND policyname = 'Users can delete versions for their campaign deliverables'
  ) THEN
    CREATE POLICY "Users can delete versions for their campaign deliverables"
      ON campaign_deliverable_versions FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM campaign_deliverables d
          JOIN campaigns c ON c.id = d.campaign_id
          JOIN client_memberships cm ON cm.client_id = c.client_id
          WHERE d.id = campaign_deliverable_versions.deliverable_id
          AND cm.user_id = auth.uid()
        )
      );
  END IF;
END $$;
