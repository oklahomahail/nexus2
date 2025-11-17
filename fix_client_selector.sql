-- Fix for empty client selector
-- This adds demo clients and a policy to view them

-- Step 1: Insert demo clients (if they don't exist)
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
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add RLS policy to allow viewing demo clients (for development)
-- This allows unauthenticated/demo users to see demo clients
CREATE POLICY "Allow viewing demo clients"
    ON clients FOR SELECT
    USING (
        -- Allow viewing clients with demo UUIDs (starting with 00000000)
        id::text LIKE '00000000-%'
    );
