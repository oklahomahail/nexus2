-- Add unique constraint to ensure one brand profile per client
-- Created: 2025-01-18

-- ============================================================================
-- UNIQUE CONSTRAINT: One Brand Profile Per Client
-- ============================================================================

-- First, check if there are any duplicate brand profiles per client
-- This query will fail the migration if duplicates exist
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT client_id, COUNT(*) as profile_count
        FROM brand_profiles
        WHERE deleted_at IS NULL
        GROUP BY client_id
        HAVING COUNT(*) > 1
    ) duplicates;

    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Found % clients with multiple brand profiles. Please consolidate before applying this migration.', duplicate_count;
    END IF;
END $$;

-- Add unique constraint to prevent multiple brand profiles per client
-- This ensures data integrity and prevents the UI bug where wrong profiles load
ALTER TABLE brand_profiles
ADD CONSTRAINT unique_brand_profile_per_client
UNIQUE (client_id)
WHERE deleted_at IS NULL;

-- Add helpful comment
COMMENT ON CONSTRAINT unique_brand_profile_per_client ON brand_profiles IS
    'Ensures each client has at most one active brand profile. Soft-deleted profiles are excluded from this constraint.';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Brand Profile Constraint Added!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added: unique_brand_profile_per_client constraint';
    RAISE NOTICE 'Effect: Each client can have only one active brand profile';
    RAISE NOTICE 'Note: Soft-deleted profiles (deleted_at IS NOT NULL) are excluded';
    RAISE NOTICE '========================================';
END $$;
