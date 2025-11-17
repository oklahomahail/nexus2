/**
 * Segmentation Onboarding Tour Configuration
 *
 * Guided tour for the new segmentation features.
 * Uses data-tour attributes to target specific UI elements.
 *
 * Tour Framework: Assumes integration with a library like react-joyride
 * or shepherd.js for step-by-step walkthroughs.
 */

export interface TourStep {
  target: string; // CSS selector or data-tour attribute
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
}

/**
 * Main segmentation tour - introduces core concepts
 */
export const SEGMENTATION_INTRO_TOUR: Tour = {
  id: "segmentation-intro",
  name: "Segmentation Basics",
  description: "Learn how to use behavioral segments for targeted campaigns",
  steps: [
    {
      target: "body",
      title: "Welcome to Segmentation! 🎯",
      content:
        "Segmentation lets you send different versions of your campaign to different donor groups. Let's walk through how it works.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="segment-catalog"]',
      title: "Your Segment Catalog",
      content:
        "These are your behavioral segments - groups of donors based on giving patterns, engagement, and preferences. No PII stored, just behaviors.",
      placement: "right",
    },
    {
      target: '[data-tour="segment-card"]',
      title: "Understanding Segments",
      content:
        "Each segment shows criteria (what defines this group) and estimated size. Click to see detailed profiles and performance history.",
      placement: "bottom",
    },
    {
      target: '[data-tour="new-segment"]',
      title: "Create Custom Segments",
      content:
        "Need a segment we don't have? Create your own using behavioral criteria like recency, frequency, and engagement level.",
      placement: "left",
    },
    {
      target: '[data-tour="deliverable-versions"]',
      title: "Deliverable Versions",
      content:
        "Each deliverable (email, direct mail, etc.) can have multiple versions - one for each segment you want to target.",
      placement: "top",
    },
    {
      target: '[data-tour="seg-wizard"]',
      title: "Quick Start with Recommendations",
      content:
        "Not sure which segments to use? Try 'Apply recommended segmentation' based on your campaign type. We'll suggest the best combinations.",
      placement: "bottom",
    },
  ],
};

/**
 * AI Features tour - shows AI coaching and recommendations
 */
export const AI_FEATURES_TOUR: Tour = {
  id: "ai-features",
  name: "AI-Powered Features",
  description: "Discover how AI helps optimize your campaign content",
  steps: [
    {
      target: '[data-tour="ai-recommendations"]',
      title: "AI Content Recommendations",
      content:
        "Get instant messaging guidance for each segment. Learn what tone, timing, and techniques work best for different donor groups.",
      placement: "right",
    },
    {
      target: '[data-tour="ai-coach"]',
      title: "AI Content Coaching",
      content:
        "Click 'Rewrite for this segment' to optimize your content using fundraising best practices. Review before/after and accept or reject.",
      placement: "top",
    },
    {
      target: '[data-tour="seg-wizard"]',
      title: "Recommended Segmentation Wizard",
      content:
        "One-click setup based on campaign type. We'll create versions for the most effective segment combinations automatically.",
      placement: "bottom",
    },
  ],
};

/**
 * Advanced features tour - overlap analysis and performance
 */
export const ADVANCED_FEATURES_TOUR: Tour = {
  id: "advanced-features",
  name: "Advanced Segmentation",
  description: "Master overlap analysis and performance tracking",
  steps: [
    {
      target: '[data-tour="overlap-venn"]',
      title: "Segment Overlap Visualization",
      content:
        "See how your segments overlap. This Venn diagram shows which donors appear in multiple segments.",
      placement: "top",
    },
    {
      target: '[data-tour="overlap-sankey"]',
      title: "Flow Diagram",
      content:
        "The Sankey diagram shows overlap flows across all segments. Thicker flows = more overlap. Use this to avoid over-messaging.",
      placement: "top",
    },
    {
      target: '[data-tour="version-performance"]',
      title: "Performance by Version",
      content:
        "After launch, track results by segment version. See which segments respond best to inform future campaigns.",
      placement: "top",
    },
    {
      target: '[data-tour="deduplication"]',
      title: "Automatic Deduplication",
      content:
        "Don't worry about overlaps - Nexus automatically deduplicates. Each recipient gets content from their highest-priority version only.",
      placement: "bottom",
    },
  ],
};

/**
 * Version management tour - creating and editing versions
 */
export const VERSION_MANAGEMENT_TOUR: Tour = {
  id: "version-management",
  name: "Managing Versions",
  description: "Learn to create and organize deliverable versions",
  steps: [
    {
      target: '[data-tour="add-version"]',
      title: "Adding Versions",
      content:
        "Create a new version for each segment you want to target. Each version gets its own content, subject line, and segment assignment.",
      placement: "left",
    },
    {
      target: '[data-tour="version-drag"]',
      title: "Reorder with Drag & Drop",
      content:
        "Drag versions to reorder them. Priority matters! When donors appear in multiple segments, they get content from the highest version.",
      placement: "right",
    },
    {
      target: '[data-tour="segment-selector"]',
      title: "Assign Segments",
      content:
        "Choose which segment this version targets. The segment criteria determine who receives this content.",
      placement: "bottom",
    },
    {
      target: '[data-tour="content-editor"]',
      title: "Customize Content",
      content:
        "Write content tailored to this segment. Use AI coaching for suggestions, or write from scratch based on segment recommendations.",
      placement: "top",
    },
  ],
};

/**
 * Complete tour collection
 */
export const SEGMENTATION_TOURS: Tour[] = [
  SEGMENTATION_INTRO_TOUR,
  AI_FEATURES_TOUR,
  ADVANCED_FEATURES_TOUR,
  VERSION_MANAGEMENT_TOUR,
];

/**
 * Get tour by ID
 */
export function getTourById(tourId: string): Tour | undefined {
  return SEGMENTATION_TOURS.find((tour) => tour.id === tourId);
}

/**
 * Get recommended tour based on user context
 */
export function getRecommendedTour(context: {
  isNewUser?: boolean;
  hasCreatedSegments?: boolean;
  hasCreatedVersions?: boolean;
}): Tour {
  const { isNewUser, hasCreatedSegments, hasCreatedVersions } = context;

  if (isNewUser || !hasCreatedSegments) {
    return SEGMENTATION_INTRO_TOUR;
  } else if (!hasCreatedVersions) {
    return VERSION_MANAGEMENT_TOUR;
  } else {
    return AI_FEATURES_TOUR;
  }
}

/**
 * Tour progress tracking
 */
export interface TourProgress {
  tourId: string;
  completedSteps: number[];
  completed: boolean;
  lastViewedAt?: string;
}

/**
 * Check if user has completed a tour
 */
export function hasTourBeenCompleted(
  tourId: string,
  progress: TourProgress[],
): boolean {
  const tourProgress = progress.find((p) => p.tourId === tourId);
  return tourProgress?.completed || false;
}

/**
 * Get next incomplete tour
 */
export function getNextIncompleteTour(
  progress: TourProgress[],
): Tour | undefined {
  for (const tour of SEGMENTATION_TOURS) {
    if (!hasTourBeenCompleted(tour.id, progress)) {
      return tour;
    }
  }
  return undefined;
}
