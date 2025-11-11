-- Nexus Seed Data Migration
-- Demo clients, campaigns, donors, and analytics for testing
-- Created: 2025-01-10

-- ============================================================================
-- DEMO CLIENTS
-- ============================================================================

-- Insert demo clients (will auto-create owner memberships via trigger)
INSERT INTO clients (id, name, short_name, primary_contact_name, primary_contact_email, email, phone, website, description, is_active, brand, settings)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Hope Foundation',
    'Hope',
    'Sarah Johnson',
    'sarah@hopefoundation.org',
    'info@hopefoundation.org',
    '+1-555-0100',
    'https://hopefoundation.org',
    'A nonprofit dedicated to ending childhood hunger through community-based programs and sustainable food systems.',
    true,
    '{"logoUrl": "https://placehold.co/200x200/4F46E5/FFFFFF/png?text=HF"}',
    '{"timezone": "America/New_York", "fiscalYearStart": "07-01", "currency": "USD"}'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Green Earth Alliance',
    'GEA',
    'Michael Chen',
    'michael@greenearthalliance.org',
    'contact@greenearthalliance.org',
    '+1-555-0200',
    'https://greenearthalliance.org',
    'Environmental nonprofit focused on climate action, reforestation, and sustainable agriculture education.',
    true,
    '{"logoUrl": "https://placehold.co/200x200/10B981/FFFFFF/png?text=GEA"}',
    '{"timezone": "America/Los_Angeles", "fiscalYearStart": "01-01", "currency": "USD"}'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Education for All',
    'EFA',
    'Jessica Martinez',
    'jessica@educationforall.org',
    'hello@educationforall.org',
    '+1-555-0300',
    'https://educationforall.org',
    'Providing quality education resources and scholarships to underserved communities worldwide.',
    true,
    '{"logoUrl": "https://placehold.co/200x200/F59E0B/FFFFFF/png?text=EFA"}',
    '{"timezone": "America/Chicago", "fiscalYearStart": "09-01", "currency": "USD"}'
);

-- ============================================================================
-- DEMO CAMPAIGNS (for Hope Foundation)
-- ============================================================================

INSERT INTO campaigns (
    id, client_id, name, description, type, status, category,
    goal_amount, raised_amount, marketing_cost,
    launch_date, end_date,
    target_audience, goals_config, performance, tags, metadata
)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Year-End Giving Campaign 2024',
    'Our largest annual fundraising campaign to support food security programs throughout the winter months.',
    'multichannel',
    'completed',
    'General',
    250000.00,
    287500.00,
    12500.00,
    '2024-11-01 00:00:00+00',
    '2024-12-31 23:59:59+00',
    '{"segmentIds": ["seg-001", "seg-002"], "totalRecipients": 15000}',
    '{"primary": "donations", "targetAmount": 250000, "kpis": ["total_raised", "donor_count", "average_gift", "roi"]}',
    '{"sent": 15000, "delivered": 14850, "opened": 8910, "clicked": 2970, "converted": 1150, "revenue": 287500, "cost": 12500, "roi": 23.0}',
    ARRAY['year-end', 'email', 'direct-mail', 'social'],
    '{"theme": "Share the Warmth", "creative_version": "v2", "ab_test_winner": "subject_line_A"}'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Spring Renewal Campaign',
    'Engage lapsed donors and attract new supporters for our spring programs.',
    'email',
    'active',
    'General',
    75000.00,
    42300.00,
    3200.00,
    '2025-03-01 00:00:00+00',
    '2025-04-30 23:59:59+00',
    '{"segmentIds": ["seg-003"], "totalRecipients": 5000}',
    '{"primary": "engagement", "targetAmount": 75000, "kpis": ["open_rate", "click_rate", "conversion_rate"]}',
    '{"sent": 5000, "delivered": 4950, "opened": 1980, "clicked": 495, "converted": 141, "revenue": 42300, "cost": 3200, "roi": 13.2}',
    ARRAY['spring', 'email', 'reactivation'],
    '{"theme": "New Beginnings", "segmentation_strategy": "lapsed_donors_6_12_months"}'
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Monthly Giving Program',
    'Recurring donation program to build sustainable funding for ongoing operations.',
    'email',
    'active',
    'General',
    120000.00,
    95000.00,
    4800.00,
    '2024-01-01 00:00:00+00',
    NULL,
    '{"segmentIds": ["seg-004", "seg-005"], "totalRecipients": 8000}',
    '{"primary": "retention", "targetAmount": 120000, "kpis": ["monthly_donors", "retention_rate", "upgrade_rate"]}',
    '{"sent": 8000, "delivered": 7920, "opened": 4752, "clicked": 1584, "converted": 380, "revenue": 95000, "cost": 4800, "roi": 19.8}',
    ARRAY['recurring', 'monthly', 'sustainer'],
    '{"program_name": "Circle of Hope", "avg_monthly_gift": 25, "active_sustainers": 380}'
);

-- ============================================================================
-- DEMO DONORS (for Hope Foundation)
-- ============================================================================

-- Major donors
INSERT INTO donors (
    id, client_id, first_name, last_name, email, phone,
    address, age,
    total_donated, donation_count, average_donation,
    first_donation_date, last_donation_date,
    engagement_score, churn_risk, lifetime_value, status,
    preferences, tags, custom_fields
)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Robert',
    'Anderson',
    'robert.anderson@email.com',
    '+1-555-1001',
    '{"street": "123 Oak Lane", "city": "New York", "state": "NY", "zipCode": "10001", "country": "USA"}',
    58,
    15500.00,
    12,
    1291.67,
    '2022-03-15 00:00:00+00',
    '2024-12-20 00:00:00+00',
    95.00,
    'low',
    18000.00,
    'active',
    '{"communicationChannel": "email", "frequency": "monthly", "topics": ["impact_stories", "events"], "emailOptIn": true, "smsOptIn": false, "mailingListOptIn": true}',
    ARRAY['major_donor', 'board_prospect', 'event_attendee'],
    '{"company": "Anderson Consulting", "profession": "Business Consultant", "interests": ["education", "food_security"]}'
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Jennifer',
    'Williams',
    'j.williams@email.com',
    '+1-555-1002',
    '{"street": "456 Maple Ave", "city": "Boston", "state": "MA", "zipCode": "02101", "country": "USA"}',
    45,
    8200.00,
    18,
    455.56,
    '2021-06-10 00:00:00+00',
    '2024-11-30 00:00:00+00',
    88.00,
    'low',
    10000.00,
    'active',
    '{"communicationChannel": "email", "frequency": "weekly", "topics": ["newsletters", "urgent_appeals"], "emailOptIn": true, "smsOptIn": true, "mailingListOptIn": true}',
    ARRAY['loyal_donor', 'volunteer', 'monthly_sustainer'],
    '{"volunteer_hours": 120, "skills": ["marketing", "social_media"]}'
),
(
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'David',
    'Thompson',
    'david.t@email.com',
    NULL,
    '{"street": "789 Pine St", "city": "Chicago", "state": "IL", "zipCode": "60601", "country": "USA"}',
    62,
    12800.00,
    8,
    1600.00,
    '2023-01-20 00:00:00+00',
    '2024-12-15 00:00:00+00',
    92.00,
    'low',
    15000.00,
    'active',
    '{"communicationChannel": "mail", "frequency": "quarterly", "topics": ["impact_stories"], "emailOptIn": false, "smsOptIn": false, "mailingListOptIn": true}',
    ARRAY['major_donor', 'legacy_prospect'],
    '{"company": "Thompson Industries", "foundation": "Thompson Family Foundation"}'
),

-- Mid-level donors
(
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Maria',
    'Garcia',
    'maria.garcia@email.com',
    '+1-555-1004',
    '{"street": "321 Elm Dr", "city": "Los Angeles", "state": "CA", "zipCode": "90001", "country": "USA"}',
    38,
    2400.00,
    24,
    100.00,
    '2020-09-05 00:00:00+00',
    '2024-12-01 00:00:00+00',
    85.00,
    'low',
    3000.00,
    'active',
    '{"communicationChannel": "email", "frequency": "monthly", "topics": ["newsletters", "events"], "emailOptIn": true, "smsOptIn": true, "mailingListOptIn": true}',
    ARRAY['monthly_sustainer', 'social_advocate'],
    '{"referrals": 3, "social_shares": 45}'
),
(
    '20000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'James',
    'Miller',
    'james.miller@email.com',
    '+1-555-1005',
    '{"street": "654 Birch Ln", "city": "Seattle", "state": "WA", "zipCode": "98101", "country": "USA"}',
    51,
    1800.00,
    15,
    120.00,
    '2022-02-14 00:00:00+00',
    '2024-10-30 00:00:00+00',
    78.00,
    'medium',
    2200.00,
    'active',
    '{"communicationChannel": "email", "frequency": "monthly", "topics": ["newsletters"], "emailOptIn": true, "smsOptIn": false, "mailingListOptIn": true}',
    ARRAY['regular_donor'],
    '{}'
);

-- ============================================================================
-- DEMO DONATIONS
-- ============================================================================

-- Major donor donations
INSERT INTO donations (donor_id, client_id, campaign_id, amount_cents, currency, date, method, is_recurring, source, channel)
VALUES
-- Robert Anderson
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 250000, 'USD', '2024-12-20 14:30:00+00', 'credit_card', false, 'website', 'email'),
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 100000, 'USD', '2024-11-15 10:00:00+00', 'check', false, 'direct_mail', 'mail'),

-- Jennifer Williams (monthly sustainer)
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 5000, 'USD', '2024-12-01 09:00:00+00', 'credit_card', true, 'website', 'email'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 5000, 'USD', '2024-11-01 09:00:00+00', 'credit_card', true, 'website', 'email'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 5000, 'USD', '2024-10-01 09:00:00+00', 'credit_card', true, 'website', 'email'),

-- David Thompson
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 300000, 'USD', '2024-12-15 16:45:00+00', 'bank_transfer', false, 'phone', 'phone'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', NULL, 200000, 'USD', '2024-06-30 12:00:00+00', 'check', false, 'direct_mail', 'mail'),

-- Maria Garcia (monthly sustainer)
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 2500, 'USD', '2024-12-01 08:30:00+00', 'credit_card', true, 'website', 'email'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 2500, 'USD', '2024-11-01 08:30:00+00', 'credit_card', true, 'website', 'email'),

-- James Miller
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 15000, 'USD', '2024-10-30 11:20:00+00', 'credit_card', false, 'email', 'email');

-- ============================================================================
-- DEMO SEGMENTS
-- ============================================================================

INSERT INTO audience_segments (
    id, client_id, name, description, type, status,
    rules, config, size, tags, priority
)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Major Donors',
    'Donors who have given $5,000+ lifetime or $1,000+ in a single gift',
    'dynamic',
    'active',
    '{"operator": "OR", "rules": [{"field": "total_donated", "operator": "greater_equal", "value": 5000}, {"field": "largest_gift", "operator": "greater_equal", "value": 1000}]}',
    '{"updateFrequency": "daily", "autoUpdate": true, "minSize": 10}',
    3,
    ARRAY['major_gifts', 'high_value'],
    'high'
),
(
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Monthly Sustainers',
    'Active recurring donors on monthly giving program',
    'dynamic',
    'active',
    '{"operator": "AND", "rules": [{"field": "has_recurring", "operator": "equals", "value": true}, {"field": "status", "operator": "equals", "value": "active"}]}',
    '{"updateFrequency": "daily", "autoUpdate": true, "minSize": 50}',
    2,
    ARRAY['recurring', 'sustainers'],
    'high'
),
(
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Lapsed Donors (6-12 months)',
    'Donors who gave in the past but not in the last 6 months',
    'dynamic',
    'active',
    '{"operator": "AND", "rules": [{"field": "last_donation_date", "operator": "between", "value": ["2024-01-01", "2024-06-01"]}, {"field": "donation_count", "operator": "greater_than", "value": 0}]}',
    '{"updateFrequency": "weekly", "autoUpdate": true, "minSize": 100}',
    0,
    ARRAY['reactivation', 'lapsed'],
    'medium'
);

-- ============================================================================
-- DEMO SEGMENT MEMBERSHIPS
-- ============================================================================

INSERT INTO segment_memberships (segment_id, donor_id, client_id, score)
VALUES
-- Major Donors
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 95.0),
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 88.0),
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 92.0),

-- Monthly Sustainers
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 88.0),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 85.0);

-- ============================================================================
-- DEMO NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (client_id, type, severity, title, message, entity_type, entity_id, metadata)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'milestone',
    'high',
    'Campaign Goal Exceeded!',
    'Year-End Giving Campaign 2024 has exceeded its goal of $250,000 by 15%! Total raised: $287,500.',
    'campaign',
    '10000000-0000-0000-0000-000000000001',
    '{"goal": 250000, "raised": 287500, "percentage": 115}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'info',
    'medium',
    'New Major Gift Received',
    'David Thompson made a $3,000 donation via bank transfer.',
    'donor',
    '20000000-0000-0000-0000-000000000003',
    '{"amount": 3000, "method": "bank_transfer"}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'warning',
    'medium',
    'Campaign Performance Alert',
    'Spring Renewal Campaign is at 56% of goal with 30 days remaining.',
    'campaign',
    '10000000-0000-0000-0000-000000000002',
    '{"goal": 75000, "raised": 42300, "percentage": 56, "days_left": 30}'
);

-- ============================================================================
-- DEMO SCHEDULED EXPORTS
-- ============================================================================

INSERT INTO scheduled_exports (
    id, client_id, created_by, name, description,
    export_type, format, spec, cadence, timezone,
    is_active, next_run_at, delivery_method
)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM profiles LIMIT 1), -- Will use first profile, adjust as needed
    'Monthly Donor Report',
    'Comprehensive monthly report of all donors and donations',
    'donors',
    'csv',
    '{"filters": {"status": "active"}, "columns": ["first_name", "last_name", "email", "total_donated", "donation_count", "last_donation_date"]}',
    'monthly',
    'America/New_York',
    true,
    '2025-02-01 09:00:00+00',
    'download'
);

-- ============================================================================
-- DEMO ANONYMOUS ANALYTICS DATA
-- ============================================================================

-- Create anonymous identities (hashed)
INSERT INTO anon_identities (client_id, email_hash, anon_id)
SELECT
    client_id,
    encode(digest(email, 'sha256'), 'hex'),
    'anon_' || encode(digest(email || 'salt', 'md5'), 'hex')
FROM donors
WHERE email IS NOT NULL;

-- Create giving patterns from donor data
INSERT INTO giving_patterns (
    client_id, anon_id,
    frequency_score, engagement_score, loyalty_score,
    giving_size_category, primary_campaign_types,
    seasonality_pattern, last_engagement_date
)
SELECT
    d.client_id,
    ai.anon_id,
    CASE
        WHEN d.donation_count >= 12 THEN 95.0
        WHEN d.donation_count >= 6 THEN 75.0
        WHEN d.donation_count >= 3 THEN 50.0
        ELSE 25.0
    END as frequency_score,
    d.engagement_score,
    CASE
        WHEN EXTRACT(YEAR FROM AGE(NOW(), d.first_donation_date)) >= 2 THEN 90.0
        WHEN EXTRACT(YEAR FROM AGE(NOW(), d.first_donation_date)) >= 1 THEN 70.0
        ELSE 40.0
    END as loyalty_score,
    CASE
        WHEN d.average_donation >= 1000 THEN 'major'::text
        WHEN d.average_donation >= 500 THEN 'large'::text
        WHEN d.average_donation >= 100 THEN 'medium'::text
        ELSE 'small'::text
    END as giving_size_category,
    ARRAY['email', 'direct_mail']::text[],
    'year_end'::text as seasonality_pattern,
    d.last_donation_date
FROM donors d
JOIN anon_identities ai ON ai.client_id = d.client_id AND ai.email_hash = encode(digest(d.email, 'sha256'), 'hex')
WHERE d.email IS NOT NULL;

-- Create behavioral events from donations
INSERT INTO behavioral_events (client_id, anon_id, event_type, campaign_id, channel, occurred_at, context)
SELECT
    don.client_id,
    ai.anon_id,
    'donation'::text as event_type,
    don.campaign_id,
    don.channel,
    don.date as occurred_at,
    jsonb_build_object(
        'amount_category', CASE
            WHEN don.amount_cents >= 100000 THEN 'major'
            WHEN don.amount_cents >= 50000 THEN 'large'
            WHEN don.amount_cents >= 10000 THEN 'medium'
            ELSE 'small'
        END,
        'method', don.method,
        'is_recurring', don.is_recurring
    ) as context
FROM donations don
JOIN donors d ON d.id = don.donor_id
JOIN anon_identities ai ON ai.client_id = d.client_id AND ai.email_hash = encode(digest(d.email, 'sha256'), 'hex')
WHERE d.email IS NOT NULL;

-- Create donor cohorts
INSERT INTO donor_cohorts (client_id, name, cohort_period, cohort_type, initial_size, current_size, description)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '2024 Q4 Acquisitions',
    '2024-Q4',
    'acquisition',
    150,
    145,
    'Donors acquired during Q4 2024 year-end campaign'
),
(
    '00000000-0000-0000-0000-000000000001',
    '2024 Q1 Acquisitions',
    '2024-Q1',
    'acquisition',
    80,
    65,
    'Donors acquired during Q1 2024'
);

-- Create retention metrics for cohorts
INSERT INTO cohort_retention_metrics (cohort_id, period, period_offset, active_count, retention_rate, average_engagement_score)
VALUES
-- Q4 2024 cohort
((SELECT id FROM donor_cohorts WHERE cohort_period = '2024-Q4' LIMIT 1), '2024-Q4', 0, 150, 1.0000, 75.0),
-- Q1 2024 cohort (showing retention decline over time)
((SELECT id FROM donor_cohorts WHERE cohort_period = '2024-Q1' LIMIT 1), '2024-Q1', 0, 80, 1.0000, 70.0),
((SELECT id FROM donor_cohorts WHERE cohort_period = '2024-Q1' LIMIT 1), '2024-Q2', 1, 75, 0.9375, 68.0),
((SELECT id FROM donor_cohorts WHERE cohort_period = '2024-Q1' LIMIT 1), '2024-Q3', 2, 70, 0.8750, 65.0),
((SELECT id FROM donor_cohorts WHERE cohort_period = '2024-Q1' LIMIT 1), '2024-Q4', 3, 65, 0.8125, 63.0);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Nexus Seed Data Migration Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 3 demo clients';
    RAISE NOTICE '  - 3 campaigns';
    RAISE NOTICE '  - 5 donors';
    RAISE NOTICE '  - 10+ donations';
    RAISE NOTICE '  - 3 segments';
    RAISE NOTICE '  - 3 notifications';
    RAISE NOTICE '  - 1 scheduled export';
    RAISE NOTICE '  - Anonymous analytics data';
    RAISE NOTICE '  - 2 donor cohorts with retention metrics';
    RAISE NOTICE '========================================';
END $$;
