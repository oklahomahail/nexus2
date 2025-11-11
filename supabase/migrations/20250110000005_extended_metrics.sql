-- ============================================================================
-- Extended Donor Intelligence Metrics
-- ============================================================================
--
-- PURPOSE:
-- Extends the donor intelligence engine with additional metrics:
-- - Monthly seasonality (more granular than quarterly)
-- - 3-year upgrade velocity (CAGR-style compound growth)
-- - Median gift by year (central tendency analysis)
-- - Segment retention (1-year loyalty tracking)
-- - Recency distribution (days since last gift)
--
-- SECURITY:
-- - All functions enforce privacy threshold (N ≥ 50)
-- - Client-scoped filtering via SECURITY DEFINER
-- - No PII exposed
--
-- ============================================================================

-- ============================================================================
-- HELPER VIEWS (Extended)
-- ============================================================================

-- View: Monthly gift aggregation (more granular than quarterly)
CREATE OR REPLACE VIEW v_monthly_gifts AS
SELECT
    d.client_id,
    EXTRACT(YEAR FROM dn.donation_date)::INTEGER AS year,
    EXTRACT(MONTH FROM dn.donation_date)::INTEGER AS month,
    COUNT(*)::INTEGER AS gift_count,
    SUM(dn.amount) AS total_amount,
    AVG(dn.amount) AS avg_amount
FROM donors d
INNER JOIN donations dn ON dn.donor_id = d.id
WHERE d.deleted_at IS NULL
  AND dn.deleted_at IS NULL
  AND dn.status = 'completed'
GROUP BY d.client_id, EXTRACT(YEAR FROM dn.donation_date), EXTRACT(MONTH FROM dn.donation_date);

COMMENT ON VIEW v_monthly_gifts IS 'Monthly gift aggregation for fine-grained seasonality analysis';

-- View: Donor recency (days since last gift)
CREATE OR REPLACE VIEW v_donor_recency AS
SELECT
    d.client_id,
    d.anon_id,
    MAX(dn.donation_date) AS last_gift_date,
    EXTRACT(EPOCH FROM (NOW() - MAX(dn.donation_date))) / 86400 AS days_since_last_gift
FROM donors d
INNER JOIN donations dn ON dn.donor_id = d.id
WHERE d.deleted_at IS NULL
  AND dn.deleted_at IS NULL
  AND dn.status = 'completed'
GROUP BY d.client_id, d.anon_id;

COMMENT ON VIEW v_donor_recency IS 'Days since last gift per donor (recency analysis)';

-- ============================================================================
-- EXTENDED METRIC FUNCTIONS
-- ============================================================================

-- Function: Monthly seasonality (more granular than quarterly)
CREATE OR REPLACE FUNCTION fn_seasonality_by_month(
    p_client_id UUID,
    p_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    year INTEGER,
    month INTEGER,
    gift_count INTEGER,
    total_amount NUMERIC,
    avg_amount NUMERIC
) AS $$
DECLARE
    v_cohort_size INTEGER;
BEGIN
    -- Count total gifts in scope
    SELECT COUNT(*)
    INTO v_cohort_size
    FROM v_monthly_gifts
    WHERE client_id = p_client_id
      AND (p_year IS NULL OR year = p_year);

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Return monthly aggregates
    RETURN QUERY
    SELECT
        mg.year::INTEGER,
        mg.month::INTEGER,
        mg.gift_count::INTEGER,
        mg.total_amount,
        mg.avg_amount
    FROM v_monthly_gifts mg
    WHERE mg.client_id = p_client_id
      AND (p_year IS NULL OR mg.year = p_year)
    ORDER BY mg.year DESC, mg.month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_seasonality_by_month IS 'Returns gift counts and totals by month (privacy-safe)';

-- Function: 3-year upgrade velocity (compound annual growth rate)
CREATE OR REPLACE FUNCTION fn_three_year_upgrade_velocity(
    p_client_id UUID,
    p_year_start INTEGER
)
RETURNS TABLE (
    anon_id TEXT,
    year_start INTEGER,
    year_end INTEGER,
    amount_start NUMERIC,
    amount_end NUMERIC,
    cagr NUMERIC
) AS $$
DECLARE
    v_cohort_size INTEGER;
    v_year_end INTEGER;
BEGIN
    v_year_end := p_year_start + 2; -- 3 years total (start + 2)

    -- Count donors who gave in both start and end years
    SELECT COUNT(DISTINCT a.anon_id)
    INTO v_cohort_size
    FROM v_donor_yearly a
    INNER JOIN v_donor_yearly b ON b.anon_id = a.anon_id AND b.client_id = a.client_id
    WHERE a.client_id = p_client_id
      AND a.year = p_year_start
      AND b.year = v_year_end;

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Calculate CAGR: ((End / Start)^(1/years) - 1) * 100
    RETURN QUERY
    SELECT
        a.anon_id,
        p_year_start AS year_start,
        v_year_end AS year_end,
        a.total_amount AS amount_start,
        b.total_amount AS amount_end,
        ROUND(
            ((POWER(b.total_amount / NULLIF(a.total_amount, 0), 1.0 / 2.0) - 1) * 100)::NUMERIC,
            2
        ) AS cagr
    FROM v_donor_yearly a
    INNER JOIN v_donor_yearly b ON b.anon_id = a.anon_id AND b.client_id = a.client_id
    WHERE a.client_id = p_client_id
      AND a.year = p_year_start
      AND b.year = v_year_end
      AND a.total_amount > 0
    ORDER BY cagr DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_three_year_upgrade_velocity IS 'Returns 3-year compound annual growth rate (CAGR) for donors';

-- Function: Median gift by year
CREATE OR REPLACE FUNCTION fn_median_gift_by_year(
    p_client_id UUID,
    p_year_start INTEGER DEFAULT NULL,
    p_year_end INTEGER DEFAULT NULL
)
RETURNS TABLE (
    year INTEGER,
    median_gift NUMERIC,
    gift_count INTEGER,
    total_amount NUMERIC
) AS $$
DECLARE
    v_cohort_size INTEGER;
BEGIN
    -- Count total gifts in scope
    SELECT COUNT(*)
    INTO v_cohort_size
    FROM donations dn
    INNER JOIN donors d ON d.id = dn.donor_id
    WHERE d.client_id = p_client_id
      AND d.deleted_at IS NULL
      AND dn.deleted_at IS NULL
      AND dn.status = 'completed'
      AND (p_year_start IS NULL OR EXTRACT(YEAR FROM dn.donation_date) >= p_year_start)
      AND (p_year_end IS NULL OR EXTRACT(YEAR FROM dn.donation_date) <= p_year_end);

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Return median gift per year
    RETURN QUERY
    SELECT
        EXTRACT(YEAR FROM dn.donation_date)::INTEGER AS year,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY dn.amount) AS median_gift,
        COUNT(*)::INTEGER AS gift_count,
        SUM(dn.amount) AS total_amount
    FROM donations dn
    INNER JOIN donors d ON d.id = dn.donor_id
    WHERE d.client_id = p_client_id
      AND d.deleted_at IS NULL
      AND dn.deleted_at IS NULL
      AND dn.status = 'completed'
      AND (p_year_start IS NULL OR EXTRACT(YEAR FROM dn.donation_date) >= p_year_start)
      AND (p_year_end IS NULL OR EXTRACT(YEAR FROM dn.donation_date) <= p_year_end)
    GROUP BY EXTRACT(YEAR FROM dn.donation_date)
    ORDER BY year DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_median_gift_by_year IS 'Returns median gift amount by year (privacy-safe)';

-- Function: Segment retention (1-year loyalty tracking)
CREATE OR REPLACE FUNCTION fn_segment_retention(
    p_client_id UUID,
    p_segment_id UUID,
    p_year INTEGER
)
RETURNS TABLE (
    segment_name TEXT,
    year INTEGER,
    donor_count_year1 INTEGER,
    donor_count_year2 INTEGER,
    retention_rate NUMERIC
) AS $$
DECLARE
    v_cohort_size INTEGER;
    v_segment_name TEXT;
    v_year2 INTEGER;
BEGIN
    v_year2 := p_year + 1;

    -- Get segment name
    SELECT name INTO v_segment_name
    FROM audience_segments
    WHERE id = p_segment_id AND client_id = p_client_id;

    IF v_segment_name IS NULL THEN
        RAISE EXCEPTION 'Segment not found or access denied';
    END IF;

    -- Count donors in segment who gave in year 1
    SELECT COUNT(DISTINCT d.anon_id)
    INTO v_cohort_size
    FROM donors d
    INNER JOIN segment_memberships sm ON sm.donor_id = d.id
    INNER JOIN donations dn ON dn.donor_id = d.id
    WHERE d.client_id = p_client_id
      AND sm.segment_id = p_segment_id
      AND d.deleted_at IS NULL
      AND dn.deleted_at IS NULL
      AND dn.status = 'completed'
      AND EXTRACT(YEAR FROM dn.donation_date) = p_year;

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Calculate retention
    RETURN QUERY
    WITH year1_donors AS (
        SELECT DISTINCT d.anon_id
        FROM donors d
        INNER JOIN segment_memberships sm ON sm.donor_id = d.id
        INNER JOIN donations dn ON dn.donor_id = d.id
        WHERE d.client_id = p_client_id
          AND sm.segment_id = p_segment_id
          AND d.deleted_at IS NULL
          AND dn.deleted_at IS NULL
          AND dn.status = 'completed'
          AND EXTRACT(YEAR FROM dn.donation_date) = p_year
    ),
    year2_donors AS (
        SELECT DISTINCT d.anon_id
        FROM donors d
        INNER JOIN segment_memberships sm ON sm.donor_id = d.id
        INNER JOIN donations dn ON dn.donor_id = d.id
        WHERE d.client_id = p_client_id
          AND sm.segment_id = p_segment_id
          AND d.deleted_at IS NULL
          AND dn.deleted_at IS NULL
          AND dn.status = 'completed'
          AND EXTRACT(YEAR FROM dn.donation_date) = v_year2
    )
    SELECT
        v_segment_name,
        p_year,
        (SELECT COUNT(*) FROM year1_donors)::INTEGER AS donor_count_year1,
        (SELECT COUNT(*) FROM year2_donors WHERE anon_id IN (SELECT anon_id FROM year1_donors))::INTEGER AS donor_count_year2,
        ROUND(
            (SELECT COUNT(*) FROM year2_donors WHERE anon_id IN (SELECT anon_id FROM year1_donors))::NUMERIC
            / NULLIF((SELECT COUNT(*) FROM year1_donors), 0) * 100,
            2
        ) AS retention_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_segment_retention IS 'Returns 1-year retention rate for a donor segment (privacy-safe)';

-- Function: Recency distribution (days since last gift)
CREATE OR REPLACE FUNCTION fn_recency_distribution(
    p_client_id UUID
)
RETURNS TABLE (
    recency_bucket TEXT,
    donor_count INTEGER
) AS $$
DECLARE
    v_cohort_size INTEGER;
BEGIN
    -- Count total donors with at least one gift
    SELECT COUNT(DISTINCT anon_id)
    INTO v_cohort_size
    FROM v_donor_recency
    WHERE client_id = p_client_id;

    -- Enforce privacy threshold
    PERFORM enforce_privacy_ok(v_cohort_size);

    -- Return recency buckets
    RETURN QUERY
    SELECT
        CASE
            WHEN days_since_last_gift <= 30 THEN '0-30 days'
            WHEN days_since_last_gift <= 90 THEN '31-90 days'
            WHEN days_since_last_gift <= 180 THEN '91-180 days'
            WHEN days_since_last_gift <= 365 THEN '181-365 days'
            WHEN days_since_last_gift <= 730 THEN '1-2 years'
            ELSE '2+ years'
        END AS recency_bucket,
        COUNT(*)::INTEGER AS donor_count
    FROM v_donor_recency
    WHERE client_id = p_client_id
    GROUP BY recency_bucket
    ORDER BY
        CASE recency_bucket
            WHEN '0-30 days' THEN 1
            WHEN '31-90 days' THEN 2
            WHEN '91-180 days' THEN 3
            WHEN '181-365 days' THEN 4
            WHEN '1-2 years' THEN 5
            ELSE 6
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fn_recency_distribution IS 'Returns donor counts by recency bucket (privacy-safe)';

-- ============================================================================
-- UPDATE COMPUTE_METRIC FUNCTION
-- ============================================================================

-- Extend compute_metric to support new metrics
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

        -- EXTENDED METRICS

        WHEN 'seasonality_monthly' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_seasonality_by_month(
                v_client_id,
                (p_filters->>'year')::INTEGER
            ) r;

        WHEN 'three_year_velocity' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_three_year_upgrade_velocity(
                v_client_id,
                (p_filters->>'year_start')::INTEGER
            ) r;

        WHEN 'median_gift_by_year' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_median_gift_by_year(
                v_client_id,
                (p_filters->>'year_start')::INTEGER,
                (p_filters->>'year_end')::INTEGER
            ) r;

        WHEN 'segment_retention' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_segment_retention(
                v_client_id,
                (p_filters->>'segment_id')::UUID,
                (p_filters->>'year')::INTEGER
            ) r;

        WHEN 'recency_distribution' THEN
            SELECT jsonb_agg(row_to_json(r))
            INTO v_result
            FROM fn_recency_distribution(v_client_id) r;

        ELSE
            RAISE EXCEPTION 'Unknown metric: %', p_metric_name
            USING HINT = 'Valid metrics: retained_donors, yoy_upgrade, gift_velocity, seasonality, seasonality_monthly, three_year_velocity, median_gift_by_year, segment_retention, recency_distribution';
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

COMMENT ON FUNCTION compute_metric IS 'Unified endpoint for computing donor intelligence metrics (extended)';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION fn_seasonality_by_month(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_three_year_upgrade_velocity(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_median_gift_by_year(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_segment_retention(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_recency_distribution(UUID) TO authenticated;

-- Grant select on new views
GRANT SELECT ON v_monthly_gifts TO authenticated;
GRANT SELECT ON v_donor_recency TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
