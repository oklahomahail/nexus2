# Track15 API Documentation

**Version:** 1.0
**Last Updated:** 2025-01-14

---

## Table of Contents

1. [Overview](#overview)
2. [Service Methods](#service-methods)
3. [React Hooks](#react-hooks)
4. [Type Definitions](#type-definitions)
5. [Database Schema](#database-schema)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Overview

The Track15 API provides methods for creating, managing, and analyzing Track15 fundraising campaigns. All methods interact with Supabase for data persistence and use TypeScript for type safety.

### Base Imports

```typescript
import { supabase } from "@/lib/supabaseClient";
import type {
  Track15Season,
  Track15Stage,
  Track15CoreStory,
  Track15NarrativeStep,
  Track15LiftMetrics,
  SegmentPerformanceData,
  RetentionSeriesData,
} from "@/types/track15.types";
```

### Service Location

All Track15 service methods are located in:

```
src/services/track15Service.ts
```

---

## Service Methods

### enableTrack15()

Enable Track15 methodology for a campaign.

**Signature:**

```typescript
async function enableTrack15(
  campaignId: string,
  season: Track15Season,
  templateKey?: string,
): Promise<void>;
```

**Parameters:**

- `campaignId` (string, required): Campaign UUID
- `season` (Track15Season, required): One of "spring" | "summer" | "fall" | "year_end"
- `templateKey` (string, optional): Template identifier for pre-built narrative arcs

**Returns:**

- `Promise<void>`: Resolves on success

**Throws:**

- Error if campaign not found
- Error if database update fails

**Example:**

```typescript
import { enableTrack15 } from "@/services/track15Service";

// Enable Track15 for spring campaign
await enableTrack15("campaign-uuid-123", "spring");

// Enable with template
await enableTrack15("campaign-uuid-123", "year_end", "holiday-appeal-2025");
```

**Database Changes:**

- Sets `track15_enabled = true`
- Sets `track15_season = season`
- Sets `track15_template_key = templateKey` (if provided)
- Sets `track15_stage = 'draft'`
- Initializes `track15_core_story = {}`

---

### updateCoreStory()

Update the core story for a Track15 campaign.

**Signature:**

```typescript
async function updateCoreStory(
  campaignId: string,
  coreStory: Partial<Track15CoreStory>,
): Promise<void>;
```

**Parameters:**

- `campaignId` (string, required): Campaign UUID
- `coreStory` (Partial<Track15CoreStory>, required): Core story object with fields:
  - `headline` (string): 6-10 word campaign headline
  - `summary` (string): 2-3 sentence campaign summary
  - `value_proposition` (string): What donor gets from giving
  - `donor_motivation` (string): Why donor should care

**Returns:**

- `Promise<void>`: Resolves on success

**Throws:**

- Error if campaign not found
- Error if campaign is not Track15-enabled

**Example:**

```typescript
import { updateCoreStory } from "@/services/track15Service";

const coreStory = {
  headline: "Feed 500 Families This Spring",
  summary:
    "Every $50 provides a week of groceries for a family facing food insecurity.",
  value_proposition: "Your $50 gift provides tangible, measurable impact.",
  donor_motivation:
    "Because every child deserves to go to bed with a full stomach.",
};

await updateCoreStory("campaign-uuid-123", coreStory);
```

**Database Changes:**

- Updates `track15_core_story` JSONB field
- Merges with existing data (partial updates supported)

---

### bulkUpdateNarrativeSteps()

Create or update multiple narrative steps for a campaign.

**Signature:**

```typescript
async function bulkUpdateNarrativeSteps(
  campaignId: string,
  steps: Track15NarrativeStep[],
): Promise<void>;
```

**Parameters:**

- `campaignId` (string, required): Campaign UUID
- `steps` (Track15NarrativeStep[], required): Array of narrative steps (max 15)

**Step Structure:**

```typescript
interface Track15NarrativeStep {
  step_number: number; // 1-15
  stage: Track15Stage; // "awareness" | "engagement" | "consideration" | "conversion" | "gratitude"
  day: number; // 1-15
  subject_line: string; // Email subject
  message: string; // Core message content
  call_to_action: string; // What donor should do
  segment_customization?: Record<string, any>; // Optional per-segment variations
}
```

**Returns:**

- `Promise<void>`: Resolves on success

**Throws:**

- Error if campaign not found
- Error if more than 15 steps provided
- Error if step numbers not unique
- Error if database insert fails

**Example:**

```typescript
import { bulkUpdateNarrativeSteps } from "@/services/track15Service";

const steps: Track15NarrativeStep[] = [
  {
    step_number: 1,
    stage: "awareness",
    day: 1,
    subject_line: "Meet the families we serve",
    message: "Introduction to community need...",
    call_to_action: "Learn more about our food pantry",
  },
  {
    step_number: 2,
    stage: "awareness",
    day: 2,
    subject_line: "Behind the scenes at our food pantry",
    message: "Show operations, introduce staff...",
    call_to_action: "See how we ensure quality and dignity",
  },
  // ... up to 15 steps
];

await bulkUpdateNarrativeSteps("campaign-uuid-123", steps);
```

**Database Changes:**

- Inserts/updates rows in `track15_narrative_steps` table
- Uses upsert logic (insert or update based on campaign_id + step_number)

---

### updateTrack15Stage()

Update the stage of a Track15 campaign.

**Signature:**

```typescript
async function updateTrack15Stage(
  campaignId: string,
  stage: Track15Stage,
): Promise<void>;
```

**Parameters:**

- `campaignId` (string, required): Campaign UUID
- `stage` (Track15Stage, required): One of:
  - `"draft"`: Campaign being built
  - `"ready_for_launch"`: Complete, awaiting activation
  - `"active"`: Currently running
  - `"paused"`: Temporarily stopped
  - `"completed"`: 15-day window finished

**Returns:**

- `Promise<void>`: Resolves on success

**Throws:**

- Error if campaign not found
- Error if invalid stage transition

**Example:**

```typescript
import { updateTrack15Stage } from "@/services/track15Service";

// Mark campaign as ready to launch
await updateTrack15Stage("campaign-uuid-123", "ready_for_launch");

// Activate campaign
await updateTrack15Stage("campaign-uuid-123", "active");
```

**Database Changes:**

- Updates `track15_stage` field
- Updates `updated_at` timestamp

---

### getLiftMetrics()

Get performance lift metrics for a Track15 campaign.

**Signature:**

```typescript
async function getLiftMetrics(campaignId: string): Promise<Track15LiftMetrics>;
```

**Parameters:**

- `campaignId` (string, required): Campaign UUID

**Returns:**

```typescript
interface Track15LiftMetrics {
  control_conversion: number; // Control group conversion rate (0-1)
  track15_conversion: number; // Track15 conversion rate (0-1)
  lift_percentage: number; // Percentage improvement
  control_revenue: number; // Expected revenue without Track15
  track15_revenue: number; // Actual revenue with Track15
  revenue_lift: number; // Revenue improvement percentage
}
```

**Throws:**

- Error if campaign not found
- Error if campaign not Track15-enabled
- Error if insufficient data for calculation

**Example:**

```typescript
import { getLiftMetrics } from "@/services/track15Service";

const metrics = await getLiftMetrics("campaign-uuid-123");

console.log(`Conversion Lift: ${metrics.lift_percentage}%`);
console.log(`Revenue Lift: ${metrics.revenue_lift}%`);
console.log(`Track15 Revenue: $${metrics.track15_revenue.toLocaleString()}`);
```

**Calculation Logic:**

```typescript
// Lift percentage = ((Track15 - Control) / Control) × 100
lift_percentage =
  ((track15_conversion - control_conversion) / control_conversion) * 100;

// Revenue lift = ((Track15 Revenue - Control Revenue) / Control Revenue) × 100
revenue_lift = ((track15_revenue - control_revenue) / control_revenue) * 100;
```

---

### getSegmentPerformance()

Get performance metrics broken down by RFM donor segment.

**Signature:**

```typescript
async function getSegmentPerformance(
  campaignId: string,
): Promise<SegmentPerformanceData[]>;
```

**Parameters:**

- `campaignId` (string, required): Campaign UUID

**Returns:**

```typescript
interface SegmentPerformanceData {
  segment_name: string; // "Champions" | "Loyal" | "Potential" | "New" | "Promising" | "Need Attention" | "At Risk"
  donor_count: number; // Number of donors who gave
  total_gifts: number; // Sum of all donations
  avg_gift_size: number; // Mean donation amount
  lift_percentage: number; // Performance vs. baseline
}
```

**Throws:**

- Error if campaign not found
- Error if no donation data available

**Example:**

```typescript
import { getSegmentPerformance } from "@/services/track15Service";

const segments = await getSegmentPerformance("campaign-uuid-123");

// Find top performing segment
const topSegment = segments.reduce((max, segment) =>
  segment.lift_percentage > max.lift_percentage ? segment : max,
);

console.log(`Top Segment: ${topSegment.segment_name}`);
console.log(`Lift: ${topSegment.lift_percentage}%`);
console.log(`Donors: ${topSegment.donor_count}`);
console.log(`Avg Gift: $${topSegment.avg_gift_size.toFixed(2)}`);
```

**Calculation Logic:**

```typescript
// For each RFM segment:
// 1. Get all donations for campaign from that segment
// 2. Count unique donors
// 3. Sum total donation amounts
// 4. Calculate average gift size
// 5. Compare to historical baseline for lift calculation
```

---

### getRetentionSeries()

Get donor retention data across the 5 Track15 stages.

**Signature:**

```typescript
async function getRetentionSeries(
  campaignId: string,
): Promise<RetentionSeriesData>;
```

**Parameters:**

- `campaignId` (string, required): Campaign UUID

**Returns:**

```typescript
interface RetentionSeriesData {
  series: RetentionDataPoint[];
}

interface RetentionDataPoint {
  stage: Track15Stage; // "awareness" | "engagement" | etc.
  donors: number; // Donor count at this stage
  retention_rate: number; // Percentage retained from start
  cumulative_revenue: number; // Total revenue through this stage
}
```

**Throws:**

- Error if campaign not found
- Error if campaign not yet active

**Example:**

```typescript
import { getRetentionSeries } from "@/services/track15Service";

const { series } = await getRetentionSeries("campaign-uuid-123");

series.forEach((point) => {
  console.log(`Stage: ${point.stage}`);
  console.log(`Donors: ${point.donors}`);
  console.log(`Retention: ${point.retention_rate}%`);
  console.log(`Revenue: $${point.cumulative_revenue.toLocaleString()}`);
  console.log("---");
});

// Calculate drop-off between stages
for (let i = 1; i < series.length; i++) {
  const dropoff = series[i - 1].donors - series[i].donors;
  const dropoffPct = (dropoff / series[i - 1].donors) * 100;
  console.log(
    `${series[i - 1].stage} → ${series[i].stage}: ${dropoffPct.toFixed(1)}% drop-off`,
  );
}
```

**Calculation Logic:**

```typescript
// For each stage:
// 1. Count donors who engaged with touchpoints in that stage
// 2. Calculate retention rate vs. initial awareness count
// 3. Sum all revenue generated through that stage
```

---

## React Hooks

### useTrack15Metrics

Custom hook for fetching lift metrics with loading/error states.

**Signature:**

```typescript
function useTrack15Metrics(campaignId: string | null): UseTrack15MetricsReturn;
```

**Parameters:**

- `campaignId` (string | null, required): Campaign UUID or null

**Returns:**

```typescript
interface UseTrack15MetricsReturn {
  metrics: Track15LiftMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Example:**

```typescript
import { useTrack15Metrics } from "@/hooks/useTrack15Metrics";

function MyComponent() {
  const { metrics, isLoading, error, refetch } = useTrack15Metrics(campaignId);

  if (isLoading) return <div>Loading metrics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!metrics) return <div>No data available</div>;

  return (
    <div>
      <h2>Lift Metrics</h2>
      <p>Conversion Lift: {metrics.lift_percentage}%</p>
      <p>Revenue Lift: {metrics.revenue_lift}%</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

**Behavior:**

- Fetches data on mount and when `campaignId` changes
- Skips fetch if `campaignId` is null
- Auto-updates loading/error states
- Provides `refetch()` for manual refresh

**Location:** `src/hooks/useTrack15Metrics.ts`

---

### useTrack15Segments

Custom hook for fetching segment performance data.

**Signature:**

```typescript
function useTrack15Segments(
  campaignId: string | null,
): UseTrack15SegmentsReturn;
```

**Parameters:**

- `campaignId` (string | null, required): Campaign UUID or null

**Returns:**

```typescript
interface UseTrack15SegmentsReturn {
  segments: SegmentPerformanceData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Example:**

```typescript
import { useTrack15Segments } from "@/hooks/useTrack15Segments";

function SegmentTable() {
  const { segments, isLoading, error } = useTrack15Segments(campaignId);

  if (isLoading) return <div>Loading segments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Segment</th>
          <th>Donors</th>
          <th>Total</th>
          <th>Avg Gift</th>
          <th>Lift</th>
        </tr>
      </thead>
      <tbody>
        {segments.map(segment => (
          <tr key={segment.segment_name}>
            <td>{segment.segment_name}</td>
            <td>{segment.donor_count}</td>
            <td>${segment.total_gifts.toLocaleString()}</td>
            <td>${segment.avg_gift_size.toFixed(2)}</td>
            <td>{segment.lift_percentage}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Location:** `src/hooks/useTrack15Segments.ts`

---

### useTrack15Retention

Custom hook for fetching retention series data.

**Signature:**

```typescript
function useTrack15Retention(
  campaignId: string | null,
): UseTrack15RetentionReturn;
```

**Parameters:**

- `campaignId` (string | null, required): Campaign UUID or null

**Returns:**

```typescript
interface UseTrack15RetentionReturn {
  data: RetentionSeriesData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Example:**

```typescript
import { useTrack15Retention } from "@/hooks/useTrack15Retention";
import Track15RetentionChart from "@/components/analytics/Track15RetentionChart";

function RetentionView() {
  const { data, isLoading, error } = useTrack15Retention(campaignId);

  if (isLoading) return <div>Loading retention data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No retention data available</div>;

  return <Track15RetentionChart data={data} />;
}
```

**Location:** `src/hooks/useTrack15Retention.ts`

---

## Type Definitions

### Track15Season

```typescript
type Track15Season = "spring" | "summer" | "fall" | "year_end";
```

**Usage:**

- Campaign creation
- Template selection
- Seasonal messaging themes

---

### Track15Stage

```typescript
type Track15Stage =
  | "draft"
  | "ready_for_launch"
  | "active"
  | "paused"
  | "completed";
```

**Narrative Stage (different from campaign stage):**

```typescript
type NarrativeStage =
  | "awareness"
  | "engagement"
  | "consideration"
  | "conversion"
  | "gratitude";
```

---

### Track15CoreStory

```typescript
interface Track15CoreStory {
  headline: string; // 6-10 word campaign headline
  summary: string; // 2-3 sentence summary
  value_proposition: string; // What donor gets
  donor_motivation: string; // Why donor should care
}
```

**Stored as:** JSONB in `campaigns.track15_core_story`

---

### Track15NarrativeStep

```typescript
interface Track15NarrativeStep {
  id?: string; // UUID (auto-generated)
  campaign_id: string; // Foreign key
  step_number: number; // 1-15
  stage: NarrativeStage; // Which of 5 stages
  day: number; // 1-15
  subject_line: string; // Email subject
  message: string; // Core content
  call_to_action: string; // What donor should do
  segment_customization?: Record<string, any>; // Per-segment variations
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
}
```

---

### Track15LiftMetrics

```typescript
interface Track15LiftMetrics {
  control_conversion: number; // 0-1 (e.g., 0.032 = 3.2%)
  track15_conversion: number; // 0-1 (e.g., 0.048 = 4.8%)
  lift_percentage: number; // Percentage (e.g., 50.0)
  control_revenue: number; // Dollar amount
  track15_revenue: number; // Dollar amount
  revenue_lift: number; // Percentage (e.g., 50.0)
}
```

---

### SegmentPerformanceData

```typescript
interface SegmentPerformanceData {
  segment_name: RFMSegment; // Segment identifier
  donor_count: number; // Number of donors
  total_gifts: number; // Sum of donations
  avg_gift_size: number; // Mean gift amount
  lift_percentage: number; // Performance vs baseline
}

type RFMSegment =
  | "Champions"
  | "Loyal"
  | "Potential Loyalists"
  | "New Donors"
  | "Promising"
  | "Need Attention"
  | "At Risk";
```

---

### RetentionSeriesData

```typescript
interface RetentionSeriesData {
  series: RetentionDataPoint[];
}

interface RetentionDataPoint {
  stage: NarrativeStage; // Which stage
  donors: number; // Donor count at stage
  retention_rate: number; // % of initial donors
  cumulative_revenue: number; // Total $ through stage
}
```

---

## Database Schema

### campaigns Table Extensions

Track15 adds these fields to the `campaigns` table:

```sql
-- Track15 enablement
track15_enabled BOOLEAN DEFAULT FALSE,
track15_season VARCHAR(20),  -- 'spring' | 'summer' | 'fall' | 'year_end'
track15_stage VARCHAR(30),   -- 'draft' | 'ready_for_launch' | 'active' | etc.
track15_template_key VARCHAR(100),

-- Core story (JSONB)
track15_core_story JSONB,

-- Performance metrics (calculated)
track15_control_conversion DECIMAL(5,4),
track15_test_conversion DECIMAL(5,4),
track15_control_revenue DECIMAL(12,2),
track15_test_revenue DECIMAL(12,2),

-- Timestamps
track15_activated_at TIMESTAMPTZ,
track15_completed_at TIMESTAMPTZ
```

**Indexes:**

```sql
CREATE INDEX idx_campaigns_track15_enabled ON campaigns(track15_enabled);
CREATE INDEX idx_campaigns_track15_season ON campaigns(track15_season);
CREATE INDEX idx_campaigns_track15_stage ON campaigns(track15_stage);
```

---

### track15_narrative_steps Table

```sql
CREATE TABLE track15_narrative_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 15),
  stage VARCHAR(20) NOT NULL,  -- 'awareness' | 'engagement' | etc.
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 15),
  subject_line TEXT NOT NULL,
  message TEXT NOT NULL,
  call_to_action TEXT NOT NULL,
  segment_customization JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(campaign_id, step_number)
);

CREATE INDEX idx_track15_narrative_steps_campaign ON track15_narrative_steps(campaign_id);
CREATE INDEX idx_track15_narrative_steps_stage ON track15_narrative_steps(stage);
```

---

## Error Handling

### Common Errors

**Campaign Not Found:**

```typescript
try {
  await getLiftMetrics("invalid-id");
} catch (error) {
  // Error: Campaign not found
  console.error(error.message);
}
```

**Track15 Not Enabled:**

```typescript
try {
  await updateCoreStory("non-track15-campaign", story);
} catch (error) {
  // Error: Campaign is not Track15-enabled
  console.error(error.message);
}
```

**Insufficient Data:**

```typescript
try {
  await getSegmentPerformance("new-campaign-with-no-donations");
} catch (error) {
  // Error: No donation data available for this campaign
  console.error(error.message);
}
```

### Error Response Format

All service methods throw standard JavaScript `Error` objects:

```typescript
interface ErrorResponse {
  message: string; // Human-readable error message
  code?: string; // Error code (if applicable)
  details?: any; // Additional context
}
```

### Best Practices

**1. Always wrap in try/catch:**

```typescript
try {
  const metrics = await getLiftMetrics(campaignId);
  setMetrics(metrics);
} catch (error) {
  setError(error instanceof Error ? error.message : "Unknown error");
  console.error("Failed to fetch metrics:", error);
}
```

**2. Validate input before calling:**

```typescript
if (!campaignId) {
  console.warn("No campaign ID provided");
  return;
}

const metrics = await getLiftMetrics(campaignId);
```

**3. Use hooks for React components:**

```typescript
// ✅ Good: Use hook (handles errors automatically)
const { metrics, error } = useTrack15Metrics(campaignId);

// ❌ Bad: Call service directly in component
const [metrics, setMetrics] = useState(null);
useEffect(() => {
  getLiftMetrics(campaignId).then(setMetrics); // Missing error handling!
}, [campaignId]);
```

---

## Examples

### Complete Campaign Creation Flow

```typescript
import { supabase } from "@/lib/supabaseClient";
import {
  enableTrack15,
  updateCoreStory,
  bulkUpdateNarrativeSteps,
  updateTrack15Stage,
} from "@/services/track15Service";

async function createTrack15Campaign() {
  try {
    // 1. Create base campaign
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        name: "Spring Food Security 2025",
        client_id: "client-uuid",
        goal_amount: 50000,
        start_date: "2025-03-15",
        end_date: "2025-03-29",
      })
      .select()
      .single();

    if (error) throw error;

    const campaignId = campaign.id;

    // 2. Enable Track15
    await enableTrack15(campaignId, "spring");

    // 3. Add core story
    const coreStory = {
      headline: "Feed 500 Families This Spring",
      summary:
        "Every $50 provides a week of groceries for a family facing food insecurity.",
      value_proposition: "Your $50 gift provides tangible, measurable impact.",
      donor_motivation:
        "Because every child deserves to go to bed with a full stomach.",
    };
    await updateCoreStory(campaignId, coreStory);

    // 4. Build narrative arc
    const narrativeSteps = [
      {
        step_number: 1,
        stage: "awareness",
        day: 1,
        subject_line: "Meet the families we serve",
        message: "Introduction to community need...",
        call_to_action: "Learn more about our food pantry",
      },
      // ... 14 more steps
    ];
    await bulkUpdateNarrativeSteps(campaignId, narrativeSteps);

    // 5. Mark ready for launch
    await updateTrack15Stage(campaignId, "ready_for_launch");

    console.log("Campaign created successfully!", campaignId);
    return campaignId;
  } catch (error) {
    console.error("Failed to create campaign:", error);
    throw error;
  }
}
```

### Fetching and Displaying Analytics

```typescript
import { useTrack15Metrics, useTrack15Segments } from "@/hooks";

function Track15Dashboard({ campaignId }: { campaignId: string }) {
  const { metrics, isLoading: metricsLoading } = useTrack15Metrics(campaignId);
  const { segments, isLoading: segmentsLoading } = useTrack15Segments(campaignId);

  if (metricsLoading || segmentsLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      {/* Lift Metrics */}
      <section>
        <h2>Lift Metrics</h2>
        <div>
          <p>Conversion Lift: {metrics?.lift_percentage.toFixed(1)}%</p>
          <p>Revenue Lift: {metrics?.revenue_lift.toFixed(1)}%</p>
          <p>Total Revenue: ${metrics?.track15_revenue.toLocaleString()}</p>
        </div>
      </section>

      {/* Segment Performance */}
      <section>
        <h2>Segment Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Segment</th>
              <th>Donors</th>
              <th>Revenue</th>
              <th>Avg Gift</th>
              <th>Lift</th>
            </tr>
          </thead>
          <tbody>
            {segments.map(segment => (
              <tr key={segment.segment_name}>
                <td>{segment.segment_name}</td>
                <td>{segment.donor_count}</td>
                <td>${segment.total_gifts.toLocaleString()}</td>
                <td>${segment.avg_gift_size.toFixed(2)}</td>
                <td>{segment.lift_percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

---

## Additional Resources

- [Track15 User Guide](TRACK15_USER_GUIDE.md)
- [Track15 Data Model](TRACK15_DATA_MODEL.md)
- [Integration Testing Plan](ISSUE_4_TESTING_PLAN.md)
- [Supabase Documentation](https://supabase.com/docs)

---

_Last Updated: 2025-01-14_
_Version: 1.0_
_© 2025 Nexus. All rights reserved._
