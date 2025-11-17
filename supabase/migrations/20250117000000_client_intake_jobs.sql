-- Client Intake Jobs Migration
-- Tracks document upload and AI parsing for client onboarding
-- Created: 2025-01-17

-- ============================================================================
-- CLIENT INTAKE JOBS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_intake_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Upload metadata
    uploaded_file_url TEXT NOT NULL,
    uploaded_file_name TEXT NOT NULL,
    uploaded_file_type TEXT NOT NULL,
    uploaded_file_size_bytes INTEGER,

    -- Processing status
    status TEXT NOT NULL CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'review_required')
    ) DEFAULT 'pending',

    -- Extracted data (JSON blob before committing to DB)
    extracted_data JSONB,
    parsed_sections JSONB,

    -- Results
    brand_profile_id UUID REFERENCES brand_profiles(id),
    error_message TEXT,

    -- Audit
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_intake_jobs_client_id ON client_intake_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_intake_jobs_client_status ON client_intake_jobs(client_id, status);
CREATE INDEX IF NOT EXISTS idx_intake_jobs_created_by ON client_intake_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_intake_jobs_status ON client_intake_jobs(status) WHERE status != 'completed';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_client_intake_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'client_intake_jobs_updated_at'
    ) THEN
        CREATE TRIGGER client_intake_jobs_updated_at
            BEFORE UPDATE ON client_intake_jobs
            FOR EACH ROW
            EXECUTE FUNCTION update_client_intake_jobs_updated_at();
    END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE client_intake_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view intake jobs for their clients
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'client_intake_jobs' AND policyname = 'Users can view intake jobs for their clients'
    ) THEN
        CREATE POLICY "Users can view intake jobs for their clients"
            ON client_intake_jobs FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM client_memberships cm
                    WHERE cm.client_id = client_intake_jobs.client_id
                    AND cm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Users can create intake jobs for their clients
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'client_intake_jobs' AND policyname = 'Users can create intake jobs for their clients'
    ) THEN
        CREATE POLICY "Users can create intake jobs for their clients"
            ON client_intake_jobs FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM client_memberships cm
                    WHERE cm.client_id = client_intake_jobs.client_id
                    AND cm.user_id = auth.uid()
                    AND cm.role IN ('owner', 'admin', 'editor')
                )
            );
    END IF;
END $$;

-- Users can update intake jobs for their clients
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'client_intake_jobs' AND policyname = 'Users can update intake jobs for their clients'
    ) THEN
        CREATE POLICY "Users can update intake jobs for their clients"
            ON client_intake_jobs FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM client_memberships cm
                    WHERE cm.client_id = client_intake_jobs.client_id
                    AND cm.user_id = auth.uid()
                    AND cm.role IN ('owner', 'admin', 'editor')
                )
            );
    END IF;
END $$;

-- Users can delete intake jobs for their clients
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'client_intake_jobs' AND policyname = 'Users can delete intake jobs for their clients'
    ) THEN
        CREATE POLICY "Users can delete intake jobs for their clients"
            ON client_intake_jobs FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM client_memberships cm
                    WHERE cm.client_id = client_intake_jobs.client_id
                    AND cm.user_id = auth.uid()
                    AND cm.role IN ('owner', 'admin', 'editor')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- STORAGE BUCKET FOR CLIENT INTAKES
-- ============================================================================

-- Create storage bucket for uploaded client briefs
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-intakes', 'client-intakes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload files to their client intake folders'
    ) THEN
        CREATE POLICY "Users can upload files to their client intake folders"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'client-intakes' AND
                (storage.foldername(name))[1] IN (
                    SELECT c.id::text
                    FROM clients c
                    JOIN client_memberships cm ON cm.client_id = c.id
                    WHERE cm.user_id = auth.uid()
                    AND cm.role IN ('owner', 'admin', 'editor')
                )
            );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view files in their client intake folders'
    ) THEN
        CREATE POLICY "Users can view files in their client intake folders"
            ON storage.objects FOR SELECT
            USING (
                bucket_id = 'client-intakes' AND
                (storage.foldername(name))[1] IN (
                    SELECT c.id::text
                    FROM clients c
                    JOIN client_memberships cm ON cm.client_id = c.id
                    WHERE cm.user_id = auth.uid()
                )
            );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update files in their client intake folders'
    ) THEN
        CREATE POLICY "Users can update files in their client intake folders"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'client-intakes' AND
                (storage.foldername(name))[1] IN (
                    SELECT c.id::text
                    FROM clients c
                    JOIN client_memberships cm ON cm.client_id = c.id
                    WHERE cm.user_id = auth.uid()
                    AND cm.role IN ('owner', 'admin', 'editor')
                )
            );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete files in their client intake folders'
    ) THEN
        CREATE POLICY "Users can delete files in their client intake folders"
            ON storage.objects FOR DELETE
            USING (
                bucket_id = 'client-intakes' AND
                (storage.foldername(name))[1] IN (
                    SELECT c.id::text
                    FROM clients c
                    JOIN client_memberships cm ON cm.client_id = c.id
                    WHERE cm.user_id = auth.uid()
                    AND cm.role IN ('owner', 'admin', 'editor')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Client Intake Jobs Migration Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - client_intake_jobs table';
    RAISE NOTICE '  - RLS policies';
    RAISE NOTICE '  - Storage bucket: client-intakes';
    RAISE NOTICE '  - Indexes and triggers';
    RAISE NOTICE '========================================';
END $$;
