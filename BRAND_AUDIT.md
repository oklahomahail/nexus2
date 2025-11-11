# Nexus Brand Audit Checklist

> **Purpose**: Ensure all UI work adheres to the Nexus 2025 brand system before merging to `main`.

---

## 🎨 Color System

- [ ] All gradients use `.nexus-glow` or `linear-gradient(135deg, #3B36F4 0%, #72E4FC 100%)`
- [ ] No custom brand colors outside the approved palette (see `tokens/brand.tokens.json`)
- [ ] Background colors use `--bg` (#0D0D12) or `--panel` (#1A1A22)
- [ ] Text colors use `--text` (white) or `--muted` (#A0A3B1)
- [ ] Semantic colors use `--success`, `--warning`, or `--error` (not custom reds/greens)
- [ ] No light mode backgrounds (all surfaces must be dark)

## 🔷 Logo Usage

- [ ] Logo only appears on dark backgrounds (#0D0D12 or darker)
- [ ] Logo maintains gradient fidelity (indigo → cyan)
- [ ] Logo not placed on busy or photographic backgrounds
- [ ] Logo proportions not distorted (aspect ratio preserved)
- [ ] Logo nodes not recolored individually
- [ ] Minimum size respected: 32px height (screen) / 12mm (print)
- [ ] Clear space maintained: 1 node radius around all edges
- [ ] Correct lockup used:
  - `<NexusLogo showWordmark />` for headers
  - `<NexusIcon />` for badges/favicons
  - `<NexusTagline />` for hero sections

## ✍️ Typography

- [ ] Typography sizes conform to scale:
  - H1: 36px / 44px line height
  - H2: 28px / 36px line height
  - H3: 22px / 30px line height
  - Body: 16px / 24px line height
  - Small: 13px / 18px line height
- [ ] Fonts loaded correctly:
  - Inter Tight SemiBold (600) for wordmark
  - Inter (400-700) for body text
  - JetBrains Mono (400) for code
- [ ] No custom font families outside approved system
- [ ] Line heights provide adequate readability (1.4-1.5 minimum)

## ✨ Animation

- [ ] Animations use approved keyframes:
  - `animate-nexus-pulse` (3s ease-in-out)
  - `animate-nexus-glow` (3s ease-in-out)
  - `animate-nexus-orbit` (20s linear)
- [ ] Animation duration < 3s (except orbit which is 20s)
- [ ] Easing uses `ease-in-out` or `ease-out` (not `linear` except for orbit)
- [ ] Animations can be disabled for accessibility (respect `prefers-reduced-motion`)
- [ ] No infinite animations on critical UI elements (use sparingly)

## 🖼️ Components

- [ ] Buttons use `.button-primary`, `.button-secondary`, or `.button-ghost`
- [ ] Cards use `.card-base` with `.card-hover` for interactive elements
- [ ] Inputs use `.input-base` with focus ring (cyan glow)
- [ ] Panels use `.panel-base` with shadow-soft
- [ ] Border radius uses approved scale (8px, 12px, 16px, 20px, 24px)
- [ ] Shadows use `.shadow-soft`, `.shadow-medium`, or `.shadow-strong`

## 📱 Responsive

- [ ] Mobile breakpoints tested (xs: 475px, sm: 640px)
- [ ] Logo scales appropriately on small screens (min 32px)
- [ ] Touch targets >= 44px for interactive elements
- [ ] Text remains readable at all breakpoints (min 14px)

## 🌐 Meta & Assets

- [ ] Favicon uses brand indigo (#3B36F4)
- [ ] Page title includes "Nexus" brand name
- [ ] Meta description mentions "Where mission meets intelligence"
- [ ] OG image uses brand colors and logo

## ♿ Accessibility

- [ ] Color contrast ratio >= 4.5:1 for body text (white on #0D0D12 passes)
- [ ] Interactive elements have visible focus states (cyan ring)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Alt text provided for logo images
- [ ] Semantic HTML used (buttons, headings, landmarks)

## 📦 File Organization

- [ ] Brand components imported from `@/components/brand`
- [ ] Colors referenced via CSS variables (`rgb(var(--accent))`)
- [ ] No hardcoded hex colors in component files
- [ ] Design tokens match `tokens/brand.tokens.json`

---

## ✅ Final Check

Before merging:

1. **Visual Review**: Does the UI feel unmistakably "Nexus"?
2. **Dark Mode**: Is dark mode enforced throughout?
3. **Performance**: Are animations smooth (60fps)?
4. **Consistency**: Does the UI match existing brand patterns?
5. **Documentation**: Are new components documented in `BRAND_GUIDE.md`?

---

## 🚨 Common Violations

**❌ Don't:**

- Use light backgrounds (#FFFFFF, #F5F5F5, etc.)
- Create custom gradients outside the brand system
- Use fonts other than Inter, Inter Tight, or JetBrains Mono
- Place logo on colored or image backgrounds
- Animate logo faster than 3s (looks frantic)
- Use red/green colors outside semantic system

**✅ Do:**

- Use `--bg`, `--panel`, `--elevated` for backgrounds
- Use `.nexus-glow` for all brand gradients
- Load fonts from `index.html` Google Fonts link
- Place logo on dark backgrounds only
- Use 3s+ animations for brand elements
- Use `--success`, `--warning`, `--error` for semantic colors

---

## 📞 Questions?

- Review: [BRAND_GUIDE.md](BRAND_GUIDE.md)
- Design tokens: [tokens/brand.tokens.json](tokens/brand.tokens.json)
- Component demo: `<BrandShowcase />` component
- Ask: #design-system Slack channel

---

**Version**: 1.0
**Last Updated**: 2025-01-10
