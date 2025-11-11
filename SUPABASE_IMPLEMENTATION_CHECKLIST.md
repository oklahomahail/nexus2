# Supabase Implementation Checklist

Track your progress implementing the Nexus Supabase backend.

## Phase 1: Foundation ✅ COMPLETE

- [x] Design privacy-first schema
- [x] Create initial migration files
- [x] Add RLS policies for client-scoped access
- [x] Generate TypeScript types from schema
- [x] Create Supabase client setup and env wiring
- [x] Add seed data for demo clients and campaigns

**Files Created**:

- ✅ `/supabase/migrations/20250110000000_nexus_initial_schema.sql`
- ✅ `/supabase/migrations/20250110000001_rls_policies.sql`
- ✅ `/supabase/migrations/20250110000002_seed_demo_data.sql`
- ✅ `/src/types/database.types.ts`
- ✅ `/src/lib/supabaseClient.ts`
- ✅ `/supabase/README.md`
- ✅ `.env.example` (updated with Supabase vars)

---

## Phase 2: Supabase Project Setup ⏳ IN PROGRESS

### 2.1 Create Supabase Project

- [ ] Sign up / log in to [https://app.supabase.com](https://app.supabase.com)
- [ ] Create new project:
  - [ ] Name: "Nexus Production" (or your choice)
  - [ ] Database password: (save securely!)
  - [ ] Region: (closest to users)
- [ ] Wait for provisioning (~2 minutes)
- [ ] Copy Project URL and Anon Key from **Settings** → **API**

### 2.2 Configure Environment

- [ ] Add to `.env`:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] Install Supabase dependency:
  ```bash
  npm install @supabase/supabase-js
  ```

### 2.3 Run Migrations

**Option A: Supabase CLI (Recommended)**

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-id
supabase db push
```

**Option B: Supabase Dashboard**

- [ ] Go to SQL Editor
- [ ] Run `20250110000000_nexus_initial_schema.sql`
- [ ] Run `20250110000001_rls_policies.sql`
- [ ] Run `20250110000002_seed_demo_data.sql` (optional seed data)

### 2.4 Verify Setup

- [ ] Check Table Editor shows all tables
- [ ] Verify demo data exists (clients, campaigns, donors)
- [ ] Test connection:
  ```bash
  npm run dev
  # Should start without Supabase errors
  ```

---

## Phase 3: Wire Notifications API 🔜 NEXT

**Priority**: Current sprint item

**File**: `/src/services/notificationService.ts`

- [ ] Replace mock `fetchNotifications` with Supabase query
- [ ] Implement `markNotificationAsRead`
- [ ] Implement `markAllNotificationsAsRead`
- [ ] Update `NotificationsContext` to use real API
- [ ] Add empty state handling
- [ ] Add error fallbacks
- [ ] Test with demo data

**Acceptance Criteria**:

- Notifications load from Supabase
- `since` parameter filters correctly
- `clientId` scoping works
- Read/unread state persists

**Estimated Time**: 1-2 hours

---

## Phase 4: Scheduled Exports MVP 🔜 NEXT

**Priority**: Current sprint item

**Tasks**:

### 4.1 Backend: Edge Function or Cron

- [ ] Create Supabase Edge Function: `scheduled-export-runner`
- [ ] Query `scheduled_exports` WHERE `is_active = true` AND `next_run_at <= NOW()`
- [ ] For each export:
  - [ ] Create `export_jobs` record (status: 'running')
  - [ ] Generate CSV using existing helpers
  - [ ] Upload to Supabase Storage
  - [ ] Update `export_jobs` (status: 'completed', artifact_url)
  - [ ] Create notification
  - [ ] Update `scheduled_exports.next_run_at`
- [ ] Add error handling (update `export_jobs` status: 'failed')

### 4.2 Frontend: Export UI

- [ ] Create `/src/components/ScheduledExports.tsx`
- [ ] List scheduled exports for current client
- [ ] Show recent export jobs with download links
- [ ] Add "Run Now" button for testing
- [ ] Integrate into ExportPanel or Settings

**Acceptance Criteria**:

- Scheduled exports run on cadence
- Artifacts stored and downloadable
- Notifications sent on completion
- Error handling for failed exports

**Estimated Time**: 4-5 hours

---

## Phase 5: Migrate Client Service 🔜 UPCOMING

**File**: `/src/services/realClientService.ts`

- [ ] Replace `getAllClients` with Supabase query
- [ ] Replace `getClientById` with Supabase query
- [ ] Replace `createClient` with Supabase insert
- [ ] Replace `updateClient` with Supabase update
- [ ] Replace `deleteClient` with soft delete (set `deleted_at`)
- [ ] Update `ClientContext` to use Supabase
- [ ] Remove localStorage fallback (optional: keep for offline)

**Acceptance Criteria**:

- All client CRUD operations work via Supabase
- RLS policies enforced (can't see other clients)
- Optimistic updates for UX
- Error handling and rollback

**Estimated Time**: 2-3 hours

---

## Phase 6: Analytics Infrastructure 🔜 UPCOMING

**Goal**: Port deterministic analytics to Supabase

### 6.1 Campaign Analytics

- [ ] Create materialized view: `mv_campaign_kpis`
  - Metrics: raised, donors, avg_gift, roi
  - Refresh strategy: on-demand or scheduled
- [ ] Update `analyticsService.getClientAnalytics` to query Supabase
- [ ] Add revenue over time query
- [ ] Add donor segments query
- [ ] Test with demo data

### 6.2 Donor Analytics (Privacy-First)

- [ ] Implement anonymous ID generation:
  - [ ] Create helper: `generateAnonId(email: string)`
  - [ ] Use SHA-256 hash with salt
- [ ] Create behavioral event tracking:
  - [ ] Track donation events
  - [ ] Track email opens/clicks (future)
  - [ ] Track campaign responses
- [ ] Implement segment analytics:
  - [ ] Query giving patterns
  - [ ] Aggregate by segment
  - [ ] Enforce minimum cohort size (≥50)
- [ ] Add cohort analysis:
  - [ ] Retention rates over time
  - [ ] Engagement trends

**Acceptance Criteria**:

- Analytics queries return real data from Supabase
- No PII exposed in analytics tables
- Aggregations meet privacy thresholds
- Performance acceptable (<2s for dashboards)

**Estimated Time**: 8-10 hours

---

## Phase 7: Authentication Integration 🔜 FUTURE

**File**: `/src/context/AuthContext.tsx`

- [ ] Replace mock auth with Supabase Auth
- [ ] Implement `login` (signInWithPassword)
- [ ] Implement `register` (signUp)
- [ ] Implement `logout` (signOut)
- [ ] Implement `refreshToken` (auto-handled by Supabase)
- [ ] Add password reset flow
- [ ] Add email verification (optional)
- [ ] Test role-based access via `client_memberships`

**Acceptance Criteria**:

- Users can sign up and log in
- Sessions persist across page reloads
- RLS policies enforce access control
- Logout clears session

**Estimated Time**: 3-4 hours

---

## Phase 8: Campaign Service Migration 🔜 FUTURE

**Files**: `/src/models/campaigns.ts`, `/src/services/campaignService.ts`

- [ ] Migrate campaign CRUD to Supabase
- [ ] Add campaign analytics queries
- [ ] Implement campaign status updates
- [ ] Add performance tracking
- [ ] Integrate with existing UI

**Estimated Time**: 4-5 hours

---

## Phase 9: Donor & Donation Services 🔜 FUTURE

**Files**: `/src/models/donors.ts`, `/src/services/donorService.ts`

- [ ] Migrate donor CRUD to Supabase
- [ ] Implement donation tracking
- [ ] Add donor segmentation queries
- [ ] Integrate anonymous analytics pipeline:
  - [ ] On donation: create behavioral_event
  - [ ] Update giving_patterns
  - [ ] Refresh cohort metrics
- [ ] Add GDPR compliance helpers (export, delete)

**Estimated Time**: 6-8 hours

---

## Phase 10: Realtime (Optional) 🔮 DEFERRED

**Goal**: Add realtime subscriptions for live updates

- [ ] Enable Realtime in Supabase project
- [ ] Subscribe to campaign changes
- [ ] Subscribe to notification changes
- [ ] Update UI on realtime events
- [ ] Add connection status indicator
- [ ] Graceful fallback to polling

**Note**: Currently polling-first is preferred. Only implement if use case demands it.

**Estimated Time**: 4-6 hours

---

## Testing Checklist

### Unit Tests

- [ ] Test Supabase client initialization
- [ ] Test RLS helper functions
- [ ] Test type safety (compile-time checks)

### Integration Tests

- [ ] Test full auth flow (signup → login → logout)
- [ ] Test client CRUD with RLS enforcement
- [ ] Test campaign + donation aggregates
- [ ] Test anonymous analytics pipeline
- [ ] Test scheduled exports end-to-end

### Manual Testing

- [ ] Create test user and client
- [ ] Add campaigns and donors
- [ ] Generate donations
- [ ] Verify analytics accuracy
- [ ] Test export downloads
- [ ] Verify notifications appear
- [ ] Test role-based access (viewer can't edit)

---

## Performance Checklist

- [ ] Add indexes to frequently queried columns
- [ ] Create materialized views for expensive aggregations
- [ ] Set up scheduled refresh for MVs (pg_cron or Edge Function)
- [ ] Enable connection pooling (Supabase default: PgBouncer)
- [ ] Monitor query performance via Supabase Dashboard → Performance
- [ ] Add caching layer (optional: Redis or in-memory)

---

## Security Checklist

- [ ] Verify all tables have RLS enabled
- [ ] Test RLS policies (can't access other clients' data)
- [ ] Review service role usage (only for background jobs)
- [ ] Enable 2FA for Supabase account
- [ ] Rotate API keys if exposed
- [ ] Set up database backups (Supabase default: daily)
- [ ] Add rate limiting for auth endpoints
- [ ] Review activity log for suspicious access

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run all migrations on production Supabase project
- [ ] Verify seed data (or skip if not needed)
- [ ] Set environment variables in Vercel
- [ ] Test connection from deployed app

### Deployment

- [ ] Deploy to Vercel
- [ ] Verify Supabase connection works
- [ ] Test auth flow in production
- [ ] Check analytics queries return data
- [ ] Monitor error logs (Vercel + Supabase)

### Post-Deployment

- [ ] Create first production client
- [ ] Invite team members
- [ ] Run test campaign
- [ ] Set up monitoring alerts (Supabase + Vercel)
- [ ] Document any production-specific quirks

---

## Monitoring & Maintenance

### Regular Tasks

- [ ] Weekly: Review Supabase logs for errors
- [ ] Weekly: Check database size and growth
- [ ] Monthly: Review RLS policy effectiveness
- [ ] Monthly: Optimize slow queries
- [ ] Quarterly: Review and archive old data

### Alerts to Set Up

- [ ] Database storage > 80% capacity
- [ ] API error rate > 5%
- [ ] Slow query (>2s)
- [ ] Failed scheduled exports
- [ ] Auth failures spike

---

## Timeline Estimate

| Phase     | Description                            | Hours        | Status         |
| --------- | -------------------------------------- | ------------ | -------------- |
| 1         | Foundation (schema, migrations, types) | 6            | ✅ Complete    |
| 2         | Supabase project setup                 | 1            | ⏳ In Progress |
| 3         | Wire notifications API                 | 2            | 🔜 Next        |
| 4         | Scheduled exports MVP                  | 5            | 🔜 Next        |
| 5         | Migrate client service                 | 3            | 🔜 Upcoming    |
| 6         | Analytics infrastructure               | 10           | 🔜 Upcoming    |
| 7         | Authentication integration             | 4            | 🔜 Future      |
| 8         | Campaign service migration             | 5            | 🔜 Future      |
| 9         | Donor & donation services              | 8            | 🔜 Future      |
| 10        | Realtime (optional)                    | 6            | 🔮 Deferred    |
| **Total** |                                        | **50 hours** |                |

**Recommended Sprint**: Phases 2-4 (8 hours) aligns with your current priorities.

---

## Success Criteria

### Minimal Viable Backend (MVP)

- ✅ Supabase project provisioned
- ✅ Migrations applied successfully
- ✅ Notifications API wired to Supabase
- ✅ Scheduled exports working end-to-end
- ✅ Client service migrated from mocks
- ✅ Basic analytics querying real data

### Full Production Ready

- All services migrated to Supabase
- Authentication integrated
- Privacy-first analytics fully operational
- RLS policies tested and verified
- Monitoring and alerts configured
- Performance optimized (<2s page loads)
- GDPR/CCPA compliance verified

---

**Last Updated**: 2025-01-10
**Phase Complete**: 1 / 10
**Estimated Completion**: ~50 hours of focused work
