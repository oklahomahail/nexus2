# Journey Campaign Persistence Guide

Complete guide for saving and loading multi-touch journey campaigns with AI-generated content.

## Overview

Journey campaigns are now persisted as "real" campaigns with:

- `journeyType` field (upgrade, monthly, reactivation)
- Full `deliverables` array with versions
- Link to originating Data Lab run via `originLabRunId`
- Scheduled send dates and status tracking

This enables:

1. Save/resume journey editing
2. Track performance by touch and segment
3. Full campaign lifecycle management

## 🎯 Quick Start

### 1. Save a Journey Campaign

```typescript
import { prepareCampaignSavePayload } from "@/utils/campaignJourneyHelpers";
import { saveCampaign } from "@/services/campaignService"; // Your API wrapper

const handleSaveJourney = async () => {
  const payload = prepareCampaignSavePayload({
    name: campaignName,
    clientId,
    journeyType,
    deliverables,
    originLabRunId: labRun?.runId,
    originLabRunSummary: `Data Lab analysis from ${new Date(labRun.runDate).toLocaleDateString()}`,
  });

  await saveCampaign(payload);
};
```

### 2. Load an Existing Journey

```typescript
import { hydrateDeliverablesFromApi } from "@/utils/campaignJourneyHelpers";

useEffect(() => {
  if (!campaign) return;

  // Hydrate journey state from loaded campaign
  setJourneyType(campaign.journeyType ?? null);

  if (campaign.deliverables) {
    const hydrated = hydrateDeliverablesFromApi(campaign.deliverables);
    setDeliverables(hydrated);
  }
}, [campaign]);
```

## 📦 Data Model

### Campaign with Journey Fields

```typescript
interface CampaignWithDeliverables {
  campaignId: string;
  campaignName: string;
  campaignType: "appeal" | "event" | ... | "sustainer";
  status: "draft" | "in_progress" | "completed" | "archived";

  // Journey-specific fields
  journeyType?: "upgrade" | "monthly" | "reactivation";
  deliverables: Deliverable[];
  originLabRunId?: string;
  originLabRunSummary?: string;

  // Standard fields
  createdAt: string;
  updatedAt: string;
}
```

### Deliverable Structure

```typescript
interface Deliverable {
  deliverableId: string;
  campaignId: string;
  deliverableType: "email" | "direct_mail" | "sms" | "social" | "phone";
  deliverableName: string; // e.g., "Touch #1: Gratitude"
  phase?: string; // Journey template name
  scheduledSendAt?: string | Date;
  status?: "draft" | "scheduled" | "sent";
  versions: DeliverableVersion[];
}
```

### Deliverable Version (Segment-Specific)

```typescript
interface DeliverableVersion {
  versionId: string;
  deliverableId: string;
  versionLabel: string; // e.g., "Upgrade-ready core donors"
  segmentCriteriaId: string; // Links to BehavioralSegment
  contentDraft: string; // Body
  subjectLine?: string; // For email
  previewText?: string; // For email
  estimatedRecipients?: number;
  sortOrder: number;
}
```

## 🔧 Backend Integration

### Database Schema

You'll need to store these fields in your campaigns table:

```sql
ALTER TABLE campaigns ADD COLUMN journey_type VARCHAR(20);
ALTER TABLE campaigns ADD COLUMN origin_lab_run_id VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN origin_lab_run_summary TEXT;
```

Deliverables are typically stored in separate tables (`campaign_deliverables`, `campaign_deliverable_versions`) with foreign keys.

### API Endpoints

#### POST /campaigns

```typescript
// Request
{
  "name": "Q1 Upgrade Journey",
  "clientId": "client_123",
  "journeyType": "upgrade",
  "deliverables": [
    {
      "deliverableId": "del_1",
      "deliverableType": "email",
      "deliverableName": "Touch #1: Gratitude",
      "phase": "Upgrade Journey (3-touch)",
      "scheduledSendAt": "2025-01-20T10:00:00Z",
      "status": "draft",
      "versions": [
        {
          "versionId": "ver_1",
          "versionLabel": "Upgrade-ready core",
          "segmentCriteriaId": "seg_upgrade_core",
          "contentDraft": "Hi [Name], ...",
          "subjectLine": "You've already made a difference",
          "sortOrder": 1
        }
      ]
    }
  ],
  "originLabRunId": "run_abc123",
  "originLabRunSummary": "Data Lab analysis from 1/15/2025"
}
```

#### GET /campaigns/:id?include=deliverables

```typescript
// Response
{
  "campaign": {
    "campaignId": "camp_xyz",
    "campaignName": "Q1 Upgrade Journey",
    "journeyType": "upgrade",
    "deliverables": [...],
    "originLabRunId": "run_abc123",
    // ...
  }
}
```

## 💡 Common Patterns

### Pattern 1: Save Journey After Bulk Draft

```typescript
const handleGenerateAndSave = async () => {
  // Step 1: Bulk draft all touches
  const drafted = await draftEntireJourneyWithAi({
    clientId,
    journeyType,
    journeyTemplate,
    labRun,
    deliverables,
    segments,
  });

  setDeliverables(drafted);

  // Step 2: Save campaign
  const payload = prepareCampaignSavePayload({
    name: `${journeyType} Journey - ${new Date().toLocaleDateString()}`,
    clientId,
    journeyType,
    deliverables: drafted,
    originLabRunId: labRun.runId,
  });

  await saveCampaign(payload);
};
```

### Pattern 2: Resume Editing Existing Journey

```typescript
const loadCampaign = async (campaignId: string) => {
  const campaign = await fetchCampaign(campaignId);

  // Restore journey state
  setJourneyType(campaign.journeyType);
  setDeliverables(hydrateDeliverablesFromApi(campaign.deliverables));

  // AI buttons will now work for revisions
  // because journeyType + labRun are available
};
```

### Pattern 3: Track Performance by Touch

```typescript
// Later, when analytics are available
const getPerformanceByTouch = (campaign: CampaignWithDeliverables) => {
  return campaign.deliverables.map((deliverable) => ({
    touchName: deliverable.deliverableName,
    phase: deliverable.phase,
    versions: deliverable.versions.map((v) => ({
      segment: v.versionLabel,
      openRate: getOpenRate(v.versionId), // Your analytics function
      clickRate: getClickRate(v.versionId),
      revenue: getRevenue(v.versionId),
    })),
  }));
};

// Display in UI:
// Upgrade Journey – Touch #1 (Gratitude) – 42% open, 7% click
// Upgrade Journey – Touch #2 (Ask Ladder) – 38% open, 5% click
```

## 🚨 Important Notes

### Date Serialization

Always serialize/hydrate dates:

```typescript
// GOOD ✅
const payload = prepareCampaignSavePayload({ ... });

// BAD ❌ - will fail JSON serialization
await saveCampaign({
  ...data,
  deliverables: deliverables, // Has Date objects!
});
```

### Bulk Draft Limits

The service enforces a limit of **10 versions** per bulk draft to prevent token abuse:

```typescript
// This will throw if plannedDrafts > 10
await draftEntireJourneyWithAi({ ... });
```

Adjust `MAX_TOUCHES_FOR_BULK_DRAFT` in [journeyBulkDraftService.ts](../src/services/journeyBulkDraftService.ts) if needed.

### AI Disclaimers

Both AI buttons now show disclaimers:

- **Single touch**: "AI can make mistakes. Always review and edit before sending."
- **Bulk draft**: "AI may be imperfect. Please review all content before launch."

These are required for user trust and transparency.

## 📊 Future Analytics Integration

With `journeyType`, `deliverableId`, and `versionId` now saved, you can:

1. **Query performance by journey type**

   ```sql
   SELECT journey_type, AVG(open_rate)
   FROM campaign_analytics
   GROUP BY journey_type;
   ```

2. **Compare touch performance**

   ```sql
   SELECT deliverable_name, AVG(click_rate)
   FROM deliverable_analytics
   WHERE campaign_id = 'camp_xyz'
   GROUP BY deliverable_name;
   ```

3. **Segment A/B testing**
   ```sql
   SELECT version_label, SUM(revenue)
   FROM version_analytics
   WHERE deliverable_id = 'del_1'
   GROUP BY version_label;
   ```

## 🔗 Related Documentation

- [Journey Builder Integration Guide](./JOURNEY_BUILDER_INTEGRATION_GUIDE.md)
- [Campaign Types](../src/types/campaign.ts)
- [Journey Helpers](../src/utils/campaignJourneyHelpers.ts)
- [Bulk Draft Service](../src/services/journeyBulkDraftService.ts)

## ✅ Checklist

When implementing journey persistence:

- [ ] Add `journeyType`, `originLabRunId` to campaign model
- [ ] Add `phase`, `scheduledSendAt`, `status` to deliverable model
- [ ] Create/update API endpoints to accept journey fields
- [ ] Use `prepareCampaignSavePayload` for all saves
- [ ] Use `hydrateDeliverablesFromApi` for all loads
- [ ] Test save → reload → edit → save cycle
- [ ] Verify AI draft buttons work after reload
- [ ] Add analytics queries for journey performance
