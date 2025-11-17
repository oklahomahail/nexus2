# Nexus Brand Usage Guide

This is the canonical internal guide for Nexus branding and logo placement across the platform.

## Core Logos

### 1. Primary Nexus Square Logo (White/Light Background)

**File:** `/public/brand/nexus_logo_transparent.svg`

**Use this variant when:** The background is white or very light.

**Approved placements:**

- Sidebar top (app anchor position)
- Login / signup screens
- Empty states
- Settings / account pages
- Onboarding screens

**Sizing:**

- Sidebar: 44px height
- Panel headers: 32px height
- Empty states: 64–96px height
- Splash screen: 100–140px height

### 2. Primary Nexus Square Logo (Dark Background)

**File:** `/public/brand/nexus_logo_dark.svg`

**Use this variant when:** Background is dark or in dark mode contexts.

**Approved placements:**

- Splash screen (centered, dark background)
- Dark mode sidebar
- Command palette header
- Dashboard hero section
- Modals with dark overlays

### 3. Donor Lab Logo

**Purpose:** Special sub-brand identity for the Donor Lab panel only.

**Use exclusively for:**

- Donor Lab panel header (48–56px)
- Donor Lab empty states (large, 96px)
- Donor Lab help/tutorial modals
- Donor Lab feature cards inside dashboard

**Important:** Do not use the Donor Lab logo outside the Donor Lab panel. Keeping it contained prevents brand dilution and increases its power as a special feature identifier.

## Placement Rules

### Use ONE logo per visual cluster

Avoid repeating the Nexus logo on every panel header or card.

### Anchor areas only

A logo should appear only at:

- **Upper left** (app anchor)
- **Centered on full-page experiences** (onboarding, auth, splash)
- **Feature-specific headers** (Donor Lab only)

### When NOT to use logos

**Do not place logos:**

- Inside sidebar nav items
- On every panel header
- On list views
- On cards or tiles
- Next to call-to-action buttons

## Sidebar Layout Specification

The sidebar follows this hierarchy:

```
┌────────────────────────────────────┐
│  [Nexus Logo - 44px]               │
│        centered                    │
│                                    │
│  [Client Switcher]                 │
│   • pill-shaped dropdown           │
│   • shows current client           │
│   • full width                     │
│                                    │
│  Navigation                        │
│   - Dashboard (Home icon)          │
│   - Campaigns                      │
│   - Segmentation                   │
│   - Donor Lab                      │
│   - Analytics                      │
│   - Reports                        │
│   - Data Quality                   │
│                                    │
│  (spacer)                          │
│                                    │
│  User Profile / Settings           │
└────────────────────────────────────┘
```

## Color Guidelines

- Use the bright Nexus colors (gradient N + orange text) **only as accents** for icons and highlights
- Keep sidebars and primary panels minimal: whites, neutrals, deep navy in dark mode
- Avoid overusing gradients except in the square logo itself

## Client Identity

- Client logos appear **only** in:
  - Client picker/switcher modal
  - Top-of-panel headers (when in client context)
- Nexus logo remains the persistent brand anchor

## Donor Lab Panel Branding

The Donor Lab panel uses custom branding to distinguish it from other features.

**Header layout:**

```
[Donor Lab Logo]   Donor Lab   [Filters] [Actions]
```

**Typography:**

- Main heading: Use "Donor Lab" or "The Nexus Donor Data Lab"
- Keep consistent with the Track15 aesthetic

## Client Switcher

### Placement

- Directly under the main Nexus logo in the sidebar
- Full width of the sidebar

### Interaction

- Opens a full modal with grid layout
- Each client card shows client name and logo (or fallback)
- Include search functionality
- Show "Recently visited clients" section

### Modal Layout

- Grid layout (2 columns)
- Each card uses white-background Nexus logo as fallback if no client logo exists
- Search bar at the top
- Clean, professional appearance matching Track15 aesthetic

## Dashboard as Home

### Default Landing Page

- Dashboard is the default landing page after login or client change
- Always redirect to dashboard instead of leaving users where they last were

### Dashboard Hero

Include small Nexus logo (32px) at top with client name:

```
[Nexus Logo]  Regional Food Bank Dashboard
```

## Typography and Spacing

- **Logo padding:** Always provide adequate breathing room (minimum 20px padding)
- **Logo sizing:** Never scale logos smaller than 32px (legibility threshold)
- **Alignment:** Center logos in sidebars, left-align in headers

## Implementation Notes

- All logo files are in `/public/brand/`
- Use SVG format for scalability and crisp rendering
- PNG versions available for compatibility
- The programmatic `NexusLogo` component can be used for animated variants

## Examples

### Good Examples

✓ Single Nexus logo at top-left of sidebar
✓ Donor Lab logo in Donor Lab panel header only
✓ Client switcher directly under main logo
✓ Dashboard as default home screen

### Bad Examples

✗ Nexus logo repeated in every panel header
✗ Donor Lab logo used outside Donor Lab panel
✗ Client logos taking precedence over Nexus branding
✗ Logos at too small a size (< 32px)

## Questions?

For branding questions or logo asset requests, refer to `/public/brand/README.md` or consult the design team.
