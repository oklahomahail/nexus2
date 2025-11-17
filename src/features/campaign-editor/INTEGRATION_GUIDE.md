# Campaign Editor Integration Guide

This guide shows how to integrate the Campaign AI Service and Persistence Service into your campaign editor steps.

## Services Overview

### 1. Campaign AI Service (`campaignAiService.ts`)

Privacy-aware AI service for generating campaign content:
- Campaign narratives
- Email series
- Social media posts
- Direct mail copy
- Creative briefs

All requests route through the AI Privacy Gateway to ensure PII protection.

### 2. Campaign Persistence Service (`campaignPersistenceService.ts`)

Autosave and persistence layer:
- Debounced autosave (500ms)
- Local storage backup
- Save status tracking
- Force save on demand
- Campaign publishing

## Basic Usage

### In useCampaignEditor Hook

The hook is already wired with:
- Automatic local draft recovery on mount
- Autosave on every `updateCampaign` call
- Save status tracking
- Force save method

```tsx
const {
  campaign,
  updateCampaign,
  step,
  goNext,
  goBack,
  saveStatus,      // { saving, lastSaved, error }
  forceSave,       // async function
} = useCampaignEditor(initialDraft);
```

### Save Status Indicator

Display save status in your UI:

```tsx
function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status.saving) {
    return <span className="text-gray-500">Saving...</span>;
  }

  if (status.error) {
    return (
      <span className="text-red-600">
        Error: {status.error}
      </span>
    );
  }

  if (status.lastSaved) {
    return (
      <span className="text-green-600">
        Saved {formatRelativeTime(status.lastSaved)}
      </span>
    );
  }

  return null;
}
```

## Step-by-Step Integration Examples

### Review Draft Step

Generate and display campaign narrative:

```tsx
// src/features/campaign-editor/steps/ReviewDraftStep.tsx
import { useState } from "react";
import { campaignAiService } from "@/services/campaignAiService";
import { Button } from "@/features/ui-kit";

export function ReviewDraftStep({ campaign, updateCampaign, goNext, goBack }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateDraft() {
    setGenerating(true);
    setError(null);

    try {
      const narrative = await campaignAiService.generateNarrative(campaign);
      updateCampaign({ draftPreview: narrative });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate draft");
    } finally {
      setGenerating(false);
    }
  }

  async function regenerateDraft() {
    await generateDraft();
  }

  return (
    <div className="space-y-6">
      <h2>Review Campaign Draft</h2>

      {!campaign.draftPreview && (
        <div className="text-center py-8">
          <p className="mb-4">Generate your campaign narrative to continue</p>
          <Button
            onClick={generateDraft}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Draft"}
          </Button>
        </div>
      )}

      {campaign.draftPreview && (
        <>
          <div className="prose max-w-none">
            {campaign.draftPreview}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={regenerateDraft}
              disabled={generating}
            >
              Regenerate
            </Button>
            <Button onClick={goNext}>
              Continue to Publish
            </Button>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Publish Step

Generate all deliverables and publish:

```tsx
// src/features/campaign-editor/steps/PublishStep.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { campaignAiService } from "@/services/campaignAiService";
import { campaignPersistenceService } from "@/services/campaignPersistenceService";
import { Button } from "@/features/ui-kit";

export function PublishStep({ campaign, goBack }) {
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  async function handlePublish() {
    setPublishing(true);
    setError(null);

    try {
      // 1. Generate email series
      setProgress("Generating email series...");
      const emailCount = campaign.deliverables?.emailCount || 10;
      const emailResult = await campaignAiService.generateEmailSeries(
        campaign,
        emailCount
      );

      if (emailResult.error) {
        throw new Error(emailResult.error);
      }

      // 2. Generate social posts
      setProgress("Generating social posts...");
      const socialCount = campaign.deliverables?.socialCount || 10;
      const socialResult = await campaignAiService.generateSocialPosts(
        campaign,
        socialCount
      );

      if (socialResult.error) {
        throw new Error(socialResult.error);
      }

      // 3. Generate direct mail (if requested)
      let directMail: string | undefined;
      if (campaign.deliverables?.includeDirectMail) {
        setProgress("Generating direct mail copy...");
        const dmResult = await campaignAiService.generateDirectMail(campaign);

        if (dmResult.error) {
          throw new Error(dmResult.error);
        }

        directMail = dmResult.copy;
      }

      // 4. Generate creative brief
      setProgress("Generating creative brief...");
      const creativeBrief = await campaignAiService.generateCreativeBrief(
        campaign
      );

      // 5. Publish everything
      setProgress("Publishing campaign...");
      await campaignPersistenceService.publish(campaign, {
        emails: emailResult.emails,
        posts: socialResult.posts,
        directMail,
        creativeBrief,
      });

      // 6. Navigate to campaign detail page
      navigate(`/clients/${campaign.clientId}/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish campaign");
    } finally {
      setPublishing(false);
      setProgress("");
    }
  }

  const emailCount = campaign.deliverables?.emailCount || 10;
  const socialCount = campaign.deliverables?.socialCount || 10;
  const includeDirectMail = campaign.deliverables?.includeDirectMail || false;

  return (
    <div className="space-y-6">
      <h2>Publish Campaign</h2>

      <div className="bg-gray-50 p-6 rounded space-y-4">
        <h3 className="font-medium">Campaign Summary</h3>

        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">Title</dt>
            <dd className="font-medium">{campaign.overview?.title}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Season</dt>
            <dd className="font-medium">{campaign.overview?.season}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Email Count</dt>
            <dd className="font-medium">{emailCount} emails</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Social Posts</dt>
            <dd className="font-medium">{socialCount} posts</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Direct Mail</dt>
            <dd className="font-medium">
              {includeDirectMail ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm">
          Publishing will generate all campaign deliverables using AI.
          This may take 30-60 seconds.
        </p>
      </div>

      {progress && (
        <div className="bg-gray-50 p-4 rounded text-center">
          <div className="animate-pulse">{progress}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={publishing}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handlePublish}
          disabled={publishing}
        >
          {publishing ? "Publishing..." : "Publish Campaign"}
        </Button>
      </div>
    </div>
  );
}
```

### Individual Deliverable Generation

Generate specific deliverables on demand:

```tsx
// Generate just emails
async function generateEmails() {
  const result = await campaignAiService.generateEmailSeries(campaign, 12);

  if (result.error) {
    console.error(result.error);
    return;
  }

  console.log("Generated emails:", result.emails);
}

// Generate just social posts
async function generateSocial() {
  const result = await campaignAiService.generateSocialPosts(campaign, 15);

  if (result.error) {
    console.error(result.error);
    return;
  }

  console.log("Generated posts:", result.posts);
}

// Generate direct mail
async function generateDM() {
  const result = await campaignAiService.generateDirectMail(campaign);

  if (result.error) {
    console.error(result.error);
    return;
  }

  console.log("Direct mail copy:", result.copy);
}
```

## Force Save Before Navigation

Save campaign before navigating away:

```tsx
import { useEffect } from "react";
import { useBeforeUnload } from "react-router-dom";

function CampaignEditor() {
  const { campaign, forceSave, saveStatus } = useCampaignEditor(draft);

  // Save before browser close/reload
  useBeforeUnload((e) => {
    if (saveStatus.saving) {
      e.preventDefault();
      return "You have unsaved changes. Are you sure you want to leave?";
    }
  });

  // Save before route navigation
  useEffect(() => {
    return () => {
      forceSave();
    };
  }, [forceSave]);

  return (
    // ... your editor UI
  );
}
```

## Error Handling

All services return structured error responses:

```tsx
// AI Service errors
const result = await campaignAiService.generateNarrative(campaign);
// Result is either the content string or throws an error

// Persistence errors via save status
if (saveStatus.error) {
  console.error("Save failed:", saveStatus.error);
  // Note: Changes are still saved to local storage
}

// Publish errors
try {
  await campaignPersistenceService.publish(campaign, deliverables);
} catch (error) {
  console.error("Publish failed:", error);
}
```

## Privacy & Security

### AI Privacy Gateway

All AI requests automatically:
- Strip PII before sending to Claude
- Validate privacy compliance
- Log requests for audit trail
- Block requests with sensitive data

### Local Storage

Drafts are saved to local storage as backup:
- Automatically on every change
- Cleared on successful publish
- Recoverable after browser crash
- Scoped to campaign ID

## Database Schema (TODO)

When ready to wire up Supabase, update these placeholder queries:

### campaigns table

```sql
create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  status text default 'draft',
  overview jsonb,
  theme jsonb,
  audience jsonb,
  deliverables jsonb,
  draft_preview text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);
```

### campaign_emails table

```sql
create table campaign_emails (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  sequence_number int,
  subject text,
  preheader text,
  body text,
  created_at timestamp with time zone default now()
);
```

### campaign_social_posts table

```sql
create table campaign_social_posts (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  platform text,
  body text,
  cta text,
  created_at timestamp with time zone default now()
);
```

## Next Steps

1. Replace placeholder API calls in `campaignPersistenceService.ts` with real Supabase queries
2. Create database tables for campaigns and deliverables
3. Add campaign list/detail views
4. Build deliverable preview/edit UI
5. Add export functionality (PDF, email service integration, etc.)
6. Implement campaign analytics and performance tracking
