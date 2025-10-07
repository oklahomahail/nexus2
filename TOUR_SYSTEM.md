# Nexus Tutorial Walkthrough System

A comprehensive tutorial walkthrough system built with React components for the Nexus nonprofit management platform.

## Overview

The tutorial walkthrough system provides:

- **Interactive Tutorial**: Dynamic step-by-step guided tutorials with navigation controls
- **Demo Mode Banner**: Visual banner indicating demo/tour mode with helpful instructions
- **Tutorial Manager**: Central orchestration component handling tutorial lifecycle
- **Spotlight Overlay**: Custom React-based spotlight for highlighting multiple UI elements
- **Smart Skip Functionality**: Skip with session-based suppression to prevent repeated prompts
- **Restart Capability**: Users can restart tutorials at any time
- **Progress Persistence**: Tutorial completion state saved across browser sessions

## Architecture

### Core Components

```
src/features/tutorials/
├── TutorialManager.tsx      # Main tutorial orchestration component
├── TutorialSpotlight.tsx    # Spotlight overlay for highlighting elements
├── DemoNavBanner.tsx        # Demo mode banner component
├── useTutorial.ts           # Core tutorial hook with navigation and state
├── useTutorialManager.ts    # Manager hook for tutorial lifecycle
└── AppIntegrationExample.tsx # Example integration component

public/data/tutorials/
└── nexusTutorial.json       # Tutorial steps configuration

src/
└── App.tsx                  # Demo banner integration
```

### Data Flow

1. **Tutorial Start**: `TutorialManager` loads tutorial JSON → `useTutorial` hook initializes state
2. **Step Navigation**: User clicks Next/Back → `useTutorial` updates current step → `TutorialSpotlight` repositions
3. **Multiple Anchors**: Steps can highlight multiple elements simultaneously using anchor arrays
4. **Skip Functionality**: User skips → Session suppression prevents re-prompting → State persists
5. **Demo Mode**: URL parameter `?tour=1` → `DemoNavBanner` shows → Tutorial auto-starts
6. **Restart**: Reset button clears localStorage → Tutorial restarts from beginning

## Tutorial Anchors

Elements with `data-tutorial-anchor` attributes for tutorial targeting:

```html
<!-- Navigation -->
<button data-tutorial-anchor="nav-dashboard">Dashboard</button>
<button data-tutorial-anchor="nav-clients">Clients</button>
<button data-tutorial-anchor="nav-campaigns">Campaigns</button>
<button data-tutorial-anchor="nav-analytics">Analytics</button>

<!-- Actions -->
<button data-tutorial-anchor="new-client-button">+ New Client</button>
<button data-tutorial-anchor="client-wizard-button">Create New Client</button>
<button data-tutorial-anchor="existing-client-button">Select Existing</button>

<!-- Content Areas -->
<div data-tutorial-anchor="client-list">Client List</div>
<div data-tutorial-anchor="dashboard-stats">Dashboard Statistics</div>
<div data-tutorial-anchor="campaign-builder">Campaign Builder</div>
```

## Usage

### Starting Tutorials

```typescript
import { TutorialManager } from "@/features/tutorials/TutorialManager";
import { useTutorialManager } from "@/features/tutorials/useTutorialManager";

// Using the TutorialManager component
<TutorialManager tutorialId="nexus-onboarding" />

// Using the hook programmatically
const { startTutorial, resetTutorial } = useTutorialManager();
startTutorial("nexus-onboarding");
```

### Checking Tutorial State

```typescript
import { useTutorial } from "@/features/tutorials/useTutorial";

const { isComplete, currentStep, tutorialData } =
  useTutorial("nexus-onboarding");

if (!isComplete) {
  // Show tutorial or prompt
}

console.log(`Step ${currentStep + 1} of ${tutorialData?.steps.length}`);
```

### Creating Custom Tutorials

Create a JSON file in `public/data/tutorials/`:

```json
{
  "version": 2,
  "title": "My Custom Tutorial",
  "steps": [
    {
      "title": "Welcome",
      "content": "Welcome to this feature!",
      "anchors": ["my-feature-anchor"],
      "navigate": "/my-feature",
      "actions": {
        "next": { "text": "Get Started", "action": "next" }
      }
    },
    {
      "title": "Key Feature",
      "content": "This is the main feature.",
      "anchors": ["primary-button", "secondary-area"],
      "actions": {
        "back": { "text": "Back", "action": "back" },
        "next": { "text": "Continue", "action": "next" }
      }
    }
  ]
}
```

### Managing Tutorial Progress

```typescript
import { useTutorial } from "@/features/tutorials/useTutorial";

function MyComponent() {
  const {
    currentStep,
    totalSteps,
    isComplete,
    nextStep,
    previousStep,
    skipTutorial
  } = useTutorial("nexus-onboarding");

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      nextStep();
    }
  };

  return (
    <div>
      <p>Step {currentStep + 1} of {totalSteps}</p>
      <button onClick={handleNext} disabled={isComplete}>
        Next
      </button>
    </div>
  );
}
```

## Integration Points

### App.tsx

- Shows `DemoNavBanner` when URL contains `?tour=1`
- Provides global tutorial state management
- Handles demo mode detection

### TutorialManager

- Orchestrates tutorial lifecycle
- Manages tutorial completion state
- Handles skip functionality with session suppression
- Provides restart capability

### Individual Pages

- Include `data-tutorial-anchor` attributes on key elements
- Tutorial automatically highlights relevant UI components
- Navigation commands in tutorial JSON handle routing

## Configuration

### Tutorial JSON Structure

```typescript
interface TutorialData {
  version: number;
  title: string;
  steps: TutorialStep[];
}

interface TutorialStep {
  title: string;
  content: string;
  anchors: string[]; // Multiple anchor support
  navigate?: string; // Optional navigation
  actions: {
    back?: { text: string; action: string };
    next?: { text: string; action: string };
    skip?: { text: string; action: string };
    dismiss?: { text: string; action: string };
  };
}
```

### Tutorial State Management

```typescript
// LocalStorage keys for tutorial state
const TUTORIAL_KEYS = {
  COMPLETE: "nexusTutorialComplete",
  SKIPPED_SESSION: "nexusTutorialSkippedSession",
  CURRENT_STEP: "nexusTutorialCurrentStep",
};

// Tutorial completion states
interface TutorialState {
  isComplete: boolean;
  isSkippedForSession: boolean;
  currentStep: number;
  totalSteps: number;
}
```

## Styling

The tutorial system uses custom React components with Tailwind CSS:

```css
/* TutorialSpotlight component styling */
.tutorial-spotlight-overlay {
  @apply fixed inset-0 bg-black/50 z-50 pointer-events-none;
}

.tutorial-spotlight-content {
  @apply bg-white rounded-lg shadow-lg p-6 max-w-md;
  @apply border border-gray-200;
}

/* DemoNavBanner component styling */
.demo-banner {
  @apply bg-blue-50 border-b border-blue-200 px-4 py-2;
  @apply text-sm text-blue-800;
}
```

## Testing

### Development Mode

- Add `?tour=1` to URL to activate demo mode and banner
- Use browser dev tools to clear `localStorage` keys starting with `nexusTutorial`
- Test tutorial flows and state persistence
- Verify skip functionality and session suppression

### Testing Tutorials

```typescript
import { useTutorialManager } from "@/features/tutorials/useTutorialManager";

// Reset tutorial state programmatically
const { resetTutorial } = useTutorialManager();

// For development testing
if (import.meta.env.DEV) {
  resetTutorial("nexus-onboarding");
}
```

## Accessibility

- Tutorials are fully keyboard navigable (Tab, Enter, Escape)
- Tutorial content has proper ARIA labels and roles
- High contrast spotlight overlays for visibility
- Screen reader friendly tutorial content and announcements
- Focus management during tutorial navigation

## Performance

- Tutorial data is loaded on-demand via fetch
- Custom React components are lightweight and efficient
- State management uses optimized localStorage operations
- Tutorial validation prevents errors with missing anchor elements
- Spotlight positioning uses efficient DOM queries

## Extending the System

### Adding New Tutorials

1. Create tutorial JSON file: `public/data/tutorials/myTutorial.json`
2. Define steps with `anchors` array and navigation
3. Add `data-tutorial-anchor` attributes to target elements
4. Integrate `TutorialManager` component with new tutorial ID
5. Test tutorial flow and anchor targeting

### Adding Tutorial Anchors

1. Add `data-tutorial-anchor="unique-name"` to target elements
2. Use descriptive, kebab-case naming
3. Ensure elements are stable (always rendered)
4. Support multiple anchors per step for complex highlighting
5. Test anchor targeting and spotlight positioning

### Custom Tutorial Actions

1. Add new action types to tutorial JSON step actions
2. Implement action handlers in `useTutorial` hook
3. Update `TutorialSpotlight` component to handle new actions
4. Test action execution and state updates

## Best Practices

1. **Stable Anchors**: Use `data-tutorial-anchor` attributes on container elements that don't change
2. **Progressive Disclosure**: Start with essential features, then advanced functionality
3. **Multiple Anchors**: Use anchor arrays to highlight related UI elements simultaneously
4. **Clear Navigation**: Include explicit navigate commands for multi-page tutorials
5. **Graceful Degradation**: Tutorials work even if some anchor elements are missing
6. **User Control**: Always provide skip and dismiss options with session suppression
7. **Mobile Friendly**: Tutorials adapt to different screen sizes and touch interactions

## Troubleshooting

### Tutorial Not Starting

- Check if tutorial JSON file exists and is valid
- Verify `TutorialManager` is properly integrated
- Check browser console for fetch or parsing errors
- Ensure tutorial completion state allows showing

### Anchors Not Highlighting

- Verify `data-tutorial-anchor` attribute spelling
- Check if elements exist in DOM when tutorial starts
- Use browser inspector to confirm element presence
- Ensure anchor names match tutorial JSON exactly

### Navigation Issues

- Check `navigate` commands in tutorial JSON steps
- Verify routing is set up correctly for navigation
- Ensure target routes render anchor elements

### State Issues

- Clear localStorage keys starting with `nexusTutorial`
- Check for typos in tutorial ID or localStorage keys
- Verify `useTutorial` hook is imported correctly
- Use browser dev tools to inspect localStorage state
