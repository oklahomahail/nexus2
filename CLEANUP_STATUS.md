# Q1 2025 Cleanup - Progress Update

> **Branch**: `chore/cleanup-q1-2025`
> **Status**: Phase 6 in progress - Import fixes
> **Last Updated**: 2025-01-10

---

## Completed ✅

### Phase 1-5: File Removal (160 files)

- ✅ Removed duplicate UI library (`src/components/ui/`)
- ✅ Removed duplicate contexts (`src/contexts/`)
- ✅ Removed demo/placeholder components (5 files)
- ✅ Removed future-phase services (16 files)
- ✅ Removed redundant models/viewModels (14 files)
- ✅ Removed obsolete campaign components (28 files)
- ✅ Removed analytics components (9 files)
- ✅ Removed writer/messaging features (10 files)
- ✅ Removed backup services (10 files)
- ✅ Removed tutorial system (25 files)
- ✅ Removed Claude panel (12 files)
- ✅ Added ESLint rules to prevent regressions

### Phase 6: Critical Import Fixes (10 files fixed)

- ✅ Fixed `src/App.tsx` - Removed tutorial system
- ✅ Fixed `src/components/ClientWizard.tsx` - Changed ui → ui-kit imports
- ✅ Fixed `src/context/ToastContext.tsx` - Moved toast-context inline
- ✅ Fixed `src/hooks/useToast.ts` - Updated import path
- ✅ Fixed `src/components/AppContent.tsx` - Removed Claude panel, fixed Topbar import
- ✅ Fixed `src/components/index.ts` - Removed deleted component exports
- ✅ Fixed `src/components/campaign/index.ts` - Removed messaging export
- ✅ Fixed `src/context/index.ts` - Removed uiTypes export
- ✅ Fixed `src/hooks/index.ts` - Removed useBackup, useStorageQuota, useDonorAnalytics exports
- ✅ Fixed `src/panels/index.ts` - Removed MessagingAssistPanel export
- ✅ Removed `src/components/__tests__/IconBadge.test.tsx` and `IconButton.test.tsx`

---

## Key Discovery: Architecture Migration

**Finding**: The app has migrated from panel-based to route-based architecture.

### Old System (Obsolete)

- Used `AppContent.tsx` with panel switching
- Components: `CampaignsPanel`, `AnalyticsDashboard`, `DonorsPanel`, `DashboardPanel`
- **Status**: `AppContent.tsx` is NOT imported anywhere - obsolete

### New System (Active)

- Uses `AppRoutes.tsx` with React Router
- Pages: `Dashboard`, `ClientsPage`, `ClientDashboard`, `ClientCampaigns`, `CampaignBuilder`
- **Status**: This is the production system

### Implication

Many broken imports are in obsolete files (panels) that are no longer used in production. We have two options:

**Option A (Recommended)**: Comment out obsolete panel files

- Faster (15 mins)
- Preserves code for reference
- Allows build to pass immediately

**Option B**: Delete obsolete panels entirely

- Cleaner codebase
- May delete code that could be useful for migration
- Requires more careful review

---

## Remaining Errors (Obsolete Files)

These files have broken imports but are NOT used in the active route system:

### Panels (Not in AppRoutes)

1. ~~`src/panels/CampaignsPanel.tsx`~~ - Replaced by pages/client/ClientCampaigns
2. ~~`src/panels/AnalyticsDashboard.tsx`~~ - Replaced by pages/client/ClientAnalytics
3. ~~`src/panels/DonorsPanel.tsx`~~ - Donor features moved to intelligence panel
4. ~~`src/panels/DashboardPanel.tsx`~~ - Replaced by pages/Dashboard

### Components (Not in AppRoutes)

5. ~~`src/components/AppContent.tsx`~~ - Entire panel-based system replaced
6. `src/components/ClientHeader.tsx` - Not used
7. `src/components/DonorComponents.tsx` - Needs migration to database.types.ts
8. `src/components/NotificationsPanel.tsx` - Needs context/notifications instead

### Services (Broken imports, used by obsolete panels)

9. `src/services/analyticsService.ts` - Remove models/analytics, goalsService
10. `src/services/campaignService.ts` - Remove realCampaignService
11. `src/services/clientService.ts` - Remove realClientService, fix Client export
12. `src/services/donorAnalyticsService.ts` - Remove models/donorAnalytics
13. `src/services/donorService.ts` - Remove models/donor

### Context (Broken imports)

14. `src/context/AppProviders.tsx` - Remove database service, appReducer
15. `src/context/ClientContext.tsx` - Fix Client type import

### Hooks (Broken imports)

16. `src/hooks/useCampaigns.ts` - Remove models/campaign
17. `src/hooks/useNotifications.ts` - Remove notificationService

### Panels Used in New Routes (Need fixing)

18. `src/panels/CampaignDesignerWizard.tsx` - Remove usePostalAssumptions (✅ Used in CampaignBuilder)
19. `src/panels/BrandProfilePanel.tsx` - Verify no issues

---

## Recommended Next Steps

### Step 1: Quick Build Fix (30 mins)

Comment out obsolete panels to get build passing:

```bash
# Move obsolete panels to archive
mkdir -p src/_archive/panels_obsolete
git mv src/panels/CampaignsPanel.tsx src/_archive/panels_obsolete/
git mv src/panels/AnalyticsDashboard.tsx src/_archive/panels_obsolete/
git mv src/panels/DonorsPanel.tsx src/_archive/panels_obsolete/
git mv src/panels/DashboardPanel.tsx src/_archive/panels_obsolete/
git mv src/components/AppContent.tsx src/_archive/
git mv src/components/ClientHeader.tsx src/_archive/
git mv src/components/NotificationsPanel.tsx src/_archive/

# Update index exports
# (Already done above)
```

### Step 2: Fix Services (1 hour)

Services are used by the new pages, so they need proper fixes:

- Replace model imports with database.types.ts
- Remove deleted service imports

### Step 3: Fix Context & Hooks (30 mins)

- Fix AppProviders, ClientContext
- Fix useCampaigns, useNotifications

### Step 4: Verify (15 mins)

```bash
npm run typecheck
npm run build
npm run dev
```

---

## Bundle Size Impact

**Before Cleanup**: ~160 obsolete files
**After Phase 1-5**: 160 files removed
**After Phase 6**: ~7 more obsolete files archived

**Estimated Impact**:

- Removed ~50KB of unused code
- Reduced TypeScript compilation time
- Eliminated 80+ import errors

---

## Next Action

**Recommended**: Execute Step 1 (archive obsolete files) to get build passing immediately.

**Command**:

```bash
mkdir -p src/_archive/panels_obsolete src/_archive/components_obsolete
# Move files and run typecheck
```

Would you like me to:

1. Archive obsolete files (15 mins) ← Recommended
2. Fix all services/context/hooks (2 hours)
3. Both (2.25 hours total)
