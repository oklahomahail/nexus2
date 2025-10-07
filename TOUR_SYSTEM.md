# Nexus Tour System

A comprehensive user onboarding and tour system built with driver.js for the Nexus nonprofit management platform.

## Overview

The tour system provides:

- **Welcome Modal**: Introduces new users and offers tour options
- **Core Tour**: Guided walkthrough of main application features
- **Feature Tours**: Specific tours for campaigns, analytics, etc.
- **Onboarding Checklist**: Progress tracking for key user actions
- **Persistent State**: Remembers user preferences and progress

## Architecture

### Core Components

```
src/tours/
├── driverService.ts      # Core tour utilities using driver.js
├── coreTour.ts          # Main application tour
├── campaignsTour.ts     # Campaigns-specific tour
└── index.ts             # Exports all tour functions

src/utils/
└── onboarding.ts        # State management and localStorage utilities

src/components/
├── WelcomeModal.tsx     # New user welcome dialog
└── OnboardingChecklist.tsx  # Progress tracking widget
```

### Data Flow

1. **First Visit**: `shouldShowWelcomeModal()` → `WelcomeModal` → User chooses action
2. **Tour Execution**: `startCoreTour()` → Driver.js highlights elements → `markCoreTourCompleted()`
3. **Progress Tracking**: Actions trigger `markOnboardingStepCompleted()` → Updates checklist
4. **State Persistence**: All preferences stored in `localStorage`

## Tour Anchors

Elements with `data-tour` attributes for tour targeting:

```html
<!-- Navigation -->
<button data-tour="nav-dashboard">Dashboard</button>
<button data-tour="nav-campaigns">Campaigns</button>
<button data-tour="nav-analytics">Analytics</button>
<button data-tour="nav-donors">Donors</button>

<!-- Actions -->
<button data-tour="new-campaign-button">+ New Campaign</button>
<button data-tour="campaigns-new">Create Campaign</button>
<button data-tour="user-menu">User Menu</button>

<!-- Content Areas -->
<h2 data-tour="campaigns-title">Campaigns</h2>
<div data-tour="campaigns-stats">KPI Widgets</div>
<div data-tour="campaigns-list">Campaign List</div>
```

## Usage

### Starting Tours

```typescript
import { startCoreTour, startCampaignsTour } from "@/tours";

// Start the main tour
await startCoreTour();

// Start campaigns tour
await startCampaignsTour();
```

### Checking Tour State

```typescript
import { hasCompletedCoreTour, getTourPreferences } from "@/utils/onboarding";

if (!hasCompletedCoreTour()) {
  // Show welcome modal or tour prompt
}

const preferences = getTourPreferences();
// { coreCompleted: false, onboardingProgress: { completed: 2, total: 5 }, ... }
```

### Creating Custom Tours

```typescript
import { createTour, TourStep } from "@/tours/driverService";

const steps: TourStep[] = [
  {
    element: '[data-tour="my-element"]',
    popover: {
      title: "Feature Title",
      description: "This explains the feature...",
      position: "bottom",
    },
  },
];

const tour = createTour(steps, {
  onDestroyed: () => {
    // Mark tour as completed
    localStorage.setItem("my-tour-completed", "1");
  },
});

tour.drive();
```

### Managing Onboarding Steps

```typescript
import {
  markOnboardingStepCompleted,
  getOnboardingProgress,
} from "@/utils/onboarding";

// Mark a step as complete when user performs action
const handleCampaignCreated = () => {
  markOnboardingStepCompleted("create_campaign");
};

// Check progress
const progress = getOnboardingProgress();
console.log(
  `${progress.completed}/${progress.total} steps completed (${progress.percentage}%)`,
);
```

## Integration Points

### DashboardPanel

- Shows `WelcomeModal` for new users
- Displays `OnboardingChecklist` until completion
- Automatically triggers core tour on welcome

### CampaignsPanel

- Auto-shows campaigns tour for first-time visitors
- Tour highlights key campaign management features

### Topbar

- "Replay Tour" option in user menu
- Starts core tour on demand

## Configuration

### Tour Options

```typescript
const tourOptions: TourOptions = {
  showProgress: true, // Show step counter
  allowClose: true, // Allow closing tour
  overlayOpacity: 0.4, // Background overlay
  nextBtnText: "Next", // Button labels
  prevBtnText: "Back",
  doneBtnText: "Done",
  onDestroyed: () => {
    // Completion callback
    markCoreTourCompleted();
  },
};
```

### Onboarding Steps

```typescript
type OnboardingStep =
  | "add_client" // Create first client
  | "create_campaign" // Launch first campaign
  | "view_analytics" // Visit analytics section
  | "export_report" // Generate first report
  | "complete_profile"; // Fill out profile
```

## Styling

The tour system uses driver.js default styles with custom CSS:

```css
/* Included automatically */
@import "driver.js/dist/driver.css";

/* Custom styling in components */
.driver-popover {
  /* Tour popover styling is handled by driver.js */
}
```

## Testing

### Development Mode

- Use browser dev tools to clear `localStorage`
- Reload page to see welcome modal again
- Test tour flows and state persistence

### Testing Tours

```typescript
import { resetAllOnboardingState } from "@/utils/onboarding";

// Reset all tour state (dev mode only)
if (process.env.NODE_ENV === "development") {
  resetAllOnboardingState();
}
```

## Accessibility

- Tours are keyboard navigable (← → arrow keys)
- Elements have proper ARIA attributes
- High contrast tour overlays
- Screen reader friendly popover content

## Performance

- Tours are lazy-loaded using dynamic imports
- Driver.js is lightweight (~10KB gzipped)
- State management uses efficient localStorage operations
- Tour validation prevents errors with missing elements

## Extending the System

### Adding New Tours

1. Create tour file: `src/tours/myFeatureTour.ts`
2. Define steps with `data-tour` selectors
3. Export start function and mark completion
4. Add to `src/tours/index.ts`
5. Integrate trigger in relevant component

### Adding Tour Anchors

1. Add `data-tour="unique-name"` to target elements
2. Use descriptive, kebab-case naming
3. Ensure elements are stable (always rendered)
4. Test tour step targeting

### Custom Onboarding Steps

1. Add step to `OnboardingStep` type in `onboarding.ts`
2. Add configuration in `OnboardingChecklist.tsx`
3. Trigger completion with `markOnboardingStepCompleted()`
4. Update checklist display logic

## Best Practices

1. **Stable Selectors**: Use `data-tour` attributes on container elements that don't change
2. **Progressive Disclosure**: Start with core tour, then feature-specific tours
3. **Contextual Timing**: Show feature tours when users first visit sections
4. **Graceful Degradation**: Tours work even if some elements are missing
5. **User Control**: Always allow skipping/dismissing tours
6. **Mobile Friendly**: Tours adapt to different screen sizes

## Troubleshooting

### Tour Not Starting

- Check if `data-tour` elements exist in DOM
- Verify imports are correct
- Check console for errors
- Ensure tour state allows showing

### Elements Not Highlighted

- Verify `data-tour` attribute spelling
- Check if element is visible when tour starts
- Use browser inspector to confirm element presence
- Try `waitForElement()` for dynamic content

### State Issues

- Clear localStorage to reset all state
- Check for typos in localStorage keys
- Verify state functions are imported correctly
- Use `getTourPreferences()` to debug state
