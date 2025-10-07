// Main tutorial system exports
export type { TutorialConfig, TutorialStep, TutorialHookReturn } from "./types";
export { useTutorial } from "./useTutorial";
export { TutorialSpotlight } from "./TutorialSpotlight";
export { TutorialManager } from "./TutorialManager";
export { useTutorialManager } from "./useTutorialManager";

// Tutorial configuration loader
export const loadTutorialConfig = async (): Promise<import("./types").TutorialConfig | null> => {
  try {
    // Import the JSON directly as ES module in Vite
    const config = await import("@/data/tutorials/nexusTutorial.json");
    return (config.default || config) as import("./types").TutorialConfig;
  } catch (error) {
    console.warn("Failed to load tutorial configuration:", error);
    return null;
  }
};

// Integration with existing onboarding system
export const hasCompletedNexusTutorial = (): boolean => {
  return localStorage.getItem("nexus.tutorial.onboarding.completed") === "1";
};

export const markNexusTutorialCompleted = (): void => {
  localStorage.setItem("nexus.tutorial.onboarding.completed", "1");
  localStorage.setItem(
    "nexus.tutorial.onboarding.completed.timestamp",
    new Date().toISOString(),
  );
};

export const resetNexusTutorial = (): void => {
  localStorage.removeItem("nexus.tutorial.onboarding.completed");
  localStorage.removeItem("nexus.tutorial.onboarding.completed.timestamp");
};

// Global tutorial controls (accessible via browser console for development)
export const addGlobalTutorialControls = () => {
  if (typeof window !== "undefined") {
    (window as any).nexusTutorialControls = {
      reset: resetNexusTutorial,
      checkCompleted: hasCompletedNexusTutorial,
      start: () => {
        resetNexusTutorial();
        window.location.reload();
      },
    };
  }
};

// Utility to check if user should see the new tutorial
export const shouldShowNexusTutorial = (): boolean => {
  // Don't show if already completed
  if (hasCompletedNexusTutorial()) {
    return false;
  }

  // Don't show if other tours are completed (they're experienced users)
  const hasOtherTours = [
    "nexus.tour.core.completed",
    "nexus.tour.campaigns.completed",
    "nexus.tour.analytics.completed",
  ].some((key) => localStorage.getItem(key) === "1");

  return !hasOtherTours;
};
