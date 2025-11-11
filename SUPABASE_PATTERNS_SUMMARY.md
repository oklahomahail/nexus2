# Inkwell Supabase Patterns - Executive Summary

## Documents Created

You now have comprehensive Supabase implementation guides in Nexus:

1. **INKWELL_SUPABASE_PATTERNS.md** (30 KB, 1068 lines)
   - Complete reference guide with all patterns from Inkwell
   - 12 major sections covering every aspect of the implementation
   - Code snippets for copy-paste integration
   - Security checklist and production guidelines

2. **SUPABASE_IMPLEMENTATION_GUIDE.md** (11 KB)
   - Quick-start guide for rapid implementation
   - Step-by-step integration instructions
   - Common errors and debugging tips
   - Testing and security checklists

---

## Key Patterns at a Glance

### 1. Client Setup (Copy-Paste Ready)

```typescript
// src/lib/supabaseClient.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Handles test vs production environments gracefully. Single singleton instance.

**Reference:** `/Users/davehail/Developer/inkwell/src/lib/supabaseClient.ts`

---

### 2. Schema Design (Table Structure)

| Table             | Purpose             | Key Features                       |
| ----------------- | ------------------- | ---------------------------------- |
| `profiles`        | User metadata       | Auto-created on signup via trigger |
| `projects`        | Org equivalent      | Ownership model, soft deletes      |
| `project_members` | User access control | Owner/Editor/Viewer roles          |
| `chapters`        | Content storage     | Timestamps, revision tracking      |
| `characters`      | Entity metadata     | JSONB for flexible fields          |
| `notes`           | Generic storage     | Array types, soft deletes          |

**Pattern:** Every table has:

- UUID primary key (gen_random_uuid)
- created_at, updated_at (timestamptz)
- deleted_at (timestamptz) for soft deletes
- Composite indexes on (owner/project_id, updated_at DESC)

**Reference:** `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000000_inkwell_schema.sql`

---

### 3. Row Level Security (RLS)

**Two-tier approach:**

**Read Access (can_access_project)**

- Owner has full access
- Members via project_members table
- Used in all SELECT policies

**Write Access (can_write_project)**

- Only owners and editors
- Prevents viewers from modifying
- Stricter than read access

**Pattern:** SQL helper functions eliminate policy duplication

**Reference:** `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000004_roles_write_guard.sql`

---

### 4. Realtime Subscriptions

**Pattern: Subscribe → Listen → Update Local Cache**

```typescript
channel.on("postgres_changes", { event: "*" }, (payload) => {
  if (eventType === "DELETE") removeLocal();
  else if (eventType === "INSERT" || "UPDATE") upsertLocal();
  onChange(id); // Trigger UI refresh
});
```

Automatically syncs remote changes to IndexedDB.

**Reference:** `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts` (lines 174-241)

---

### 5. Bidirectional Sync (Push/Pull)

**Last-Write-Wins Conflict Resolution**

```
Local Time > Remote Time ? Push : Pull
```

Simple, deterministic, no user prompts.

**Push Pattern:**

1. Fetch local items
2. For each: check remote updated_at
3. If local newer: UPSERT
4. If remote newer: skip

**Pull Pattern:**

1. Fetch remote items
2. For each: check local updated_at
3. If remote newer: update local
4. If local newer: skip

**Reference:** `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts` (lines 25-145)

---

### 6. React Context Integration

**Three-Context Architecture:**

| Context           | Purpose                      | Updates                 | Persistence     |
| ----------------- | ---------------------------- | ----------------------- | --------------- |
| `AuthContext`     | User/session state           | Real-time (auth events) | Browser session |
| `AppContext`      | Projects, current selection  | Manual actions          | localStorage    |
| `ChaptersContext` | Chapter metadata per project | Reducers                | localStorage    |

**Pattern:**

- Contexts hold UI state only
- Sync service handles cloud operations separately
- Optimistic updates to context, async sync to cloud
- No direct Supabase calls from context

**References:**

- `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`
- `/Users/davehail/Developer/inkwell/src/context/AppContext.tsx`
- `/Users/davehail/Developer/inkwell/src/context/ChaptersContext.tsx`

---

### 7. Auth Patterns

**User/Org Structure:**

```
auth.users (Supabase managed)
    └─ profiles (auto-created)

projects (organization equivalent)
    ├─ owner_id (user)
    └─ project_members (shared access)
        ├─ user_id
        └─ role (owner/editor/viewer)
```

**Auto-create Profile Trigger:**

When user signs up → immediately create profile with same ID.

**Sign-In Methods:**

- Magic link (OTP via email)
- Password-based
- Secure redirect handling

**Reference:** `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`

---

### 8. Hooks for Common Tasks

| Hook            | Purpose                            | Source              |
| --------------- | ---------------------------------- | ------------------- |
| `useAuth()`     | Access user, session, auth methods | Custom wrapper      |
| `useSync()`     | Track online status, pending syncs | connectivityService |
| `useChapters()` | Get chapters for project           | ChaptersContext     |
| `useProject()`  | Get current project and methods    | AppContext          |

**Reference:** `/Users/davehail/Developer/inkwell/src/hooks/`

---

### 9. Sync Service Architecture

**Singleton Pattern:**

```typescript
class SupabaseSyncService {
  async pushToCloud(options: {...})
  async pullFromCloud()
  async getStatus()
  onStatusUpdate(callback)
}

export const supabaseSyncService = new SupabaseSyncService();
```

Lifecycle methods for push/pull, status tracking, listener support.

**Reference:** `/Users/davehail/Developer/inkwell/src/services/supabaseSync.ts`

---

### 10. TypeScript Support

**Types Generated From Schema:**

```bash
npx supabase gen types typescript --project-id YOUR_ID > types/database.ts
```

Auto-generated types prevent schema mismatches.

**Manual Types:**

```typescript
interface Project {
  id: string;
  owner_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

---

### 11. Error Handling

**Graceful Degradation:**

1. **Missing Env Vars:** Clear error message in non-test
2. **Network Down:** Queue operations, retry on reconnect
3. **RLS Violation:** Return 403, show user message
4. **Sync Conflict:** Use Last-Write-Wins, no prompts
5. **Invalid UUID:** Skip sync for demo projects

**Pattern:** Validate, log, continue, report

---

### 12. Encryption (Optional E2EE)

**Pattern: Optional Encryption**

- Check if E2EE enabled for project
- If yes: encrypt before pushing, decrypt after pulling
- If no: pass through plaintext
- Store encrypted_content in JSONB field
- Graceful display if key unavailable

**Reference:** `/Users/davehail/Developer/inkwell/src/services/supabaseSync.ts` (lines 541-626)

---

## Implementation Checklist

### Phase 1: Foundation (30 minutes)

- [ ] Create supabaseClient.ts
- [ ] Update .env.example
- [ ] Install @supabase/supabase-js
- [ ] Test client initialization

### Phase 2: Schema (15 minutes)

- [ ] Create migration files in supabase/migrations/
- [ ] Apply migrations locally
- [ ] Verify tables in Supabase Dashboard
- [ ] Enable RLS on all tables

### Phase 3: Auth (45 minutes)

- [ ] Create AuthContext.tsx
- [ ] Implement sign-up/sign-in/sign-out
- [ ] Update auth redirects
- [ ] Test login flow end-to-end

### Phase 4: Sync Service (1 hour)

- [ ] Create syncService.ts
- [ ] Implement pushLocalChanges()
- [ ] Implement pullRemoteChanges()
- [ ] Set up realtime subscriptions

### Phase 5: Hooks (30 minutes)

- [ ] Create useAuth() hook
- [ ] Create useSync() hook
- [ ] Create entity-specific hooks
- [ ] Test hooks in components

### Phase 6: Integration (1 hour)

- [ ] Wrap app with AuthProvider
- [ ] Add sync service initialization
- [ ] Implement optimistic updates
- [ ] Test end-to-end workflow

### Phase 7: Testing & Hardening (1.5 hours)

- [ ] Test RLS policies
- [ ] Test offline/online transitions
- [ ] Test conflict resolution
- [ ] Test soft deletes
- [ ] Performance testing

**Total: 5 hours**

---

## File Locations in Inkwell (Reference)

### Client & Config

- `/Users/davehail/Developer/inkwell/src/lib/supabaseClient.ts`
- `/Users/davehail/Developer/inkwell/.env.example`

### Contexts

- `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`
- `/Users/davehail/Developer/inkwell/src/context/AppContext.tsx`
- `/Users/davehail/Developer/inkwell/src/context/ChaptersContext.tsx`

### Services

- `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts`
- `/Users/davehail/Developer/inkwell/src/services/supabaseSync.ts`
- `/Users/davehail/Developer/inkwell/src/services/connectivityService.ts`

### Hooks

- `/Users/davehail/Developer/inkwell/src/hooks/useAuth.ts`
- `/Users/davehail/Developer/inkwell/src/hooks/useSync.ts`
- `/Users/davehail/Developer/inkwell/src/hooks/useChapters.ts`

### Migrations

- `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000000_inkwell_schema.sql`
- `/Users/davehail/Developer/inkwell/supabase/migrations/20250119000000_auto_create_profiles.sql`
- `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000004_roles_write_guard.sql`

---

## Best Practices Summary

1. **Client:** Single singleton instance, reuse everywhere
2. **Schema:** UUID PKs, created_at/updated_at, soft deletes, composite indexes
3. **RLS:** Helper functions for access control, no policy duplication
4. **Realtime:** Subscribe to postgres_changes, update local IndexedDB
5. **Sync:** Last-Write-Wins, push before pull, continue on errors
6. **Context:** UI state only, separate sync service, optimistic updates
7. **Auth:** Auto-create profiles, validate redirects, role-based access
8. **Hooks:** Custom hooks for context access, type-safe
9. **Errors:** Graceful degradation, clear logging, user-friendly messages
10. **Testing:** RLS policies, offline/online, conflict resolution, soft deletes

---

## Next Steps

1. **Read the full guides:**
   - INKWELL_SUPABASE_PATTERNS.md (comprehensive reference)
   - SUPABASE_IMPLEMENTATION_GUIDE.md (step-by-step)

2. **Review Inkwell code:**
   - Study files referenced above
   - Copy patterns, adapt to Nexus entities

3. **Create Supabase project:**
   - Visit https://supabase.com
   - Set up authentication
   - Create database
   - Enable Realtime

4. **Implement phases 1-7:**
   - Follow checklist above
   - Test each phase
   - Document any changes

5. **Deploy to production:**
   - Run migrations
   - Configure RLS
   - Whitelist callback URLs
   - Enable backups

---

Generated: 2025-11-10
Source: Inkwell v1.1.0 Production Codebase
Ready for: Nexus Integration
