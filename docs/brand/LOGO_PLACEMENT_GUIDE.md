# Nexus Logo Placement Quick Reference

## Current Logo Assets

Located in `/public/brand/`:

### Primary Logos (In Use)
- ✅ `nexus_logo_transparent.svg` - **CURRENTLY USED** in sidebar
- ✅ `nexus_logo_dark.svg` - Available for dark mode hero sections
- ✅ `nexus_logo_blue_bg.svg` - Available for marketing materials
- ✅ `nexus_icon_dark.svg` - Available for favicons/small spaces

### Missing Assets (From Your Design Spec)

Based on your design images, you mentioned these logo variants:

1. **Nexus Primary Square Logo (White Background)** ✅
   - Already have: `nexus_logo_transparent.svg`
   - Currently used in: Sidebar (both layouts)

2. **Nexus Primary Square Logo (Dark Background)** ✅
   - Already have: `nexus_logo_dark.svg`
   - Can be used for: Splash screens, dark mode, hero sections

3. **Nexus Donor Lab Logo** ❌ NEEDED
   - Need to create: `nexus_donor_lab_logo.svg`
   - Will be used in: Donor Lab panel header only
   - Size: 48-56px in panel header, 96px in empty states

## Logo File Naming Convention

All logo files should follow this pattern:
```
/public/brand/
  nexus_logo_transparent.svg       # Main logo (light bg)
  nexus_logo_dark.svg               # Main logo (dark bg)
  nexus_logo_blue_bg.svg            # Marketing variant
  nexus_donor_lab_logo.svg          # ⬅️ TO BE ADDED
  nexus_icon_dark.svg               # Favicon/small
```

## Where Logos Appear in the App

### 1. Sidebar (Both Layouts)
**File:** `src/layouts/AppLayout.tsx` and `src/layouts/ClientLayout.tsx`
```tsx
<img
  src="/brand/nexus_logo_transparent.svg"
  alt="Nexus"
  className="h-11 w-auto"
/>
```
**Size:** 44px (h-11 = 44px in Tailwind)

### 2. Donor Lab Panel Header
**File:** `src/panels/NexusDonorDataLabPanel.tsx`

**Current (temporary icon):**
```tsx
<h1 className="text-base font-semibold text-slate-50 flex items-center gap-2">
  <FlaskConical size={20} className="text-cyan-400" />
  Donor Lab
</h1>
```

**When logo is available (uncomment this):**
```tsx
<img
  src="/brand/nexus_donor_lab_logo.svg"
  alt="Donor Lab"
  className="h-12 w-auto"
/>
```

### 3. Future Placements (Not Yet Implemented)

#### Dashboard Hero
When dashboard becomes the default home:
```tsx
<div className="flex items-center gap-2">
  <img
    src="/brand/nexus_logo_transparent.svg"
    alt="Nexus"
    className="h-8 w-auto"
  />
  <h1>Regional Food Bank Dashboard</h1>
</div>
```

#### Auth Screens
Login, signup, magic link pages:
```tsx
<img
  src="/brand/nexus_logo_transparent.svg"
  alt="Nexus"
  className="h-20 w-auto mx-auto"
/>
```

#### Empty States
When no data exists:
```tsx
<img
  src="/brand/nexus_logo_transparent.svg"
  alt="Nexus"
  className="h-24 w-auto opacity-10"
/>
```

#### Splash Screen (Dark)
Full-screen loading:
```tsx
<div className="bg-slate-950">
  <img
    src="/brand/nexus_logo_dark.svg"
    alt="Nexus"
    className="h-32 w-auto"
  />
</div>
```

## Logo Sizing Reference

| Context | Tailwind Class | Actual Size | Use Case |
|---------|---------------|-------------|----------|
| Sidebar | `h-11` | 44px | Main navigation anchor |
| Donor Lab Header | `h-12` | 48px | Panel branding |
| Dashboard Hero | `h-8` | 32px | Section header |
| Auth Screens | `h-20` | 80px | Centered branding |
| Empty States | `h-24` | 96px | Watermark |
| Splash Screen | `h-32` | 128px | Full-screen hero |

## Design Specifications

### Primary Nexus Logo
- **Format:** SVG (vector)
- **Colors:** Gradient (pink to orange to cyan) + "nexus" text
- **Aspect Ratio:** Square icon + wordmark
- **Background:** Transparent (for light backgrounds) or Dark variant

### Donor Lab Logo
- **Format:** SVG (vector)
- **Theme:** Should complement Track15 aesthetic
- **Color Palette:** Suggest cyan/blue tones to match Flask icon currently used
- **Text:** "DONOR LAB" or "Donor Lab" wordmark
- **Style:** Should feel like a "lab" or "scientific" sub-brand

## To Add Donor Lab Logo

1. **Save the file:**
   ```bash
   # Save your Donor Lab logo to:
   /Users/davehail/Developer/Nexus/public/brand/nexus_donor_lab_logo.svg
   ```

2. **Update the component:**
   Open `src/panels/NexusDonorDataLabPanel.tsx` and uncomment lines 353-357:
   ```tsx
   <img
     src="/brand/nexus_donor_lab_logo.svg"
     alt="Donor Lab"
     className="h-12 w-auto"
   />
   ```

3. **Remove the temporary icon:**
   Delete or comment out the Flask icon on lines 359-362

4. **Test:**
   ```bash
   # Navigate to the Donor Lab panel and verify the logo displays correctly
   ```

## Logo Usage Rules (Quick Reference)

### ✅ DO:
- Use the transparent logo on light backgrounds
- Use the dark logo on dark backgrounds
- Maintain aspect ratio (never stretch)
- Provide adequate padding (minimum 20px)
- Use Donor Lab logo ONLY in Donor Lab panel

### ❌ DON'T:
- Mix logo variants (light logo on dark background)
- Scale logos smaller than 32px
- Repeat logos on every panel
- Use Donor Lab logo outside its panel
- Modify logo colors or gradients

## Client Logos (Future)

When you add support for client-specific logos:

1. **Storage location:**
   ```
   /public/clients/[client-id]/logo.svg
   ```

2. **Fallback behavior:**
   - If client logo exists: Display it
   - If not: Show first letter in colored circle (already implemented)

3. **Where to display:**
   - Client switcher modal cards
   - Client dashboard header
   - Reports (optional)

## Questions?

- **Brand guidelines:** See [BRAND_USAGE.md](BRAND_USAGE.md)
- **Implementation details:** See [BRANDING_IMPLEMENTATION.md](../BRANDING_IMPLEMENTATION.md)
- **Design rationale:** Refer to original design spec images
