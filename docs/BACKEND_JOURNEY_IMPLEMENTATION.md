# Backend Journey Implementation Guide

**Status**: Ready to implement
**Prerequisites**: Front-end journey persistence code complete (commit ec308b2)

This guide walks through the backend changes needed to support journey campaign persistence.

---

## 🎯 Overview

You need to:
1. Update database schema (add journey fields)
2. Update API endpoints (accept/return journey data)
3. Verify AI Privacy Gateway handles campaign requests

---

## 1️⃣ Database Schema Updates

### Supabase/PostgreSQL Migrations

Create a new migration file: `supabase/migrations/YYYYMMDD_add_journey_fields.sql`

```sql
-- Add journey fields to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS journey_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS origin_lab_run_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS origin_lab_run_summary TEXT;

-- Add journey fields to campaign_deliverables table
ALTER TABLE campaign_deliverables
  ADD COLUMN IF NOT EXISTS phase VARCHAR(255),
  ADD COLUMN IF NOT EXISTS scheduled_send_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Add check constraint for journey_type
ALTER TABLE campaigns
  ADD CONSTRAINT campaigns_journey_type_check
  CHECK (journey_type IS NULL OR journey_type IN ('upgrade', 'monthly', 'reactivation'));

-- Add check constraint for deliverable status
ALTER TABLE campaign_deliverables
  ADD CONSTRAINT campaign_deliverables_status_check
  CHECK (status IN ('draft', 'scheduled', 'sent'));

-- Add index for querying by journey type
CREATE INDEX IF NOT EXISTS idx_campaigns_journey_type ON campaigns(journey_type) WHERE journey_type IS NOT NULL;

-- Add index for scheduled deliverables
CREATE INDEX IF NOT EXISTS idx_deliverables_scheduled ON campaign_deliverables(scheduled_send_at) WHERE scheduled_send_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN campaigns.journey_type IS 'Type of multi-touch journey: upgrade, monthly, or reactivation';
COMMENT ON COLUMN campaigns.origin_lab_run_id IS 'ID of Data Lab run that generated segments for this campaign';
COMMENT ON COLUMN campaigns.origin_lab_run_summary IS 'Human-readable description of the Data Lab run origin';
COMMENT ON COLUMN campaign_deliverables.phase IS 'Journey template phase name (e.g., "Touch #1: Gratitude")';
COMMENT ON COLUMN campaign_deliverables.scheduled_send_at IS 'When this deliverable is scheduled to be sent';
COMMENT ON COLUMN campaign_deliverables.status IS 'Current status: draft, scheduled, or sent';
```

### Run Migration

```bash
# If using Supabase CLI
npx supabase migration new add_journey_fields
# Then copy the SQL above into the generated file

# Apply migration
npx supabase db push

# Or via Supabase Dashboard:
# 1. Go to Database → SQL Editor
# 2. Paste and execute the SQL above
```

---

## 2️⃣ Update API Endpoints

### Option A: Using Supabase (Current Setup)

If you're using Supabase Edge Functions, update your campaign functions:

#### `supabase/functions/campaigns/index.ts` (or similar)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  try {
    const { method } = req;

    if (method === "POST") {
      // Create campaign
      const body = await req.json();
      const {
        name,
        clientId,
        journeyType,
        deliverables,
        originLabRunId,
        originLabRunSummary,
        // ... other fields
      } = body;

      // Insert campaign
      const { data: campaign, error: campaignError } = await supabaseClient
        .from("campaigns")
        .insert({
          campaign_name: name,
          client_id: clientId,
          journey_type: journeyType || null,
          origin_lab_run_id: originLabRunId || null,
          origin_lab_run_summary: originLabRunSummary || null,
          // ... other fields
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Insert deliverables if provided
      if (deliverables && deliverables.length > 0) {
        const deliverableRows = deliverables.map((d: any) => ({
          campaign_id: campaign.id,
          deliverable_type: d.deliverableType,
          deliverable_name: d.deliverableName,
          phase: d.phase || null,
          scheduled_send_at: d.scheduledSendAt || null,
          status: d.status || "draft",
        }));

        const { data: insertedDeliverables, error: delError } = await supabaseClient
          .from("campaign_deliverables")
          .insert(deliverableRows)
          .select();

        if (delError) throw delError;

        // Insert versions for each deliverable
        for (let i = 0; i < deliverables.length; i++) {
          const deliverable = deliverables[i];
          const insertedDel = insertedDeliverables[i];

          if (deliverable.versions && deliverable.versions.length > 0) {
            const versionRows = deliverable.versions.map((v: any) => ({
              deliverable_id: insertedDel.deliverable_id,
              version_label: v.versionLabel || v.label,
              segment_criteria_id: v.segmentCriteriaId,
              content_draft: v.contentDraft || v.content?.body,
              subject_line: v.subjectLine || v.content?.subject,
              preview_text: v.previewText || null,
              estimated_recipients: v.estimatedRecipients || null,
              sort_order: v.sortOrder || 1,
            }));

            const { error: versionError } = await supabaseClient
              .from("campaign_deliverable_versions")
              .insert(versionRows);

            if (versionError) throw versionError;
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, campaign }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (method === "GET") {
      // Get campaign by ID
      const url = new URL(req.url);
      const campaignId = url.searchParams.get("id");
      const includeDeliverables = url.searchParams.get("include") === "deliverables";

      if (!campaignId) {
        throw new Error("Campaign ID required");
      }

      // Fetch campaign
      const { data: campaign, error: campaignError } = await supabaseClient
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      if (includeDeliverables) {
        // Fetch deliverables
        const { data: deliverables, error: delError } = await supabaseClient
          .from("campaign_deliverables")
          .select(`
            *,
            versions:campaign_deliverable_versions(*)
          `)
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: true });

        if (delError) throw delError;

        campaign.deliverables = deliverables;
      }

      return new Response(
        JSON.stringify({ success: true, campaign }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Option B: Using Express Backend (server/)

If you're using the Express backend in `server/src/routes/campaigns.ts`:

```typescript
// Update createCampaignSchema
const createCampaignSchema = baseCampaignSchema.extend({
  journeyType: z.enum(["upgrade", "monthly", "reactivation"]).optional(),
  originLabRunId: z.string().optional(),
  originLabRunSummary: z.string().optional(),
  deliverables: z.array(z.object({
    deliverableType: z.enum(["direct_mail", "email", "sms", "social", "phone"]),
    deliverableName: z.string(),
    phase: z.string().optional(),
    scheduledSendAt: z.string().datetime().optional(),
    status: z.enum(["draft", "scheduled", "sent"]).default("draft"),
    versions: z.array(z.object({
      versionLabel: z.string(),
      segmentCriteriaId: z.string(),
      contentDraft: z.string(),
      subjectLine: z.string().optional(),
      previewText: z.string().optional(),
      estimatedRecipients: z.number().optional(),
      sortOrder: z.number().default(1),
    })),
  })).optional(),
});

// POST /campaigns - Create campaign with deliverables
router.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const validatedData = createCampaignSchema.parse(req.body);

    // Create campaign with journey fields
    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        clientId: validatedData.clientId,
        userId,
        journeyType: validatedData.journeyType,
        originLabRunId: validatedData.originLabRunId,
        originLabRunSummary: validatedData.originLabRunSummary,
        // ... other fields
      },
    });

    // Create deliverables if provided
    if (validatedData.deliverables) {
      for (const d of validatedData.deliverables) {
        const deliverable = await prisma.campaignDeliverable.create({
          data: {
            campaignId: campaign.id,
            deliverableType: d.deliverableType,
            deliverableName: d.deliverableName,
            phase: d.phase,
            scheduledSendAt: d.scheduledSendAt ? new Date(d.scheduledSendAt) : null,
            status: d.status,
          },
        });

        // Create versions
        if (d.versions) {
          await prisma.campaignDeliverableVersion.createMany({
            data: d.versions.map(v => ({
              deliverableId: deliverable.id,
              versionLabel: v.versionLabel,
              segmentCriteriaId: v.segmentCriteriaId,
              contentDraft: v.contentDraft,
              subjectLine: v.subjectLine,
              previewText: v.previewText,
              estimatedRecipients: v.estimatedRecipients,
              sortOrder: v.sortOrder,
            })),
          });
        }
      }
    }

    res.json({ success: true, data: { campaign } });
  })
);
```

---

## 3️⃣ Verify AI Privacy Gateway

Check that `supabase/functions/ai-privacy-gateway/index.ts` handles `category: "campaign"`:

```typescript
// Should already exist from previous implementation
if (category === "campaign") {
  const { system, turns } = payload;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-7-sonnet-latest",
      system: system || "You are a helpful assistant.",
      messages: turns || [{ role: "user", content: "Hello" }],
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({ ok: true, data }));
}
```

If this doesn't exist, create the Edge Function:

```bash
npx supabase functions new ai-privacy-gateway
```

Then copy the implementation from the example in [JOURNEY_AI_REAL_INTEGRATION_SUMMARY.md](./JOURNEY_AI_REAL_INTEGRATION_SUMMARY.md#example-edge-function-stub).

---

## 4️⃣ Update Prisma Schema (if using Prisma)

If you're using Prisma ORM, update `server/prisma/schema.prisma`:

```prisma
model Campaign {
  id                    String   @id @default(uuid())
  name                  String
  clientId              String
  userId                String
  // ... existing fields

  // Journey fields
  journeyType           String?  // "upgrade" | "monthly" | "reactivation"
  originLabRunId        String?
  originLabRunSummary   String?

  deliverables          CampaignDeliverable[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([journeyType])
  @@map("campaigns")
}

model CampaignDeliverable {
  id                String   @id @default(uuid())
  campaignId        String
  deliverableType   String   // "email" | "direct_mail" | "sms" | "social" | "phone"
  deliverableName   String
  phase             String?
  scheduledSendAt   DateTime?
  status            String   @default("draft") // "draft" | "scheduled" | "sent"

  campaign          Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  versions          CampaignDeliverableVersion[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([campaignId])
  @@index([scheduledSendAt])
  @@map("campaign_deliverables")
}

model CampaignDeliverableVersion {
  id                   String   @id @default(uuid())
  deliverableId        String
  versionLabel         String
  segmentCriteriaId    String
  contentDraft         String   @db.Text
  subjectLine          String?
  previewText          String?
  estimatedRecipients  Int?
  sortOrder            Int      @default(1)

  deliverable          CampaignDeliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([deliverableId])
  @@map("campaign_deliverable_versions")
}
```

Then generate migration:

```bash
cd server
npx prisma migrate dev --name add_journey_fields
```

---

## 5️⃣ Test the Integration

### Test 1: Create Journey Campaign

```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Upgrade Journey - Test",
    "clientId": "client_123",
    "journeyType": "upgrade",
    "originLabRunId": "run_abc",
    "originLabRunSummary": "Data Lab from 1/15/2025",
    "deliverables": [{
      "deliverableType": "email",
      "deliverableName": "Touch #1: Gratitude",
      "phase": "Upgrade Journey",
      "scheduledSendAt": "2025-01-20T10:00:00Z",
      "status": "draft",
      "versions": [{
        "versionLabel": "Core donors",
        "segmentCriteriaId": "seg_123",
        "contentDraft": "Hi [Name], thank you...",
        "subjectLine": "You made a difference",
        "sortOrder": 1
      }]
    }]
  }'
```

### Test 2: Load Journey Campaign

```bash
curl -X GET "http://localhost:3000/api/campaigns/camp_xyz?include=deliverables" \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:

```json
{
  "success": true,
  "campaign": {
    "campaignId": "camp_xyz",
    "campaignName": "Q1 Upgrade Journey - Test",
    "journeyType": "upgrade",
    "originLabRunId": "run_abc",
    "deliverables": [
      {
        "deliverableId": "del_1",
        "deliverableName": "Touch #1: Gratitude",
        "phase": "Upgrade Journey",
        "scheduledSendAt": "2025-01-20T10:00:00Z",
        "status": "draft",
        "versions": [...]
      }
    ]
  }
}
```

---

## 6️⃣ Deploy

### Supabase Edge Functions

```bash
# Deploy AI gateway
npx supabase functions deploy ai-privacy-gateway

# Deploy campaigns function (if using)
npx supabase functions deploy campaigns
```

### Express Backend

```bash
cd server
npm run build
# Deploy to your hosting (Railway, Render, etc.)
```

---

## ✅ Checklist

Before marking complete:

- [ ] Database migration created and applied
- [ ] New columns visible in database
- [ ] API endpoint accepts `journeyType`, `deliverables`, `originLabRunId`
- [ ] API endpoint returns these fields in GET requests
- [ ] AI Privacy Gateway handles `category: "campaign"` requests
- [ ] Test campaign creation with journey fields
- [ ] Test campaign loading with deliverables
- [ ] Verify dates serialize/deserialize correctly
- [ ] Check that frontend can save and reload journeys

---

## 📊 Next: Analytics Queries

Once deployed, you can query journey performance:

```sql
-- Journey type performance
SELECT
  journey_type,
  COUNT(*) as total_campaigns,
  AVG(goal_amount) as avg_goal
FROM campaigns
WHERE journey_type IS NOT NULL
GROUP BY journey_type;

-- Upcoming scheduled deliverables
SELECT
  c.campaign_name,
  c.journey_type,
  d.deliverable_name,
  d.scheduled_send_at
FROM campaign_deliverables d
JOIN campaigns c ON d.campaign_id = c.id
WHERE d.scheduled_send_at > NOW()
  AND d.status = 'draft'
ORDER BY d.scheduled_send_at;
```

---

## 🔗 Related Docs

- [JOURNEY_PERSISTENCE_GUIDE.md](./JOURNEY_PERSISTENCE_GUIDE.md) - Front-end patterns
- [JOURNEY_AI_REAL_INTEGRATION_SUMMARY.md](./JOURNEY_AI_REAL_INTEGRATION_SUMMARY.md) - Complete implementation summary

---

**Ready to implement!** Follow this guide step-by-step and you'll have full journey persistence operational. 🚀
