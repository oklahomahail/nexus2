# Nexus Design System

Premium editorial design foundation for the Nexus platform.

## Overview

The Nexus Design System replaces the old heavy blue theme with a refined editorial aesthetic that aligns with Track15's professional brand standards. This system provides:

- **Consistent visual identity** across all pages and features
- **Reusable UI components** for rapid development
- **Design tokens** for easy theming and maintenance
- **Premium aesthetic** that builds trust and professionalism

## Quick Start

### Using Design Tokens

All design tokens are defined in `/src/styles/tokens.css` and can be used directly in your styles:

```css
/* Color tokens */
background-color: var(--nx-charcoal);
color: var(--nx-gold);
border-color: var(--nx-border);

/* Typography */
font-family: var(--nx-font-sans);
font-size: var(--nx-text-body);

/* Spacing */
padding: var(--nx-space-lg);
margin: var(--nx-space-2xl);

/* Radii */
border-radius: var(--nx-radius-md);

/* Shadows */
box-shadow: var(--nx-shadow-sm);
```

### Using UI Components

Import from the UI component library:

```tsx
import {
  Button,
  Card,
  Input,
  Panel,
  Tabs,
  SectionHeader,
} from "@/components/ui";

// Use in your components
<Card>
  <SectionHeader title="Dashboard" subtitle="Overview of your campaigns" />
  <Input label="Email" placeholder="you@example.com" />
  <Button variant="primary">Save Changes</Button>
</Card>;
```

## Color System

### Brand Colors

| Token             | Value   | Usage                                     |
| ----------------- | ------- | ----------------------------------------- |
| `--nx-charcoal`   | #1C1E26 | Primary dark surface, sidebar backgrounds |
| `--nx-rich-black` | #0F1115 | Deep backgrounds, active states           |
| `--nx-offwhite`   | #FAFAF8 | Light surfaces, app backgrounds           |

### Accent Colors

| Token            | Value   | Usage                                   |
| ---------------- | ------- | --------------------------------------- |
| `--nx-gold`      | #D4AF37 | Primary accent, active indicators, CTAs |
| `--nx-gold-soft` | #E5C46B | Hover states, secondary gold            |

### Action Colors

| Token            | Value   | Usage                                |
| ---------------- | ------- | ------------------------------------ |
| `--nx-blue-deep` | #314C89 | Action buttons, links                |
| `--nx-blue-soft` | #E6ECF7 | Light blue backgrounds, hover states |

### System Colors

| Token             | Value   | Usage                             |
| ----------------- | ------- | --------------------------------- |
| `--nx-success`    | #3E8E6D | Success states, positive feedback |
| `--nx-error`      | #B34343 | Error states, warnings            |
| `--nx-border`     | #E0E2E7 | Dividers, card borders            |
| `--nx-text-muted` | #4C4F57 | Secondary text, labels            |

## Typography

### Font Families

- **Sans-serif**: Inter (body text, UI elements)
- **Serif**: Libre Franklin (optional editorial headings)
- **Monospace**: JetBrains Mono (code, technical content)

### Type Scale

| Token             | Size | Usage              |
| ----------------- | ---- | ------------------ |
| `--nx-text-h1`    | 32px | Page titles        |
| `--nx-text-h2`    | 24px | Section headers    |
| `--nx-text-h3`    | 18px | Subsection headers |
| `--nx-text-body`  | 15px | Body text          |
| `--nx-text-small` | 13px | Labels, captions   |
| `--nx-text-xs`    | 12px | Helper text        |

### Font Weights

- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing Scale

Consistent spacing rhythm throughout the app:

| Token            | Value | Usage           |
| ---------------- | ----- | --------------- |
| `--nx-space-xs`  | 4px   | Tight spacing   |
| `--nx-space-sm`  | 8px   | Small gaps      |
| `--nx-space-md`  | 12px  | Medium spacing  |
| `--nx-space-lg`  | 16px  | Standard gaps   |
| `--nx-space-xl`  | 24px  | Section spacing |
| `--nx-space-2xl` | 32px  | Large sections  |
| `--nx-space-3xl` | 48px  | Page sections   |

## Border Radius

| Token              | Value  | Usage                    |
| ------------------ | ------ | ------------------------ |
| `--nx-radius-sm`   | 4px    | Buttons, inputs          |
| `--nx-radius-md`   | 6px    | Cards                    |
| `--nx-radius-lg`   | 10px   | Panels, large components |
| `--nx-radius-full` | 9999px | Pills, avatars           |

## Shadows

Depth and elevation system:

| Token            | Value                       | Usage            |
| ---------------- | --------------------------- | ---------------- |
| `--nx-shadow-sm` | 0 1px 2px rgba(0,0,0,0.04)  | Subtle depth     |
| `--nx-shadow-md` | 0 2px 4px rgba(0,0,0,0.06)  | Cards            |
| `--nx-shadow-lg` | 0 4px 8px rgba(0,0,0,0.08)  | Elevated panels  |
| `--nx-shadow-xl` | 0 8px 16px rgba(0,0,0,0.10) | Modals, popovers |

## UI Components

### Button

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Action</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

### Input

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="you@example.com"
  helperText="We'll never share your email"
/>

// Error state
<Input
  label="Password"
  type="password"
  error={true}
  helperText="Password is required"
/>
```

### TextArea

```tsx
import { TextArea } from "@/components/ui";

<TextArea label="Description" placeholder="Enter description..." rows={4} />;
```

### Card

```tsx
import { Card } from '@/components/ui';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Hover effect
<Card hover>
  <p>Hover over me</p>
</Card>

// Custom padding
<Card padding="lg">
  <p>Large padding</p>
</Card>
```

### Panel

```tsx
import { Panel } from "@/components/ui";

<Panel
  title="Dashboard"
  subtitle="Overview of your metrics"
  actions={<Button size="sm">Edit</Button>}
>
  <p>Panel content goes here</p>
</Panel>;
```

### Tabs

```tsx
import { Tabs } from "@/components/ui";
import { useState } from "react";

const [activeTab, setActiveTab] = useState("overview");

<Tabs
  tabs={[
    { id: "overview", label: "Overview" },
    { id: "settings", label: "Settings" },
    { id: "analytics", label: "Analytics" },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>;
```

### SectionHeader

```tsx
import { SectionHeader, Button } from "@/components/ui";

<SectionHeader
  title="Campaigns"
  subtitle="Manage your marketing campaigns"
  actions={<Button>Create Campaign</Button>}
/>;
```

## Layout Guidelines

### Page Structure

```tsx
<div className="bg-[var(--nx-offwhite)] min-h-screen">
  <div className="max-w-7xl mx-auto py-10 px-6">
    <SectionHeader title="Page Title" subtitle="Page description" />

    <div className="space-y-6">
      <Card>{/* Content */}</Card>
    </div>
  </div>
</div>
```

### Spacing Rhythm

- **Page padding**: 40px (var(--nx-space-2xl))
- **Section spacing**: 24px (var(--nx-space-xl))
- **Card spacing**: 16px (var(--nx-space-lg))
- **Form field spacing**: 12px (var(--nx-space-md))

### Responsive Breakpoints

Use Tailwind's responsive prefixes:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Migration Guide

### Replacing Old Components

**Old:**

```tsx
<div className="bg-zinc-950 text-white p-4">
  <button className="bg-blue-600 px-4 py-2">Click me</button>
</div>
```

**New:**

```tsx
<Card>
  <Button variant="primary">Click me</Button>
</Card>
```

### Color Migration

| Old               | New                           |
| ----------------- | ----------------------------- |
| `bg-zinc-950`     | `bg-[var(--nx-charcoal)]`     |
| `bg-blue-600`     | `bg-[var(--nx-blue-deep)]`    |
| `text-gray-600`   | `text-[var(--nx-text-muted)]` |
| `border-gray-300` | `border-[var(--nx-border)]`   |

## Best Practices

1. **Use design tokens** instead of hardcoded values
2. **Prefer UI components** over custom styles
3. **Follow spacing rhythm** for consistent layout
4. **Use semantic colors** (success, error) for state
5. **Keep accessibility** in mind (focus states, ARIA labels)
6. **Test responsiveness** at all breakpoints

## Examples

See these pages for design system implementation:

- `/clients/:clientId/brand` - Brand Profile page
- [BrandProfilePage.tsx](../src/features/brand-profile/BrandProfilePage.tsx)
- [BrandForm.tsx](../src/features/brand-profile/BrandForm.tsx)
- [UploadBrandFile.tsx](../src/features/brand-profile/UploadBrandFile.tsx)

## Support

For questions or issues with the design system:

1. Check this documentation
2. Review existing component implementations
3. Refer to [tokens.css](../src/styles/tokens.css) for available variables
