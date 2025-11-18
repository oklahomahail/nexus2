-- ============================================================================
-- FIX DATA QUALITY FUNCTIONS
-- Fix schema mismatch: donors has first_name/last_name (not name)
-- and address is JSONB (not separate city/state/zip columns)
-- ============================================================================

-- ============================================================================
-- FUNCTION: Detect Duplicate Donors (FIXED)
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
      'name_1', COALESCE(d1.first_name || ' ' || d1.last_name, d1.first_name, d1.last_name),
      'name_2', COALESCE(d2.first_name || ' ' || d2.last_name, d2.first_name, d2.last_name)
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
      'name_1', COALESCE(d1.first_name || ' ' || d1.last_name, d1.first_name, d1.last_name),
      'name_2', COALESCE(d2.first_name || ' ' || d2.last_name, d2.first_name, d2.last_name)
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
      'name_1', COALESCE(d1.first_name || ' ' || d1.last_name, d1.first_name, d1.last_name),
      'name_2', COALESCE(d2.first_name || ' ' || d2.last_name, d2.first_name, d2.last_name),
      'zip', d1.address->>'zipCode',
      'email_1', d1.email,
      'email_2', d2.email
    ) AS details
  FROM donors d1
  JOIN donors d2 ON
    LOWER(COALESCE(d1.first_name || ' ' || d1.last_name, d1.first_name, d1.last_name)) =
    LOWER(COALESCE(d2.first_name || ' ' || d2.last_name, d2.first_name, d2.last_name))
    AND d1.address->>'zipCode' = d2.address->>'zipCode'
    AND d1.id < d2.id
  WHERE d1.client_id = p_client_id
    AND d2.client_id = p_client_id
    AND (d1.first_name IS NOT NULL OR d1.last_name IS NOT NULL)
    AND (d2.first_name IS NOT NULL OR d2.last_name IS NOT NULL)
    AND d1.address->>'zipCode' IS NOT NULL
    AND d1.address->>'zipCode' != '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Detect Missing Fields (FIXED)
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
  -- Donors missing email
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'email'::TEXT,
    COUNT(*) FILTER (WHERE email IS NULL OR email = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE email IS NULL OR email = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Donors missing phone
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'phone'::TEXT,
    COUNT(*) FILTER (WHERE phone IS NULL OR phone = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE phone IS NULL OR phone = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Donors missing first_name
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'first_name'::TEXT,
    COUNT(*) FILTER (WHERE first_name IS NULL OR first_name = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE first_name IS NULL OR first_name = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Donors missing last_name
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'last_name'::TEXT,
    COUNT(*) FILTER (WHERE last_name IS NULL OR last_name = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE last_name IS NULL OR last_name = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Donors missing address (entire JSONB field)
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'address'::TEXT,
    COUNT(*) FILTER (WHERE address IS NULL OR address = 'null'::jsonb OR address = '{}'::jsonb),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE address IS NULL OR address = 'null'::jsonb OR address = '{}'::jsonb) * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Donors missing city (in JSONB)
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'city'::TEXT,
    COUNT(*) FILTER (WHERE address->>'city' IS NULL OR address->>'city' = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE address->>'city' IS NULL OR address->>'city' = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Donors missing state (in JSONB)
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'state'::TEXT,
    COUNT(*) FILTER (WHERE address->>'state' IS NULL OR address->>'state' = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE address->>'state' IS NULL OR address->>'state' = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
  FROM donors
  WHERE client_id = p_client_id;

  -- Donors missing zipCode (in JSONB)
  RETURN QUERY
  SELECT
    'donors'::TEXT,
    'zipCode'::TEXT,
    COUNT(*) FILTER (WHERE address->>'zipCode' IS NULL OR address->>'zipCode' = ''),
    COUNT(*),
    ROUND((COUNT(*) FILTER (WHERE address->>'zipCode' IS NULL OR address->>'zipCode' = '') * 100.0 / NULLIF(COUNT(*), 0)), 2)
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
-- GRANT PERMISSIONS (ensure they're still granted after recreation)
-- ============================================================================

GRANT EXECUTE ON FUNCTION fn_detect_duplicate_donors TO authenticated;
GRANT EXECUTE ON FUNCTION fn_detect_missing_fields TO authenticated;
