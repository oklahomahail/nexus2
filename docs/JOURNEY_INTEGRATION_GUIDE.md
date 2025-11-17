# Journey System Integration Guide

Complete guide for integrating AI-powered journey components into your campaign builder.

## Overview

The Journey System provides:

- **Template Selection**: Pre-configured multi-touch journeys (upgrade, monthly, reactivation)
- **Auto-Scaffolding**: Creates deliverables from templates
- **AI Content Generation**: Drafts email content using Data Lab insights
- **Visual Journey Map**: Overview sidebar showing structure and progress

## Quick Start

### 1. Basic Integration

```typescript
import { JourneyBuilderDemo } from '@/components/campaigns/JourneyBuilderDemo';

// In your route configuration
<Route path="/clients/:clientId/journey-demo" element={<JourneyBuilderDemo />} />
```

### 2. Component-by-Component Integration

For existing campaign builders, integrate components individually:

```typescript
import { ApplyJourneyTemplatePanel } from "@/components/campaigns/ApplyJourneyTemplatePanel";
import { JourneyOverviewSidebar } from "@/components/campaigns/JourneyOverviewSidebar";
import { JourneyTouchCard } from "@/components/campaigns/JourneyTouchCard";
import { GenerateJourneyWithAiButton } from "@/components/campaigns/GenerateJourneyWithAiButton";
```

## Component Reference

### ApplyJourneyTemplatePanel

Shows journey templates and creates deliverables when applied.

**Props:**

```typescript
{
  labRun: LabRun | null;
  onApply: (journeyType: JourneyType) => void;
}
```

**Usage:**

```typescript
<ApplyJourneyTemplatePanel
  labRun={latestLabRun}
  onApply={(journeyType) => {
    const template = getJourneyTemplate(journeyType);
    // Create deliverables from template.touches
    scaffoldDeliverablesFromTemplate(template);
  }}
/>
```

### JourneyOverviewSidebar

Visual map of the journey showing touches, segments, and timing.

**Props:**

```typescript
{
  journeyTemplate: JourneyTemplate | null;
  labRun: LabRun | null;
  deliverables: Deliverable[];
  segments: BehavioralSegment[];
}
```

**Usage:**

```typescript
<JourneyOverviewSidebar
  journeyTemplate={getJourneyTemplate(journeyType)}
  labRun={labRun}
  deliverables={deliverables}
  segments={segments}
/>
```

### JourneyTouchCard

Editable card for a single journey touch with AI draft button.

**Props:**

```typescript
{
  clientId: string | undefined;
  journeyType: JourneyType;
  touch: JourneyTouchTemplate;
  labRun: LabRun | null;
  segment: BehavioralSegment | null;
  version: DeliverableVersion;
  onChange: (patch: Partial<DeliverableVersion['content']>) => void;
  onError?: (message: string) => void;
}
```

**Usage:**

```typescript
{deliverables.map(d => {
  const touch = journeyTemplate.touches.find(t => t.label === d.name);
  const version = d.versions[0];
  const segment = segments.find(s => s.segmentId === version.segmentCriteriaId);

  return (
    <JourneyTouchCard
      clientId={clientId}
      journeyType={journeyType}
      touch={touch}
      labRun={labRun}
      segment={segment}
      version={version}
      onChange={(patch) => updateVersionContent(d.deliverableId, version.versionId, patch)}
    />
  );
})}
```

### GenerateJourneyWithAiButton

Bulk draft button that generates content for all touches and segments.

**Props:**

```typescript
{
  clientId: string | undefined;
  journeyType: JourneyType | null;
  journeyTemplate: JourneyTemplate | null;
  labRun: LabRun | null;
  deliverables: Deliverable[];
  segments: BehavioralSegment[];
  onUpdateDeliverables: (ds: Deliverable[]) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}
```

**Usage:**

```typescript
<GenerateJourneyWithAiButton
  clientId={clientId}
  journeyType={journeyType}
  journeyTemplate={journeyTemplate}
  labRun={labRun}
  deliverables={deliverables}
  segments={segments}
  onUpdateDeliverables={setDeliverables}
  onSuccess={(msg) => toast.success(msg)}
  onError={(msg) => toast.error(msg)}
/>
```

## Complete Integration Pattern

### Step 1: State Management

```typescript
const [journeyType, setJourneyType] = useState<JourneyType | null>(null);
const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
const [segments, setSegments] = useState<BehavioralSegment[]>([]);
const [labRun, setLabRun] = useState<LabRun | null>(null);

// Load Data Lab run
useEffect(() => {
  if (clientId) {
    const run = getLatestLabRun(clientId);
    setLabRun(run);
  }
}, [clientId]);

// Get journey template
const journeyTemplate = journeyType ? getJourneyTemplate(journeyType) : null;
```

### Step 2: Apply Template Handler

```typescript
const handleApplyTemplate = (type: JourneyType) => {
  const template = getJourneyTemplate(type);
  if (!template) return;

  setJourneyType(type);

  // Create deliverables from template
  const baseDate = new Date();
  const newDeliverables = template.touches.map((touch) => {
    const scheduledDate = new Date(
      baseDate.getTime() + touch.offsetDays * 24 * 60 * 60 * 1000,
    );

    // Pick relevant segments for this journey type
    const relevantSegments = pickSegmentsForJourney(type, segments);

    // Create one version per segment
    const versions = relevantSegments.map((seg) => ({
      versionId: crypto.randomUUID(),
      label: seg.name,
      segmentCriteriaId: seg.segmentId,
      content: { subject: "", body: "" },
    }));

    return {
      deliverableId: crypto.randomUUID(),
      name: touch.label,
      type: touch.channel,
      phase: template.name,
      scheduledSendAt: scheduledDate,
      status: "draft",
      versions,
    };
  });

  setDeliverables(newDeliverables);
};
```

### Step 3: Layout

```typescript
<div className="grid gap-6 lg:grid-cols-[2fr_1.25fr]">
  {/* Left: Touch editors */}
  <div className="space-y-4">
    <GenerateJourneyWithAiButton {...bulkDraftProps} />

    {deliverables.map(deliverable => (
      <JourneyTouchCard {...touchCardProps} />
    ))}
  </div>

  {/* Right: Journey map */}
  <JourneyOverviewSidebar {...sidebarProps} />
</div>
```

## Helper Functions

### Pick Segments for Journey Type

```typescript
function pickSegmentsForJourney(
  type: JourneyType,
  segments: BehavioralSegment[],
): BehavioralSegment[] {
  const labRuleIncludes = (seg: BehavioralSegment, needle: string) =>
    typeof seg.criteria?.labRule === "string" &&
    seg.criteria.labRule.includes(needle);

  if (type === "upgrade") {
    return segments.filter(
      (seg) =>
        labRuleIncludes(seg, "upgradeReady") || /upgrade/i.test(seg.name),
    );
  }

  if (type === "monthly") {
    return segments.filter(
      (seg) =>
        labRuleIncludes(seg, "monthlyProspect") || /monthly/i.test(seg.name),
    );
  }

  if (type === "reactivation") {
    return segments.filter(
      (seg) => labRuleIncludes(seg, "lapsed") || /lapsed/i.test(seg.name),
    );
  }

  return [];
}
```

### Update Version Content

```typescript
const handleUpdateVersion = (
  deliverableId: string,
  versionId: string,
  patch: Partial<DeliverableVersion["content"]>,
) => {
  setDeliverables((prev) =>
    prev.map((d) =>
      d.deliverableId === deliverableId
        ? {
            ...d,
            versions: d.versions.map((v) =>
              v.versionId === versionId
                ? { ...v, content: { ...v.content, ...patch } }
                : v,
            ),
          }
        : d,
    ),
  );
};
```

## Advanced: Auto-Create Versions

Enhance `ApplyJourneyTemplatePanel` to auto-create segment versions:

```typescript
// In ApplyJourneyTemplatePanel
const handleApply = () => {
  if (!selectedType) return;
  const template = getJourneyTemplate(selectedType);
  if (!template) return;

  const targetSegments = pickSegmentsForJourney(
    selectedType,
    availableSegments,
  );
  const deliverables = createDeliverablesWithSegmentVersions(
    template,
    existingDeliverables,
    targetSegments,
  );

  onApply(deliverables);
};
```

## Testing the Integration

### 1. Run the Demo

```bash
# Start dev server
pnpm dev

# Navigate to demo
http://localhost:5173/clients/demo-client/journey-demo
```

### 2. Test Flow

1. **Apply Template**
   - Click "Apply template"
   - Select journey type (upgrade/monthly/reactivation)
   - Verify deliverables created with correct touches

2. **Generate Content**
   - Click "Generate journey with AI"
   - Verify all touch cards populate with content
   - Check subject lines and body copy

3. **Edit Content**
   - Modify subject line
   - Edit body text
   - Verify changes persist

4. **Journey Map**
   - Verify sidebar shows all touches
   - Check segment assignments
   - Confirm scheduled dates

## Type Definitions

Replace temporary interfaces with actual types:

```typescript
// Remove these from component files:
interface Deliverable { ... }
interface DeliverableVersion { ... }
interface BehavioralSegment { ... }

// Import actual types:
import type { Deliverable, DeliverableVersion } from '@/types/campaign';
import type { BehavioralSegment } from '@/types/analytics'; // or wherever defined
```

## Next Steps

1. **Claude API Integration**
   - Replace mock in `journeyAiCoachService.ts`
   - Use `_enrichedPrompt` variable with actual API call

2. **Persistence**
   - Save campaigns to database
   - Store `journeyType` on campaign
   - Persist deliverables and versions

3. **Segment Loading**
   - Fetch actual segments from Data Lab
   - Filter by journey type
   - Handle segment updates

4. **Performance**
   - Add loading skeletons
   - Implement optimistic updates
   - Debounce content changes

## Troubleshooting

### "No segments assigned" warning

- Ensure segments are loaded before applying template
- Check segment selection logic in `pickSegmentsForJourney`
- Verify segment `segmentId` matches version `segmentCriteriaId`

### AI draft button disabled

- Verify `clientId` is present
- Check that `labRun` is loaded
- Ensure segment is assigned to version

### Content not updating

- Check `onChange` handler is called
- Verify state update in parent component
- Ensure version IDs match

## Resources

- [Journey Templates](../src/utils/journeyTemplates.ts)
- [AI Coach Service](../src/services/journeyAiCoachService.ts)
- [Bulk Draft Service](../src/services/journeyBulkDraftService.ts)
- [Demo Component](../src/components/campaigns/JourneyBuilderDemo.tsx)
