-- ============================================================================
-- AI-Safe Views
-- ============================================================================
--
-- PURPOSE:
-- Create read-only views that expose ONLY non-PII data safe for AI consumption
-- Ensures brand context can be loaded without risk of PII leakage
--
-- SECURITY:
-- - No donor contact information (name, email, phone, address)
-- - No donation notes or free-text fields
-- - Only brand identity, aggregates, and public-facing content
--
-- ============================================================================

-- ============================================================================
-- AI-SAFE BRAND CONTEXT
-- ============================================================================

-- View: Brand profiles without sensitive URLs or asset references
CREATE OR REPLACE VIEW public.ai_safe_brand_context AS
SELECT
    client_id,
    id AS brand_id,
    name,
    mission_statement,
    tone_of_voice,
    brand_personality,
    style_keywords,
    primary_colors,
    typography,
    created_at,
    updated_at
FROM public.brand_profiles
WHERE deleted_at IS NULL;

COMMENT ON VIEW public.ai_safe_brand_context IS 'AI-safe brand profile data (no URLs, no assets, no uploads)';

-- View: Brand corpus text snippets (already public-facing content)
CREATE OR REPLACE VIEW public.ai_safe_brand_corpus AS
SELECT
    client_id,
    brand_id,
    source_type,
    title,
    content,
    tokens,
    created_at
FROM public.brand_corpus
WHERE deleted_at IS NULL
  AND source_type IN ('website', 'pdf', 'doc', 'social', 'manual')
ORDER BY updated_at DESC;

COMMENT ON VIEW public.ai_safe_brand_corpus IS 'AI-safe brand voice examples (public-facing content only)';

-- ============================================================================
-- AI-SAFE ANALYTICS AGGREGATES
-- ============================================================================

-- View: Client-level giving summary (no donor details)
CREATE OR REPLACE VIEW public.ai_safe_client_giving_summary AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    COUNT(DISTINCT d.id) AS total_donors,
    COUNT(dn.id) AS total_donations,
    SUM(dn.amount) AS total_raised,
    AVG(dn.amount) AS avg_gift,
    MIN(dn.donation_date) AS first_gift_date,
    MAX(dn.donation_date) AS last_gift_date
FROM clients c
LEFT JOIN donors d ON d.client_id = c.id AND d.deleted_at IS NULL
LEFT JOIN donations dn ON dn.donor_id = d.id AND dn.deleted_at IS NULL AND dn.status = 'completed'
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name;

COMMENT ON VIEW public.ai_safe_client_giving_summary IS 'Client-level giving aggregates (no donor-level data)';

-- View: Campaign performance summary (no donor PII)
CREATE OR REPLACE VIEW public.ai_safe_campaign_summary AS
SELECT
    cp.client_id,
    cp.id AS campaign_id,
    cp.name AS campaign_name,
    cp.type,
    cp.start_date,
    cp.end_date,
    cp.goal_amount,
    COUNT(DISTINCT dn.donor_id) AS donor_count,
    COUNT(dn.id) AS donation_count,
    SUM(dn.amount) AS total_raised,
    AVG(dn.amount) AS avg_gift,
    ROUND((SUM(dn.amount) / NULLIF(cp.goal_amount, 0)) * 100, 2) AS pct_of_goal
FROM campaigns cp
LEFT JOIN donations dn ON dn.campaign_id = cp.id AND dn.deleted_at IS NULL AND dn.status = 'completed'
WHERE cp.deleted_at IS NULL
GROUP BY cp.client_id, cp.id, cp.name, cp.type, cp.start_date, cp.end_date, cp.goal_amount;

COMMENT ON VIEW public.ai_safe_campaign_summary IS 'Campaign performance aggregates (no donor PII)';

-- ============================================================================
-- PRIVACY ENFORCEMENT
-- ============================================================================

-- Function: Validate that a view is AI-safe (no PII columns)
CREATE OR REPLACE FUNCTION validate_ai_safe_view(view_name TEXT)
RETURNS TABLE (
    column_name TEXT,
    is_safe BOOLEAN,
    reason TEXT
) AS $$
DECLARE
    v_schema TEXT := 'public';
    v_forbidden_cols TEXT[] := ARRAY[
        'email', 'phone', 'address', 'street', 'city', 'state', 'zip', 'postal',
        'first_name', 'last_name', 'full_name', 'contact', 'ssn', 'tax_id',
        'notes', 'memo', 'comment', 'description' -- free-text fields that may contain PII
    ];
BEGIN
    RETURN QUERY
    SELECT
        c.column_name::TEXT,
        NOT EXISTS (
            SELECT 1
            FROM unnest(v_forbidden_cols) AS forbidden
            WHERE c.column_name ILIKE '%' || forbidden || '%'
        ) AS is_safe,
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM unnest(v_forbidden_cols) AS forbidden
                WHERE c.column_name ILIKE '%' || forbidden || '%'
            )
            THEN 'Column name suggests PII'
            ELSE 'OK'
        END AS reason
    FROM information_schema.columns c
    WHERE c.table_schema = v_schema
      AND c.table_name = view_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION validate_ai_safe_view IS 'Check if a view exposes any columns with PII-like names';

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant select on AI-safe views to authenticated users (RLS will apply via base tables)
GRANT SELECT ON public.ai_safe_brand_context TO authenticated;
GRANT SELECT ON public.ai_safe_brand_corpus TO authenticated;
GRANT SELECT ON public.ai_safe_client_giving_summary TO authenticated;
GRANT SELECT ON public.ai_safe_campaign_summary TO authenticated;

-- Grant execute on validation function
GRANT EXECUTE ON FUNCTION validate_ai_safe_view(TEXT) TO authenticated;

-- ============================================================================
-- VALIDATION QUERIES (for testing)
-- ============================================================================

-- Uncomment to test:
-- SELECT * FROM validate_ai_safe_view('ai_safe_brand_context');
-- SELECT * FROM validate_ai_safe_view('ai_safe_brand_corpus');
-- SELECT * FROM validate_ai_safe_view('ai_safe_client_giving_summary');
-- SELECT * FROM validate_ai_safe_view('ai_safe_campaign_summary');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
