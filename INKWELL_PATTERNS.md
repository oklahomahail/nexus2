# Inkwell Pattern Implementation for Nexus

> Status: Phase 1 Started - ErrorBoundary Complete
> Branch: `chore/cleanup-q1-2025`

## Overview

High-leverage patterns from Inkwell's battle-tested codebase adapted for Nexus's needs. Focus on platform safety, UX feedback, and observability without scope creep.

---

## ✅ Completed

### 1. ErrorBoundary System

**File**: `src/components/system/ErrorBoundary.tsx`

**Features**:

- App-level, feature-level, and component-level boundaries
- Error reporting with local storage backup
- Recovery UI with retry/reload options
- Nexus-branded error screens
- Development mode details toggle
- HOCs: `withErrorBoundary`, `FeatureErrorBoundary`, `ComponentErrorBoundary`

**Usage**:

```tsx
import { FeatureErrorBoundary } from "@/components/system/ErrorBoundary";

<FeatureErrorBoundary featureName="Campaign Designer">
  <CampaignDesignerWizard />
</FeatureErrorBoundary>;
```

---

## 📋 Remaining High-Priority Patterns

### 2. AsyncBoundary (Suspense + ErrorBoundary)

**Priority**: HIGH
**Effort**: 30 mins

**File**: `src/components/system/AsyncBoundary.tsx`

Combines React Suspense with ErrorBoundary for async data loading:

```tsx
<AsyncBoundary fallback={<LoadingState />}>
  <DonorIntelligencePanel />
</AsyncBoundary>
```

**Source**: Inkwell doesn't have this as a separate component, but the pattern is straightforward. Create from scratch.

---

### 3. HTTP Client with Retry + Timeout

**Priority**: HIGH
**Effort**: 1 hour

**File**: `src/lib/http.ts`

**Features**:

- Exponential backoff with jitter
- Configurable retries (default: 3)
- Request timeout (default: 30s)
- Type-safe JSON responses
- Error normalization

**API**:

```tsx
import { retry, withTimeout } from "@/lib/http";

// Wrap Supabase Edge Function calls
const result = await retry(
  () => supabase.functions.invoke("ai-privacy-gateway", { body: prompt }),
  { retries: 3, base: 1000, max: 10000 },
);

// Or with timeout
const data = await withTimeout(fetch("/api/data"), { timeout: 5000 });
```

**Inkwell Source**: `src/lib/http.ts` (if exists) or implement from scratch using:

- `p-retry` pattern
- `AbortController` for timeout

---

### 4. Toast System (Promise-Aware)

**Priority**: HIGH
**Effort**: 1.5 hours

**Files**:

- `src/components/system/Toaster.tsx`
- `src/hooks/useToast.ts`

**Features**:

- Promise-aware: `toast.promise(fn, { loading, success, error })`
- Persistent toasts with manual dismiss
- Positioning (top-right, bottom-right, etc.)
- Dark mode support
- Action buttons

**API**:

```tsx
import { useToast } from "@/hooks/useToast";

const toast = useToast();

// Simple
toast.success("Campaign generated!");

// Promise-aware
await toast.promise(generateCampaign(params), {
  loading: "Generating campaign...",
  success: (data) => `Generated ${data.channels.length} channels`,
  error: "Failed to generate campaign",
});

// With action
toast.info("Export ready", {
  action: {
    label: "Download",
    onClick: () => downloadFile(data),
  },
});
```

**Inkwell Source**: Check `src/components/ui/Toast.tsx` or `src/hooks/useToast.ts`

**Alternative**: Use `sonner` library (what Inkwell likely uses under the hood)

---

### 5. Content Sanitization

**Priority**: MEDIUM
**Effort**: 45 mins

**File**: `src/privacy/sanitize.ts`

**Features**:

- HTML/script tag stripping
- SQL injection phrase detection
- Prompt injection guards
- URL normalization

**API**:

```tsx
import { sanitizeHTML, sanitizePrompt } from "@/privacy/sanitize";

const clean = sanitizeHTML(userInput); // Strip <script>, <style>, etc.
const safe = sanitizePrompt(userMessage); // Guard against prompt injection
```

**Inkwell Source**: `src/lib/sanitize.ts` or `src/privacy/sanitize.ts`

---

### 6. Content Normalization

**Priority**: MEDIUM
**Effort**: 30 mins

**File**: `src/privacy/normalize.ts`

**Features**:

- HTML → plain text
- Whitespace collapse
- Language detection hints
- Smart quotes normalization

**API**:

```tsx
import { htmlToText, normalizeWhitespace } from "@/privacy/normalize";

const text = htmlToText(corpusHTML); // Clean text for AI prompts
const clean = normalizeWhitespace(text); // Collapse multiple spaces/newlines
```

**Inkwell Source**: `src/lib/normalize.ts`

---

### 7. TaskProgress + useTask

**Priority**: MEDIUM
**Effort**: 1 hour

**Files**:

- `src/components/system/TaskProgress.tsx`
- `src/hooks/useTask.ts`

**Features**:

- Determinate/indeterminate progress
- Cancellable operations
- Progress percentage
- Status messages

**API**:

```tsx
import { useTask } from "@/hooks/useTask";

const { start, progress, cancel, status } = useTask();

const handleGenerate = async () => {
  await start(async (updateProgress) => {
    updateProgress(0, "Analyzing brand...");
    const brand = await fetchBrand();

    updateProgress(50, "Generating content...");
    const content = await generateContent(brand);

    updateProgress(100, "Complete!");
    return content;
  });
};

// In UI
<TaskProgress progress={progress} status={status} onCancel={cancel} />;
```

**Inkwell Source**: `src/hooks/useTask.ts` or create from scratch

---

### 8. Edge Function Shared Utilities

**Priority**: MEDIUM
**Effort**: 1 hour

**Files**:

- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/auth.ts`
- `supabase/functions/_shared/errors.ts`
- `supabase/functions/_shared/rateLimit.ts`

**Features**:

- Unified CORS handling
- JWT auth validation
- Structured error responses
- In-memory rate limiting

**API**:

```tsx
import { corsHeaders, handleCors } from "../_shared/cors";
import { verifyAuth } from "../_shared/auth";
import { ErrorResponse } from "../_shared/errors";
import { checkRateLimit } from "../_shared/rateLimit";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors(req);

  const user = await verifyAuth(req);
  if (!user) return ErrorResponse.unauthorized();

  const allowed = await checkRateLimit(user.id, "ai-privacy-gateway", 10);
  if (!allowed) return ErrorResponse.rateLimited();

  // ... function logic
});
```

**Inkwell Source**: `supabase/functions/_shared/` directory

---

### 9. FocusTrap + A11y Utilities

**Priority**: LOW
**Effort**: 45 mins

**Files**:

- `src/components/system/FocusTrap.tsx`
- `src/styles/a11y.css`

**Features**:

- Trap focus in modals
- Keyboard navigation
- Focus ring with brand colors
- Skip links

**Inkwell Source**: `src/components/system/FocusTrap.tsx`

---

### 10. MSW Test Setup

**Priority**: LOW
**Effort**: 1 hour

**Files**:

- `tests/setup/msw.ts`
- `tests/setup/vitest.ts`
- `tests/smoke/services.test.ts`

**Features**:

- Mock Supabase Edge Function calls
- Smoke tests for critical services
- Test hooks without network

**Inkwell Source**: `tests/setup/` directory

---

## 🚫 Explicitly NOT Co-opting

- Writing/editing UI components (Composer, Editor)
- Realtime collaboration code
- Content calendar/scheduling
- Any PII-handling text transformers (Nexus uses placeholders only)

---

## 📊 Implementation Priority

### Phase 1 (This Session) ✅

- [x] ErrorBoundary

### Phase 2 (Next Session)

- [ ] AsyncBoundary (30 mins)
- [ ] HTTP retry/timeout (1 hour)
- [ ] Toast system (1.5 hours)

### Phase 3 (Follow-up)

- [ ] Content sanitization (45 mins)
- [ ] Content normalization (30 mins)
- [ ] TaskProgress + useTask (1 hour)

### Phase 4 (Optional)

- [ ] Edge Function utilities (1 hour)
- [ ] FocusTrap + A11y (45 mins)
- [ ] MSW test setup (1 hour)

---

## 🎯 Quick Wins to Apply Now

### 1. Wrap Critical Panels

```tsx
// src/panels/CampaignDesignerWizard.tsx
import { FeatureErrorBoundary } from "@/components/system/ErrorBoundary";

export default function CampaignDesignerWizard() {
  return (
    <FeatureErrorBoundary featureName="Campaign Designer">
      {/* existing code */}
    </FeatureErrorBoundary>
  );
}
```

### 2. Wrap Brand/Intelligence Panels

```tsx
// src/panels/BrandProfilePanel.tsx
<FeatureErrorBoundary featureName="Brand Profile">
  {/* panel content */}
</FeatureErrorBoundary>

// src/panels/DonorIntelligencePanel.tsx
<FeatureErrorBoundary featureName="Donor Intelligence">
  {/* panel content */}
</FeatureErrorBoundary>
```

### 3. Replace AppContent (when re-added)

```tsx
// src/app/App.tsx or AppRoutes.tsx
import { AppErrorBoundary } from "@/components/system/ErrorBoundary";

<AppErrorBoundary level="app">
  <AppRoutes />
</AppErrorBoundary>;
```

---

## 📝 Notes

- **ErrorBoundary** is production-ready and can be used immediately
- **Toast system** should replace all `alert()` and ad-hoc notifications
- **HTTP retry** is critical for Edge Function stability (AI calls, analytics)
- **Sanitization** adds belt-and-suspenders for corpus import and markdown rendering
- **TaskProgress** improves UX for long AI generations (5-30s operations)

---

## 🔗 Resources

- Inkwell codebase: `/Users/davehail/Developer/inkwell`
- Nexus branch: `chore/cleanup-q1-2025`
- Original audit: [CLEANUP_TODO.md](CLEANUP_TODO.md)
- Brand system: [BRAND_SYSTEM_COMPLETE.md](BRAND_SYSTEM_COMPLETE.md)

---

**Last Updated**: 2025-01-10
**Status**: ErrorBoundary complete, ready for Phase 2
