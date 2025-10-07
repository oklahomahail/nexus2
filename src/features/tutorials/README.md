# Nexus Tutorial Walkthrough System

A comprehensive onboarding tutorial system for Nexus that guides new users through creating their first client and campaign using the Regional Food Bank example.

## Overview

This tutorial system provides:

- **Interactive walkthrough** using the "Regional Food Bank – End-of-Year Holiday Campaign" example
- **Smart spotlight system** with smooth positioning and halo effects
- **Integration** with existing onboarding utilities
- **Demo data** that pre-populates realistic client and campaign information
- **Keyboard navigation** (Arrow keys, Enter, Escape)
- **Progress tracking** and completion persistence

## Implementation Guide

### 1. Add Tutorial Manager to Your App

Add the TutorialManager to your main App component:

```tsx
// src/App.tsx
import React, { useEffect, useState } from "react";
import { TutorialManager, loadTutorialConfig } from "@/features/tutorials";
import type { TutorialConfig } from "@/features/tutorials";

export default function App() {
  const [tutorialConfig, setTutorialConfig] = useState<TutorialConfig | null>(
    null,
  );

  useEffect(() => {
    loadTutorialConfig().then(setTutorialConfig);
  }, []);

  return (
    <>
      {/* Your existing app content */}

      {/* Tutorial system overlay */}
      <TutorialManager
        config={tutorialConfig}
        onComplete={() => console.log("Tutorial completed!")}
        onDismiss={() => console.log("Tutorial dismissed")}
      />
    </>
  );
}
```

### 2. Add Data Attributes to UI Components

Add `data-tutorial-step` attributes to the UI components referenced in the tutorial:

```tsx
// Add Client Button
<button
  data-tutorial-step="clients.add"
  onClick={handleAddClient}
>
  New Client
</button>

// New Campaign Button (within client workspace)
<button
  data-tutorial-step="campaigns.new"
  onClick={handleNewCampaign}
>
  New Campaign
</button>

// Campaign Builder Panel
<div data-tutorial-step="campaign.builder">
  {/* Campaign builder form */}
</div>

// Campaign Review & Launch
<div data-tutorial-step="campaign.review">
  {/* Review checklist and launch button */}
</div>

// Dashboard Performance Section
<section data-tutorial-step="dashboard.performance">
  {/* Charts and KPI widgets */}
</section>

// Reports Panel
<section data-tutorial-step="reports.panel">
  {/* Report generation controls */}
</section>

// Campaigns List
<div data-tutorial-step="campaigns.list">
  {/* Campaign list/grid view */}
</div>
```

### 3. Integrate Demo Data (Optional but Recommended)

For the best tutorial experience, integrate the demo data into your forms and data stores:

```tsx
import { seedDemoData } from "@/data/demo";

// Pre-fill forms during tutorial
const handleTutorialFormDefaults = (step: TutorialStep) => {
  if (step.formDefaults) {
    // Apply defaults to your form state
    setFormData(step.formDefaults);
  }
};

// Seed demo data on tutorial start
const handleTutorialStart = () => {
  seedDemoData(); // Stores demo data in sessionStorage
};
```

### 4. Add Help Menu Option

Add a "Take Walkthrough" option to your help menu or settings:

```tsx
import { resetNexusTutorial } from "@/features/tutorials";

const helpMenuItems = [
  {
    label: "Take Walkthrough",
    action: () => {
      resetNexusTutorial();
      window.location.reload();
    },
  },
];
```

## API Reference

### Components

#### `<TutorialManager>`

Main component that orchestrates the tutorial flow.

**Props:**

- `config: TutorialConfig | null` - Tutorial configuration object
- `onStart?: () => void` - Called when tutorial starts
- `onComplete?: () => void` - Called when tutorial completes
- `onDismiss?: () => void` - Called when tutorial is dismissed
- `autoStart?: boolean` - Whether to auto-start for new users (default: true)

#### `<TutorialSpotlight>`

Individual step spotlight component (used internally by TutorialManager).

### Hooks

#### `useTutorial(config)`

Core tutorial state management hook.

**Returns:**

- `active: boolean` - Whether tutorial is currently active
- `currentStep: TutorialStep | null` - Current tutorial step
- `stepIndex: number` - Current step index
- `totalSteps: number` - Total number of steps
- `isCompleted: boolean` - Whether tutorial has been completed
- `start()` - Start the tutorial
- `next()` - Go to next step
- `previous()` - Go to previous step
- `dismiss()` - Dismiss tutorial
- `complete()` - Mark tutorial as completed
- `reset()` - Reset tutorial state

#### `useTutorialManager(config)`

Higher-level tutorial management hook with additional utilities.

### Utilities

#### Tutorial State

- `hasCompletedNexusTutorial(): boolean`
- `markNexusTutorialCompleted(): void`
- `resetNexusTutorial(): void`
- `shouldShowNexusTutorial(): boolean`

#### Configuration

- `loadTutorialConfig(): Promise<TutorialConfig | null>`

#### Demo Data

- `seedDemoData()` - Load demo data into sessionStorage
- `getDemoData()` - Get all demo data objects

## Tutorial Flow

The tutorial walks users through these steps:

1. **Welcome** - Introduction to Nexus
2. **Create Client** - Add Regional Food Bank client
3. **Create Campaign** - Set up End-of-Year Holiday Campaign
4. **Build Campaign** - Configure messaging, assets, and segments
5. **Review & Launch** - Final review and campaign activation
6. **Monitor Performance** - View real-time analytics dashboard
7. **Generate Reports** - Create and export campaign reports
8. **Optimize & Repeat** - Learn about campaign duplication and optimization

## Development

### Global Controls

In development, you can access tutorial controls via browser console:

```javascript
// Reset tutorial and restart
nexusTutorialControls.reset();
nexusTutorialControls.start();

// Check completion status
nexusTutorialControls.checkCompleted();
```

### Keyboard Navigation

- **→ / Enter**: Next step
- **←**: Previous step
- **Escape**: Dismiss tutorial

### Customization

#### Adding New Steps

Edit `/src/data/tutorials/nexusTutorial.json` to add or modify tutorial steps.

#### Styling

The tutorial uses Tailwind CSS classes and can be customized via:

- CSS custom properties for colors
- Tailwind utility classes in components
- Custom CSS for animations

#### Analytics Integration

The tutorial integrates with the existing onboarding system and can be tracked alongside other user tours.

## Best Practices

1. **Ensure Elements Exist** - Make sure all `data-tutorial-step` elements are present in the DOM
2. **Test Across Views** - Verify tutorial works across different screen sizes
3. **Handle Edge Cases** - Consider what happens if users navigate away mid-tutorial
4. **Progressive Enhancement** - Tutorial should gracefully degrade if JavaScript fails
5. **Accessibility** - Ensure keyboard navigation and screen reader compatibility

## Troubleshooting

### Tutorial Not Starting

- Check that tutorial config loaded successfully
- Verify user hasn't already completed tutorial
- Ensure auto-start conditions are met

### Spotlight Not Positioned Correctly

- Verify target element exists in DOM
- Check element visibility and positioning
- Test across different viewport sizes

### Demo Data Not Loading

- Check sessionStorage for `nexus.tutorial.demoData`
- Verify demo data import paths are correct
- Ensure data structures match your app's types
