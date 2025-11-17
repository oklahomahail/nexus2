# Nexus Editorial Layout System

## Overview

The Nexus Editorial Layout System provides a **complete platform-level UI identity** with consistent spacing, typography, and component patterns across the entire application. This system ensures every page follows the same premium editorial aesthetic established in the design system.

---

## Core Components

### 1. AppTopbar

**Location:** `/src/layouts/AppTopbar.tsx`

Universal topbar component with consistent navigation and user actions.

**Features:**

- 64px height (`h-16`)
- Off-white background (`--nx-offwhite`)
- Subtle border (`--nx-border`)
- Support/Docs links
- Profile placeholder (ready for dropdown)

**Usage:**

```tsx
import AppTopbar from "@/layouts/AppTopbar";

<AppTopbar />;
```

---

### 2. AppPageLayout

**Location:** `/src/layouts/AppPageLayout.tsx`

Universal page wrapper that provides consistent structure for all authenticated pages.

**Features:**

- Automatic sidebar integration
- Topbar included by default
- Editorial spacing rhythm (`editorial-flow` class)
- Proper overflow handling
- Flexible customization

**Props:**

```tsx
interface AppPageLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode; // Optional custom sidebar
  topbar?: ReactNode; // Optional custom topbar
  noPadding?: boolean; // Disable default padding
}
```

**Usage:**

```tsx
import AppPageLayout from "@/layouts/AppPageLayout";

// Basic usage
<AppPageLayout>
  <YourPageContent />
</AppPageLayout>

// With custom sidebar
<AppPageLayout sidebar={<CustomSidebar />}>
  <YourPageContent />
</AppPageLayout>

// Full-bleed layout (no padding)
<AppPageLayout noPadding>
  <FullWidthComponent />
</AppPageLayout>
```

---

### 3. PageHeading

**Location:** `/src/components/ui/PageHeading.tsx`

Consistent page title pattern for all pages.

**Props:**

```tsx
interface PageHeadingProps {
  title: string; // Main page title
  subtitle?: string; // Optional description
  actions?: ReactNode; // Optional action buttons
}
```

**Usage:**

```tsx
import { PageHeading } from "@/components/ui/PageHeading";
import Button from "@/components/ui/Button";

// Basic
<PageHeading
  title="Client Dashboard"
  subtitle="Track15-powered campaign and donor management"
/>

// With actions
<PageHeading
  title="Campaign Manager"
  subtitle="Create and manage your campaigns"
  actions={
    <>
      <Button variant="secondary">Export</Button>
      <Button variant="primary">New Campaign</Button>
    </>
  }
/>
```

---

### 4. SectionBlock

**Location:** `/src/components/ui/SectionBlock.tsx`

Standardized content panel with optional title and actions.

**Props:**

```tsx
interface SectionBlockProps {
  title?: string; // Section title
  description?: string; // Optional subtitle
  actions?: ReactNode; // Optional action buttons
  children: ReactNode; // Section content
  noPadding?: boolean; // Remove padding for tables
  className?: string; // Custom classes
}
```

**Usage:**

```tsx
import { SectionBlock } from "@/components/ui/SectionBlock";
import Button from "@/components/ui/Button";

// Basic section
<SectionBlock title="Recent Activity">
  <ActivityList />
</SectionBlock>

// With description and actions
<SectionBlock
  title="Campaign Performance"
  description="Track your campaigns in real-time"
  actions={<Button variant="ghost">View All</Button>}
>
  <CampaignChart />
</SectionBlock>

// Full-bleed for tables
<SectionBlock title="Donor List" noPadding>
  <DonorTable />
</SectionBlock>
```

---

## Editorial Spacing Rhythm

**Location:** `/src/styles/layout.css`

The spacing system creates automatic vertical rhythm that matches premium editorial platforms.

### Key Classes

#### `.editorial-flow`

Applies 40px spacing between major sections (automatically applied in `AppPageLayout`)

```tsx
<div className="editorial-flow">
  <PageHeading ... />        {/* 40px gap */}
  <SectionBlock ... />       {/* 40px gap */}
  <SectionBlock ... />
</div>
```

#### `.content-flow`

Standard 16px spacing within sections

```tsx
<div className="content-flow">
  <p>Paragraph 1</p> {/* 16px gap */}
  <p>Paragraph 2</p> {/* 16px gap */}
  <p>Paragraph 3</p>
</div>
```

#### `.content-flow-tight`

Compact 12px spacing for dense layouts

#### `.content-flow-relaxed`

Generous 24px spacing for breathing room

### Grid Utilities

```css
.grid-standard    /* 24px gap */
.grid-tight       /* 16px gap */
.grid-relaxed     /* 32px gap */
```

**Usage:**

```tsx
<div className="grid-standard grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>
```

---

## Complete Page Example

Here's how to build a complete dashboard page using the unified system:

```tsx
import React from "react";
import { PageHeading } from "@/components/ui/PageHeading";
import { SectionBlock } from "@/components/ui/SectionBlock";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <div className="px-8 py-10 editorial-flow">
      {/* Page Title */}
      <PageHeading
        title="Client Dashboard"
        subtitle="Track15-powered campaign and donor management"
        actions={
          <>
            <Button variant="secondary" size="sm">
              Export
            </Button>
            <Button variant="primary" size="sm">
              New Campaign
            </Button>
          </>
        }
      />

      {/* Metrics Section - 40px gap from heading */}
      <SectionBlock title="Key Metrics">
        <div className="grid grid-cols-3 gap-6">
          <MetricCard label="Total Donors" value="12,456" />
          <MetricCard label="Total Raised" value="$1.2M" />
          <MetricCard label="Avg. Gift" value="$96" />
        </div>
      </SectionBlock>

      {/* Activity Section - 40px gap from previous section */}
      <SectionBlock
        title="Recent Activity"
        actions={
          <Button variant="ghost" size="sm">
            View All
          </Button>
        }
      >
        <div className="content-flow">
          <ActivityItem title="Campaign Launch" time="2h ago" />
          <ActivityItem title="Segment Created" time="4h ago" />
        </div>
      </SectionBlock>

      {/* Campaigns Section - 40px gap from previous section */}
      <SectionBlock title="Active Campaigns">
        <div className="grid grid-cols-2 gap-4">
          <CampaignCard name="Spring Drive" progress={45} />
          <CampaignCard name="Monthly Giving" progress={77} />
        </div>
      </SectionBlock>
    </div>
  );
}
```

---

## Integration with Existing Layouts

### ClientLayout Integration

The `ClientLayout` has been updated to use the new editorial design tokens:

- Topbar: 64px height, off-white background, editorial typography
- Main content area: Off-white background, charcoal text
- Sidebar: Dark charcoal (`#1C1E26`) with gold accent (`#D4AF37`)

**No changes needed** - existing pages using `ClientLayout` will automatically benefit from the updated styling.

### Wrapping Existing Pages

To migrate an existing page to the new system:

**Before:**

```tsx
export default function OldPage() {
  return (
    <div className="p-6">
      <h1>Page Title</h1>
      <div className="mt-8">
        <h2>Section</h2>
        <Content />
      </div>
    </div>
  );
}
```

**After:**

```tsx
import { PageHeading } from "@/components/ui/PageHeading";
import { SectionBlock } from "@/components/ui/SectionBlock";

export default function NewPage() {
  return (
    <div className="px-8 py-10 editorial-flow">
      <PageHeading title="Page Title" />

      <SectionBlock title="Section">
        <Content />
      </SectionBlock>
    </div>
  );
}
```

---

## Design Tokens Reference

All components use CSS custom properties from `/src/styles/tokens.css`:

### Colors

- `--nx-charcoal`: #1C1E26 (primary dark)
- `--nx-rich-black`: #0F1115 (deep backgrounds)
- `--nx-offwhite`: #FAFAF8 (light surfaces)
- `--nx-gold`: #D4AF37 (primary accent)
- `--nx-blue-deep`: #314C89 (action buttons)
- `--nx-border`: #E0E2E7 (dividers)
- `--nx-text-muted`: #4C4F57 (secondary text)

### Typography

- `--nx-text-h1`: 32px (page titles)
- `--nx-text-h2`: 24px (section headers)
- `--nx-text-h3`: 18px (subsections)
- `--nx-text-body`: 15px (body text)
- `--nx-text-small`: 13px (labels)

### Spacing

- `--nx-space-xs`: 4px
- `--nx-space-sm`: 8px
- `--nx-space-md`: 12px
- `--nx-space-lg`: 16px
- `--nx-space-xl`: 24px
- `--nx-space-2xl`: 32px
- `--nx-space-3xl`: 48px

### Radii

- `--nx-radius-sm`: 4px (buttons)
- `--nx-radius-md`: 6px (cards)
- `--nx-radius-lg`: 10px (panels)

---

## Best Practices

### 1. Always Use PageHeading

Every page should start with a `PageHeading` component for consistency.

### 2. Wrap Content in SectionBlocks

Use `SectionBlock` for any distinct content area - charts, tables, lists, forms.

### 3. Leverage Editorial Flow

Let the `.editorial-flow` class handle vertical spacing automatically. Don't add manual margins between major sections.

### 4. Use Design Tokens

Always use CSS custom properties (`var(--nx-*)`) instead of hardcoded colors or sizes.

### 5. Maintain Hierarchy

- Page title (h1): 32px
- Section title (h2): 24px
- Subsection (h3): 18px
- Body text: 15px

---

## What's Next?

Now that the foundation is complete, you can:

1. **Migrate Legacy Pages** - Update existing pages to use the new components
2. **Build Component Playground** - Interactive component sandbox for testing
3. **Add Visual Regression Testing** - Lock down the design with Playwright
4. **Implement Breadcrumbs** - Add navigation hierarchy for deep pages
5. **Create Page Templates** - Reusable layouts for common page patterns

---

## Example Pages

See these files for complete working examples:

- `/src/pages/ExampleDashboard.tsx` - Full dashboard with metrics, activity, and campaigns
- `/src/features/brand-profile/pages/BrandProfilePage.tsx` - Brand profile using editorial system

---

## Support

For questions or issues with the layout system:

- Review the Style Guide at `/style-guide`
- Check design tokens in `/src/styles/tokens.css`
- Reference layout utilities in `/src/styles/layout.css`
