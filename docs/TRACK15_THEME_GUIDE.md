# Track15 Theme Implementation Guide

**Created:** 2025-01-14
**Status:** Theme CSS Complete, Component Updates Pending

---

## Overview

This guide documents the Track15.com-inspired light theme that has been added to Nexus for Track15-specific views. The theme provides a professional, clean look that matches the Track15.com brand while maintaining Nexus's existing dark theme for standard features.

---

## Theme Configuration Complete ✅

### CSS Variables Added

All Track15 theme variables have been added to `src/index.css`:

```css
/* Track15 Brand Colors - Light Theme Palette */
--track15-primary: 13 95 168; /* #0D5FA8 - Professional Blue */
--track15-primary-dark: 9 64 112; /* #094070 - Deeper Blue */
--track15-primary-soft: 229 241 255; /* #E5F1FF - Light Blue BG */
--track15-accent: 249 168 38; /* #F9A826 - Warm Orange/Gold */
--track15-bg: 244 245 247; /* #F4F5F7 - Page Background */
--track15-surface: 255 255 255; /* #FFFFFF - Card Surface */
--track15-border: 229 231 235; /* #E5E7EB - Border */
--track15-text: 31 41 51; /* #1F2933 - Primary Text */
--track15-muted: 107 114 128; /* #6B7280 - Muted Text */

/* Track15 Typography */
--font-track15-heading: "Montserrat", var(--font-sans);
--font-track15-body: "Source Sans 3", var(--font-sans);
```

### Utility Classes Available

All utility classes have been added to `src/index.css`:

**Background:**

- `.track15-bg` - Page background (#F4F5F7)
- `.track15-surface` - Card/surface white
- `.track15-primary` - Primary blue button
- `.track15-primary-soft` - Light blue highlight
- `.bg-track15-primary` - Primary blue background
- `.bg-track15-accent` - Accent orange background

**Text:**

- `.track15-text` - Primary text color
- `.track15-text-muted` - Muted text
- `.text-track15-primary` - Primary blue text
- `.text-track15-accent` - Accent orange text

**Borders:**

- `.track15-border` - Border color

**Typography:**

- `.font-track15-heading` - Montserrat font for headings
- `.font-track15-body` - Source Sans 3 for body

**Components:**

- `.track15-card` - Pre-styled card (rounded, border, shadow)
- `.track15-stepper-step` - Base stepper circle
  - `.active` - Current step (blue outline, light blue bg)
  - `.completed` - Done step (blue bg, white text)
  - `.pending` - Future step (gray)

### Fonts Loaded ✅

Google Fonts imported in `src/index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap");
```

---

## Components To Update

### 1. Track15CampaignWizard

**File:** `src/panels/Track15CampaignWizard.tsx`

**Current State:** Uses dark Nexus theme
**Target State:** Light Track15 theme

**Changes Needed:**

#### Container/Wrapper

```tsx
// BEFORE
<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">

// AFTER
<div className="min-h-screen track15-bg px-4 py-10">
```

#### Header

```tsx
// BEFORE
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
  Create Track15 Campaign
</h1>

// AFTER
<h1 className="text-3xl font-semibold font-track15-heading text-track15-primary">
  Your Track15 Campaign Builder
</h1>
<p className="text-sm track15-text-muted max-w-2xl">
  Design a donor journey that mirrors Track15's consulting approach
</p>
```

#### Progress Stepper

```tsx
// BEFORE
<div className="flex items-center gap-4 bg-white dark:bg-gray-800 border...">

// AFTER
<nav className="flex items-center gap-4 rounded-2xl track15-surface px-4 py-3 border track15-border shadow-sm">
  {steps.map((step, idx) => {
    const isActive = idx === stepIndex;
    const isCompleted = idx < stepIndex;
    return (
      <div key={step.id} className="flex items-center gap-2 text-xs whitespace-nowrap">
        <div className={`
          track15-stepper-step
          ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}
        `}>
          {idx + 1}
        </div>
        <span className={isActive ? "font-medium track15-text" : "track15-text-muted"}>
          {step.label}
        </span>
        {idx < steps.length - 1 && (
          <span className="mx-1 h-px w-6 track15-border" />
        )}
      </div>
    );
  })}
</nav>
```

#### Card Container

```tsx
// BEFORE
<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

// AFTER
<div className="track15-card p-6 space-y-6">
  {/* Content */}
</div>
```

#### Buttons

```tsx
// BEFORE (Back button)
<button className="text-gray-600 hover:text-gray-900 ...">
  ← Back
</button>

// AFTER
<button className="track15-text-muted hover:track15-text hover:bg-track15-bg transition-colors px-4 py-2 rounded-lg">
  ← Back
</button>

// BEFORE (Next/Submit button)
<button className="bg-purple-600 hover:bg-purple-700 text-white ...">
  Next
</button>

// AFTER
<button className="track15-primary px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm">
  Next
</button>
```

**Complete Example:**

```tsx
return (
  <div className="min-h-screen track15-bg px-4 py-10">
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold font-track15-heading text-track15-primary">
          Your Track15 Campaign Builder
        </h1>
        <p className="text-sm track15-text-muted max-w-2xl">
          Design a donor journey that mirrors Track15's consulting approach:
          clear seasons, a strong core story, and a consistent five-stage
          narrative.
        </p>
      </header>

      {/* Stepper - Use track15-stepper-step classes */}
      <nav className="flex items-center gap-4 overflow-x-auto rounded-2xl track15-surface px-4 py-3 border track15-border shadow-sm">
        {/* ... stepper content ... */}
      </nav>

      {/* Card */}
      <div className="track15-card">
        <div className="p-6 space-y-6">
          {/* Step content */}
          {renderStepBody()}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={goBack}
              disabled={stepIndex === 0 || isSaving}
              className="track15-text-muted hover:track15-text hover:bg-track15-bg transition-colors px-4 py-2 rounded-lg"
            >
              ← Back
            </button>

            <button
              onClick={stepIndex < steps.length - 1 ? goNext : handleSubmit}
              disabled={isSaving}
              className="track15-primary px-6 py-2.5 rounded-lg font-medium"
            >
              {stepIndex < steps.length - 1 ? "Next" : "Launch Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
```

---

### 2. Track15AnalyticsPanel

**File:** `src/panels/Track15AnalyticsPanel.tsx`

**Current State:** Uses dark Nexus theme
**Target State:** Light Track15 theme with modular analytics cards

**Changes Needed:**

#### Page Container

```tsx
// BEFORE
<div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">

// AFTER
<div className="min-h-screen track15-bg px-4 py-6">
```

#### Header

```tsx
// BEFORE
<div className="bg-white dark:bg-gray-800 border-b ...">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Track15 Performance
  </h1>

// AFTER
<header className="mb-6">
  <h1 className="text-3xl font-semibold font-track15-heading text-track15-primary">
    Track15 Performance
  </h1>
  <p className="text-sm track15-text-muted mt-1">
    Campaign analytics and donor journey insights
  </p>
</header>
```

#### Campaign Selector

```tsx
// BEFORE
<select className="rounded-lg border border-gray-300 bg-white ...">

// AFTER
<select className="px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text focus:outline-none focus:ring-2 focus:ring-track15-primary/20">
  {campaigns.map(c => (
    <option key={c.id} value={c.id}>{c.name}</option>
  ))}
</select>
```

#### Analytics Cards

```tsx
// BEFORE
<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 ...">

// AFTER
<div className="track15-card p-6">
  <h2 className="text-xl font-semibold font-track15-heading text-track15-primary mb-4">
    Lift Metrics
  </h2>
  {/* Content */}
</div>
```

#### Stat Cards

```tsx
// Highlight important numbers in primary blue
<div className="text-2xl font-bold text-track15-primary">
  {liftPercentage}%
</div>
<div className="text-sm track15-text-muted">
  Conversion Lift
</div>
```

**Complete Example:**

```tsx
return (
  <div className="min-h-screen track15-bg px-4 py-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold font-track15-heading text-track15-primary">
            Track15 Performance
          </h1>
          <p className="text-sm track15-text-muted mt-1">
            Campaign analytics and donor journey insights
          </p>
        </div>

        {/* Campaign Selector */}
        <select className="px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text">
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lift Metrics Card */}
        <div className="track15-card p-6">
          <h2 className="text-xl font-semibold font-track15-heading text-track15-primary mb-4">
            Lift Metrics
          </h2>
          <Track15LiftMetrics metrics={metrics} />
        </div>

        {/* Segment Performance Card */}
        <div className="track15-card p-6">
          <h2 className="text-xl font-semibold font-track15-heading text-track15-primary mb-4">
            Segment Performance
          </h2>
          <Track15SegmentPerformance segments={segments} />
        </div>
      </div>

      {/* Retention Chart - Full Width */}
      <div className="track15-card p-6">
        <h2 className="text-xl font-semibold font-track15-heading text-track15-primary mb-4">
          Donor Retention
        </h2>
        <Track15RetentionChart data={retentionData} />
      </div>
    </div>
  </div>
);
```

---

### 3. Track15LiftMetrics Component

**File:** `src/components/analytics/Track15LiftMetrics.tsx`

**Changes:**

```tsx
// Use Track15 colors for key metrics
<div className="grid grid-cols-2 gap-4">
  <div className="track15-surface rounded-xl p-4 border track15-border">
    <div className="text-2xl font-bold text-track15-primary">
      {liftPercentage}%
    </div>
    <div className="text-sm track15-text-muted">Conversion Lift</div>
  </div>

  <div className="track15-surface rounded-xl p-4 border track15-border">
    <div className="text-2xl font-bold text-track15-primary">
      {revenueLift}%
    </div>
    <div className="text-sm track15-text-muted">Revenue Lift</div>
  </div>
</div>
```

---

### 4. Track15SegmentPerformance Component

**File:** `src/components/analytics/Track15SegmentPerformance.tsx`

**Changes:**

```tsx
// Table styling
<table className="w-full">
  <thead>
    <tr className="border-b track15-border">
      <th className="text-left py-3 px-4 font-semibold track15-text text-sm">
        Segment
      </th>
      <th className="text-right py-3 px-4 font-semibold track15-text text-sm">
        Donors
      </th>
      <th className="text-right py-3 px-4 font-semibold track15-text text-sm">
        Lift
      </th>
    </tr>
  </thead>
  <tbody>
    {segments.map((segment) => (
      <tr
        key={segment.name}
        className="border-b track15-border hover:bg-track15-bg/50 transition-colors"
      >
        <td className="py-3 px-4 track15-text">{segment.name}</td>
        <td className="py-3 px-4 text-right track15-text">{segment.donors}</td>
        <td className="py-3 px-4 text-right">
          <span className="text-track15-primary font-semibold">
            {segment.lift}%
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### 5. Track15RetentionChart Component

**File:** `src/components/analytics/Track15RetentionChart.tsx`

**Changes:**

```tsx
// Use Track15 primary blue for the main data line
<Line
  type="monotone"
  dataKey="retention_rate"
  stroke="rgb(13, 95, 168)" // --track15-primary
  strokeWidth={3}
  dot={{ fill: "rgb(13, 95, 168)", r: 5 }}
/>

// Use Track15 accent for secondary data
<Line
  type="monotone"
  dataKey="cumulative_revenue"
  stroke="rgb(249, 168, 38)" // --track15-accent
  strokeWidth={2}
/>
```

---

## Color Usage Guidelines

### When to Use Track15 Theme

Use Track15 theme (light) for:

- Track15CampaignWizard panel
- Track15AnalyticsPanel
- Any Track15-specific modals or overlays
- Track15 documentation/help pages

### When to Keep Nexus Theme

Keep Nexus theme (dark) for:

- Main app shell (sidebar, header)
- Standard campaigns
- Donor management
- Reports (non-Track15)
- Settings

### Color Mapping

| Element         | Nexus (Dark)          | Track15 (Light)        |
| --------------- | --------------------- | ---------------------- |
| Page Background | `#0D0D12` (dark)      | `#F4F5F7` (light gray) |
| Card Surface    | `#1A1A22` (dark gray) | `#FFFFFF` (white)      |
| Primary Text    | `#FFFFFF` (white)     | `#1F2933` (dark)       |
| Primary CTA     | `#3B36F4` (indigo)    | `#0D5FA8` (blue)       |
| Accent          | `#72E4FC` (cyan)      | `#F9A826` (orange)     |

---

## Typography Guidelines

### Headings

Use `font-track15-heading` (Montserrat) for:

- Page titles (h1)
- Section headings (h2)
- Card titles
- Step labels in wizard

**Example:**

```tsx
<h1 className="text-3xl font-semibold font-track15-heading text-track15-primary">
  Your Track15 Campaign Builder
</h1>
```

### Body Text

Use `font-track15-body` (Source Sans 3) for:

- Paragraph text
- Form labels
- Descriptions
- Helper text

**Example:**

```tsx
<p className="text-sm font-track15-body track15-text-muted">
  Design a donor journey that mirrors Track15's consulting approach
</p>
```

### Font Weights

- **Montserrat (headings):** 500 (medium), 600 (semibold), 700 (bold)
- **Source Sans 3 (body):** 400 (regular), 500 (medium), 600 (semibold)

---

## Implementation Checklist

### Phase 1: Core Components ✅

- [x] Add CSS variables to `src/index.css`
- [x] Add utility classes to `src/index.css`
- [x] Import Google Fonts in `src/index.css`

### Phase 2: Wizard (Pending)

- [ ] Update `Track15CampaignWizard.tsx` container
- [ ] Update wizard header
- [ ] Update progress stepper
- [ ] Update card styling
- [ ] Update button styles
- [ ] Test wizard flow

### Phase 3: Analytics (Pending)

- [ ] Update `Track15AnalyticsPanel.tsx` container
- [ ] Update analytics header
- [ ] Update campaign selector
- [ ] Update card grid layout
- [ ] Test analytics display

### Phase 4: Analytics Components (Pending)

- [ ] Update `Track15LiftMetrics.tsx`
- [ ] Update `Track15SegmentPerformance.tsx`
- [ ] Update `Track15RetentionChart.tsx` colors
- [ ] Test all charts

### Phase 5: Testing (Pending)

- [ ] Visual QA in light mode
- [ ] Verify font loading
- [ ] Check color contrast (WCAG)
- [ ] Test responsive layouts
- [ ] Cross-browser testing

---

## Quick Reference

### Common Class Combinations

**Page Container:**

```tsx
className = "min-h-screen track15-bg px-4 py-6";
```

**Card:**

```tsx
className = "track15-card p-6";
```

**Heading:**

```tsx
className = "text-2xl font-semibold font-track15-heading text-track15-primary";
```

**Muted Text:**

```tsx
className = "text-sm track15-text-muted";
```

**Primary Button:**

```tsx
className = "track15-primary px-6 py-2.5 rounded-lg font-medium";
```

**Secondary/Ghost Button:**

```tsx
className =
  "track15-text-muted hover:track15-text hover:bg-track15-bg px-4 py-2 rounded-lg";
```

**Input Field:**

```tsx
className =
  "px-4 py-2.5 rounded-lg border track15-border track15-surface track15-text focus:ring-2 focus:ring-track15-primary/20";
```

---

## Next Steps

1. Update `Track15CampaignWizard.tsx` with new theme classes
2. Update `Track15AnalyticsPanel.tsx` with new theme classes
3. Update analytics sub-components
4. Test thoroughly in different browsers
5. Document any edge cases or adjustments

---

_Last Updated: 2025-01-14_
_Status: CSS Complete, Component Updates Needed_
