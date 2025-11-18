-- ============================================================================
-- FIX OUTLIERS FUNCTION
-- Fix schema mismatch: donations has 'date' column, not 'donated_at'
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
            'date', date
          )
        )
        FROM (
          SELECT id, amount_cents, donor_id, date
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
            'date', date
          )
        )
        FROM (
          SELECT id, amount_cents, date
          FROM donations
          WHERE client_id = p_client_id
            AND date > NOW()
          ORDER BY date DESC
          LIMIT 5
        ) examples
      )
    )
  FROM donations
  WHERE client_id = p_client_id
    AND date > NOW();

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION fn_detect_outliers TO authenticated;
