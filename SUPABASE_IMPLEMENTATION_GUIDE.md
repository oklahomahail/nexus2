# Supabase Implementation Guide for Nexus

Quick reference for integrating Inkwell's proven Supabase patterns into Nexus.

## Quick Start (30 minutes)

### 1. Create Supabase Client (`src/lib/supabaseClient.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";

const isTest = import.meta.env.MODE === "test";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  (isTest ? "http://127.0.0.1:54321" : undefined);
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  (isTest ? "test-anon-key" : undefined);

if (!isTest && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
  );
}

const finalSupabaseUrl = supabaseUrl || "http://localhost:54321";
const finalSupabaseAnonKey = supabaseAnonKey || "test-anon-key";

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey);
```

### 2. Update `.env.example`

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BASE_URL=http://localhost:5173
```

### 3. Create Auth Context (`src/context/AuthContext.tsx`)

Start with: `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`

Key changes for Nexus:

- Update redirect paths to match Nexus routing
- Adapt auth methods if different from Inkwell
- Keep error handling and state management patterns

### 4. Create Sync Service (`src/services/syncService.ts`)

Start with: `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts`

Adapt for your entities (Clients, Projects, etc.):

```typescript
export async function pushLocalChanges(
  entityType: string,
  entityId: string,
): Promise<void> {
  // Similar pattern: fetch local, compare timestamps, upsert if newer
}

export async function pullRemoteChanges(
  entityType: string,
  entityId: string,
): Promise<any[]> {
  // Similar pattern: fetch remote, compare timestamps, update if newer
}

export function subscribeToChanges(
  entityType: string,
  onChange: (id?: string) => void,
): () => void {
  // Setup realtime listener with postgres_changes
}
```

### 5. Wire Auth Hook (`src/hooks/useAuth.ts`)

```typescript
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### 6. Create Sync Hook (`src/hooks/useSync.ts`)

Start with: `/Users/davehail/Developer/inkwell/src/hooks/useSync.ts`

```typescript
export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isSyncing };
}
```

---

## Schema Setup (15 minutes)

### Create Migration Files

**`supabase/migrations/001_init.sql`**

Adapt from Inkwell's main schema, but for your entities:

```sql
-- Core tables for Nexus
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz  -- soft delete
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Composite indexes for performance
CREATE INDEX idx_clients_owner_updated ON public.clients (owner_id, updated_at DESC);
CREATE INDEX idx_projects_client_updated ON public.projects (client_id, updated_at DESC);
```

**`supabase/migrations/002_rls.sql`**

Copy from Inkwell's RLS patterns:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Access helper
CREATE OR REPLACE FUNCTION public.can_access_client(cid uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.clients c
    WHERE c.id = cid AND c.owner_id = auth.uid()
  );
$$;

-- Users policies
CREATE POLICY "users_read" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Clients policies
CREATE POLICY "clients_read" ON public.clients
  FOR SELECT USING (public.can_access_client(id));

CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE USING (owner_id = auth.uid());

-- Projects policies
CREATE POLICY "projects_read" ON public.projects
  FOR SELECT USING (public.can_access_client(client_id));

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT WITH CHECK (public.can_access_client(client_id));

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (public.can_access_client(client_id));
```

**`supabase/migrations/003_triggers.sql`**

```sql
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (new.id, new.email, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Touch updated_at on any update
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
```

### Apply Migrations

```bash
cd supabase
# Create a migration file
npx supabase migration new init_schema
# Edit the generated file with your SQL

# Apply locally
npx supabase db push

# Deploy to production
npx supabase db push --project-ref YOUR_PROJECT_ID
```

---

## Integration Patterns

### Pattern 1: Optimistic Updates

```typescript
// Local update immediately
setProjects([...projects, newProject]);

// Sync in background
syncService.pushLocalChanges("projects", newProject.id).catch((error) => {
  // Rollback on error
  setProjects(projects.filter((p) => p.id !== newProject.id));
  showError(error.message);
});
```

### Pattern 2: Realtime Sync

```typescript
useEffect(() => {
  const unsubscribe = subscribeToChanges("projects", (projectId) => {
    // Refresh affected project from local cache or refetch
    refreshProject(projectId);
  });

  return unsubscribe;
}, [entityId]);
```

### Pattern 3: Conflict Resolution (Last-Write-Wins)

```typescript
if (
  new Date(local.updatedAt).getTime() > new Date(remote.updatedAt).getTime()
) {
  // Local is newer, push it
  await supabase.from("projects").upsert(local);
} else {
  // Remote is newer, pull it
  await supabase.from("projects").select("*").eq("id", projectId);
}
```

### Pattern 4: Error Recovery

```typescript
const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "error">(
  "synced",
);

async function retry() {
  setSyncStatus("pending");
  try {
    await syncService.syncAll();
    setSyncStatus("synced");
  } catch (error) {
    setSyncStatus("error");
    showError(error.message);
  }
}
```

---

## Testing Checklist

- [ ] Supabase client initializes without errors
- [ ] Auth context provides user and session
- [ ] Login/logout flows work
- [ ] RLS policies block unauthorized access
- [ ] Sync pushes local changes to Supabase
- [ ] Sync pulls remote changes to local
- [ ] Realtime subscriptions trigger callbacks
- [ ] Offline mode doesn't break app
- [ ] Timestamps are consistent (UTC)
- [ ] Soft deletes work (deleted_at != NULL)
- [ ] Indexes exist and improve query performance

---

## Debugging

### Check RLS Policies

```sql
-- In Supabase SQL editor
SELECT * FROM auth.users WHERE id = current_user_id();
SELECT * FROM public.clients WHERE owner_id = auth.uid();
```

### Monitor Realtime

```typescript
const channels = supabase.getChannels();
console.log(
  "Connected channels:",
  channels.map((ch) => ch.topic),
);
```

### Verify Sync Direction

```typescript
// Track what's being synced
console.log("[Sync] Pushing:", local.length, "items");
console.log("[Sync] Pulling:", remote.length, "items");
console.log("[Sync] Conflicts:", conflicts.length);
```

---

## Performance Tips

1. **Batch Updates**
   - Use multi-row upserts instead of individual inserts
   - Example: `INSERT INTO table VALUES (...), (...) ON CONFLICT DO UPDATE`

2. **Pagination**
   - Use `.range(0, 99)` to limit results
   - Implement cursor-based pagination for large datasets

3. **Selective Sync**
   - Only sync changed items (use updated_at > last_sync)
   - Track sync state per entity

4. **Index on Sort Keys**
   - Always index fields used in ORDER BY (like updated_at)
   - Use DESC for reverse chronological queries

5. **Connection Pooling**
   - Supabase handles this automatically
   - Keep connections alive with periodic pings

---

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] No public INSERT/UPDATE/DELETE policies
- [ ] Foreign keys with ON DELETE CASCADE
- [ ] Timestamps immutable (update triggers set updated_at only)
- [ ] Soft deletes respected in queries (WHERE deleted_at IS NULL)
- [ ] Auth redirects validated (no open redirects)
- [ ] API keys in environment variables (never hardcoded)
- [ ] CORS configured in Supabase Dashboard
- [ ] Rate limiting enabled (if needed)

---

## Common Errors & Fixes

| Error                                    | Cause                        | Fix                             |
| ---------------------------------------- | ---------------------------- | ------------------------------- |
| "Missing VITE_SUPABASE_URL"              | Env var not set              | Add to .env file                |
| "new row violates RLS policy"            | RLS policy too strict        | Check can_access_project()      |
| "Subscription to 'table' already exists" | Duplicate channel            | Unsubscribe properly on cleanup |
| "Realtime not connected"                 | Realtime disabled in project | Enable in Supabase Dashboard    |
| "Network error"                          | Offline                      | Check navigator.onLine          |

---

## Next Steps

1. Read full guide: `/Users/davehail/Developer/Nexus/INKWELL_SUPABASE_PATTERNS.md`
2. Review Inkwell's implementations:
   - `/Users/davehail/Developer/inkwell/src/lib/supabaseClient.ts`
   - `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`
   - `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts`
3. Create Supabase project (https://supabase.com)
4. Apply migrations
5. Integrate contexts and hooks
6. Test auth and sync flows
