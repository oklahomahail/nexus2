-- ============================================================================
-- DATA QUALITY DASHBOARD
-- Phase 2.1: Detect duplicates, missing fields, and outliers
-- ============================================================================

-- Create data quality issues table to track findings
CREATE TABLE IF NOT EXISTS data_quality_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Issue classification
  issue_type TEXT NOT NULL CHECK (
    issue_type IN ('duplicate', 'missing_field', 'outlier', 'invalid_format')
  ),
  severity TEXT NOT NULL CHECK (
    severity IN ('high', 'medium', 'low')
  ),

  -- Issue details
  table_name TEXT NOT NULL,
  record_id UUID,
  field_name TEXT,
  description TEXT NOT NULL,
  details JSONB,

  -- Resolution tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'acknowledged', 'resolved', 'ignored')
  ),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),

  -- Metadata
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dq_issues_client_id ON data_quality_issues(client_id);
CREATE INDEX IF NOT EXISTS idx_dq_issues_type ON data_quality_issues(client_id, issue_type);
CREATE INDEX IF NOT EXISTS idx_dq_issues_severity ON data_quality_issues(client_id, severity);
CREATE INDEX IF NOT EXISTS idx_dq_issues_status ON data_quality_issues(status);

-- ============================================================================
-- FUNCTION: Detect Duplicate Donors
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_detect_duplicate_donors(p_client_id UUID)
RETURNS TABLE (
  donor_id_1 UUID,
  donor_id_2 UUID,
  match_type TEXT,
  match_score NUMERIC,
  details JSONB
) AS $$
BEGIN
  -- Email duplicates (exact match)
  RETURN QUERY
  SELECT
    d1.id AS donor_id_1,
    d2.id AS donor_id_2,
    'email_exact'::TEXT AS match_type,
    1.0::NUMERIC AS match_score,
    jsonb_build_object(
      'email', d1.email,
      'name_1', d1.name,
      'name_2', d2.name
    ) AS details
  FROM donors d1
  JOIN donors d2 ON d1.email = d2.email AND d1.id < d2.id
  WHERE d1.client_id = p_client_id
    AND d2.client_id = p_client_id
    AND d1.email IS NOT NULL
    AND d1.email != '';

  -- Phone duplicates (exact match, normalized)
  RETURN QUERY
  SELECT
    d1.id AS donor_id_1,
    d2.id AS donor_id_2,
    'phone_exact'::TEXT AS match_type,
    1.0::NUMERIC AS match_score,
    jsonb_build_object(
      'phone', d1.phone,
      'name_1', d1.name,
      'name_2', d2.name
    ) AS details
  FROM donors d1
  JOIN donors d2 ON d1.phone = d2.phone AND d1.id < d2.id
  WHERE d1.client_id = p_client_id
    AND d2.client_id = p_client_id
    AND d1.phone IS NOT NULL
    AND d1.phone != '';

  -- Name + ZIP duplicates (fuzzy match)
  RETURN QUERY
  SELECT
    d1.id AS donor_id_1,
    d2.id AS donor_id_2,
    'name_zip_fuzzy'::TEXT AS match_type,
    0.85::NUMERIC AS match_score,
    jsonb_build_object(
      'name_1', d1.name,
      'name_2', d2.name,
      'zip', d1.zip,
      'email_1', d1.email,
      'email_2', d2.email
    ) AS details
  FROM donors d1
  JOIN donors d2 ON
    LOWER(d1.name) = LOWER(d2.name)
    AND d1.zip = d2.zip
    AND d1.id < d2.id
  WHERE d1.client_id = p_client_id
    AND d2.client_id = p_client_id
    AND d1.name IS NOT NULL
    AND d2.name IS NOT NULL
    AND d1.zip IS NOT NULL
    AND d1.zip != '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Detect Missing Fields
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_detect_missing_fields(p_client_id UUID)
RETURNS TABLE (
  table_name TEXT,
  field_name TEXT,
  missing_count BIGINT,
  total_count BIGINT,
  missing_percent NUMERIC
) AS $$
BEGIN
  -- Donors missing fields
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'email'::TEXT,
    COUNT(*) FILTER (WHERE email IS NULL OR email = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE email IS NULL OR email = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'phone'::TEXT,
    COUNT(*) FILTER (WHERE phone IS NULL OR phone = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE phone IS NULL OR phone = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'address'::TEXT,
    COUNT(*) FILTER (WHERE address IS NULL OR address = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE address IS NULL OR address = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'city'::TEXT,
    COUNT(*) FILTER (WHERE city IS NULL OR city = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE city IS NULL OR city = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'state'::TEXT,
    COUNT(*) FILTER (WHERE state IS NULL OR state = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE state IS NULL OR state = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'zip'::TEXT,
    COUNT(*) FILTER (WHERE zip IS NULL OR zip = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE zip IS NULL OR zip = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Campaigns missing fields
  RETURN QUERY
  SELECT
    'campaigns'::TEXT,
    'goal_amount'::TEXT,
    COUNT(*) FILTER (WHERE goal_amount IS NULL OR goal_amount = 0),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE goal_amount IS NULL OR goal_amount = 0) * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM campaigns
  WHERE client_id = p_client_id;

  RETURN QUERY
  SELECT
    'campaigns'::TEXT,
    'start_date'::TEXT,
    COUNT(*) FILTER (WHERE start_date IS NULL),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE start_date IS NULL) * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM campaigns
  WHERE client_id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Detect Outliers
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_detect_outliers(p_client_id UUID)
RETURNS TABLE (
  outlier_type TEXT,
  severity TEXT,
  record_count BIGINT,
  details JSONB
) AS $$
BEGIN
  -- Donations with extreme amounts (>$10,000)
  RETURN QUERY
  SELECT
    'donation_extreme_amount'::TEXT,
    'medium'::TEXT,
    COUNT(*),
    jsonb_build_object(
      'threshold', 10000,
      'max_amount', MAX(amount_cents / 100.0),
      'examples', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', id,
            'amount', amount_cents / 100.0,
            'donor_id', donor_id,
            'date', donated_at
          )
        )
        FROM (
          SELECT id, amount_cents, donor_id, donated_at
          FROM donations
          WHERE client_id = p_client_id
            AND amount_cents > 1000000
          ORDER BY amount_cents DESC
          LIMIT 5
        ) examples
      )
    )
  FROM donations
  WHERE client_id = p_client_id
    AND amount_cents > 1000000;

  -- Donations with future dates
  RETURN QUERY
  SELECT
    'donation_future_date'::TEXT,
    'high'::TEXT,
    COUNT(*),
    jsonb_build_object(
      'examples', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', id,
            'amount', amount_cents / 100.0,
            'date', donated_at
          )
        )
        FROM (
          SELECT id, amount_cents, donated_at
          FROM donations
          WHERE client_id = p_client_id
            AND donated_at > NOW()
          ORDER BY donated_at DESC
          LIMIT 5
        ) examples
      )
    )
  FROM donations
  WHERE client_id = p_client_id
    AND donated_at > NOW();

  -- Donations with $0 amount
  RETURN QUERY
  SELECT
    'donation_zero_amount'::TEXT,
    'low'::TEXT,
    COUNT(*),
    jsonb_build_object(
      'count', COUNT(*)
    )
  FROM donations
  WHERE client_id = p_client_id
    AND (amount_cents IS NULL OR amount_cents = 0);

  -- Campaigns with past end dates still marked as active
  RETURN QUERY
  SELECT
    'campaign_past_end_date'::TEXT,
    'medium'::TEXT,
    COUNT(*),
    jsonb_build_object(
      'examples', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', id,
            'name', name,
            'end_date', end_date
          )
        )
        FROM (
          SELECT id, name, end_date
          FROM campaigns
          WHERE client_id = p_client_id
            AND end_date < NOW()
            AND status = 'active'
          LIMIT 5
        ) examples
      )
    )
  FROM campaigns
  WHERE client_id = p_client_id
    AND end_date < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Calculate Data Quality Score
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_data_quality_score(p_client_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_score NUMERIC := 100.0;
  v_deductions JSONB := '[]'::JSONB;
  v_duplicate_count BIGINT;
  v_missing_critical_fields NUMERIC;
  v_outlier_count BIGINT;
BEGIN
  -- Deduct points for duplicates (up to -30 points)
  SELECT COUNT(*) INTO v_duplicate_count
  FROM fn_detect_duplicate_donors(p_client_id);

  IF v_duplicate_count > 0 THEN
    v_score := v_score - LEAST(30, v_duplicate_count * 2);
    v_deductions := v_deductions || jsonb_build_object(
      'reason', 'duplicate_donors',
      'count', v_duplicate_count,
      'points', -LEAST(30, v_duplicate_count * 2)
    );
  END IF;

  -- Deduct points for missing critical fields (up to -40 points)
  SELECT AVG(missing_percent) INTO v_missing_critical_fields
  FROM fn_detect_missing_fields(p_client_id)
  WHERE field_name IN ('email', 'phone');

  IF v_missing_critical_fields > 0 THEN
    v_score := v_score - LEAST(40, v_missing_critical_fields * 0.8);
    v_deductions := v_deductions || jsonb_build_object(
      'reason', 'missing_critical_fields',
      'percent', v_missing_critical_fields,
      'points', -LEAST(40, v_missing_critical_fields * 0.8)
    );
  END IF;

  -- Deduct points for outliers (up to -20 points)
  SELECT SUM(record_count) INTO v_outlier_count
  FROM fn_detect_outliers(p_client_id)
  WHERE severity IN ('high', 'medium');

  IF v_outlier_count > 0 THEN
    v_score := v_score - LEAST(20, v_outlier_count * 1);
    v_deductions := v_deductions || jsonb_build_object(
      'reason', 'outliers',
      'count', v_outlier_count,
      'points', -LEAST(20, v_outlier_count * 1)
    );
  END IF;

  -- Return score with breakdown
  RETURN jsonb_build_object(
    'score', GREATEST(0, ROUND(v_score, 1)),
    'grade', CASE
      WHEN v_score >= 90 THEN 'A'
      WHEN v_score >= 80 THEN 'B'
      WHEN v_score >= 70 THEN 'C'
      WHEN v_score >= 60 THEN 'D'
      ELSE 'F'
    END,
    'deductions', v_deductions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE data_quality_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quality issues for their clients" ON data_quality_issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = data_quality_issues.client_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quality issues for their clients" ON data_quality_issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_memberships cm
      WHERE cm.client_id = data_quality_issues.client_id
        AND cm.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_data_quality_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER data_quality_issues_updated_at
  BEFORE UPDATE ON data_quality_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_data_quality_issues_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION fn_detect_duplicate_donors TO authenticated;
GRANT EXECUTE ON FUNCTION fn_detect_missing_fields TO authenticated;
GRANT EXECUTE ON FUNCTION fn_detect_outliers TO authenticated;
GRANT EXECUTE ON FUNCTION fn_data_quality_score TO authenticated;
