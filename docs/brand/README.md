# Nexus Branding Documentation

Welcome to the Nexus branding documentation. This directory contains all brand guidelines, logo placement rules, and implementation details for maintaining consistent, professional branding across the Nexus platform.

## Quick Links

- 📘 **[Brand Usage Guide](BRAND_USAGE.md)** - Complete branding guidelines
- 🎨 **[Logo Placement Guide](LOGO_PLACEMENT_GUIDE.md)** - Logo usage quick reference
- ✅ **[Implementation Summary](../BRANDING_IMPLEMENTATION.md)** - What was implemented and how

## Logo Assets

All logo files are located in `/public/brand/`:

| File | Purpose | Status | Size |
|------|---------|--------|------|
| `nexus_logo_transparent.svg` | Main logo (light backgrounds) | ✅ In use | Variable |
| `nexus_logo_transparent.png` | PNG fallback | ✅ Available | 256x256 |
| `nexus_logo_dark.svg` | Main logo (dark backgrounds) | ✅ Available | Variable |
| `nexus_logo_blue_bg.svg` | Marketing variant | ✅ Available | Variable |
| `nexus_logo_blue_bg.png` | PNG fallback | ✅ Available | 256x256 |
| `nexus_icon_dark.svg` | Icon only (no wordmark) | ✅ Available | 64x64 |
| `nexus_tagline_lockup.svg` | Logo + tagline | ✅ Available | Variable |
| `nexus_donor_lab_logo.svg` | Donor Lab sub-brand | ❌ **Needed** | 48-96px |

## Visual Identity

### Primary Nexus Logo
- **Style:** Geometric "N" with gradient (pink → orange → cyan)
- **Wordmark:** "nexus" in modern sans-serif (orange)
- **Background:** Transparent or dark variant
- **Format:** SVG (vector) for scalability

### Donor Lab Sub-Brand
- **Purpose:** Distinguish the Donor Data Lab feature
- **Style:** Should complement Track15 aesthetic
- **Suggestion:** Lab/scientific theme with cyan/blue tones
- **Status:** ❌ Logo not yet created

### Color Palette
- **Primary Gradient:** `#FF1B6B` → `#FF6B1B` → `#00D4FF`
- **Background Dark:** `#0A0A0F` (zinc-950)
- **Background Light:** `#FFFFFF`
- **Accent Blue:** `#3B82F6` (Tailwind blue-500)
- **Accent Cyan:** `#00D4FF`

## Where Branding Appears

### 1. Sidebar (Every Page)
- **Component:** `AppLayout.tsx`, `ClientLayout.tsx`
- **Logo:** Nexus primary logo (44px)
- **Position:** Top center of sidebar
- **Always visible:** Yes

### 2. Client Switcher Modal
- **Component:** `ClientSwitcherModal.tsx`
- **Client Branding:** First letter fallback (future: client logos)
- **Position:** Triggered from sidebar button

### 3. Donor Lab Panel
- **Component:** `NexusDonorDataLabPanel.tsx`
- **Logo:** Donor Lab logo (when available)
- **Position:** Panel header
- **Currently:** Using Flask icon placeholder

### 4. Future Placements
- Dashboard hero section
- Authentication screens
- Empty states
- Loading/splash screen

## Brand Guidelines Summary

### Logo Sizing
- **Minimum size:** 32px (legibility threshold)
- **Sidebar:** 44px
- **Panel headers:** 32-48px
- **Hero sections:** 80-128px
- **Empty states:** 64-96px

### Spacing
- **Minimum padding:** 20px around logo
- **Optical alignment:** Center in containers
- **Breathing room:** Never crowd with other elements

### Usage Rules

#### ✅ DO:
- Use correct logo variant for background color
- Maintain aspect ratio
- Provide adequate spacing
- Use Donor Lab logo only in Donor Lab
- Follow the established hierarchy

#### ❌ DON'T:
- Repeat logos unnecessarily
- Scale below 32px
- Modify colors or gradients
- Use wrong variant for background
- Mix brand identities

## Implementation Status

### ✅ Completed
- [x] Brand usage documentation
- [x] Logo placement guide
- [x] Sidebar redesign (both layouts)
- [x] Client switcher modal (production-grade)
- [x] Navigation icons
- [x] Donor Lab header (placeholder ready)
- [x] Type checking and verification

### ⏳ Pending (Optional)
- [ ] Create Donor Lab logo
- [ ] Dashboard as default landing page
- [ ] User profile component in sidebar footer
- [ ] Client logo support
- [ ] Authentication screen branding
- [ ] Empty state branding

## File Structure

```
docs/
  brand/
    README.md                    ← You are here
    BRAND_USAGE.md              ← Complete guidelines
    LOGO_PLACEMENT_GUIDE.md     ← Quick reference
  BRANDING_IMPLEMENTATION.md    ← Implementation details

public/
  brand/
    nexus_logo_transparent.svg   ← Main logo (light)
    nexus_logo_dark.svg          ← Main logo (dark)
    nexus_logo_blue_bg.svg       ← Marketing variant
    nexus_icon_dark.svg          ← Icon only
    [other variants...]

src/
  layouts/
    AppLayout.tsx               ← Sidebar with logo
    ClientLayout.tsx            ← Client sidebar with logo
  components/
    nav/
      client/
        ClientSwitcherModal.tsx ← Client picker modal
  panels/
    NexusDonorDataLabPanel.tsx  ← Donor Lab with branding
```

## Design Principles

### 1. Professional Polish
- Clean, minimal interfaces
- Consistent spacing and typography
- Smooth transitions
- High contrast for accessibility

### 2. Track15 Aesthetic
- Dark sidebar (zinc-950)
- White content areas
- Subtle color accents
- Professional, enterprise-grade feel

### 3. Clear Hierarchy
- Logo anchors the brand
- Client switcher is prominent
- Navigation is scannable
- Sub-brands are contained

### 4. User Experience
- Predictable navigation
- Clear visual affordances
- Keyboard shortcuts
- Accessible to all users

## For Designers

### Adding a New Logo
1. Export as SVG (vector format)
2. Optimize with SVGO or similar
3. Save to `/public/brand/`
4. Name using `nexus_[variant]_[background].svg` pattern
5. Update this README
6. Update LOGO_PLACEMENT_GUIDE.md

### Logo Design Requirements
- **Format:** SVG (preferred) or PNG (fallback)
- **Transparency:** Yes (except blue_bg variant)
- **Optimization:** Remove unnecessary metadata
- **Accessibility:** Ensure contrast ratios meet WCAG AA
- **Scalability:** Test at 32px and 128px

## For Developers

### Using Logos in Components
```tsx
// Sidebar logo (standard)
<img
  src="/brand/nexus_logo_transparent.svg"
  alt="Nexus"
  className="h-11 w-auto"
/>

// Hero section (larger)
<img
  src="/brand/nexus_logo_dark.svg"
  alt="Nexus"
  className="h-32 w-auto"
/>

// Empty state (subtle)
<img
  src="/brand/nexus_logo_transparent.svg"
  alt="Nexus"
  className="h-24 w-auto opacity-10"
/>
```

### Adding Client Logos
When implementing client-specific logos:
1. Store in `/public/clients/[client-id]/logo.svg`
2. Update Client type to include `logoUrl?: string`
3. Update ClientSwitcherModal to render client logos
4. Maintain letter fallback for clients without logos

## Questions & Support

### Common Questions

**Q: Which logo should I use?**
A: Use `nexus_logo_transparent.svg` for light backgrounds, `nexus_logo_dark.svg` for dark backgrounds.

**Q: Can I use the logo in marketing materials?**
A: Yes, use the blue background variant for presentations and marketing.

**Q: How small can the logo be?**
A: Minimum 32px for legibility. Below this, use the icon-only variant.

**Q: When will the Donor Lab logo be ready?**
A: It's prepared in the code (commented out). Just add the SVG file and uncomment.

**Q: Can I modify the logo colors?**
A: No, maintain the original gradient and colors for brand consistency.

### Getting Help

- **Brand questions:** Review [BRAND_USAGE.md](BRAND_USAGE.md)
- **Implementation:** See [BRANDING_IMPLEMENTATION.md](../BRANDING_IMPLEMENTATION.md)
- **Logo placement:** Check [LOGO_PLACEMENT_GUIDE.md](LOGO_PLACEMENT_GUIDE.md)
- **Code issues:** Open an issue or ask the team

## Recent Changes

### 2024-11-17: Initial Branding Implementation
- Created comprehensive brand guidelines
- Redesigned sidebar with prominent logo
- Implemented production-grade client switcher modal
- Added navigation icons
- Updated Donor Lab panel header
- Created complete documentation suite

---

**Last Updated:** November 17, 2024
**Version:** 1.0
**Maintained by:** Nexus Design Team
