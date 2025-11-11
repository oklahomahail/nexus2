# Inkwell Supabase Implementation Patterns - Complete Reference

A comprehensive guide to Inkwell's production-grade Supabase integration patterns, ready to port to Nexus.

---

## 1. SUPABASE CLIENT SETUP

### 1.1 Client Initialization

**File:** `/Users/davehail/Developer/inkwell/src/lib/supabaseClient.ts`

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
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
  );
}

// Use safe defaults for testing environment
const finalSupabaseUrl = supabaseUrl || "http://localhost:54321";
const finalSupabaseAnonKey = supabaseAnonKey || "test-anon-key";

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey);
```

### 1.2 Environment Configuration

**File:** `/Users/davehail/Developer/inkwell/.env.example` (excerpt)

```bash
# Required environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BASE_URL=http://localhost:5173

# Optional but recommended
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Key Points:**

- Uses VITE\_ prefix for client-side env vars
- Graceful handling of missing credentials in non-test environments
- Test environment defaults to local Supabase instance (port 54321)
- Single exported `supabase` instance (singleton pattern)

---

## 2. SCHEMA PATTERNS

### 2.1 Main Schema Design

**File:** `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000000_inkwell_schema.sql`

#### Core Tables

```sql
-- Profiles (auto-synced with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  timezone text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects (ownership model)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  schema_version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz  -- soft delete support
);

-- Project Memberships (for sharing)
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz default now(),
  primary key (project_id, user_id)
);

-- Chapters (core writing content)
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  index_in_project int not null,
  title text not null,
  body text not null default '',
  client_rev bigint not null default 0,  -- for conflict detection
  client_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz  -- soft delete
);

-- Characters (metadata with JSONB)
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  bio text not null default '',
  traits jsonb not null default '{}'::jsonb,  -- flexible JSONB field
  client_rev bigint not null default 0,
  client_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Notes (generic structured storage)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null default 'note',  -- discriminator for note types
  content text not null default '',
  tags text[] not null default '{}',  -- array type
  client_rev bigint not null default 0,
  client_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

### 2.2 Naming Conventions

- **Table names:** snake_case, plural (projects, chapters, characters)
- **Column names:** snake_case
- **IDs:** uuid with gen_random_uuid() default
- **Timestamps:** created_at, updated_at (timestamptz)
- **Soft deletes:** deleted_at field (not primary deletion)
- **Foreign keys:** {table}\_id pattern (project_id, user_id)
- **Indexes:** idx*{table}*{fields} pattern

### 2.3 Indexing Strategy

```sql
create index if not exists idx_projects_owner_updated on public.projects (owner_id, updated_at desc);
create index if not exists idx_chapters_project_updated on public.chapters (project_id, updated_at desc);
create index if not exists idx_characters_project_updated on public.characters (project_id, updated_at desc);
create index if not exists idx_notes_project_updated on public.notes (project_id, updated_at desc);
```

**Strategy:**

- Composite indexes on (user/project, updated_at DESC) for listing/sorting queries
- Optimizes common queries: "fetch all items for user/project, sorted by recency"
- Avoids N+1 queries when loading project contents

### 2.4 Revision Tracking

**Purpose:** Enable conflict detection and optimistic updates

```sql
-- In each content table:
client_rev bigint not null default 0,  -- incremented on each edit
client_hash text,  -- hash of content for conflict detection
```

**Usage Pattern:**

1. Client increments client_rev on every local edit
2. On sync, compares client_rev with server version
3. If conflict: uses timestamp-based resolution (newer wins)

---

## 3. ROW LEVEL SECURITY (RLS) POLICIES

### 3.1 Access Control Functions

**File:** `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000000_inkwell_schema.sql`

```sql
-- Helper function: Can user access project at all?
create or replace function public.can_access_project(pid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.projects p
    where p.id = pid
      and (
        p.owner_id = auth.uid() or exists(
          select 1 from public.project_members m
          where m.project_id = pid and m.user_id = auth.uid()
        )
      )
  );
$$;
```

### 3.2 RLS Policies by Table

#### Projects Table

```sql
alter table public.projects enable row level security;

-- READ: Users see projects they own or are members of
drop policy if exists "projects_read" on public.projects;
create policy "projects_read" on public.projects
for select using (
  owner_id = auth.uid() or exists(
    select 1 from public.project_members m where m.project_id = projects.id and m.user_id = auth.uid()
  )
);

-- INSERT: Only authenticated users can create (they become owner)
drop policy if exists "projects_insert" on public.projects;
create policy "projects_insert" on public.projects
for insert with check ( owner_id = auth.uid() );

-- UPDATE: Only owner can update
drop policy if exists "projects_update" on public.projects;
create policy "projects_update" on public.projects
for update using ( owner_id = auth.uid() );
```

#### Content Tables (Chapters, Characters, Notes)

```sql
-- READ: Access via can_access_project()
drop policy if exists "chapters_read" on public.chapters;
create policy "chapters_read" on public.chapters
for select using ( public.can_access_project(project_id) );

-- INSERT: Must have write access
drop policy if exists "chapters_insert" on public.chapters;
create policy "chapters_insert" on public.chapters
for insert with check ( public.can_access_project(project_id) );

-- UPDATE: Must have write access
drop policy if exists "chapters_update" on public.chapters;
create policy "chapters_update" on public.chapters
for update using ( public.can_access_project(project_id) );
```

### 3.3 Role-Based Write Guards

**File:** `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000004_roles_write_guard.sql`

```sql
-- Only owners and editors can write; viewers are read-only
create or replace function public.can_write_project(pid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.projects p
    where p.id = pid and p.owner_id = auth.uid()
  ) or exists(
    select 1 from public.project_members m
    where m.project_id = pid and m.user_id = auth.uid() and m.role in ('owner','editor')
  );
$$;

-- Apply to write operations
drop policy if exists "chapters_update" on public.chapters;
create policy "chapters_update" on public.chapters
for update using ( public.can_write_project(project_id) );
```

**Role Hierarchy:**

- owner: Full control (read, write, manage members)
- editor: Read & write content, but can't modify members
- viewer: Read-only access

---

## 4. LIVE SUBSCRIPTION PATTERNS (REALTIME)

### 4.1 Realtime Subscription Service

**File:** `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts`

```typescript
export function subscribeToChapterChanges(
  projectId: string,
  onChange: (chapterId?: string) => void,
): () => void {
  // Validate UUID (skip demo/local projects)
  if (!isValidUUID(projectId)) {
    return () => {}; // No-op unsubscribe
  }

  const channel = supabase
    .channel(`chapters:${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to INSERT, UPDATE, DELETE
        schema: "public",
        table: "chapters",
        filter: `project_id=eq.${projectId}`,
      },
      async (payload: any) => {
        const {
          eventType,
          new: newRow,
          old: oldRow,
        } = payload as {
          eventType: "INSERT" | "UPDATE" | "DELETE";
          new: any;
          old: any;
        };

        try {
          if (eventType === "DELETE" && oldRow?.id) {
            // Remote deletion - remove from local IndexedDB
            await Chapters.remove(oldRow.id);
          } else if (eventType === "INSERT" || eventType === "UPDATE") {
            // Remote insert/update - upsert to local IndexedDB
            if (newRow) {
              const input: CreateChapterInput = {
                id: newRow.id,
                projectId: projectId,
                title: newRow.title,
                content: newRow.content || "",
                summary: newRow.summary,
                index: newRow.order_index,
                status: newRow.status || "draft",
              };
              await Chapters.create(input);
            }
          }

          // Notify UI of change
          onChange(newRow?.id || oldRow?.id);
        } catch (error) {
          console.error("[Realtime] Failed to process change:", error);
        }
      },
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
```

### 4.2 Usage in React Components

```typescript
useEffect(() => {
  const unsubscribe = subscribeToChapterChanges(projectId, (chapterId) => {
    // Trigger refresh when remote changes detected
    refreshChapters();
  });
  return unsubscribe;
}, [projectId]);
```

### 4.3 Connectivity Check

```typescript
export function isRealtimeConnected(): boolean {
  const channels = supabase.getChannels();
  return channels.some((ch: any) => ch.state === "joined");
}
```

---

## 5. BIDIRECTIONAL SYNC PATTERNS

### 5.1 Sync Service Architecture

**File:** `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts`

#### Push (Upload) Pattern

```typescript
export async function pushLocalChanges(projectId: string): Promise<void> {
  const local = await Chapters.list(projectId);
  if (!local.length) return;

  for (const ch of local) {
    try {
      // Get full chapter (meta + content)
      const full = await Chapters.get(ch.id);

      // Check if remote exists and compare timestamps
      const { data: remote } = await supabase
        .from("chapters")
        .select("updated_at")
        .eq("id", ch.id)
        .maybeSingle();

      const localTime = new Date(ch.updatedAt).getTime();
      const remoteTime = remote ? new Date(remote.updated_at).getTime() : 0;

      // Only push if local is newer (Last-Write-Wins conflict resolution)
      if (localTime > remoteTime) {
        const { error } = await supabase.from("chapters").upsert({
          id: ch.id,
          project_id: projectId,
          title: ch.title,
          content: full.content,
          summary: ch.summary,
          word_count: ch.wordCount,
          order_index: ch.index,
          status: ch.status,
          updated_at: ch.updatedAt,
        });

        if (error) {
          console.error("[Sync] Failed to push chapter:", ch.id, error);
        }
      }
    } catch (error) {
      console.error("[Sync] Error pushing chapter:", ch.id, error);
    }
  }
}
```

**Key Pattern:**

- Uses `upsert` (UPSERT operation)
- Timestamp comparison for conflict resolution
- Skips pushing if remote is already newer
- Continues on error for other items

#### Pull (Download) Pattern

```typescript
export async function pullRemoteChanges(
  projectId: string,
): Promise<ChapterMeta[]> {
  const { data: remote, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index");

  if (error) throw error;
  if (!remote?.length) return [];

  const merged: ChapterMeta[] = [];

  for (const r of remote) {
    try {
      const localMeta = await Chapters.getMeta(r.id).catch(() => null);
      const remoteTime = new Date(r.updated_at).getTime();
      const localTime = localMeta ? new Date(localMeta.updatedAt).getTime() : 0;

      // Only pull if remote is newer
      if (remoteTime > localTime) {
        const input: CreateChapterInput = {
          id: r.id,
          projectId: projectId,
          title: r.title,
          content: r.content || "",
          summary: r.summary,
          index: r.order_index,
          status: r.status as "draft" | "revising" | "final",
        };

        await Chapters.create(input);
        merged.push({
          id: r.id,
          projectId: projectId,
          title: r.title,
          index: r.order_index,
          summary: r.summary,
          status: r.status,
          wordCount: r.word_count || 0,
          tags: [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        });
      }
    } catch (error) {
      console.error("[Sync] Error pulling chapter:", r.id, error);
    }
  }

  return merged;
}
```

### 5.2 Full Bidirectional Sync

```typescript
export async function syncChapters(projectId: string): Promise<void> {
  await pushLocalChanges(projectId); // Upload first
  await pullRemoteChanges(projectId); // Then download
}
```

### 5.3 Conflict Resolution Strategy

**Strategy: Last-Write-Wins (LWW)**

1. Compare timestamps: `local.updated_at` vs `remote.updated_at`
2. Newer timestamp always wins
3. No user prompts required
4. Deterministic and repeatable

**Suitable for:**

- Document editing with clear causality
- Single-device workflows
- Content where simple overwrites are acceptable

---

## 6. CONTEXT INTEGRATION

### 6.1 Auth Context

**File:** `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, redirectPath?: string) => Promise<{ error: AuthError | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
        triggerDashboardView();
      }

      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/auth/update-password';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods...
  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, ... }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Key Patterns:**

- Single `useAuth()` hook for all auth operations
- Initializes session on mount
- Subscribes to auth state changes
- Handles password recovery flow
- Session persists across page reloads (Supabase handles)

### 6.2 App State Context

**File:** `/Users/davehail/Developer/inkwell/src/context/AppContext.tsx`

```typescript
interface AppState {
  view: View;
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  theme: Theme;
  autoSave: {
    isSaving: boolean;
    lastSaved: Date | null;
    error: string | null;
  };
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(state.projects));
  }, [state.projects]);

  useEffect(() => {
    if (state.currentProjectId) {
      localStorage.setItem(PROJECT_ID_KEY, state.currentProjectId);
    }
  }, [state.currentProjectId]);

  const contextValue: AppContextValue = {
    state,
    dispatch,
    currentProject: useMemo(() =>
      state.projects.find(p => p.id === state.currentProjectId) || null,
      [state.projects, state.currentProjectId]
    ),
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    addProject: (project) => dispatch({ type: 'ADD_PROJECT', payload: project }),
    updateProject: (project) => dispatch({ type: 'UPDATE_PROJECT', payload: project }),
    // ... more actions
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
```

**Integration with Supabase:**

- Uses localStorage for persistence (works offline)
- Syncs with Supabase via separate sync service
- Optimistic updates: update local state immediately, sync in background
- No direct Supabase calls in context (separation of concerns)

### 6.3 Chapters Context

**File:** `/Users/davehail/Developer/inkwell/src/context/ChaptersContext.tsx`

```typescript
type State = {
  byId: Record<string, ChapterMeta>;
  byProject: Record<string, string[]>; // ordered IDs per project
  activeId?: string;
};

export function ChaptersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chaptersReducer, initialState);

  const value: ChaptersContextValue = {
    state,
    dispatch,
    getChapters: (projectId: string) =>
      (state.byProject[projectId] ?? [])
        .map((id) => state.byId[id])
        .filter((c): c is ChapterMeta => !!c),
    getActiveChapter: () => (state.activeId ? state.byId[state.activeId] : undefined),
  };

  return <ChaptersContext.Provider value={value}>{children}</ChaptersContext.Provider>;
}

// Convenience hooks for common selectors
export function useChapterList(projectId: string): ChapterMeta[] {
  const { getChapters } = useChapters();
  return getChapters(projectId);
}

export function useActiveChapter(): ChapterMeta | undefined {
  const { getActiveChapter } = useChapters();
  return getActiveChapter();
}
```

**Pattern:**

- Normalized state (byId + byProject)
- Selector hooks for common queries
- Persists active chapter to localStorage
- Keeps only metadata in context (full content in IndexedDB)

---

## 7. AUTH PATTERNS

### 7.1 User/Org/Role Structure

**Tables:**

```sql
-- Profiles (user metadata)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  timezone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects (organizations equivalent)
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Members (org membership)
CREATE TABLE public.project_members (
  project_id uuid NOT NULL REFERENCES public.projects(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);
```

### 7.2 Auto-Create Profile on Signup

**File:** `/Users/davehail/Developer/inkwell/supabase/migrations/20250119000000_auto_create_profiles.sql`

```sql
-- Trigger: auto-create profiles on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
```

**Effect:**

- When user signs up, profile automatically created
- Profile ID = auth user ID (foreign key)
- No gaps in data model

### 7.3 Sign-In Methods

**File:** `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`

#### Magic Link (OTP)

```typescript
const signInWithEmail = async (email: string, redirectPath?: string) => {
  const finalRedirect = normalizeSafeRedirect(redirectPath);
  const origin = window.location.origin;
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(finalRedirect)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true,
    },
  });

  return { error };
};
```

#### Password-Based

```typescript
const signInWithPassword = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

const signUpWithPassword = async (email: string, password: string) => {
  const origin = window.location.origin;
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}&tour=1`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });

  return { error };
};
```

**Security Notes:**

- Validates redirect URLs (prevents open redirects)
- Uses HTTPS-only in production
- Callback URL must be whitelisted in Supabase Dashboard
- Supports query param flags (?tour=1 for onboarding)

---

## 8. ENCRYPTION & E2EE

### 8.1 Encrypted Sync Pattern

**File:** `/Users/davehail/Developer/inkwell/src/services/supabaseSync.ts` (excerpt)

```typescript
private async encryptChapterIfNeeded(
  chapter: Chapter,
  projectId: string,
): Promise<Chapter & { encrypted_content?: EncryptResult }> {
  const e2eeReady = await this.isE2EEReady(projectId);

  if (!e2eeReady) {
    return chapter; // Return unencrypted
  }

  try {
    const dek = e2eeKeyManager.getDEK(projectId);

    const contentToEncrypt = {
      body: chapter.body,
      title: chapter.title,
    };

    const encrypted = await encryptJSON(contentToEncrypt, dek);

    return {
      ...chapter,
      body: '', // Clear plaintext
      title: '[Encrypted]',
      encrypted_content: encrypted,
    };
  } catch (error) {
    devLog.error('[SupabaseSync] Chapter encryption failed:', error);
    throw new Error(`Failed to encrypt chapter ${chapter.id}`);
  }
}

private async decryptChapterIfNeeded(
  chapter: Chapter & { encrypted_content?: EncryptResult },
  projectId: string,
): Promise<Chapter> {
  if (!chapter.encrypted_content) {
    return chapter;
  }

  const e2eeReady = await this.isE2EEReady(projectId);

  if (!e2eeReady) {
    return {
      ...chapter,
      title: '[Locked - Please unlock project]',
      body: '',
    };
  }

  try {
    const dek = e2eeKeyManager.getDEK(projectId);
    const decrypted = await decryptJSON<{ body: string; title: string }>(
      chapter.encrypted_content,
      dek,
    );

    return {
      ...chapter,
      title: decrypted.title,
      body: decrypted.body,
    };
  } catch (error) {
    devLog.error('[SupabaseSync] Chapter decryption failed:', error);
    throw new Error(`Failed to decrypt chapter ${chapter.id}`);
  }
}
```

**Pattern:**

- Optional encryption (can turn on/off per project)
- DEK (Data Encryption Key) managed separately
- Encrypted content stored in JSONB field
- Graceful degradation if key unavailable

---

## 9. IMPLEMENTING IN NEXUS

### 9.1 File Structure to Create

Based on Inkwell's organization:

```
Nexus/
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts         (COPY from Inkwell pattern)
│   ├── context/
│   │   ├── AuthContext.tsx           (ADAPT from Inkwell)
│   │   ├── AppContext.tsx            (ADAPT from Inkwell)
│   │   └── ProjectsContext.tsx       (NEW - Inkwell's project management)
│   ├── hooks/
│   │   ├── useAuth.ts               (COPY from Inkwell)
│   │   ├── useSync.ts               (ADAPT from Inkwell)
│   │   └── useProject.ts            (ADAPT from Inkwell)
│   ├── services/
│   │   ├── syncService.ts           (ADAPT from chaptersSyncService)
│   │   ├── projectsService.ts       (NEW - Inkwell pattern)
│   │   └── connectivityService.ts   (COPY if needed)
│   └── types/
│       └── supabase.ts              (Generate from schema)
└── supabase/
    ├── migrations/
    │   ├── 001_init.sql             (ADAPT from Inkwell schema)
    │   ├── 002_rls.sql              (COPY from Inkwell)
    │   └── 003_triggers.sql         (COPY from Inkwell)
    └── seed.sql                      (NEW)
```

### 9.2 Critical Implementation Steps

1. **Setup Client**
   - Copy supabaseClient.ts pattern
   - Update env vars in .env.example
   - Test connection

2. **Create Schema**
   - Use Inkwell's table designs as template
   - Adapt to Nexus data model
   - Apply RLS policies from migrations

3. **Implement Auth Context**
   - Copy AuthContext.tsx
   - Update redirect paths for Nexus routes

4. **Add Sync Service**
   - Adapt chaptersSyncService.ts for Nexus entities
   - Implement pushLocalChanges/pullRemoteChanges pattern
   - Add realtime subscriptions

5. **Wire Context & Hooks**
   - Create AppProvider wrapper
   - Add useSync, useAuth hooks
   - Integrate with existing Nexus state

6. **Test RLS**
   - Verify policies work with test users
   - Test ownership/member restrictions
   - Check soft delete behavior

---

## 10. KEY TAKEAWAYS

### Best Practices from Inkwell

1. **Singleton Client**
   - Single `supabase` export
   - Reused throughout app

2. **Timestamp-Based Conflict Resolution**
   - Simple, deterministic
   - Works for single-device workflows
   - No user intervention needed

3. **UPSERT Operations**
   - Single operation for insert/update
   - Cleaner than manual existence checks

4. **Realtime with Local Cache**
   - Subscribe to changes
   - Update local IndexedDB immediately
   - Provides offline support + live updates

5. **RLS + Helper Functions**
   - can_access_project() for read access
   - can_write_project() for write access
   - Avoids policy duplication

6. **Context-Based State Management**
   - Lightweight contexts for auth & app state
   - Separate sync service for cloud operations
   - localStorage for persistence

7. **Soft Deletes**
   - deleted_at field instead of hard deletion
   - Allows recovery
   - Audit trail compatible

8. **Validation & Error Handling**
   - Validate UUIDs before sync (skip demo projects)
   - Continue on per-item errors
   - Return errors to caller

---

## 11. REFERENCE FILE PATHS

Key files in Inkwell to study:

1. **Client Setup**
   - `/Users/davehail/Developer/inkwell/src/lib/supabaseClient.ts`

2. **Schema & Migrations**
   - `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000000_inkwell_schema.sql`
   - `/Users/davehail/Developer/inkwell/supabase/migrations/20250128000004_roles_write_guard.sql`
   - `/Users/davehail/Developer/inkwell/supabase/migrations/20250119000000_auto_create_profiles.sql`

3. **Auth**
   - `/Users/davehail/Developer/inkwell/src/context/AuthContext.tsx`
   - `/Users/davehail/Developer/inkwell/.env.example`

4. **Sync & Realtime**
   - `/Users/davehail/Developer/inkwell/src/services/chaptersSyncService.ts`
   - `/Users/davehail/Developer/inkwell/src/services/supabaseSync.ts`

5. **Context & Hooks**
   - `/Users/davehail/Developer/inkwell/src/context/AppContext.tsx`
   - `/Users/davehail/Developer/inkwell/src/context/ChaptersContext.tsx`
   - `/Users/davehail/Developer/inkwell/src/hooks/useSync.ts`
   - `/Users/davehail/Developer/inkwell/src/hooks/useChapters.ts`

6. **Connectivity**
   - `/Users/davehail/Developer/inkwell/src/services/connectivityService.ts`

---

## 12. PRODUCTION CHECKLIST

When implementing in Nexus:

- [ ] Supabase project created and URLs configured
- [ ] Auth methods enabled (Magic Link, Password, or both)
- [ ] Callback URLs whitelisted in Supabase Dashboard
- [ ] Schema migrations applied
- [ ] RLS policies tested with multiple user roles
- [ ] Realtime enabled in Supabase project
- [ ] Offline-first localStorage + IndexedDB setup
- [ ] Sync conflict resolution tested
- [ ] Error handling & logging in place
- [ ] E2EE key management (if needed)
- [ ] Soft delete queries exclude deleted_at IS NULL
- [ ] Database backups configured
- [ ] Performance indexes verified

---

Generated: 2025-11-10
Reference: Inkwell v1.1.0 Production Codebase
