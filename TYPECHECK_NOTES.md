# TypeScript Type Check Notes

**Date:** 2025-01-14
**Status:** Known Issues - Supabase Types Need Regeneration

---

## Known Type Errors

### Supabase Type Generation Required

Most type errors are due to Supabase types not being regenerated after schema changes. Tables return `never` type because the TypeScript definitions don't match the current database schema.

**Affected Files:**

- `src/services/track15Service.ts` - Track15 tables (campaigns, track15_narrative_steps)
- `src/services/analyticsService.ts` - Campaigns table
- `src/services/knowledgeBaseService.ts` - Knowledge base tables
- `src/panels/Track15CampaignWizard.tsx` - Campaigns table
- `src/panels/Track15AnalyticsPanel.tsx` - Campaigns table

**Root Cause:**
The migrations added Track15 fields to existing tables, but Supabase types haven't been regenerated to reflect these changes.

**Solution:**

```bash
# Generate Supabase types
npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts

# Or use Supabase CLI with local database
npx supabase db pull
npx supabase gen types typescript --local > src/types/supabase.ts
```

---

## Fixed Type Errors

### 1. Track15LiftMetrics Import Conflict ✅

**File:** `src/components/analytics/Track15LiftMetrics.tsx`

**Issue:** Component name conflicts with type name when using value import

**Fix:** Changed to type-only import

```typescript
// Before
import { Track15LiftMetrics } from "@/types/track15.types";

// After
import type { Track15LiftMetrics } from "@/types/track15.types";
```

---

## Errors Requiring Database Work

### SeasonSelectionStep Missing Types

**File:** `src/components/campaign/wizard-steps/SeasonSelectionStep.tsx`

**Issues:**

- Missing `CampaignSeason` export
- Missing `CAMPAIGN_SEASONS` export

**Status:** Needs investigation - these types may be defined differently in track15.types

### SOPs Missing Checksum

**File:** `src/components/knowledge/SOPs.tsx`

**Issue:** BrandCorpusInput requires `checksum` field

**Status:** Needs schema update or type fix

---

## Workarounds

Until Supabase types are regenerated, the app will still compile and run, but TypeScript will show errors in the IDE. The errors don't prevent:

- Development server from running
- Building for production
- Runtime functionality

The type errors are compile-time only and don't affect actual functionality.

---

## Next Steps

1. **Immediate:** Commit current changes with known type issues
2. **Short-term:** Regenerate Supabase types after migrations are applied
3. **Long-term:** Set up automated type generation in CI/CD

---

_This file documents expected type errors and can be deleted once Supabase types are regenerated._
