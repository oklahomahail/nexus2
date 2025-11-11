-- Nexus Brand Bible Migration
-- Campaign Designer foundation: brand profiles, assets, and corpus
-- Created: 2025-01-10

-- Enable vector extension for future embeddings (optional but recommended)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- BRAND PROFILES
-- ============================================================================

-- Brand profiles: the "character bible" for each organization
CREATE TABLE brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Identity
    name TEXT NOT NULL,
    mission_statement TEXT,

    -- Voice & Tone
    tone_of_voice TEXT,                              -- e.g., "warm, urgent, plain-language"
    brand_personality TEXT,                          -- bullets or sentences
    style_keywords TEXT[],                           -- e.g., '{"impact","community","evidence-based"}'

    -- Visual Identity
    primary_colors TEXT[],                           -- hex strings: ['#0E4B7F', '#F05A28']
    typography JSONB,                                -- { "headings": "Inter", "body": "Source Serif", "weights":[400,600] }
    logo_url TEXT,                                   -- Supabase Storage (bucket "brand-assets")

    -- Guidelines
    guidelines_url TEXT,                             -- optional public doc (e.g. brand book pdf)

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

-- Brand assets: images, templates, examples linked to brand
CREATE TABLE brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,

    -- Asset details
    asset_type TEXT NOT NULL,
    url TEXT NOT NULL,                               -- Supabase Storage object URL or external URL
    description TEXT,
    metadata JSONB,                                  -- arbitrary (e.g., color hexes extracted, dimensions)

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

-- Brand corpus: grounding text extracted from sites/reports/social
-- Store raw text + optional embedding for retrieval-augmented prompting
CREATE TABLE brand_corpus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,

    -- Source info
    source_type TEXT NOT NULL,
    source_url TEXT,                                 -- original URL if applicable
    title TEXT,
    checksum TEXT NOT NULL,                          -- sha256 of normalized text for dedupe

    -- Content
    content TEXT NOT NULL,                           -- normalized plain text
    embedding vector(1536),                          -- optional OpenAI embedding (1536-d)
    tokens INTEGER,                                  -- optional token count cache

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT brand_corpus_type_check CHECK (
        source_type IN ('website', 'pdf', 'doc', 'social', 'manual')
    )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Brand profiles
CREATE INDEX idx_brand_profiles_client_updated
    ON brand_profiles(client_id, updated_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_brand_profiles_name
    ON brand_profiles(client_id, name)
    WHERE deleted_at IS NULL;

-- Brand assets
CREATE INDEX idx_brand_assets_client_brand_updated
    ON brand_assets(client_id, brand_id, updated_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_brand_assets_type
    ON brand_assets(brand_id, asset_type)
    WHERE deleted_at IS NULL;

-- Brand corpus
CREATE INDEX idx_brand_corpus_client_brand_updated
    ON brand_corpus(client_id, brand_id, updated_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_brand_corpus_source_type
    ON brand_corpus(brand_id, source_type)
    WHERE deleted_at IS NULL;

-- Full-text search on corpus
CREATE INDEX idx_brand_corpus_fts
    ON brand_corpus USING gin (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    );

-- Dedupe corpus rows from same source (client_id + brand_id + checksum must be unique)
CREATE UNIQUE INDEX u_brand_corpus_client_brand_checksum
    ON brand_corpus(client_id, brand_id, checksum)
    WHERE deleted_at IS NULL;

-- Vector similarity index (optional - uncomment if using embeddings)
-- CREATE INDEX idx_brand_corpus_embedding
--     ON brand_corpus USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_brand_profiles_updated_at
    BEFORE UPDATE ON brand_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_assets_updated_at
    BEFORE UPDATE ON brand_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_corpus_updated_at
    BEFORE UPDATE ON brand_corpus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_corpus ENABLE ROW LEVEL SECURITY;

-- Brand Profiles Policies
CREATE POLICY "Users can view brand profiles for their clients"
    ON brand_profiles FOR SELECT
    USING (can_access_client(client_id) AND deleted_at IS NULL);

CREATE POLICY "Editors can create brand profiles for their clients"
    ON brand_profiles FOR INSERT
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Editors can update brand profiles for their clients"
    ON brand_profiles FOR UPDATE
    USING (can_write_client(client_id) AND deleted_at IS NULL)
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete brand profiles for their clients"
    ON brand_profiles FOR DELETE
    USING (is_client_admin(client_id));

-- Brand Assets Policies
CREATE POLICY "Users can view brand assets for their clients"
    ON brand_assets FOR SELECT
    USING (can_access_client(client_id) AND deleted_at IS NULL);

CREATE POLICY "Editors can create brand assets for their clients"
    ON brand_assets FOR INSERT
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Editors can update brand assets for their clients"
    ON brand_assets FOR UPDATE
    USING (can_write_client(client_id) AND deleted_at IS NULL)
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete brand assets for their clients"
    ON brand_assets FOR DELETE
    USING (is_client_admin(client_id));

-- Brand Corpus Policies
CREATE POLICY "Users can view brand corpus for their clients"
    ON brand_corpus FOR SELECT
    USING (can_access_client(client_id) AND deleted_at IS NULL);

CREATE POLICY "System can insert brand corpus"
    ON brand_corpus FOR INSERT
    WITH CHECK (true); -- Will be restricted to service role in Edge Function

CREATE POLICY "Editors can update brand corpus for their clients"
    ON brand_corpus FOR UPDATE
    USING (can_write_client(client_id) AND deleted_at IS NULL)
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete brand corpus for their clients"
    ON brand_corpus FOR DELETE
    USING (is_client_admin(client_id));

-- ============================================================================
-- ACTIVITY LOG TRIGGERS
-- ============================================================================

CREATE TRIGGER log_brand_profiles_activity
    AFTER INSERT OR UPDATE OR DELETE ON brand_profiles
    FOR EACH ROW EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_brand_assets_activity
    AFTER INSERT OR UPDATE OR DELETE ON brand_assets
    FOR EACH ROW EXECUTE FUNCTION log_client_activity();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON brand_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON brand_assets TO authenticated;
GRANT SELECT ON brand_corpus TO authenticated;

-- Service role gets full access (for Edge Functions)
GRANT ALL ON brand_profiles TO service_role;
GRANT ALL ON brand_assets TO service_role;
GRANT ALL ON brand_corpus TO service_role;

-- ============================================================================
-- STORAGE BUCKET SETUP (for brand assets)
-- ============================================================================

-- Note: This should be run once in Supabase Dashboard or via CLI
-- Create bucket for brand assets (private)
-- Dashboard: Storage → New Bucket → name: "brand-assets", public: false

-- Example RLS for storage.objects (apply in Dashboard → Storage → Policies):
-- CREATE POLICY "Users can view brand assets for their clients"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'brand-assets' AND (storage.foldername(name))[1]::uuid IN (
--         SELECT client_id FROM client_memberships WHERE user_id = auth.uid()
--     ));

-- ============================================================================
-- SEED DATA (Track15 example)
-- ============================================================================

-- Uncomment to seed Track15 brand profile for testing
-- Replace with actual client_id from your clients table

-- INSERT INTO brand_profiles (
--     client_id, name, mission_statement, tone_of_voice, brand_personality,
--     style_keywords, primary_colors, typography
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000001', -- Hope Foundation from seed data
--     'Hope Foundation Brand Guidelines',
--     'A nonprofit dedicated to ending childhood hunger through community-based programs and sustainable food systems.',
--     'warm, evidence-based, hopeful, donor-respectful, clear',
--     'Pragmatic, Impact-focused, Community-first, Compassionate',
--     ARRAY['impact', 'community', 'evidence-based', 'transparency', 'sustainability'],
--     ARRAY['#4F46E5', '#10B981', '#F59E0B'],
--     '{"headings": "Inter", "body": "Source Serif Pro", "weights": [400, 600, 700]}'::jsonb
-- );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Brand Bible Migration Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - brand_profiles table';
    RAISE NOTICE '  - brand_assets table';
    RAISE NOTICE '  - brand_corpus table';
    RAISE NOTICE '  - Full-text search indexes';
    RAISE NOTICE '  - RLS policies for client-scoped access';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Create "brand-assets" storage bucket';
    RAISE NOTICE '  2. Deploy scheduled-import-brand-corpus Edge Function';
    RAISE NOTICE '  3. Seed Track15 brand profile';
    RAISE NOTICE '========================================';
END $$;
