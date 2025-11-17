# Donor Data Lab Integration Guide

## Overview

The Donor Data Lab is now fully integrated with Nexus's core systems:

- **Segment creation** via donor analytics service
- **Run persistence** for history and AI enrichment
- **AI context enrichment** for grounded content generation

## Architecture

```
┌─────────────────┐
│  Data Lab UI    │
│  (Upload CSV)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────────┐
│ Analysis Engine │─────▶│  Save Lab Run        │
│ donorDataLab.ts │      │  (History + AI ctx)  │
└────────┬────────┘      └──────────────────────┘
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐      ┌────────────────────────┐
│ Promote Segments │      │   CSV Exports          │
│ → Analytics API  │      │   (Upgrade, Monthly)   │
└──────────────────┘      └────────────────────────┘
```

## Services

### 1. Donor Analytics Service

**File**: `src/services/donorAnalyticsService.ts`

Central API for segment CRUD operations. Currently uses localStorage, ready for backend integration.

```typescript
import { createSegment, getSegments } from "@/services/donorAnalyticsService";

// Create a new segment
const segment = await createSegment(clientId, {
  name: "Upgrade-ready donors",
  description: "Medium/large donors with strong patterns",
  criteria: { engagement: "high", frequency: "repeat" },
  isActive: true,
  isDefault: false,
  category: "giving_pattern",
});

// Get all segments for a client
const segments = getSegments(clientId);
```

**Backend Integration**: Replace localStorage calls with:

```typescript
const res = await fetch(`/api/clients/${clientId}/segments`, {
  method: "POST",
  body: JSON.stringify(segmentData),
});
```

### 2. Lab Run Persistence

**File**: `src/services/donorDataLabPersistence.ts`

Stores completed analyses for history and AI enrichment.

```typescript
import {
  saveLabRun,
  getLatestLabRun,
} from "@/services/donorDataLabPersistence";

// Automatically saved when analysis completes
// Stored: last 10 runs per client

// Get most recent run
const latest = getLatestLabRun(clientId);
if (latest) {
  console.log(`Analysis from ${latest.runDate}`);
  console.log(latest.recommendations.overview);
}
```

### 3. AI Context Enrichment

**File**: `src/services/donorDataLabAIContext.ts`

Injects donor file strategy into AI prompts.

```typescript
import {
  enrichPromptWithLabContext,
  hasLabContext,
} from "@/services/donorDataLabAIContext";

// In your AI email drafting service:
const basePrompt = "Write a fundraising email for upgrade prospects.";
const enriched = enrichPromptWithLabContext(clientId, basePrompt, "upgrade");

// enriched now includes:
// - Overview of donor file
// - Upgrade strategy recommendations
// - Channel & cadence notes
// - Then the original prompt
```

**Example enriched prompt**:

```
This organization recently analyzed their donor file (donors_2024.csv, 1,234 donors, analyzed on 1/15/2025).

## Donor File Strategy Overview
We analyzed 1,234 donors in this file. 156 donors (13% of file) look ready for a targeted upgrade ask...

## Upgrade Strategy
- Create a dedicated "Upgrade-ready core donors" segment targeting the 156 donors flagged as upgrade-ready.
- For this segment, use an ask ladder that starts at their most recent gift (100%), then offers 125% and 150% options...

---

Write a fundraising email for upgrade prospects.
```

## Usage Examples

### Using Lab Context in AI Drafting

```typescript
// In your content generation service
import {
  hasLabContext,
  getLabContextSummary,
  enrichPromptWithLabContext,
} from "@/services/donorDataLabAIContext";

function generateUpgradeEmail(clientId: string, baseTone: string): string {
  // Check if we have Lab data
  if (hasLabContext(clientId)) {
    const summary = getLabContextSummary(clientId);
    // Show in UI: "Based on your donor analysis from 1/15/2025 (1,234 donors)"
  }

  const basePrompt = `Write a ${baseTone} fundraising email targeting upgrade-ready donors...`;

  // Automatically enrich with Lab strategy if available
  const enrichedPrompt = enrichPromptWithLabContext(
    clientId,
    basePrompt,
    "upgrade",
  );

  return callAI(enrichedPrompt);
}
```

### Creating Segments from Lab Suggestions

```typescript
// Already wired in NexusDonorDataLabPanel
// User clicks "Create segment" → segment appears in Segmentation tab
import { promoteSuggestedSegmentToNexusSegment } from "@/services/donorDataLabSegmentPromotion";

const segment = await promoteSuggestedSegmentToNexusSegment({
  clientId,
  analysis,
  suggestedSegmentId: "upgrade_ready_core",
});
// segment is now available via getSegments(clientId)
```

### Exporting Cohorts

```typescript
import {
  exportUpgradeReadyCsv,
  exportLookalikeSeedCsv,
} from "@/services/donorDataLabExport";

// Export upgrade-ready donors
exportUpgradeReadyCsv(analysis);
// Downloads: upgrade_ready_donors.csv

// Export lookalike seed for ads
exportLookalikeSeedCsv(analysis, "core_high_value_seed");
// Downloads: lookalike_seed_core_high_value.csv
```

## Backend Migration Checklist

When connecting to a real backend:

### 1. Segment API

- [ ] Create `/api/clients/:clientId/segments` endpoints
- [ ] Update `donorAnalyticsService.ts` fetch calls
- [ ] Remove localStorage fallbacks

### 2. Lab Run API

- [ ] Create `/api/clients/:clientId/data-lab-runs` endpoints
- [ ] Update `donorDataLabPersistence.ts` fetch calls
- [ ] Add pagination for history (>10 runs)

### 3. Data Sync

- [ ] On segment creation, sync to database
- [ ] On Lab run save, sync to database
- [ ] Add error handling for offline mode

## Feature Flags

Consider adding feature flags for gradual rollout:

```typescript
// In your feature config
const FEATURES = {
  DATA_LAB_SEGMENT_PROMOTION: true, // Allow creating segments from Lab
  DATA_LAB_AI_ENRICHMENT: true, // Enrich AI with Lab context
  DATA_LAB_RUN_HISTORY: false, // Show past runs (coming soon)
};
```

## Testing

```bash
# Type check
pnpm typecheck:app

# Build
pnpm build

# Test in browser
# 1. Navigate to /clients/:clientId/data-lab
# 2. Upload a CSV
# 3. Click "Create segment" on a suggestion
# 4. Navigate to /clients/:clientId/segmentation
# 5. Verify segment appears in list
```

## Monitoring

Track these metrics:

- Lab runs per client
- Segments created from Lab
- AI enrichment usage rate
- CSV export downloads

## Next Steps

1. **Campaign Integration**: Add "Start Campaign" button to Results
2. **Run History UI**: Show past analyses in a timeline
3. **Segment Performance**: Track how Lab-created segments perform vs. manual
4. **AI A/B Testing**: Compare enriched vs. non-enriched AI output

## Support

For questions or issues:

- Check `/src/services/donorDataLab*.ts` for core logic
- See `NexusDonorDataLabPanel.tsx` for UI integration
- Review this guide for API patterns
