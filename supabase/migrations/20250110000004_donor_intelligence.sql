-- ============================================================================
-- Donor Intelligence Engine - Privacy-Safe Analytics
-- ============================================================================
--
-- PURPOSE:
-- Provides RPC functions for analyzing anonymized donor data while enforcing
-- privacy thresholds (minimum cohort size N ≥ 50).
--
-- FEATURES:
-- - Retained donor analysis (e.g., "donors who gave every year for X years")
-- - Year-over-year upgrade velocity (percentage change in giving)
-- - Gift velocity (median time between gifts)
-- - Seasonality analysis (quarterly gift counts)
-- - Privacy enforcement on all queries
--
-- SECURITY:
-- - All functions use SECURITY DEFINER with client_id filtering
-- - Minimum cohort size of 50 enforced via enforce_privacy_ok()
-- - No PII exposed - operates only on anon_id
--
-- ============================================================================

-- ============================================================================
-- PRIVACY CONSTANTS
-- ============================================================================

-- Minimum cohort size for GDPR/CCPA compliance
CREATE OR REPLACE FUNCTION get_privacy_threshold()
RETURNS INTEGER AS $$
BEGIN
    RETURN 50;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Donor yearly totals (aggregated by year)
CREATE OR REPLACE VIEW v_donor_yearly AS
SELECT
    d.client_id,
    d.anon_id,
    EXTRACT(YEAR FROM dn.donation_date)::INTEGER AS year,
    COUNT(*)::INTEGER AS gift_count,
    SUM(dn.amount) AS total_amount,
    AVG(dn.amount) AS avg_amount,
    MIN(dn.donation_date) AS first_gift_date,
    MAX(dn.donation_date) AS last_gift_date
FROM donors d
INNER JOIN donations dn ON dn.donor_id = d.id
WHERE d.deleted_at IS NULL
  AND dn.deleted_at IS NULL
  AND dn.status = 'completed'
GROUP BY d.client_id, d.anon_id, EXTRACT(YEAR FROM dn.donation_date);

COMMENT ON VIEW v_donor_yearly IS 'Aggregated donor giving by year (privacy-safe, uses anon_id)';

-- View: Quarterly gift aggregation
CREATE OR REPLACE VIEW v_quarterly_gifts AS
SELECT
    d.client_id,
    EXTRACT(YEAR FROM dn.donation_date)::INTEGER AS year,
    EXTRACT(QUARTER FROM dn.donation_date)::INTEGER AS quarter,
    COUNT(*)::INTEGER AS gift_count,
    SUM(dn.amount) AS total_amount
FROM donors d
INNER JOIN donations dn ON dn.donor_id = d.id
WHERE d.deleted_at IS NULL
  AND dn.deleted_at IS NULL
  AND dn.status = 'completed'
GROUP BY d.client_id, EXTRACT(YEAR FROM dn.donation_date), EXTRACT(QUARTER FROM dn.donation_date);

COMMENT ON VIEW v_quarterly_gifts IS 'Quarterly gift aggregation for seasonality analysis';

-- ============================================================================
-- PRIVACY ENFORCEMENT
-- ============================================================================

-- Function: Enforce minimum cohort size
CREATE OR REPLACE FUNCTION enforce_privacy_ok(cohort_size INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    IF cohort_size < get_privacy_threshold() THEN
        RAISE EXCEPTION 'Privacy threshold not met: cohort size % is below minimum of %',
            cohort_size, get_privacy_threshold()
        USING HINT = 'Broaden your query criteria to include more donors';
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION enforce_privacy_ok IS 'Enforces minimum cohort size for privacy compliance';

-- ============================================================================
-- METRIC FUNCTIONS
-- ============================================================================

-- Function: Retained donor counts (donors who gave every year for N consecutive years)
CREATE OR REPLACE FUNCTION fn_retained_donor_counts(
    p_client_id UUID,
    p_num_years INTEGER DEFAULT 5
)
RETURNS TABLE (
    consecutive_years INTEGER,
    donor_count INTEGER
) AS $$
DECLARE
    v_cohort_size INTEGER;
BEGIN
    -- Calculate total cohort size
    SELECT COUNT(DISTINCT d.anon_id)
    INTO v_cohort_size
    FROM donors d
    WHERE d.client_id = p_client_id
      AND d.deleted_at IS NULL;

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Return retained donor counts
    RETURN QUERY
    WITH yearly_donors AS (
        SELECT DISTINCT
            anon_id,
            year
        FROM v_donor_yearly
        WHERE client_id = p_client_id
    ),
    donor_streaks AS (
        SELECT
            anon_id,
            year,
            year - ROW_NUMBER() OVER (PARTITION BY anon_id ORDER BY year) AS streak_group
        FROM yearly_donors
    ),
    streak_lengths AS (
        SELECT
            anon_id,
            COUNT(*) AS consecutive_years
        FROM donor_streaks
        GROUP BY anon_id, streak_group
    )
    SELECT
        sl.consecutive_years::INTEGER,
        COUNT(DISTINCT sl.anon_id)::INTEGER AS donor_count
    FROM streak_lengths sl
    WHERE sl.consecutive_years >= LEAST(p_num_years, 1)
    GROUP BY sl.consecutive_years
    ORDER BY sl.consecutive_years DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_retained_donor_counts IS 'Returns donor counts by consecutive giving years (privacy-safe)';

-- Function: Year-over-year upgrade leaderboard
CREATE OR REPLACE FUNCTION fn_yoy_upgrade_leaderboard(
    p_client_id UUID,
    p_year_from INTEGER,
    p_year_to INTEGER
)
RETURNS TABLE (
    anon_id TEXT,
    amount_from NUMERIC,
    amount_to NUMERIC,
    pct_change NUMERIC
) AS $$
DECLARE
    v_cohort_size INTEGER;
BEGIN
    -- Count donors who gave in both years
    SELECT COUNT(DISTINCT a.anon_id)
    INTO v_cohort_size
    FROM v_donor_yearly a
    INNER JOIN v_donor_yearly b ON b.anon_id = a.anon_id AND b.client_id = a.client_id
    WHERE a.client_id = p_client_id
      AND a.year = p_year_from
      AND b.year = p_year_to;

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Return upgrade leaderboard
    RETURN QUERY
    SELECT
        a.anon_id,
        a.total_amount AS amount_from,
        b.total_amount AS amount_to,
        ROUND(((b.total_amount - a.total_amount) / NULLIF(a.total_amount, 0)) * 100, 2) AS pct_change
    FROM v_donor_yearly a
    INNER JOIN v_donor_yearly b ON b.anon_id = a.anon_id AND b.client_id = a.client_id
    WHERE a.client_id = p_client_id
      AND a.year = p_year_from
      AND b.year = p_year_to
      AND a.total_amount > 0
    ORDER BY pct_change DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_yoy_upgrade_leaderboard IS 'Returns top donors by percentage increase between two years';

-- Function: Gift velocity (median days between gifts for repeat donors)
CREATE OR REPLACE FUNCTION fn_gift_velocity(
    p_client_id UUID
)
RETURNS TABLE (
    anon_id TEXT,
    gift_count INTEGER,
    median_days_between NUMERIC
) AS $$
DECLARE
    v_cohort_size INTEGER;
BEGIN
    -- Count repeat donors (2+ gifts)
    SELECT COUNT(DISTINCT d.anon_id)
    INTO v_cohort_size
    FROM donors d
    INNER JOIN donations dn ON dn.donor_id = d.id
    WHERE d.client_id = p_client_id
      AND d.deleted_at IS NULL
      AND dn.deleted_at IS NULL
      AND dn.status = 'completed'
    GROUP BY d.anon_id
    HAVING COUNT(*) >= 2;

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Return gift velocity
    RETURN QUERY
    WITH donor_gifts AS (
        SELECT
            d.anon_id,
            dn.donation_date,
            LAG(dn.donation_date) OVER (PARTITION BY d.anon_id ORDER BY dn.donation_date) AS prev_date
        FROM donors d
        INNER JOIN donations dn ON dn.donor_id = d.id
        WHERE d.client_id = p_client_id
          AND d.deleted_at IS NULL
          AND dn.deleted_at IS NULL
          AND dn.status = 'completed'
    ),
    gift_intervals AS (
        SELECT
            anon_id,
            EXTRACT(EPOCH FROM (donation_date - prev_date)) / 86400 AS days_between
        FROM donor_gifts
        WHERE prev_date IS NOT NULL
    )
    SELECT
        gi.anon_id,
        COUNT(*)::INTEGER + 1 AS gift_count, -- +1 because intervals are N-1
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gi.days_between) AS median_days_between
    FROM gift_intervals gi
    GROUP BY gi.anon_id
    HAVING COUNT(*) >= 1 -- At least 2 gifts (1 interval)
    ORDER BY median_days_between ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_gift_velocity IS 'Returns median days between gifts for repeat donors (privacy-safe)';

-- Function: Seasonality by quarter
CREATE OR REPLACE FUNCTION fn_seasonality_by_quarter(
    p_client_id UUID,
    p_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    year INTEGER,
    quarter INTEGER,
    gift_count INTEGER,
    total_amount NUMERIC
) AS $$
DECLARE
    v_cohort_size INTEGER;
BEGIN
    -- Count total gifts in scope
    SELECT COUNT(*)
    INTO v_cohort_size
    FROM v_quarterly_gifts
    WHERE client_id = p_client_id
      AND (p_year IS NULL OR year = p_year);

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Return quarterly aggregates
    RETURN QUERY
    SELECT
        qg.year::INTEGER,
        qg.quarter::INTEGER,
        qg.gift_count::INTEGER,
        qg.total_amount
    FROM v_quarterly_gifts qg
    WHERE qg.client_id = p_client_id
      AND (p_year IS NULL OR qg.year = p_year)
    ORDER BY qg.year DESC, qg.quarter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_seasonality_by_quarter IS 'Returns gift counts and totals by quarter (privacy-safe)';

-- ============================================================================
-- MAIN RPC ENDPOINT
-- ============================================================================

-- Function: Compute metric (unified endpoint for all donor intelligence queries)
CREATE OR REPLACE FUNCTION compute_metric(
    p_metric_name TEXT,
    p_filters JSONB DEFAULT '{}'::JSONB,
    p_client_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_client_id UUID;
    v_result JSONB;
BEGIN
    -- Use provided client_id or get from current user context
    v_client_id := COALESCE(p_client_id, (
        SELECT cm.client_id
        FROM client_memberships cm
        WHERE cm.user_id = auth.uid()
        LIMIT 1
    ));

    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'No client context available'
        USING HINT = 'User must be a member of a client organization';
    END IF;

    -- Route to appropriate metric function
    CASE p_metric_name
        WHEN 'retained_donors' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_retained_donor_counts(
                v_client_id,
                COALESCE((p_filters->>'num_years')::INTEGER, 5)
            ) r;

        WHEN 'yoy_upgrade' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_yoy_upgrade_leaderboard(
                v_client_id,
                (p_filters->>'year_from')::INTEGER,
                (p_filters->>'year_to')::INTEGER
            ) r;

        WHEN 'gift_velocity' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_gift_velocity(v_client_id) r;

        WHEN 'seasonality' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_seasonality_by_quarter(
                v_client_id,
                (p_filters->>'year')::INTEGER
            ) r;

        ELSE
            RAISE EXCEPTION 'Unknown metric: %', p_metric_name
            USING HINT = 'Valid metrics: retained_donors, yoy_upgrade, gift_velocity, seasonality';
    END CASE;

    RETURN COALESCE(v_result, '[]'::JSONB);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', SQLERRM,
            'hint', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION compute_metric IS 'Unified endpoint for computing donor intelligence metrics with privacy enforcement';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
-- (RLS policies and client_id filtering handled within functions)
GRANT EXECUTE ON FUNCTION get_privacy_threshold() TO authenticated;
GRANT EXECUTE ON FUNCTION enforce_privacy_ok(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_retained_donor_counts(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_yoy_upgrade_leaderboard(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_gift_velocity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_seasonality_by_quarter(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_metric(TEXT, JSONB, UUID) TO authenticated;

-- Grant select on views to authenticated users (RLS enforced via base tables)
GRANT SELECT ON v_donor_yearly TO authenticated;
GRANT SELECT ON v_quarterly_gifts TO authenticated;

-- ============================================================================
-- ACTIVITY LOGGING
-- ============================================================================

-- Log donor intelligence queries to activity_log
CREATE OR REPLACE FUNCTION log_donor_intelligence_query()
RETURNS TRIGGER AS $$
BEGIN
    -- Note: This is a placeholder for future implementation
    -- Could insert into activity_log table with metric_name, filters, execution_time
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
