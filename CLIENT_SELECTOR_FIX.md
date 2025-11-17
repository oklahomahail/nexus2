# Client Selector Fix - Empty Dropdown Issue

## Problem
The client selector dropdown is empty because:
1. ❌ No clients exist in the database
2. ❌ RLS policies require authenticated users with `client_memberships`
3. ❌ Seed data migration was never executed on remote database

## Root Cause Analysis

### Database State
```bash
# Query confirms zero clients:
curl "https://sdgkpehhzysjofcpvdbo.supabase.co/rest/v1/clients?select=*" \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"
# Returns: []
```

### RLS Policy Issue
From [supabase/migrations/20250110000001_rls_policies.sql](supabase/migrations/20250110000001_rls_policies.sql:103-105):
```sql
CREATE POLICY "Users can view clients they have access to"
    ON clients FOR SELECT
    USING (can_access_client(id));
```

This policy calls `can_access_client()` which checks `client_memberships`:
```sql
RETURN EXISTS (
    SELECT 1
    FROM client_memberships
    WHERE client_id = target_client_id
      AND user_id = auth.uid()
);
```

Without authentication or membership, **no clients will be visible**.

## Solution Options

### Option 1: Quick Dev Fix (Recommended for Testing)

Add a policy to allow viewing demo clients without authentication.

**File:** `fix_client_selector.sql`

```sql
-- 1. Insert demo clients
INSERT INTO clients (id, name, short_name, ...) VALUES (...);

-- 2. Add demo RLS policy
CREATE POLICY "Allow viewing demo clients"
    ON clients FOR SELECT
    USING (id::text LIKE '00000000-%');
```

**To Apply:**
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo/sql/new)
2. Copy and run `fix_client_selector.sql`
3. Refresh your Nexus app

**Pros:**
✅ Quick fix for development
✅ No authentication required for demo
✅ Demo clients always visible

**Cons:**
⚠️ Not production-ready
⚠️ Demo policy should be removed in production

---

### Option 2: Proper Production Fix

Ensure users are properly authenticated and have client memberships.

#### Step 1: Run Full Seed Migration

```bash
# In Supabase SQL Editor, run:
supabase/migrations/20250110000002_seed_demo_data.sql
```

This creates:
- 3 demo clients (Hope Foundation, Green Earth Alliance, Education for All)
- Sample campaigns, donors, donations
- Segments and analytics data

#### Step 2: Sign Up and Create Membership

After signing up, the trigger `create_profile_and_membership` should automatically:
1. Create a profile
2. Create an "owner" membership for new clients

**If this doesn't work automatically:**

```sql
-- Manually assign your user to a demo client
INSERT INTO client_memberships (client_id, user_id, role)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Hope Foundation
    'YOUR_USER_ID_FROM_auth.users',         -- Your auth.uid()
    'owner'
);
```

**Pros:**
✅ Production-ready
✅ Proper security model
✅ Multi-user support

**Cons:**
⚠️ Requires user signup
⚠️ More complex for quick testing

---

## Recommended Approach

For **local/dev environment**: Use **Option 1** (quick fix)
For **production deployment**: Use **Option 2** (proper auth)

### Implementation Steps (Option 1)

1. **Run SQL:**
   ```bash
   # Copy fix_client_selector.sql contents
   # Paste into: https://supabase.com/dashboard/project/sdgkpehhzysjofcpvdbo/sql/new
   # Click "Run"
   ```

2. **Verify clients exist:**
   ```bash
   curl "https://sdgkpehhzysjofcpvdbo.supabase.co/rest/v1/clients?select=id,name" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

3. **Test in Nexus:**
   - Refresh the app
   - Check client selector dropdown
   - Should show: Hope Foundation, Green Earth Alliance, Education for All

4. **If still empty, check browser console:**
   ```javascript
   // Look for errors in DevTools Console
   // Check Network tab for /clients API call
   ```

---

## Additional Context

### Migration Files
- Schema: [20250110000000_nexus_initial_schema.sql](supabase/migrations/20250110000000_nexus_initial_schema.sql)
- RLS Policies: [20250110000001_rls_policies.sql](supabase/migrations/20250110000001_rls_policies.sql)
- Seed Data: [20250110000002_seed_demo_data.sql](supabase/migrations/20250110000002_seed_demo_data.sql)

### Key Components
- Service: [src/services/clientService.ts](src/services/clientService.ts:82-96) - `list()` method
- Context: [src/context/ClientContext.tsx](src/context/ClientContext.tsx:35-43) - loads clients on mount
- Component: See explorer results for ClientSwitcherModal, ClientSwitcher

### Testing Checklist

After applying fix:
- [ ] Clients visible in selector dropdown
- [ ] Can select a client (e.g., Hope Foundation)
- [ ] Client context updates correctly
- [ ] Dashboard shows client-specific data
- [ ] No console errors related to RLS
