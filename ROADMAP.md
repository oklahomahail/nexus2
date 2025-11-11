# Nexus 2025 Roadmap

> **Mission**: Transform Nexus from a fundraising assistant into a comprehensive fundraising intelligence platform with AI-powered insights, privacy-first analytics, and multi-channel campaign automation.

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Foundation (COMPLETED)](#phase-1-foundation-completed)
3. [Phase 2: Intelligence & Insights](#phase-2-intelligence--insights-jan-feb-2025)
4. [Phase 3: Performance & Scale](#phase-3-performance--scale-mar-apr-2025)
5. [Phase 4: Automation & Campaigns](#phase-4-automation--campaigns-may-jun-2025)
6. [Phase 5: Multi-Channel Expansion](#phase-5-multi-channel-expansion-jul-aug-2025)
7. [Phase 6: Compliance & Security](#phase-6-compliance--security-sep-oct-2025)
8. [Phase 7: Enterprise & White-Label](#phase-7-enterprise--white-label-nov-dec-2025)
9. [Technical Debt & Testing](#technical-debt--testing)
10. [Risk Mitigation](#risk-mitigation)
11. [Success Metrics](#success-metrics)

---

## Overview

Nexus is a privacy-first fundraising platform that combines donor analytics, AI-powered campaign generation, and multi-channel automation. This roadmap outlines feature development from Q1 2025 through Q4 2025.

### Core Differentiators

1. **Privacy-First Architecture**: Anonymous donor IDs, minimum cohort size (N ≥ 50), no PII in analytics
2. **AI Privacy Gateway**: Allowlist-only fields, regex PII detection, zero donor data to AI services
3. **Brand Bible + AI Fusion**: Brand-consistent campaign generation across direct mail, email, and social
4. **Donor Intelligence Engine**: Natural language analytics queries with AI-powered insights

### Technology Stack

- **Frontend**: React 18 + TypeScript (strict mode), Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Supabase (PostgreSQL + Edge Functions + Storage), Deno runtime
- **AI**: Claude 3.5 Sonnet via Anthropic API
- **Security**: Row Level Security (RLS), JWT authentication, client-scoped multi-tenancy

---

## Phase 1: Foundation (COMPLETED)

**Status**: ✅ Merged to `main` (commit `205b8fd`)
**Timeline**: Dec 2024 - Jan 2025
**Effort**: ~40 hours

### Features Delivered

#### 1. Supabase Backend
- 17-table schema with privacy-first design
- Anonymous donor identities (one-way SHA-256 hashing)
- Row Level Security (RLS) with client-scoping
- TypeScript types auto-generated from schema
- Seed data with 3 demo clients

**Key Files**:
- `supabase/migrations/20250110000000_nexus_initial_schema.sql`
- `supabase/migrations/20250110000001_rls_policies.sql`
- `supabase/migrations/20250110000002_seed_data.sql`
- `src/types/database.types.ts`

#### 2. Brand Bible System
- Brand profiles (mission, tone, colors, typography)
- Brand assets (logo, images, documents)
- Brand corpus (voice examples from websites/PDFs/social)
- Full-text search with `to_tsvector`
- SHA-256 checksums for content deduplication

**Key Files**:
- `supabase/migrations/20250110000003_brand_bible.sql`
- `src/services/brandService.ts`
- `supabase/functions/scheduled-import-brand-corpus/index.ts`

#### 3. Brand Profile UI
- 4-tab interface: Identity, Visuals, Tone & Language, Corpus
- Brand Corpus Manager with search and URL import
- Auto-save form data
- Lazy-loaded panel with `React.lazy`

**Key Files**:
- `src/panels/BrandProfilePanel.tsx`
- `src/components/brand/BrandCorpusManager.tsx`
- `src/hooks/useBrandProfile.ts`

#### 4. Donor Intelligence Engine
- 4 core metrics: Retention, Upgrade Velocity, Gift Velocity, Seasonality
- Privacy-safe RPC functions (enforce N ≥ 50)
- Recharts visualizations (bar, line, scatter charts)
- CSV/Markdown export with metric-specific summaries

**Key Files**:
- `supabase/migrations/20250110000004_donor_intelligence.sql`
- `supabase/migrations/20250110000005_extended_metrics.sql`
- `src/services/donorIntelService.ts`
- `src/panels/DonorIntelligencePanel.tsx`
- `src/utils/export.ts`

#### 5. Campaign Designer Wizard
- 5-step workflow: Basics, Channels, Direct Mail, Generate, Results
- AI-powered generation (direct mail, email sequences, social posts)
- Postage estimation (nonprofit vs first-class rates)
- Brand context injection (profile + top 10 corpus snippets)

**Key Files**:
- `src/panels/CampaignDesignerWizard.tsx`
- `src/services/campaignDesignService.ts`
- `src/services/postageEstimator.ts`
- `supabase/functions/campaign-designer/index.ts`

#### 6. AI Privacy Gateway
- Allowlist-only fields by category (campaign, analytics)
- Regex PII detection (email, phone, address, SSN, credit card)
- Privacy threshold enforcement (N ≥ 50)
- No request body logging
- Metrics tracking (total, blocked, allowed)

**Key Files**:
- `supabase/functions/ai-privacy-gateway/index.ts`
- `src/privacy/scrub.ts`
- `supabase/functions/_shared/scrub.ts`
- `PRIVACY_GATEWAY.md`

#### 7. AI-Safe SQL Views
- `ai_safe_brand_context`: Brand profiles (no URLs, no assets)
- `ai_safe_brand_corpus`: Public-facing brand voice examples
- `ai_safe_client_giving_summary`: Client-level aggregates (no donors)
- `ai_safe_campaign_summary`: Campaign performance (no donor PII)
- `validate_ai_safe_view()`: Function to check for PII-like column names

**Key Files**:
- `supabase/migrations/20250110000006_ai_safe_views.sql`

### Success Metrics (Phase 1)

- ✅ 44 files committed, 15,751 lines of code
- ✅ Zero TypeScript errors in strict mode
- ✅ Privacy gateway blocks 100% of PII test cases
- ✅ All analytics queries enforce N ≥ 50 cohort threshold
- ✅ Campaign Designer generates brand-consistent output

---

## Phase 2: Intelligence & Insights (Jan-Feb 2025)

**Timeline**: 6 weeks
**Effort**: ~30 hours
**Goal**: Enhance analytics with saved insights, filters, AI summaries, and data quality tools

### Features

#### 1. Data Quality Dashboard
**Priority**: HIGH
**Effort**: 5 hours
**Why**: Donor data imports often have inconsistencies. A data quality dashboard helps clients identify and fix issues before they impact analytics.

**Features**:
- Duplicate detection (email, phone, address fuzzy matching)
- Missing field reports (% complete by table)
- Outlier detection (gifts >$10k, dates in future, etc.)
- Quick-fix actions (merge duplicates, bulk update)
- Visual health score per client

**Implementation**:
```sql
-- supabase/migrations/20250201_data_quality.sql
CREATE OR REPLACE FUNCTION fn_data_quality_report(p_client_id UUID)
RETURNS TABLE (
    issue_type TEXT,
    severity TEXT, -- 'high' | 'medium' | 'low'
    count INTEGER,
    details JSONB
) AS $$
-- Detect duplicates, missing fields, outliers
$$;
```

**UI**: New `DataQualityPanel.tsx` with issue list and fix actions

#### 2. Saved Insights Library
**Effort**: 3 hours
**Why**: Users run the same metrics repeatedly. Let them save + recall configurations.

**Schema**:
```sql
CREATE TABLE saved_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'retained_donors' | 'upgrade_velocity' | etc.
    filters JSONB, -- { year: 2024, segment_id: '...' }
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI**: Add "Save Insight" button to each metric view, show library in sidebar

#### 3. Basic Tag-Based Segments
**Effort**: 4 hours
**Why**: Enables segment filters in analytics (see #4). Manual tagging precedes rule-based segmentation (Phase 3).

**Schema**:
```sql
CREATE TABLE donor_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    color TEXT, -- hex color for UI badges
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE donor_segment_members (
    donor_id UUID NOT NULL REFERENCES donors(id),
    segment_id UUID NOT NULL REFERENCES donor_segments(id),
    PRIMARY KEY (donor_id, segment_id)
);
```

**UI**: Segment manager in Donors view, tag assignment UI

#### 4. Segment & Date Filters (Global)
**Effort**: 4 hours
**Why**: Apply filters to all analytics queries (e.g., "Show Q4 2024 retention for Major Donors segment")

**Implementation**:
- Add filter bar to `DonorIntelligencePanel.tsx`
- Pass `segmentId`, `startDate`, `endDate` to all metric RPCs
- Update SQL functions to accept optional filter params

**UI**: Filter bar with segment dropdown, date range picker

#### 5. AI Insights-on-Hover
**Effort**: 3 hours
**Why**: Contextual AI summaries help users interpret data without leaving the chart.

**Implementation**:
- Add `useClaudeAnalysis` hook (already exists)
- Trigger on chart hover (debounced 500ms)
- Show popover with 1-2 sentence insight
- Include year-over-year comparison automatically

**Enhancement**: Cache insights in `analytics_cache` table (see Phase 3) to avoid redundant AI calls

**UI**: Popover component with loading spinner, insight text

#### 6. Export Jobs Dashboard
**Effort**: 3 hours
**Why**: Track history of exports + reports for audit/compliance

**Schema**:
```sql
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    metric_type TEXT,
    format TEXT, -- 'csv' | 'markdown' | 'json'
    row_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Security**:
- Store metadata only (filename, date, user_id), NOT the CSV itself
- Add rate limiting: max 10 exports/hour per client
- Log to `export_jobs` table for audit trail

**UI**: New `ExportJobsPanel.tsx` with table of past exports

#### 7. Onboarding Checklist Widget
**Priority**: QUICK WIN
**Effort**: 2 hours
**Why**: Reduces time-to-value for new clients

**Features**:
- Dashboard widget: "✓ Import donors → ✓ Create brand profile → ⬜ Generate first campaign"
- Progress bar showing % complete
- Links to incomplete steps

**UI**: Add to `Dashboard.tsx` as top card

#### 8. Demo Data Generator
**Priority**: QUICK WIN
**Effort**: 3 hours
**Why**: Lets prospects explore features before importing real data

**Implementation**:
- Edge Function: `generate-demo-data`
- One-click seed realistic data (1000 donors, 5 campaigns, 3 years history)
- Randomized names, amounts, dates
- Mark as demo data with `is_demo: true` flag

**UI**: Button in Dashboard for empty clients

#### 9. Dark Mode Toggle
**Priority**: QUICK WIN
**Effort**: 1 hour
**Why**: You have dark mode classes, but no UI toggle

**Implementation**:
- Add toggle to user menu in `AppContent.tsx` header
- Store preference in `localStorage`
- Apply `dark` class to `<html>` element

### Success Metrics (Phase 2)

- 90% of users save at least 1 insight within first week
- Data quality score averages >80% across clients
- AI insights-on-hover used 500+ times/week
- Onboarding checklist increases activation rate by 20%
- Export rate limiting prevents abuse (0 incidents)

---

## Phase 3: Performance & Scale (Mar-Apr 2025)

**Timeline**: 8 weeks
**Effort**: ~25 hours
**Goal**: Optimize query performance, add caching, and build rule-based segmentation engine

### Features

#### 1. Materialized Views for Core Metrics
**Effort**: 4 hours
**Why**: Precompute quarterly/monthly/yearly metrics to avoid expensive joins on every query

**Implementation**:
```sql
-- supabase/migrations/20250301_materialized_views.sql
CREATE MATERIALIZED VIEW mv_client_giving_summary AS
SELECT
    c.id AS client_id,
    EXTRACT(YEAR FROM dn.donation_date) AS year,
    EXTRACT(QUARTER FROM dn.donation_date) AS quarter,
    COUNT(DISTINCT dn.donor_id) AS donor_count,
    COUNT(dn.id) AS gift_count,
    SUM(dn.amount) AS total_amount,
    AVG(dn.amount) AS avg_amount
FROM clients c
LEFT JOIN donors d ON d.client_id = c.id
LEFT JOIN donations dn ON dn.donor_id = d.id AND dn.status = 'completed'
GROUP BY c.id, year, quarter;

-- Add unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX idx_mv_client_giving_summary
    ON mv_client_giving_summary (client_id, year, quarter);
```

**Critical**: Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` to avoid table lock during reads

**Migration Path**:
- For clients with large donation histories (100k+ donations), initial refresh may take minutes
- Add progress indicators and chunked processing
- Consider `pg_cron` for gradual backfill

#### 2. Nightly Refresh Cron Job
**Effort**: 3 hours
**Why**: Keep materialized views up-to-date without manual intervention

**Implementation**:
```sql
-- Supabase pg_cron extension
SELECT cron.schedule(
    'refresh-mv-nightly',
    '0 2 * * *', -- 2 AM daily
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_client_giving_summary$$
);
```

**UI**: Admin panel with manual refresh button + last refresh timestamp

#### 3. Rule-Based Donor Segmentation Engine
**Effort**: 8 hours
**Why**: Enables automated segment assignment based on giving behavior. Foundational for campaign targeting (Phase 4).

**Schema**:
```sql
-- Extend donor_segments table from Phase 2
ALTER TABLE donor_segments ADD COLUMN rules JSONB;

-- Example rules format:
-- {
--   "conditions": [
--     { "field": "total_lifetime_giving", "operator": ">=", "value": 10000 },
--     { "field": "last_gift_date", "operator": ">", "value": "2024-01-01" }
--   ],
--   "match": "all" // 'all' | 'any'
-- }
```

**Supported Rules**:
- Lifetime giving amount (>, <, =, >=, <=)
- Last gift date (>, <, between)
- Gift count (>, <, =)
- Consecutive years (>=)
- Average gift (>, <)
- Recency (days since last gift)

**Implementation**:
- Edge Function: `compute-segment-memberships`
- Runs nightly via `pg_cron`
- Updates `donor_segment_members` table

**UI**: Segment rule builder in `DonorSegmentsPanel.tsx`

#### 4. Composite Indexing
**Effort**: 2 hours
**Why**: Speed up filtered queries (segment + date range)

**Implementation**:
```sql
-- supabase/migrations/20250315_composite_indexes.sql
CREATE INDEX idx_donations_client_date ON donations (client_id, donation_date);
CREATE INDEX idx_donations_client_anon_date ON donations (client_id, anon_id, donation_date);
CREATE INDEX idx_donors_client_segment ON donor_segment_members (segment_id, donor_id);
```

**Validation**: Use `EXPLAIN ANALYZE` on production-scale data (100k+ donations)

#### 5. Analytics Cache Table
**Effort**: 3 hours
**Why**: Store AI summaries for reuse (avoid redundant AI calls)

**Schema**:
```sql
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    cache_key TEXT NOT NULL, -- hash of (metric, filters, data)
    narrative TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE (client_id, cache_key)
);

-- Auto-expire after 7 days
CREATE INDEX idx_analytics_cache_expires ON analytics_cache (expires_at);
```

**Implementation**:
- Before calling AI, check cache with key = `sha256(metric + filters + data_hash)`
- If hit, return cached narrative
- If miss, call AI + store result with 7-day TTL

**Savings**: Reduces AI costs by ~60% for repeated queries

#### 6. Keyboard Shortcuts (Cmd+K Palette)
**Priority**: QUICK WIN
**Effort**: 3 hours
**Why**: Improves power user experience

**Implementation**:
- Use `cmdk` library (https://cmdk.paco.me/)
- Search navigation, metrics, actions
- Shortcuts: `Cmd+K` (open), `/` (quick search), `Esc` (close)

**UI**: Modal overlay with fuzzy search

### Success Metrics (Phase 3)

- Materialized views reduce query time by 70% (from ~2s to ~600ms)
- Analytics cache hit rate >60% after 2 weeks
- Segmentation engine assigns 10k+ donors/night
- Composite indexes improve filtered queries by 50%
- Keyboard shortcuts used by 30% of weekly active users

---

## Phase 4: Automation & Campaigns (May-Jun 2025)

**Timeline**: 8 weeks
**Effort**: ~35 hours
**Goal**: Add campaign performance tracking, approval workflows, scheduled reports, and templates library

### Features

#### 1. Campaign Performance Tracking
**Priority**: HIGH
**Effort**: 8 hours
**Why**: Campaign Designer generates output, but there's no feedback loop to track performance. You need attribution to measure ROI.

**Schema**:
```sql
-- Extend campaigns table
ALTER TABLE campaigns ADD COLUMN mail_sent_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN email_sent_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN response_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN cost_per_acquisition DECIMAL(10,2);

-- Track campaign → donation associations
ALTER TABLE donations ADD COLUMN campaign_id UUID REFERENCES campaigns(id);
CREATE INDEX idx_donations_campaign ON donations (campaign_id);
```

**Metrics**:
- Response rate: `(gifts / mail pieces sent) * 100`
- Cost per acquisition: `total_cost / response_count`
- Longitudinal impact: Retention rate of campaign donors (1-year, 3-year)
- A/B test framework: Compare two campaign variants (variant_a vs variant_b)

**Implementation**:
- Edge Function: `track-campaign-response`
- Called when donation is associated with campaign
- Updates campaign metrics table

**UI**: `CampaignPerformancePanel.tsx` with response rate charts, CPA, ROI

#### 2. Campaign Approval Workflow
**Priority**: CRITICAL
**Effort**: 4 hours
**Why**: Prevent accidental sends (especially email blasts)

**Schema**:
```sql
ALTER TABLE campaigns ADD COLUMN approval_status TEXT DEFAULT 'draft'; -- 'draft' | 'pending_approval' | 'approved' | 'rejected'
ALTER TABLE campaigns ADD COLUMN approved_by UUID REFERENCES auth.users(id);
ALTER TABLE campaigns ADD COLUMN approved_at TIMESTAMPTZ;
```

**Implementation**:
- After AI generation, campaign enters `draft` status
- User clicks "Request Approval" → status = `pending_approval`
- Admin reviews + approves → status = `approved`
- Only approved campaigns can be sent

**UI**: Approval button in `CampaignDesignerWizard.tsx`, approval queue in admin panel

#### 3. Campaign Templates Library
**Effort**: 5 hours
**Why**: Let users save successful campaign structures as templates

**Schema**:
```sql
CREATE TABLE campaign_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id), -- NULL = global template
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'direct_mail' | 'email' | 'multi_channel'
    season TEXT, -- 'Q4' | 'Spring' | etc.
    structure JSONB NOT NULL, -- stores params + channel config
    is_public BOOLEAN DEFAULT FALSE, -- share with other clients
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Features**:
- Save campaign as template (after generation)
- Pre-populate forms with template defaults
- Community library (opt-in sharing across clients)
- Template preview before use

**UI**: Templates dropdown in `CampaignDesignerWizard.tsx`, template manager panel

#### 4. Scheduled Donor Reports (Edge Function)
**Effort**: 6 hours
**Why**: Automate monthly/quarterly CSV reports → Storage → email notification

**Implementation**:
```typescript
// supabase/functions/scheduled-donor-reports/index.ts
Deno.serve(async (req) => {
  // 1. Fetch clients with active report schedules
  // 2. For each client, run metrics (retention, upgrade, etc.)
  // 3. Generate CSV with metric-specific summary
  // 4. Upload to Supabase Storage: /reports/{client_id}/{YYYY-MM-DD}_report.csv
  // 5. Send email notification with download link
})
```

**Schema**:
```sql
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    metric_type TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'weekly' | 'monthly' | 'quarterly'
    recipients TEXT[] NOT NULL, -- email addresses
    filters JSONB,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Trigger**: `pg_cron` daily at 6 AM, checks `next_run_at`

#### 5. Email/Webhook Notifications
**Effort**: 4 hours
**Why**: Notify admins when reports ready, campaigns approved, data quality issues detected

**Implementation**:
- Use Resend API for transactional emails (free tier: 3000/month)
- Webhook support for Slack, Discord, Zapier

**Schema**:
```sql
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    notification_type TEXT NOT NULL, -- 'report_ready' | 'campaign_approved' | 'data_quality_alert'
    channel TEXT NOT NULL, -- 'email' | 'webhook'
    destination TEXT NOT NULL, -- email or webhook URL
    enabled BOOLEAN DEFAULT TRUE
);
```

**UI**: Notification settings in client profile

#### 6. A/B Test Framework
**Effort**: 8 hours
**Why**: Compare campaign variants to optimize messaging

**Schema**:
```sql
CREATE TABLE campaign_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    variant_name TEXT NOT NULL, -- 'Control' | 'Variant A' | 'Variant B'
    subject_line TEXT,
    body_content TEXT,
    sent_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Implementation**:
- Split audience into 2-3 segments (randomized)
- Send different variants to each segment
- Track response rates
- Declare winner after statistical significance (p < 0.05)

**UI**: A/B test setup in `CampaignDesignerWizard.tsx`, results dashboard

### Success Metrics (Phase 4)

- Campaign performance tracked for 100% of sent campaigns
- Approval workflow prevents 95% of accidental sends
- Templates library has 20+ templates shared across clients
- Scheduled reports sent 500+ times/month
- A/B tests run 50+ times, average lift 15%

---

## Phase 5: Multi-Channel Expansion (Jul-Aug 2025)

**Timeline**: 8 weeks
**Effort**: ~40 hours
**Goal**: Expand beyond direct mail to email sequences, SMS, and social media automation

### Features

#### 1. Email Service Integration
**Priority**: HIGH
**Effort**: 10 hours
**Why**: Email is the most cost-effective fundraising channel

**Integrations**:
- **Resend** (recommended): Modern API, generous free tier
- **Postmark**: High deliverability
- **SendGrid**: Enterprise-grade

**Schema**:
```sql
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    subject_line TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NOT NULL,
    from_email TEXT NOT NULL,
    from_name TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_campaign_id UUID NOT NULL REFERENCES email_campaigns(id),
    donor_id UUID NOT NULL REFERENCES donors(id),
    email_hash TEXT NOT NULL, -- privacy: don't store plain email
    status TEXT NOT NULL, -- 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    bounce_reason TEXT,
    unsubscribed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical: Email Deliverability**
- SPF/DKIM verification flow during client onboarding
- Bounce tracking (pause campaigns if bounce rate >5%)
- Unsubscribe link in every email (CAN-SPAM compliance)

**Implementation**:
- Edge Function: `send-email-campaign`
- Integrates with Resend API
- Handles webhooks for bounce/open/click events
- Updates `email_deliveries` table

**UI**: Email campaign builder in `CampaignDesignerWizard.tsx`, deliverability dashboard

#### 2. SMS Campaigns
**Effort**: 8 hours
**Why**: High open rates (98%), immediate engagement

**Integrations**:
- **Twilio**: Industry standard
- **Bandwidth**: Lower cost

**Schema**:
```sql
CREATE TABLE sms_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    message_body TEXT NOT NULL, -- 160 chars max
    from_phone TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TCPA compliance: track consent
ALTER TABLE donors ADD COLUMN sms_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE donors ADD COLUMN sms_consent_date TIMESTAMPTZ;
```

**Critical: TCPA Compliance**
- TCPA requires explicit opt-in for SMS
- Show consent status in contact views
- Auto-exclude non-consented donors from SMS campaigns

**Implementation**:
- Edge Function: `send-sms-campaign`
- Integrates with Twilio API
- Only sends to donors with `sms_consent = TRUE`

**UI**: SMS campaign builder, consent manager

#### 3. Social Media Post Scheduler
**Effort**: 10 hours
**Why**: Automate social media for campaigns (Facebook, Twitter/X, LinkedIn, Instagram)

**Integration**: Use **Ayrshare API** (unified social media posting)

**Schema**:
```sql
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    platform TEXT NOT NULL, -- 'facebook' | 'twitter' | 'linkedin' | 'instagram'
    content TEXT NOT NULL,
    media_urls TEXT[], -- image/video URLs
    scheduled_at TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    post_url TEXT, -- URL of published post
    engagement_stats JSONB, -- likes, shares, comments
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical: Platform-Specific Variants**
- Character limits: Twitter 280, LinkedIn 3000, Instagram 2200
- Generate platform-specific variants automatically in AI prompt

**Implementation**:
- Edge Function: `post-to-social`
- Triggered by `pg_cron` at scheduled time
- Integrates with Ayrshare API

**UI**: Social media calendar view, post preview

#### 4. Multi-Channel Campaign Orchestration
**Effort**: 12 hours
**Why**: Coordinate direct mail + email + SMS + social in unified campaign

**Schema**:
```sql
CREATE TABLE campaign_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    step_order INTEGER NOT NULL,
    channel TEXT NOT NULL, -- 'direct_mail' | 'email' | 'sms' | 'social'
    delay_days INTEGER DEFAULT 0, -- days after previous step
    content_id UUID, -- references email_campaigns, sms_campaigns, or social_posts
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Sequence**:
1. Day 0: Direct mail sent
2. Day 3: Email follow-up
3. Day 7: SMS reminder
4. Day 14: Social media thank-you post

**Implementation**:
- Edge Function: `orchestrate-campaign`
- Processes sequences step-by-step
- Tracks completion per donor

**UI**: Sequence builder with drag-and-drop timeline

### Success Metrics (Phase 5)

- Email campaigns have 95%+ deliverability rate
- SMS campaigns achieve 98% open rate (industry standard)
- Social posts generate 500+ engagements/month
- Multi-channel campaigns increase response rate by 25% vs single-channel

---

## Phase 6: Compliance & Security (Sep-Oct 2025)

**Timeline**: 8 weeks
**Effort**: ~30 hours
**Goal**: Add GDPR/CCPA compliance tools, audit logging, data residency, and optional E2EE

### Features

#### 1. GDPR Right to Erasure
**Priority**: CRITICAL
**Effort**: 4 hours
**Why**: GDPR Article 17 requires "right to be forgotten"

**Implementation**:
```sql
-- RPC function for hard delete
CREATE OR REPLACE FUNCTION fn_gdpr_erase_donor(
    p_client_id UUID,
    p_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_donor_id UUID;
BEGIN
    -- Find donor by email hash
    SELECT d.id INTO v_donor_id
    FROM donors d
    JOIN anon_identities ai ON ai.anon_id = d.anon_id
    WHERE d.client_id = p_client_id
      AND ai.email_hash = encode(digest(p_email, 'sha256'), 'hex');

    IF v_donor_id IS NULL THEN
        RAISE EXCEPTION 'Donor not found';
    END IF;

    -- Cascade delete from all tables
    DELETE FROM donations WHERE donor_id = v_donor_id;
    DELETE FROM behavioral_events WHERE donor_id = v_donor_id;
    DELETE FROM donor_segment_members WHERE donor_id = v_donor_id;
    DELETE FROM email_deliveries WHERE donor_id = v_donor_id;
    DELETE FROM donors WHERE id = v_donor_id;

    -- Log erasure
    INSERT INTO audit_log (action, details) VALUES
        ('gdpr_erasure', jsonb_build_object('donor_id', v_donor_id, 'email', p_email));

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**UI**: "Request Data Erasure" button in donor profile, confirmation modal

#### 2. Audit Logging
**Effort**: 5 hours
**Why**: Track all sensitive actions for compliance and security

**Schema**:
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'export' | 'gdpr_erasure' | 'ai_request' | 'campaign_send'
    resource_type TEXT, -- 'donor' | 'campaign' | 'metric'
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_client ON audit_log (client_id, created_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log (user_id, created_at DESC);
```

**Logged Events**:
- AI requests (timestamp, user_id, category, blocked_reason)
- Exports (timestamp, user_id, metric, row_count)
- GDPR erasures (timestamp, user_id, donor_id)
- Campaign sends (timestamp, user_id, campaign_id, recipient_count)

**Retention**: 1 year minimum for compliance

**UI**: Audit log viewer in admin panel (filterable by action, user, date)

#### 3. Data Residency
**Effort**: 4 hours
**Why**: GDPR requires EU data to stay in EU region

**Implementation**:
```sql
ALTER TABLE clients ADD COLUMN data_region TEXT DEFAULT 'us'; -- 'us' | 'eu' | 'ap'
```

**Configuration**:
- For EU clients, create Supabase project in EU region
- Add `data_region` badge in UI
- Document migration path for existing clients

**UI**: Region selector during client onboarding

#### 4. Enhanced RLS Policies for PII Access
**Effort**: 3 hours
**Why**: Restrict PII access to client admins only (not all members)

**Schema**:
```sql
ALTER TABLE client_memberships ADD COLUMN can_view_pii BOOLEAN DEFAULT FALSE;
```

**RLS Policy**:
```sql
-- Only users with can_view_pii = TRUE can see donor contact fields
CREATE POLICY donor_pii_access ON donors
FOR SELECT
USING (
    client_id IN (
        SELECT client_id
        FROM client_memberships
        WHERE user_id = auth.uid() AND can_view_pii = TRUE
    )
);
```

**UI**: Toggle "Allow PII Access" in team member settings

#### 5. Data Export (Full Account)
**Effort**: 4 hours
**Why**: GDPR Article 20 requires data portability. Prevents vendor lock-in concerns.

**Implementation**:
- Edge Function: `export-all-client-data`
- Generates ZIP of CSVs for all tables
- Uploads to Storage → download link

**Schema**:
```sql
CREATE TABLE full_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    file_path TEXT NOT NULL, -- Storage path
    file_size_mb DECIMAL(10,2),
    status TEXT DEFAULT 'processing', -- 'processing' | 'ready' | 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- 7 days
);
```

**UI**: "Export All Data" button in client settings, download link when ready

#### 6. CCPA "Do Not Sell" Flag
**Effort**: 2 hours
**Why**: CCPA requires opt-out for data sales (Nexus doesn't sell data, but need flag for compliance)

**Schema**:
```sql
ALTER TABLE donors ADD COLUMN ccpa_do_not_sell BOOLEAN DEFAULT FALSE;
```

**UI**: Checkbox in donor profile, auto-exclude from external integrations if TRUE

#### 7. Client-Side E2EE (Optional Upgrade)
**Effort**: 10 hours
**Why**: For highest compliance standards (HIPAA, SOC 2), encrypt donor PII at rest

**Implementation**:
```sql
-- Add encrypted blob column
ALTER TABLE donors ADD COLUMN secure_blob JSONB; -- encrypted PII: {name, email, phone, address}
ALTER TABLE donors DROP COLUMN first_name, last_name, email, phone; -- remove plaintext fields
```

**Encryption Flow**:
1. Generate per-client RSA/ECC keypair
2. Public key: stored in app config
3. Private key: held by client admins (browser or KMS)
4. Encrypt PII client-side with WebCrypto before upload
5. Decrypt on-demand in browser when viewing donor

**Trade-offs**:
- More complex key management
- Performance overhead for encryption/decryption
- Requires client admin key custody

**Benefits**:
- Database and servers are blind to PII
- AI receives only decrypted brand context + precomputed aggregates
- Meets highest compliance standards

**UI**: Key management panel, import/export keypair

### Success Metrics (Phase 6)

- GDPR erasure requests processed within 24 hours (100% compliance)
- Audit log retention 100% for 1 year
- Data residency correctly enforced (0 violations)
- E2EE adoption rate 10% of enterprise clients
- Zero PII breaches or compliance incidents

---

## Phase 7: Enterprise & White-Label (Nov-Dec 2025)

**Timeline**: 8 weeks
**Effort**: ~40 hours
**Goal**: Add SSO, white-labeling, custom domains, metered billing, and API access

### Features

#### 1. SSO Integration
**Effort**: 8 hours
**Why**: Enterprise clients require SAML/OAuth for security

**Implementation**:
- Supabase supports SAML/OAuth out-of-box
- Test with Okta, Auth0, Google Workspace, Microsoft Entra ID

**Configuration**:
```sql
CREATE TABLE sso_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    provider TEXT NOT NULL, -- 'okta' | 'auth0' | 'google' | 'microsoft'
    config JSONB NOT NULL, -- provider-specific settings
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI**: SSO setup wizard in admin panel

#### 2. White-Label Branding
**Effort**: 10 hours
**Why**: Enterprise clients want custom branding (logo, colors, domain)

**Schema**:
```sql
CREATE TABLE white_label_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    logo_url TEXT,
    primary_color TEXT, -- hex color
    secondary_color TEXT,
    custom_domain TEXT, -- e.g., nexus.nonprofit.org
    favicon_url TEXT,
    app_name TEXT DEFAULT 'Nexus',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Implementation**:
- Load white-label settings on app init
- Apply CSS custom properties for colors
- Show custom logo in header

**UI**: White-label settings panel, live preview

#### 3. Custom Domains
**Effort**: 6 hours
**Why**: Enterprise clients want `nexus.nonprofit.org` instead of `nexus.app/client-slug`

**Implementation**:
- Use Vercel custom domains or Cloudflare Workers
- CNAME record: `nexus.nonprofit.org` → `nexus.app`
- SSL certificate auto-provisioning

**Schema**:
```sql
ALTER TABLE white_label_settings ADD COLUMN custom_domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE white_label_settings ADD COLUMN custom_domain_verified_at TIMESTAMPTZ;
```

**UI**: Domain setup wizard with DNS instructions, verification button

#### 4. Metered Billing
**Effort**: 10 hours
**Why**: Scale pricing based on usage (donors, AI calls, campaigns)

**Integration**: Use **Stripe Billing** with usage-based pricing

**Pricing Tiers**:
- **Starter**: 1 client, 5k donors, 10 AI generations/month - $29/mo
- **Growth**: 3 clients, 50k donors, 100 AI generations/month - $99/mo
- **Pro**: Unlimited clients, 500k donors, 1000 AI generations/month - $299/mo
- **Enterprise**: Custom limits + white-label + SSO - Custom pricing

**Schema**:
```sql
CREATE TABLE billing_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    donor_count INTEGER,
    ai_call_count INTEGER,
    campaign_count INTEGER,
    storage_gb DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE billing_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    stripe_invoice_id TEXT,
    amount_usd DECIMAL(10,2),
    status TEXT, -- 'draft' | 'open' | 'paid' | 'void'
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Implementation**:
- Edge Function: `sync-billing-usage` (runs daily)
- Reports usage to Stripe Billing API
- Stripe generates invoices automatically

**UI**: Billing dashboard with usage charts, invoice history

#### 5. API Access (REST + Webhooks)
**Effort**: 12 hours
**Why**: Enterprise clients want to integrate with CRMs, marketing automation, etc.

**Implementation**:
- Expose Supabase PostgREST API with client-scoped JWT
- Add webhook support for events (donation created, campaign sent, etc.)

**Schema**:
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL, -- bcrypt hash of API key
    scopes TEXT[] NOT NULL, -- ['read:donors', 'write:donations', 'read:campaigns']
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- ['donation.created', 'campaign.sent']
    secret TEXT NOT NULL, -- for HMAC signature
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Documentation**:
- Create API docs with OpenAPI spec
- Host at `docs.nexusapp.com/api`

**UI**: API key manager, webhook manager

#### 6. AI Model Selection
**Effort**: 4 hours
**Why**: Let clients choose between Claude, GPT-4, Gemini based on cost/quality preferences

**Schema**:
```sql
ALTER TABLE clients ADD COLUMN ai_model TEXT DEFAULT 'claude-3-5-sonnet'; -- 'claude-3-5-sonnet' | 'gpt-4o' | 'gemini-pro'
```

**Implementation**:
- Update `ai-privacy-gateway` to route to correct provider
- Track costs per model in `billing_usage`

**UI**: Model selector in client settings, cost comparison chart

### Success Metrics (Phase 7)

- SSO enabled for 50% of enterprise clients
- White-label custom domains live for 20+ clients
- API usage grows 100+ requests/day
- Metered billing processes $50k+ monthly revenue
- AI model selection reduces costs by 20% for budget-conscious clients

---

## Technical Debt & Testing

### Unit Tests (Vitest)

**Target**: 80% coverage of `/src/utils` and `/src/services`

**Priority Tests**:
```typescript
// src/privacy/scrub.test.ts
import { containsPII, deepContainsPII, allowlistObject } from '@/privacy/scrub'

test('detects email addresses', () => {
  expect(containsPII('Contact: john.doe@example.com')).toBe(true)
})

test('detects phone numbers', () => {
  expect(containsPII('Call me at 555-123-4567')).toBe(true)
})

test('detects addresses', () => {
  expect(containsPII('123 Main Street, Anytown')).toBe(true)
})

test('allows brand content', () => {
  expect(containsPII('Our mission is to help communities thrive')).toBe(false)
})

test('filters campaign payload', () => {
  const input = {
    profile: { name: 'Hope Foundation', email: 'contact@hope.org' },
    donors: [{ name: 'John Doe', email: 'john@example.com' }]
  }
  const filtered = allowlistObject(input, 'campaign')
  expect(filtered.profile.name).toBe('Hope Foundation')
  expect(filtered.profile.email).toBeUndefined() // NOT in allowlist
  expect(filtered.donors).toBeUndefined() // NOT in allowlist
})
```

```typescript
// src/utils/export.test.ts
import { rowsToCsv, rowsToMarkdown } from '@/utils/export'

test('converts rows to CSV', () => {
  const rows = [
    { name: 'Alice', amount: 100 },
    { name: 'Bob', amount: 200 }
  ]
  const csv = rowsToCsv(rows)
  expect(csv).toContain('name,amount')
  expect(csv).toContain('"Alice","100"')
})

test('escapes double quotes in CSV', () => {
  const rows = [{ name: 'Alice "Al" Smith', amount: 100 }]
  const csv = rowsToCsv(rows)
  expect(csv).toContain('"Alice ""Al"" Smith"')
})
```

### Integration Tests (pgTAP or Supabase Test Helpers)

**Target**: All RPC functions covered

**Priority Tests**:
```sql
-- test/sql/rls_policies.test.sql
BEGIN;
SELECT plan(5);

-- Test: User can only access their own client's data
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-a-uuid';

SELECT results_eq(
  'SELECT client_id FROM donors WHERE client_id = ''client-b-uuid''',
  ARRAY[]::UUID[],
  'User A cannot access Client B donors'
);

-- Test: Privacy threshold enforcement
SELECT throws_ok(
  'SELECT * FROM fn_retained_donor_counts(''client-a-uuid'', 2024) WHERE donor_count < 50',
  'Privacy threshold not met',
  'Blocks queries with N < 50'
);

SELECT * FROM finish();
ROLLBACK;
```

### E2E Tests (Playwright)

**Target**: 5-10 critical user journeys

**Priority Flows**:
```typescript
// e2e/critical-flows.spec.ts
import { test, expect } from '@playwright/test'

test('Import donors → View analytics → Export CSV', async ({ page }) => {
  await page.goto('/donors')
  await page.click('button:has-text("Import")')
  // Upload CSV fixture
  await page.setInputFiles('input[type="file"]', 'fixtures/donors.csv')
  await page.click('button:has-text("Upload")')
  await expect(page.locator('text=1000 donors imported')).toBeVisible()

  await page.goto('/analytics')
  await page.click('button:has-text("Retention")')
  await expect(page.locator('canvas')).toBeVisible() // Chart rendered

  await page.click('button:has-text("CSV")')
  // Assert download triggered
})

test('Create brand profile → Generate campaign → Download outputs', async ({ page }) => {
  await page.goto('/brand')
  await page.fill('input[name="name"]', 'Hope Foundation')
  await page.fill('textarea[name="mission_statement"]', 'We help communities thrive')
  await page.click('button:has-text("Save")')

  await page.goto('/campaigns/designer')
  await page.fill('input[name="name"]', 'Year-End Appeal 2025')
  await page.click('button:has-text("Generate")')
  await expect(page.locator('text=Campaign generated')).toBeVisible({ timeout: 30000 })

  await page.click('button:has-text("Download All")')
  // Assert ZIP download
})

test('Privacy gateway blocks PII in campaign request', async ({ page, request }) => {
  const response = await request.post('/functions/v1/ai-privacy-gateway', {
    data: {
      category: 'campaign',
      payload: { email: 'test@example.com' }
    }
  })
  expect(response.status()).toBe(400)
  const body = await response.json()
  expect(body.error).toBe('pii_detected_blocked')
})
```

---

## Risk Mitigation

### Technical Risks

#### 1. Claude API Rate Limits
**Risk**: Campaign generation fails during high usage
**Impact**: User frustration, lost revenue
**Likelihood**: Medium
**Mitigation**:
- Implement queue system with BullMQ or Supabase pg_cron
- Add retry logic with exponential backoff
- Show queue position in UI ("Position 3 of 10")
- Upgrade to Claude Enterprise for higher limits

#### 2. Large CSV Exports Timeout
**Risk**: Exporting 100k+ donors causes browser hang
**Impact**: Users can't export data, compliance issues
**Likelihood**: High (for enterprise clients)
**Mitigation**:
- Move exports to Edge Function → Storage → download link (async)
- Add progress indicator
- Limit sync exports to 10k rows
- For larger exports, email download link when ready

#### 3. Materialized View Refresh Lock
**Risk**: `REFRESH MATERIALIZED VIEW` locks table during read
**Impact**: Analytics queries fail during refresh
**Likelihood**: Medium
**Mitigation**:
- Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` (requires unique index)
- Schedule refreshes during low-traffic hours (2 AM)
- Add fallback to base tables if view unavailable

#### 4. Email Deliverability Issues
**Risk**: Emails land in spam, bounce rate spikes
**Impact**: Campaign performance suffers, sender reputation damaged
**Likelihood**: High (for new domains)
**Mitigation**:
- Require SPF/DKIM verification during onboarding
- Monitor bounce rate, pause campaigns if >5%
- Use transactional email providers (Resend, Postmark)
- Warm up new domains gradually (50 → 500 → 5000 emails/day)

#### 5. GDPR Erasure Cascade Failures
**Risk**: Donor deletion fails mid-cascade, leaves orphaned records
**Impact**: Compliance violation, potential fines
**Likelihood**: Low
**Mitigation**:
- Wrap erasure in transaction (ROLLBACK on error)
- Add comprehensive logging
- Test with 1M+ record databases
- Provide "dry run" mode to preview deletion impact

### Business Risks

#### 1. AI-Generated Content Quality
**Risk**: AI output is generic or off-brand
**Impact**: Users don't trust AI, manual edits required
**Likelihood**: Medium
**Mitigation**:
- Add feedback loop (thumbs up/down on generated content)
- Use feedback to refine prompts over time
- Offer "Regenerate" button with prompt adjustments
- Store high-rated examples in brand corpus

#### 2. Client Churn Due to Data Lock-In
**Risk**: Clients fear vendor lock-in
**Impact**: Churn rate increases, negative reviews
**Likelihood**: Medium
**Mitigation**:
- Build "Export All Data" feature in Phase 6 (ZIP of CSVs)
- Promote data portability in marketing
- Offer migration assistance for churned clients

#### 3. Privacy Breach
**Risk**: PII leaks to AI service or external logs
**Impact**: GDPR violation, fines, reputational damage
**Likelihood**: Low (strong architecture)
**Mitigation**:
- Privacy gateway enforced at Edge Function layer (single chokepoint)
- Comprehensive unit tests for PII detection
- Regular security audits
- Bug bounty program

---

## Success Metrics

### Product Metrics

**Activation**:
- % of new clients who complete onboarding checklist within 7 days (target: 80%)
- Time to first campaign generation (target: <2 hours)

**Engagement**:
- Weekly active users (WAU) growth rate (target: 10% MoM)
- Average sessions per user per week (target: 5+)
- Feature adoption rate (target: 60% use 3+ features)

**Retention**:
- 30-day retention rate (target: 70%)
- 90-day retention rate (target: 50%)
- Churn rate (target: <5% monthly)

**Revenue**:
- Monthly recurring revenue (MRR) growth (target: 20% MoM)
- Average revenue per account (ARPA) (target: $150/mo)
- Conversion rate: free trial → paid (target: 25%)

### Technical Metrics

**Performance**:
- Analytics query response time p95 (target: <1s)
- Campaign generation time p95 (target: <30s)
- Page load time p95 (target: <2s)

**Reliability**:
- Uptime (target: 99.9%)
- Error rate (target: <0.1%)
- API success rate (target: >99%)

**Privacy & Security**:
- PII detection accuracy (target: >99.9%)
- Privacy gateway block rate (target: <1% false positives)
- Security incidents (target: 0)

**AI Efficiency**:
- AI cost per campaign (target: <$0.50)
- Cache hit rate for analytics insights (target: >60%)
- AI-generated content approval rate (target: >80%)

---

## Appendix: Dependency Graph

```
Phase 1 (Foundation) ✅
  ↓
Phase 2 (Intelligence & Insights)
  ├─ Basic Tag-Based Segments → Segment Filters
  ├─ Data Quality Dashboard (standalone)
  ├─ Saved Insights (standalone)
  ├─ AI Insights-on-Hover (standalone)
  └─ Onboarding Checklist (standalone)
  ↓
Phase 3 (Performance & Scale)
  ├─ Materialized Views → Nightly Refresh Cron
  ├─ Rule-Based Segmentation Engine (depends on Phase 2 segments)
  ├─ Analytics Cache (depends on AI insights)
  └─ Composite Indexing (standalone)
  ↓
Phase 4 (Automation & Campaigns)
  ├─ Campaign Performance Tracking (standalone)
  ├─ Campaign Approval Workflow (standalone)
  ├─ Campaign Templates (standalone)
  ├─ Scheduled Reports (depends on Phase 3 materialized views)
  └─ A/B Testing (depends on performance tracking)
  ↓
Phase 5 (Multi-Channel Expansion)
  ├─ Email Service Integration (standalone)
  ├─ SMS Campaigns (standalone)
  ├─ Social Media Scheduler (standalone)
  └─ Multi-Channel Orchestration (depends on all above)
  ↓
Phase 6 (Compliance & Security)
  ├─ GDPR Right to Erasure (standalone)
  ├─ Audit Logging (standalone)
  ├─ Data Residency (standalone)
  ├─ Full Data Export (standalone)
  └─ Client-Side E2EE (optional, standalone)
  ↓
Phase 7 (Enterprise & White-Label)
  ├─ SSO Integration (standalone)
  ├─ White-Label Branding (standalone)
  ├─ Custom Domains (depends on white-label)
  ├─ Metered Billing (standalone)
  └─ API Access (standalone)
```

---

## Contact & Feedback

For questions, suggestions, or feature requests:
- **GitHub Issues**: https://github.com/yourusername/nexus/issues
- **Email**: support@nexusapp.com
- **Slack**: #nexus-dev

---

**Last Updated**: 2025-01-10
**Version**: 2.0

**Changelog**:
- **v2.0** (2025-01-10): Comprehensive roadmap combining original plan + enhanced suggestions
- **v1.0** (2025-01-10): Initial roadmap with Phase 1 completion
