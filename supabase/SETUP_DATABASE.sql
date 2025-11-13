-- ============================================================================
-- NEXUS DATABASE SETUP - CONSOLIDATED MIGRATION
-- ============================================================================
-- This file consolidates the initial schema and RLS policies
-- Run this in Supabase SQL Editor to set up your database
--
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
--
-- Created: 2025-01-13
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Organizations/Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name TEXT,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    description TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Brand/settings as JSONB for flexibility
    brand JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Indexes
    CONSTRAINT clients_name_check CHECK (length(name) >= 1)
);

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    avatar_url TEXT,

    -- Settings
    preferences JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Client memberships (many-to-many: users ↔ clients)
CREATE TABLE client_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',

    -- Metadata
    invited_by UUID REFERENCES profiles(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT client_memberships_unique UNIQUE (client_id, user_id),
    CONSTRAINT client_memberships_role_check CHECK (role IN ('owner', 'admin', 'editor', 'viewer'))
);

-- ============================================================================
-- CAMPAIGNS & FUNDRAISING
-- ============================================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'email',
    status TEXT NOT NULL DEFAULT 'draft',
    category TEXT DEFAULT 'General',

    -- Goals & budget
    goal_amount NUMERIC(12, 2) DEFAULT 0,
    raised_amount NUMERIC(12, 2) DEFAULT 0,
    marketing_cost NUMERIC(12, 2) DEFAULT 0,
    budget JSONB DEFAULT '{"total": 0, "spent": 0, "currency": "USD"}',

    -- Dates
    launch_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,

    -- Targeting
    target_audience JSONB DEFAULT '{"segmentIds": [], "totalRecipients": 0}',
    goals_config JSONB DEFAULT '{"primary": "donations", "kpis": []}',

    -- Performance (denormalized for speed)
    performance JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "converted": 0, "revenue": 0, "cost": 0, "roi": 0}',

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT campaigns_name_check CHECK (length(name) >= 1),
    CONSTRAINT campaigns_type_check CHECK (type IN ('email', 'direct_mail', 'social_media', 'multichannel', 'event', 'peer_to_peer')),
    CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'paused', 'cancelled')),
    CONSTRAINT campaigns_dates_check CHECK (end_date IS NULL OR launch_date IS NULL OR end_date >= launch_date)
);

-- ============================================================================
-- DONOR DATA (OPERATIONAL - PII ALLOWED)
-- ============================================================================

CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- PII (stored here only - never in analytics tables)
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address JSONB, -- {street, city, state, zipCode, country}

    -- Demographics (optional)
    age INTEGER,

    -- Aggregate metrics (updated by triggers)
    total_donated NUMERIC(12, 2) DEFAULT 0,
    donation_count INTEGER DEFAULT 0,
    average_donation NUMERIC(12, 2) DEFAULT 0,
    first_donation_date TIMESTAMP WITH TIME ZONE,
    last_donation_date TIMESTAMP WITH TIME ZONE,
    last_contact_date TIMESTAMP WITH TIME ZONE,

    -- Engagement
    engagement_score NUMERIC(5, 2) DEFAULT 0,
    churn_risk TEXT DEFAULT 'low',
    lifetime_value NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'active',

    -- Preferences
    preferences JSONB DEFAULT '{"communicationChannel": "email", "frequency": "monthly", "topics": [], "emailOptIn": true, "smsOptIn": false, "mailingListOptIn": true}',

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT donors_status_check CHECK (status IN ('active', 'inactive', 'blocked')),
    CONSTRAINT donors_churn_risk_check CHECK (churn_risk IN ('low', 'medium', 'high')),
    CONSTRAINT donors_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

    -- Transaction details
    amount_cents BIGINT NOT NULL, -- Store in cents to avoid floating point issues
    currency TEXT DEFAULT 'USD',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Payment method
    method TEXT DEFAULT 'credit_card',
    is_recurring BOOLEAN DEFAULT false,

    -- Attribution
    source TEXT DEFAULT 'website',
    channel TEXT DEFAULT 'email',

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT donations_amount_check CHECK (amount_cents > 0),
    CONSTRAINT donations_method_check CHECK (method IN ('credit_card', 'bank_transfer', 'check', 'cash', 'crypto', 'paypal', 'venmo')),
    CONSTRAINT donations_source_check CHECK (source IN ('website', 'direct_mail', 'email', 'phone', 'event', 'referral', 'social', 'other'))
);

-- ============================================================================
-- PRIVACY-FIRST ANALYTICS (NO PII BEYOND THIS POINT)
-- ============================================================================

-- Anonymous donor identities (one-way hash mapping)
CREATE TABLE anon_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- One-way hash of email (cannot be reversed)
    email_hash TEXT NOT NULL,

    -- Anonymous ID (public-facing)
    anon_id TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT anon_identities_unique_hash UNIQUE (client_id, email_hash),
    CONSTRAINT anon_identities_unique_anon UNIQUE (client_id, anon_id),
    CONSTRAINT anon_identities_anon_id_format CHECK (anon_id ~ '^anon_[a-f0-9]{32}$')
);

-- Behavioral events (anonymous)
CREATE TABLE behavioral_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    anon_id TEXT NOT NULL, -- No FK to preserve anonymity

    -- Event details
    event_type TEXT NOT NULL, -- 'donation', 'email_open', 'email_click', 'page_view', 'form_submit'
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    channel TEXT,

    -- Timing
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Context (no PII allowed)
    context JSONB DEFAULT '{}',

    -- Constraints
    CONSTRAINT behavioral_events_type_check CHECK (event_type IN ('donation', 'email_open', 'email_click', 'page_view', 'form_submit', 'unsubscribe', 'campaign_response'))
);

-- Giving patterns (anonymous behavioral analysis)
CREATE TABLE giving_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    anon_id TEXT NOT NULL,

    -- Behavioral scores (0-100)
    frequency_score NUMERIC(5, 2) DEFAULT 0,
    engagement_score NUMERIC(5, 2) DEFAULT 0,
    loyalty_score NUMERIC(5, 2) DEFAULT 0,

    -- Categorical (no amounts)
    giving_size_category TEXT DEFAULT 'small',

    -- Patterns
    primary_campaign_types TEXT[] DEFAULT '{}',
    seasonality_pattern TEXT,
    average_response_time_days INTEGER,

    -- Dates
    last_engagement_date TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT giving_patterns_unique UNIQUE (client_id, anon_id),
    CONSTRAINT giving_patterns_size_check CHECK (giving_size_category IN ('small', 'medium', 'large', 'major')),
    CONSTRAINT giving_patterns_seasonality_check CHECK (seasonality_pattern IS NULL OR seasonality_pattern IN ('year_end', 'spring', 'fall', 'consistent', 'variable'))
);

-- Donor cohorts (time-based aggregations)
CREATE TABLE donor_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Cohort definition
    name TEXT NOT NULL,
    cohort_period TEXT NOT NULL, -- '2024-Q1', '2024-01', etc.
    cohort_type TEXT DEFAULT 'acquisition', -- 'acquisition', 'engagement', 'reactivation'

    -- Size
    initial_size INTEGER NOT NULL DEFAULT 0,
    current_size INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    description TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT donor_cohorts_unique UNIQUE (client_id, cohort_period, cohort_type),
    CONSTRAINT donor_cohorts_size_check CHECK (initial_size >= 0 AND current_size >= 0)
);

-- Cohort retention metrics
CREATE TABLE cohort_retention_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES donor_cohorts(id) ON DELETE CASCADE,

    -- Period
    period TEXT NOT NULL, -- '2024-Q2', '2024-02', etc.
    period_offset INTEGER NOT NULL, -- 0 = initial period, 1 = +1 period, etc.

    -- Metrics
    active_count INTEGER NOT NULL DEFAULT 0,
    retention_rate NUMERIC(5, 4) NOT NULL DEFAULT 0, -- 0.0000 to 1.0000
    average_engagement_score NUMERIC(5, 2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT cohort_retention_unique UNIQUE (cohort_id, period),
    CONSTRAINT cohort_retention_rate_check CHECK (retention_rate >= 0 AND retention_rate <= 1)
);

-- ============================================================================
-- SEGMENTATION
-- ============================================================================

CREATE TABLE audience_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Definition
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'dynamic',
    status TEXT NOT NULL DEFAULT 'active',

    -- Rules (stored as JSONB for flexibility)
    rules JSONB,

    -- Config
    config JSONB DEFAULT '{"updateFrequency": "daily", "autoUpdate": true, "minSize": 50}',

    -- Metadata
    size INTEGER DEFAULT 0,
    estimated_size INTEGER,
    tags TEXT[] DEFAULT '{}',
    priority TEXT DEFAULT 'medium',
    created_by UUID REFERENCES profiles(id),

    -- Performance (denormalized)
    performance JSONB DEFAULT '{"conversionRate": 0, "engagementRate": 0, "averageGiftSize": 0, "totalRevenue": 0}',

    -- Timestamps
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT audience_segments_name_check CHECK (length(name) >= 1),
    CONSTRAINT audience_segments_type_check CHECK (type IN ('dynamic', 'static', 'predictive', 'behavioral')),
    CONSTRAINT audience_segments_status_check CHECK (status IN ('active', 'inactive', 'archived', 'testing')),
    CONSTRAINT audience_segments_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Segment membership (bridges donors to segments)
CREATE TABLE segment_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID NOT NULL REFERENCES audience_segments(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Metadata
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    score NUMERIC(5, 2), -- Optional relevance score

    -- Constraints
    CONSTRAINT segment_memberships_unique UNIQUE (segment_id, donor_id)
);

-- ============================================================================
-- NOTIFICATIONS & ALERTS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

    -- Content
    type TEXT NOT NULL DEFAULT 'info',
    severity TEXT DEFAULT 'medium',
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Context
    entity_type TEXT, -- 'campaign', 'donor', 'export', etc.
    entity_id UUID,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Status
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT notifications_type_check CHECK (type IN ('info', 'success', 'warning', 'error', 'milestone', 'threshold')),
    CONSTRAINT notifications_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- ============================================================================
-- SCHEDULED EXPORTS
-- ============================================================================

CREATE TABLE scheduled_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id),

    -- Configuration
    name TEXT NOT NULL,
    description TEXT,
    export_type TEXT NOT NULL, -- 'analytics', 'donors', 'campaigns', 'donations'
    format TEXT NOT NULL DEFAULT 'csv',

    -- Spec (filters, columns, etc.)
    spec JSONB NOT NULL DEFAULT '{}',

    -- Schedule
    cadence TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    cron_expression TEXT, -- For custom cadence
    timezone TEXT DEFAULT 'UTC',

    -- Status
    is_active BOOLEAN DEFAULT true,
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,

    -- Delivery
    delivery_method TEXT DEFAULT 'download', -- 'download', 'email', 's3', 'sftp'
    delivery_config JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT scheduled_exports_name_check CHECK (length(name) >= 1),
    CONSTRAINT scheduled_exports_type_check CHECK (export_type IN ('analytics', 'donors', 'campaigns', 'donations', 'segments', 'custom')),
    CONSTRAINT scheduled_exports_format_check CHECK (format IN ('csv', 'json', 'xlsx', 'pdf')),
    CONSTRAINT scheduled_exports_cadence_check CHECK (cadence IN ('daily', 'weekly', 'monthly', 'quarterly', 'custom'))
);

CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheduled_export_id UUID REFERENCES scheduled_exports(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Execution
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,

    -- Results
    outcome TEXT, -- 'success', 'failure', 'partial'
    artifact_url TEXT,
    artifact_size_bytes BIGINT,
    row_count INTEGER,

    -- Errors
    error_message TEXT,
    error_details JSONB,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT export_jobs_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    CONSTRAINT export_jobs_outcome_check CHECK (outcome IS NULL OR outcome IN ('success', 'failure', 'partial'))
);

-- ============================================================================
-- ACTIVITY LOG (AUDIT TRAIL)
-- ============================================================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Activity details
    entity_type TEXT NOT NULL, -- 'client', 'campaign', 'donor', 'export', etc.
    entity_id UUID,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'exported', 'merged', etc.

    -- Context
    description TEXT,
    changes JSONB, -- Before/after snapshot for updates
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT activity_log_entity_type_check CHECK (entity_type IN ('client', 'campaign', 'donor', 'donation', 'segment', 'export', 'notification', 'user'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Clients
CREATE INDEX idx_clients_is_active ON clients(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_updated_at ON clients(updated_at DESC);

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Client memberships
CREATE INDEX idx_client_memberships_client ON client_memberships(client_id);
CREATE INDEX idx_client_memberships_user ON client_memberships(user_id);

-- Campaigns
CREATE INDEX idx_campaigns_client ON campaigns(client_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_dates ON campaigns(launch_date, end_date) WHERE deleted_at IS NULL;

-- Donors
CREATE INDEX idx_donors_client ON donors(client_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_donors_email ON donors(client_id, email) WHERE deleted_at IS NULL AND email IS NOT NULL;
CREATE INDEX idx_donors_status ON donors(status) WHERE deleted_at IS NULL;

-- Donations
CREATE INDEX idx_donations_donor ON donations(donor_id, date DESC);
CREATE INDEX idx_donations_campaign ON donations(campaign_id, date DESC);
CREATE INDEX idx_donations_client_date ON donations(client_id, date DESC);

-- Behavioral events
CREATE INDEX idx_behavioral_events_client_anon ON behavioral_events(client_id, anon_id, occurred_at DESC);
CREATE INDEX idx_behavioral_events_campaign ON behavioral_events(campaign_id, occurred_at DESC);
CREATE INDEX idx_behavioral_events_type ON behavioral_events(client_id, event_type, occurred_at DESC);

-- Giving patterns
CREATE INDEX idx_giving_patterns_client_anon ON giving_patterns(client_id, anon_id);

-- Cohorts
CREATE INDEX idx_donor_cohorts_client ON donor_cohorts(client_id, cohort_period);
CREATE INDEX idx_cohort_retention_cohort ON cohort_retention_metrics(cohort_id, period);

-- Segments
CREATE INDEX idx_audience_segments_client ON audience_segments(client_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_segment_memberships_segment ON segment_memberships(segment_id);
CREATE INDEX idx_segment_memberships_donor ON segment_memberships(donor_id);

-- Notifications
CREATE INDEX idx_notifications_client ON notifications(client_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- Scheduled exports
CREATE INDEX idx_scheduled_exports_client ON scheduled_exports(client_id) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX idx_scheduled_exports_next_run ON scheduled_exports(next_run_at) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX idx_export_jobs_scheduled ON export_jobs(scheduled_export_id, created_at DESC);

-- Activity log
CREATE INDEX idx_activity_log_client ON activity_log(client_id, occurred_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id, occurred_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_giving_patterns_updated_at BEFORE UPDATE ON giving_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donor_cohorts_updated_at BEFORE UPDATE ON donor_cohorts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cohort_retention_updated_at BEFORE UPDATE ON cohort_retention_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audience_segments_updated_at BEFORE UPDATE ON audience_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_exports_updated_at BEFORE UPDATE ON scheduled_exports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONOR AGGREGATE UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_donor_aggregates()
RETURNS TRIGGER AS $$
BEGIN
    -- Update donor's aggregate metrics when donation changes
    UPDATE donors
    SET
        total_donated = (
            SELECT COALESCE(SUM(amount_cents), 0) / 100.0
            FROM donations
            WHERE donor_id = COALESCE(NEW.donor_id, OLD.donor_id)
        ),
        donation_count = (
            SELECT COUNT(*)
            FROM donations
            WHERE donor_id = COALESCE(NEW.donor_id, OLD.donor_id)
        ),
        average_donation = (
            SELECT COALESCE(AVG(amount_cents), 0) / 100.0
            FROM donations
            WHERE donor_id = COALESCE(NEW.donor_id, OLD.donor_id)
        ),
        first_donation_date = (
            SELECT MIN(date)
            FROM donations
            WHERE donor_id = COALESCE(NEW.donor_id, OLD.donor_id)
        ),
        last_donation_date = (
            SELECT MAX(date)
            FROM donations
            WHERE donor_id = COALESCE(NEW.donor_id, OLD.donor_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.donor_id, OLD.donor_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donor_aggregates_on_donation
AFTER INSERT OR UPDATE OR DELETE ON donations
FOR EACH ROW EXECUTE FUNCTION update_donor_aggregates();

-- ============================================================================
-- CAMPAIGN AGGREGATE UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_campaign_aggregates()
RETURNS TRIGGER AS $$
DECLARE
    target_campaign_id UUID;
BEGIN
    -- Determine which campaign to update
    target_campaign_id := COALESCE(NEW.campaign_id, OLD.campaign_id);

    -- Only update if there's a campaign associated
    IF target_campaign_id IS NOT NULL THEN
        UPDATE campaigns
        SET
            raised_amount = (
                SELECT COALESCE(SUM(amount_cents), 0) / 100.0
                FROM donations
                WHERE campaign_id = target_campaign_id
            ),
            updated_at = NOW()
        WHERE id = target_campaign_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_aggregates_on_donation
AFTER INSERT OR UPDATE OR DELETE ON donations
FOR EACH ROW EXECUTE FUNCTION update_campaign_aggregates();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper Functions for RLS
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

-- Enable RLS on all tables
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

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Client Policies
CREATE POLICY "Users can view clients they have access to"
    ON clients FOR SELECT
    USING (can_access_client(id));

CREATE POLICY "Admins can create clients"
    ON clients FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update their clients"
    ON clients FOR UPDATE
    USING (is_client_admin(id))
    WITH CHECK (is_client_admin(id));

CREATE POLICY "Owners can delete their clients"
    ON clients FOR DELETE
    USING (is_client_owner(id));

-- Client Memberships Policies
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

-- Campaign Policies
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

-- Donor Policies
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

-- Donation Policies
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

-- Anonymous Analytics Policies
CREATE POLICY "Users can view anon identities for their clients"
    ON anon_identities FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can manage anon identities"
    ON anon_identities FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view behavioral events for their clients"
    ON behavioral_events FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can insert behavioral events"
    ON behavioral_events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view giving patterns for their clients"
    ON giving_patterns FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can manage giving patterns"
    ON giving_patterns FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view cohorts for their clients"
    ON donor_cohorts FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "Admins can manage cohorts for their clients"
    ON donor_cohorts FOR ALL
    USING (is_client_admin(client_id))
    WITH CHECK (is_client_admin(client_id));

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
    USING (true)
    WITH CHECK (true);

-- Segmentation Policies
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

CREATE POLICY "Users can view segment memberships for their clients"
    ON segment_memberships FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "Editors can manage segment memberships for their clients"
    ON segment_memberships FOR ALL
    USING (can_write_client(client_id))
    WITH CHECK (can_write_client(client_id));

-- Notification Policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (
        user_id = auth.uid() OR
        (client_id IS NOT NULL AND can_access_client(client_id))
    );

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

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

-- Scheduled Exports Policies
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

CREATE POLICY "Users can view export jobs for their clients"
    ON export_jobs FOR SELECT
    USING (can_access_client(client_id));

CREATE POLICY "System can manage export jobs"
    ON export_jobs FOR ALL
    USING (true)
    WITH CHECK (true);

-- Activity Log Policies
CREATE POLICY "Users can view activity log for their clients"
    ON activity_log FOR SELECT
    USING (client_id IS NOT NULL AND can_access_client(client_id));

CREATE POLICY "System can insert activity log entries"
    ON activity_log FOR INSERT
    WITH CHECK (true);

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

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your Nexus database is now ready!
-- Next steps:
-- 1. Verify tables exist by running: SELECT * FROM clients LIMIT 1;
-- 2. Test the API endpoint: https://sdgkpehhzysjofcpvdbo.supabase.co/rest/v1/clients
-- 3. Refresh your Nexus app at https://app.leadwithnexus.com
-- ============================================================================
