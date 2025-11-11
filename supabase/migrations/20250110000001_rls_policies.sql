-- Nexus Row Level Security (RLS) Policies
-- Client-scoped access control with role-based permissions
-- Created: 2025-01-10

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Check if user can access a client (viewer, editor, admin, or owner)
CREATE OR REPLACE FUNCTION can_access_client(target_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM client_memberships
        WHERE client_id = target_client_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can write to a client (editor, admin, or owner only)
CREATE OR REPLACE FUNCTION can_write_client(target_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM client_memberships
        WHERE client_id = target_client_id
          AND user_id = auth.uid()
          AND role IN ('owner', 'admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is owner or admin of a client
CREATE OR REPLACE FUNCTION is_client_admin(target_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM client_memberships
        WHERE client_id = target_client_id
          AND user_id = auth.uid()
          AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is owner of a client
CREATE OR REPLACE FUNCTION is_client_owner(target_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM client_memberships
        WHERE client_id = target_client_id
          AND user_id = auth.uid()
          AND role = 'owner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE anon_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_retention_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES (Users can manage their own profile)
-- ============================================================================

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CLIENT POLICIES
-- ============================================================================

CREATE POLICY "Users can view clients they have access to"
    ON clients FOR SELECT
    USING (can_access_client(id));

CREATE POLICY "Admins can create clients"
    ON clients FOR INSERT
    WITH CHECK (true); -- Initial creation allowed, membership added by trigger

CREATE POLICY "Admins can update their clients"
    ON clients FOR UPDATE
    USING (is_client_admin(id))
    WITH CHECK (is_client_admin(id));

CREATE POLICY "Owners can delete their clients"
    ON clients FOR DELETE
    USING (is_client_owner(id));

-- ============================================================================
-- CLIENT MEMBERSHIPS POLICIES
-- ============================================================================

CREATE POLICY "Users can view memberships for their clients"
    ON client_memberships FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "Admins can add members to their clients"
    ON client_memberships FOR INSERT
    WITH CHECK (is_client_admin(client_id));

CREATE POLICY "Admins can update memberships in their clients"
    ON client_memberships FOR UPDATE
    USING (is_client_admin(client_id))
    WITH CHECK (is_client_admin(client_id));

CREATE POLICY "Admins can remove members from their clients"
    ON client_memberships FOR DELETE
    USING (is_client_admin(client_id));

-- ============================================================================
-- CAMPAIGN POLICIES
-- ============================================================================

CREATE POLICY "Users can view campaigns for their clients"
    ON campaigns FOR SELECT
    USING (can_access_client(client_id) AND deleted_at IS NULL);

CREATE POLICY "Editors can create campaigns for their clients"
    ON campaigns FOR INSERT
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Editors can update campaigns for their clients"
    ON campaigns FOR UPDATE
    USING (can_write_client(client_id) AND deleted_at IS NULL)
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete campaigns for their clients"
    ON campaigns FOR DELETE
    USING (is_client_admin(client_id));

-- ============================================================================
-- DONOR POLICIES (PII - Restricted Access)
-- ============================================================================

CREATE POLICY "Users can view donors for their clients"
    ON donors FOR SELECT
    USING (can_access_client(client_id) AND deleted_at IS NULL);

CREATE POLICY "Editors can create donors for their clients"
    ON donors FOR INSERT
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Editors can update donors for their clients"
    ON donors FOR UPDATE
    USING (can_write_client(client_id) AND deleted_at IS NULL)
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete donors for their clients"
    ON donors FOR DELETE
    USING (is_client_admin(client_id));

-- ============================================================================
-- DONATION POLICIES
-- ============================================================================

CREATE POLICY "Users can view donations for their clients"
    ON donations FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "Editors can create donations for their clients"
    ON donations FOR INSERT
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Editors can update donations for their clients"
    ON donations FOR UPDATE
    USING (can_write_client(client_id))
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete donations for their clients"
    ON donations FOR DELETE
    USING (is_client_admin(client_id));

-- ============================================================================
-- ANONYMOUS ANALYTICS POLICIES
-- ============================================================================

-- Anonymous identities (read-only for most users)
CREATE POLICY "Users can view anon identities for their clients"
    ON anon_identities FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can manage anon identities"
    ON anon_identities FOR ALL
    USING (true) -- Will be restricted to service role in production
    WITH CHECK (true);

-- Behavioral events (analytics data - no PII)
CREATE POLICY "Users can view behavioral events for their clients"
    ON behavioral_events FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can insert behavioral events"
    ON behavioral_events FOR INSERT
    WITH CHECK (true); -- Will be restricted to service role in production

-- Giving patterns (aggregated behavioral data)
CREATE POLICY "Users can view giving patterns for their clients"
    ON giving_patterns FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can manage giving patterns"
    ON giving_patterns FOR ALL
    USING (true) -- Will be restricted to service role in production
    WITH CHECK (true);

-- Donor cohorts
CREATE POLICY "Users can view cohorts for their clients"
    ON donor_cohorts FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "Admins can manage cohorts for their clients"
    ON donor_cohorts FOR ALL
    USING (is_client_admin(client_id))
    WITH CHECK (is_client_admin(client_id));

-- Cohort retention metrics
CREATE POLICY "Users can view cohort retention for their clients"
    ON cohort_retention_metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM donor_cohorts dc
            WHERE dc.id = cohort_retention_metrics.cohort_id
              AND can_access_client(dc.client_id)
        )
    );

CREATE POLICY "System can manage cohort retention metrics"
    ON cohort_retention_metrics FOR ALL
    USING (true) -- Will be restricted to service role in production
    WITH CHECK (true);

-- ============================================================================
-- SEGMENTATION POLICIES
-- ============================================================================

CREATE POLICY "Users can view segments for their clients"
    ON audience_segments FOR SELECT
    USING (can_access_client(client_id) AND deleted_at IS NULL);

CREATE POLICY "Editors can create segments for their clients"
    ON audience_segments FOR INSERT
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Editors can update segments for their clients"
    ON audience_segments FOR UPDATE
    USING (can_write_client(client_id) AND deleted_at IS NULL)
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete segments for their clients"
    ON audience_segments FOR DELETE
    USING (is_client_admin(client_id));

-- Segment memberships
CREATE POLICY "Users can view segment memberships for their clients"
    ON segment_memberships FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "Editors can manage segment memberships for their clients"
    ON segment_memberships FOR ALL
    USING (can_write_client(client_id))
    WITH CHECK (can_write_client(client_id));

-- ============================================================================
-- NOTIFICATION POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (
        user_id = auth.uid() OR
        (client_id IS NOT NULL AND can_access_client(client_id))
    );

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true); -- Will be restricted to service role in production

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete notifications for their clients"
    ON notifications FOR DELETE
    USING (
        user_id = auth.uid() OR
        (client_id IS NOT NULL AND is_client_admin(client_id))
    );

-- ============================================================================
-- SCHEDULED EXPORTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view scheduled exports for their clients"
    ON scheduled_exports FOR SELECT
    USING (can_access_client(client_id) AND deleted_at IS NULL);

CREATE POLICY "Editors can create scheduled exports for their clients"
    ON scheduled_exports FOR INSERT
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Editors can update their scheduled exports"
    ON scheduled_exports FOR UPDATE
    USING (can_write_client(client_id) AND deleted_at IS NULL)
    WITH CHECK (can_write_client(client_id));

CREATE POLICY "Admins can delete scheduled exports for their clients"
    ON scheduled_exports FOR DELETE
    USING (is_client_admin(client_id));

-- Export jobs
CREATE POLICY "Users can view export jobs for their clients"
    ON export_jobs FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can manage export jobs"
    ON export_jobs FOR ALL
    USING (true) -- Will be restricted to service role in production
    WITH CHECK (true);

-- ============================================================================
-- ACTIVITY LOG POLICIES
-- ============================================================================

CREATE POLICY "Users can view activity log for their clients"
    ON activity_log FOR SELECT
    USING (client_id IS NOT NULL AND can_access_client(client_id));

CREATE POLICY "System can insert activity log entries"
    ON activity_log FOR INSERT
    WITH CHECK (true); -- Will be restricted to service role in production

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_create_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name, preferences)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auto_create_profile();

-- ============================================================================
-- AUTO-CREATE OWNER MEMBERSHIP ON CLIENT CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Add creator as owner if they're authenticated
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO client_memberships (client_id, user_id, role, invited_by)
        VALUES (NEW.id, auth.uid(), 'owner', auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_client_created
    AFTER INSERT ON clients
    FOR EACH ROW EXECUTE FUNCTION auto_create_owner_membership();

-- ============================================================================
-- ACTIVITY LOG TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_client_activity()
RETURNS TRIGGER AS $$
DECLARE
    activity_action TEXT;
    activity_changes JSONB;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        activity_action := 'created';
        activity_changes := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        activity_action := 'updated';
        activity_changes := jsonb_build_object(
            'before', to_jsonb(OLD),
            'after', to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        activity_action := 'deleted';
        activity_changes := to_jsonb(OLD);
    END IF;

    -- Insert activity log entry
    INSERT INTO activity_log (
        client_id,
        user_id,
        entity_type,
        entity_id,
        action,
        changes,
        occurred_at
    ) VALUES (
        COALESCE(NEW.client_id, OLD.client_id),
        auth.uid(),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        activity_action,
        activity_changes,
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging to key tables
CREATE TRIGGER log_campaigns_activity
    AFTER INSERT OR UPDATE OR DELETE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_donors_activity
    AFTER INSERT OR UPDATE OR DELETE ON donors
    FOR EACH ROW EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_donations_activity
    AFTER INSERT OR UPDATE OR DELETE ON donations
    FOR EACH ROW EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_segments_activity
    AFTER INSERT OR UPDATE OR DELETE ON audience_segments
    FOR EACH ROW EXECUTE FUNCTION log_client_activity();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON donors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON donations TO authenticated;
GRANT SELECT ON anon_identities TO authenticated;
GRANT SELECT ON behavioral_events TO authenticated;
GRANT SELECT ON giving_patterns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON donor_cohorts TO authenticated;
GRANT SELECT ON cohort_retention_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audience_segments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON segment_memberships TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_exports TO authenticated;
GRANT SELECT ON export_jobs TO authenticated;
GRANT SELECT ON activity_log TO authenticated;

-- Grant service role full access (for background jobs)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
