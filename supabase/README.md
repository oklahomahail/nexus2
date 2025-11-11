# Nexus Supabase Setup Guide

Complete guide to setting up and deploying Nexus's privacy-first Supabase backend.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Schema Architecture](#schema-architecture)
- [Migrations](#migrations)
- [Environment Setup](#environment-setup)
- [Running Migrations](#running-migrations)
- [TypeScript Integration](#typescript-integration)
- [Next Steps](#next-steps)

---

## Overview

Nexus uses Supabase for:

- **Authentication** - User sign-up, login, and session management
- **Postgres Database** - Client-scoped data with Row Level Security (RLS)
- **Privacy-First Analytics** - Anonymous behavioral tracking without PII
- **Real-time (Optional)** - Live updates via subscriptions (currently polling-first)

### Key Design Principles

- **Privacy-First**: No PII in analytics tables; anonymous IDs only
- **Client-Scoped**: All data scoped to organizations via `client_id`
- **Role-Based Access**: Owner/Admin/Editor/Viewer roles enforced via RLS
- **Deterministic Analytics**: Aggregations and cohorts for GDPR/CCPA compliance

---

## Prerequisites

1. **Supabase Account** - Sign up at [https://app.supabase.com](https://app.supabase.com)
2. **Supabase CLI** - Install via npm:
   ```bash
   npm install -g supabase
   ```
3. **Node.js** - v18+ recommended
4. **PostgreSQL Knowledge** - Basic understanding helpful

---

## Quick Start

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: Nexus Production (or your choice)
   - **Database Password**: Strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to provision (~2 minutes)

### 2. Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **Project API Key (anon, public)** (starts with `eyJ...`)

### 3. Configure Environment Variables

Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 5. Run Migrations

Using Supabase CLI (recommended):

```bash
# Link to your project
supabase link --project-ref your-project-id

# Run all migrations
supabase db push
```

Or manually via Supabase Dashboard:

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy contents of each migration file (in order):
   - `20250110000000_nexus_initial_schema.sql`
   - `20250110000001_rls_policies.sql`
   - `20250110000002_seed_demo_data.sql`
3. Execute each in order

### 6. Verify Installation

```bash
# Test connection
npm run dev

# Check tables exist
# In Supabase Dashboard → Table Editor, you should see:
# - clients, profiles, campaigns, donors, donations
# - behavioral_events, giving_patterns, donor_cohorts
# - notifications, scheduled_exports, etc.
```

---

## Schema Architecture

### Core Tables (Operational Data)

| Table | Purpose | PII? |
|-------|---------|------|
| `clients` | Organization/nonprofit entities | Minimal |
| `profiles` | User profiles (extends auth.users) | Yes |
| `client_memberships` | User-to-client access control | No |
| `campaigns` | Fundraising campaigns | No |
| `donors` | Donor contact info | **YES** |
| `donations` | Individual transactions | No |

### Analytics Tables (Privacy-First)

| Table | Purpose | PII? |
|-------|---------|------|
| `anon_identities` | Email hash → anonymous ID mapping | **No** (one-way hash) |
| `behavioral_events` | Anonymous interaction tracking | No |
| `giving_patterns` | Behavioral scores (no amounts) | No |
| `donor_cohorts` | Time-based donor groups | No |
| `cohort_retention_metrics` | Cohort retention over time | No |

### Supporting Tables

| Table | Purpose |
|-------|---------|
| `audience_segments` | Segmentation definitions |
| `segment_memberships` | Donor-to-segment mappings |
| `notifications` | System notifications |
| `scheduled_exports` | Export job definitions |
| `export_jobs` | Export execution history |
| `activity_log` | Audit trail |

---

## Migrations

### Migration Files

Migrations are located in `/supabase/migrations/` and run in order:

1. **`20250110000000_nexus_initial_schema.sql`**
   - Creates all tables
   - Adds indexes for performance
   - Sets up triggers (updated_at, donor aggregates)

2. **`20250110000001_rls_policies.sql`**
   - Enables Row Level Security (RLS)
   - Creates helper functions (`can_access_client`, `can_write_client`, etc.)
   - Adds policies for all tables
   - Auto-create profile and membership triggers

3. **`20250110000002_seed_demo_data.sql`**
   - Creates 3 demo clients (Hope Foundation, Green Earth Alliance, Education for All)
   - Adds 3 campaigns, 5 donors, 10+ donations
   - Seeds segments, notifications, scheduled exports
   - Generates anonymous analytics data

### Running Migrations Manually

If you prefer to run migrations manually:

```sql
-- In Supabase SQL Editor, run each file in order
-- Copy/paste contents and execute

-- 1. Initial schema
\i supabase/migrations/20250110000000_nexus_initial_schema.sql

-- 2. RLS policies
\i supabase/migrations/20250110000001_rls_policies.sql

-- 3. Seed data (optional, for testing)
\i supabase/migrations/20250110000002_seed_demo_data.sql
```

---

## Environment Setup

### Development Environment

Create `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key

# Claude AI
VITE_CLAUDE_API_KEY=your-claude-api-key

# API
VITE_API_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:4000/api

# Debug
VITE_ENABLE_DEBUG=true
```

### Production Environment

For Vercel deployment, add these environment variables in **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

### Testing Environment (Optional)

For isolated testing, create a separate Supabase project:

```env
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-test-anon-key
```

---

## Running Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Install CLI globally
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push all migrations
supabase db push

# Or run a specific migration
supabase db push --migration-name 20250110000000_nexus_initial_schema
```

### Option 2: Supabase Dashboard

1. Open [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy/paste migration file contents
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. Repeat for each migration in order

### Option 3: psql (Advanced)

```bash
# Get connection string from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/20250110000000_nexus_initial_schema.sql
\i supabase/migrations/20250110000001_rls_policies.sql
\i supabase/migrations/20250110000002_seed_demo_data.sql
```

---

## TypeScript Integration

### Generated Types

TypeScript types are in `/src/types/database.types.ts` and match the schema exactly.

### Usage

```typescript
import { supabase } from '@/lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabaseClient'

// Type-safe queries
type Client = Tables<'clients'>
type ClientInsert = TablesInsert<'clients'>
type ClientUpdate = TablesUpdate<'clients'>

// Query with types
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('is_active', true)

// data is automatically typed as Client[]
```

### Regenerating Types

If you modify the schema, regenerate types:

```bash
# Using Supabase CLI
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts

# Or use the type generator
npm run types:generate
```

---

## Next Steps

Now that your Supabase backend is set up, here are the recommended next steps:

### 1. Wire Notifications API to Supabase

**File**: `/src/services/notificationService.ts`

Replace the mock API with Supabase queries:

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function fetchNotifications(since?: string, clientId?: string) {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (since) {
    query = query.gt('created_at', since)
  }

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as 'info' | 'success' | 'warning' | 'error',
    timestamp: n.created_at,
    read: !!n.read_at,
    clientId: n.client_id || undefined,
  }))
}
```

### 2. Implement Scheduled Exports MVP

Create an Edge Function or cron job that:

1. Queries `scheduled_exports` for `is_active = true` and `next_run_at <= NOW()`
2. Generates CSV using your existing export helpers
3. Creates `export_jobs` record with status and artifact URL
4. Sends notification on completion

### 3. Migrate Client Service to Supabase

**File**: `/src/services/realClientService.ts`

Replace mock storage with Supabase:

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function getAllClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}
```

### 4. Port Analytics Infrastructure

Map your deterministic analytics to Supabase views:

```sql
-- Create materialized view for campaign KPIs
CREATE MATERIALIZED VIEW mv_campaign_kpis AS
SELECT
  c.id as campaign_id,
  c.client_id,
  c.name,
  c.raised_amount,
  COUNT(DISTINCT d.donor_id) as donor_count,
  AVG(d.amount_cents / 100.0) as avg_gift,
  SUM(d.amount_cents / 100.0) as total_revenue,
  c.marketing_cost,
  CASE
    WHEN c.marketing_cost > 0 THEN (c.raised_amount - c.marketing_cost) / c.marketing_cost
    ELSE 0
  END as roi
FROM campaigns c
LEFT JOIN donations d ON d.campaign_id = c.id
GROUP BY c.id;

-- Refresh on a schedule
CREATE INDEX ON mv_campaign_kpis(client_id, campaign_id);
```

### 5. Add Authentication

Integrate Supabase Auth with your existing `AuthContext`:

```typescript
import { supabase } from '@/lib/supabaseClient'

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.display_name || data.user.email!,
      role: 'admin', // Get from profiles table
      roles: ['admin'],
    },
    tokens: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    },
  }
}
```

### 6. Enable Realtime (Optional)

If you decide to move from polling to realtime:

```typescript
// Subscribe to campaign changes
const subscription = supabase
  .channel('campaign-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'campaigns',
      filter: `client_id=eq.${clientId}`,
    },
    (payload) => {
      console.log('Campaign updated:', payload)
      // Invalidate cache or update state
    }
  )
  .subscribe()

// Cleanup
return () => {
  subscription.unsubscribe()
}
```

---

## Troubleshooting

### Migration Errors

**Error**: "relation already exists"
- Solution: Drop conflicting tables or reset database via **Database** → **Reset**

**Error**: "permission denied"
- Solution: Check RLS policies or use service role key for admin operations

**Error**: "function does not exist"
- Solution: Ensure migration `20250110000001_rls_policies.sql` ran successfully

### Connection Issues

**Error**: "Invalid API key"
- Solution: Double-check `VITE_SUPABASE_ANON_KEY` in `.env`

**Error**: "Network error"
- Solution: Verify `VITE_SUPABASE_URL` is correct and project is active

### RLS Issues

**Error**: "new row violates row-level security policy"
- Solution: Check user is authenticated and has correct role in `client_memberships`

**Debugging RLS**:
```sql
-- Test RLS as specific user
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-id-here"}';
SELECT * FROM clients; -- Should only see allowed clients
```

---

## Resources

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase CLI Docs**: [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
- **PostgreSQL Docs**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **Inkwell Reference**: `/Users/davehail/Developer/inkwell` (for proven patterns)
- **Nexus Docs**: See `/SUPABASE_DOCS_INDEX.md` for Inkwell pattern documentation

---

## Support

For issues or questions:

1. Check [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review Inkwell implementation in `/Users/davehail/Developer/inkwell`
3. Contact Nexus development team

---

**Last Updated**: 2025-01-10
**Schema Version**: 1.0.0
**Migration Count**: 3
