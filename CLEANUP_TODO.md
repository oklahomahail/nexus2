# Q1 2025 Cleanup - Remaining Tasks

> **Status**: Phase 1-5 Complete (160 files removed)
> **Remaining**: Import fixes and deprecated component removal

---

## Completed ✅

- [x] Removed duplicate UI library (`src/components/ui/`)
- [x] Removed duplicate contexts (`src/contexts/`)
- [x] Removed demo/placeholder components (5 files)
- [x] Removed future-phase services (16 files)
- [x] Removed redundant models/viewModels (14 files)
- [x] Removed obsolete campaign components (28 files)
- [x] Removed analytics components (9 files)
- [x] Removed writer/messaging features (10 files)
- [x] Removed backup services (10 files)
- [x] Removed tutorial system (25 files)
- [x] Removed Claude panel (12 files)
- [x] Added ESLint rules to prevent regressions

**Total**: 160 files removed

---

## Remaining Import Fixes 🔧

### High Priority (Breaks Build)

1. **Components with broken imports** (12 files):
   - `src/components/AppContent.tsx` - Remove Claude panel import, fix Topbar import
   - `src/components/ClientHeader.tsx` - Remove CampaignModal import
   - `src/components/ClientWizard.tsx` - Fix UI component imports (Button, Input)
   - `src/components/DonorComponents.tsx` - Remove models/donor import
   - `src/components/NotificationsPanel.tsx` - Remove notificationService import
   - `src/components/index.ts` - Remove deleted component exports
   - `src/components/__tests__/*.test.tsx` - Remove IconBadge/IconButton tests

2. **Panels with broken imports** (5 files):
   - `src/panels/AnalyticsDashboard.tsx` - Remove AnalyticsFiltersComponent, EnhancedAnalyticsWidgets, models/analytics
   - `src/panels/CampaignDesignerWizard.tsx` - Remove usePostalAssumptions hook
   - `src/panels/CampaignsPanel.tsx` - Remove CampaignCreationWizard, CampaignDetail, CampaignList, CampaignModal, CampaignPerformanceTable, models/campaign
   - `src/panels/DashboardPanel.tsx` - Remove OnboardingChecklist, WelcomeModal, tours
   - `src/panels/DonorsPanel.tsx` - Remove models/donor
   - `src/panels/index.ts` - Remove MessagingAssistPanel export

3. **Services with broken imports** (5 files):
   - `src/services/analyticsService.ts` - Remove models/analytics, goalsService
   - `src/services/campaignService.ts` - Remove realCampaignService
   - `src/services/clientService.ts` - Remove realClientService, fix Client export
   - `src/services/donorAnalyticsService.ts` - Remove models/donorAnalytics
   - `src/services/donorService.ts` - Remove models/donor

4. **Context with broken imports** (4 files):
   - `src/context/AppProviders.tsx` - Remove database service, appReducer
   - `src/context/ClientContext.tsx` - Fix Client type import
   - `src/context/ToastContext.tsx` - Fix toast-context import
   - `src/context/index.ts` - Remove uiTypes export

5. **Hooks with broken imports** (4 files):
   - `src/hooks/index.ts` - Remove useBackup, useStorageQuota, useDonorAnalytics exports
   - `src/hooks/useCampaigns.ts` - Remove models/campaign, fix campaignService imports
   - `src/hooks/useNotifications.ts` - Remove notificationService
   - `src/hooks/useToast.ts` - Fix toast-context import

6. **Campaign component** (1 file):
   - `src/components/campaign/index.ts` - Remove messaging export

---

## Components to Deprecate/Replace 🚧

These components have broken imports and should be replaced or removed:

### Replace with Phase 1 Components

1. **CampaignsPanel** → Replace with simpler campaign list using CampaignDesignerWizard
2. **AnalyticsDashboard** → Replace with DonorIntelligencePanel (already exists)
3. **DashboardPanel** → Simplify, remove OnboardingChecklist (Phase 2 feature)
4. **DonorComponents** → Refactor to use database.types.ts
5. **NotificationsPanel** → Use context/notifications instead of notificationService

### Remove (Unused/Obsolete)

1. **ClientHeader** - Not used in AppRoutes
2. **ClientWizard** - Replace with ui-kit components
3. **Test files** - IconBadge.test.tsx, IconButton.test.tsx (components removed)

---

## Migration Strategy

### Option A: Quick Fix (Recommended)

1. Fix critical imports manually (30 mins)
2. Comment out broken components (5 mins)
3. Verify build passes (5 mins)
4. Commit cleanup (10 mins)
5. Create follow-up issue for deprecated components

**Total Time**: 50 minutes
**Risk**: Low (broken components commented out, not deleted)

### Option B: Complete Rewrite

1. Rewrite broken components to use database.types.ts (4 hours)
2. Remove all model/viewModel references (1 hour)
3. Simplify CampaignsPanel and AnalyticsDashboard (2 hours)
4. Add comprehensive tests (2 hours)

**Total Time**: 9 hours
**Risk**: Medium (large refactor)

---

## Recommended Next Steps

1. **Immediate**: Fix App.tsx (✅ Done)
2. **Today**: Fix remaining imports using Option A
3. **This Week**: Create GitHub issues for deprecated components
4. **Phase 2**: Complete component rewrites with proper testing

---

## ESLint Rules Added ✅

The following imports are now blocked by ESLint:

- `@/components/ui/*` → Use `@/components/ui-kit/*`
- `@/features/writing/*` → Out of scope
- `@/services/backup/*` → Removed
- `@/features/claude/*` → Use ai-privacy-gateway
- `@/features/tutorials/*` → Phase 2 feature
- `**/models/**` → Use `@/types/database.types.ts`
- `**/viewModels/**` → Use `@/types/database.types.ts`

---

**Last Updated**: 2025-01-10
**Branch**: `chore/cleanup-q1-2025`
