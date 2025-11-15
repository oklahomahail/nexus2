-- Add Track15 fields to campaigns table
-- This adds the missing fields that are needed by the Track15 service layer

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

-- Add start_date field if missing (used by retention service)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS start_date timestamptz;

-- Add amount field to donations if missing (currently using amount_cents)
-- Note: The service layer expects an 'amount' field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='donations' AND column_name='amount') THEN
    ALTER TABLE donations ADD COLUMN amount numeric GENERATED ALWAYS AS (amount_cents / 100.0) STORED;
  END IF;
END$$;

-- Add donor_id to donations if it's using a different name
-- (Check if needed based on actual schema)

-- Update database comment for tracking
COMMENT ON COLUMN campaigns.track15_enabled IS 'Whether Track15 methodology is enabled for this campaign';
COMMENT ON COLUMN campaigns.track15_season IS 'Track15 campaign season: spring, summer, fall, winter';
COMMENT ON COLUMN campaigns.track15_stage IS 'Current Track15 workflow stage';
