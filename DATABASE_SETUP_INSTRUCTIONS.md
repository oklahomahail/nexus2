# Nexus Database Setup Instructions

## Problem Summary

Your Nexus app was failing because:
1. **Missing database tables** - The Supabase project had no tables (404 errors)
2. **Invalid Sentry DSN** - Placeholder value was causing initialization errors

## Solution

### 1. Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo/sql/new
2. Open the file: `supabase/SETUP_DATABASE.sql`
3. Copy the entire contents and paste into the SQL Editor
4. Click **"Run"** to execute

**Option B: Using Supabase CLI** (if you have it installed)

```bash
npm install -g supabase
supabase link --project-ref sdgkpehhzysjofcpvdbo
supabase db push
```

### 2. Verify Tables Were Created

Run this test query in the SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- clients
- profiles
- client_memberships
- campaigns
- donors
- donations
- behavioral_events
- audience_segments
- notifications
- activity_log
- (and more...)

### 3. Test the API Endpoint

After running migrations, test that the API works:

```bash
curl "https://sdgkpehhzysjofcpvdbo.supabase.co/rest/v1/clients?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Expected response (for empty database):
```json
[]
```

NOT a 404 error!

### 4. Refresh Your Nexus App

Once tables exist:
1. Visit: https://app.leadwithnexus.com
2. The console errors should be gone
3. The "Select Client" and "New Client" buttons should work

## What Was Fixed

### Database Schema
Created a consolidated SQL migration that includes:
- All core tables (clients, campaigns, donors, donations, etc.)
- Row Level Security (RLS) policies for data isolation
- Indexes for performance
- Triggers for automatic timestamp updates
- Auto-profile creation on signup
- Activity logging

File: `supabase/SETUP_DATABASE.sql`

### Sentry Configuration
Fixed the Sentry initialization to skip when using placeholder DSN.

File: `src/lib/sentry.ts`

Changed:
```typescript
if (!SENTRY_DSN) {
  // Skip init
}
```

To:
```typescript
if (!SENTRY_DSN || SENTRY_DSN === "your_sentry_dsn_here") {
  // Skip init
}
```

## Next Steps

After the database is set up:

1. **Create your first client** - Use the "New Client" button
2. **Set up Sentry** (optional) - Add real Sentry DSN to Vercel env vars:
   ```
   VITE_SENTRY_DSN=https://your-real-dsn@sentry.io/project-id
   ```
3. **Seed demo data** (optional) - Run the seed migration:
   ```sql
   -- File: supabase/migrations/20250110000002_seed_demo_data.sql
   ```

## Troubleshooting

### Still getting 404 errors?
- Verify tables exist using the SQL query above
- Check that RLS policies were created: `\dp` in psql
- Ensure you're using the correct Supabase project

### Buttons still not working?
- Check browser console for errors
- Verify environment variables in Vercel
- Clear browser cache and hard refresh

### Authentication issues?
- Make sure you're logged in
- Check that your user has a profile in the `profiles` table
- Verify client_memberships are created when clients are added

## Support

If you encounter issues:
1. Check the browser console for specific error messages
2. Verify Supabase logs in the dashboard
3. Review the RLS policies in Supabase SQL Editor
