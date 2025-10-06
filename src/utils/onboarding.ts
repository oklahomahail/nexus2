// Keys for localStorage
const CORE_TOUR_COMPLETED_KEY = "nexus.tour.core.completed";
const CORE_TOUR_DISMISSED_KEY = "nexus.tour.core.dismissed";
const CAMPAIGNS_TOUR_COMPLETED_KEY = "nexus.tour.campaigns.completed";
const ANALYTICS_TOUR_COMPLETED_KEY = "nexus.tour.analytics.completed";
const ONBOARDING_CHECKLIST_KEY = "nexus.onboarding.checklist";

export type OnboardingStep = 
  | "add_client"
  | "create_campaign"
  | "view_analytics" 
  | "export_report"
  | "complete_profile";

export interface OnboardingChecklist {
  [key: string]: {
    completed: boolean;
    completedAt?: Date;
  };
}

// Core tour functions
export function hasCompletedCoreTour(): boolean {
  return localStorage.getItem(CORE_TOUR_COMPLETED_KEY) === "1";
}

export function markCoreTourCompleted(): void {
  localStorage.setItem(CORE_TOUR_COMPLETED_KEY, "1");
  localStorage.setItem(`${CORE_TOUR_COMPLETED_KEY}.timestamp`, new Date().toISOString());
}

export function isCoreTourDismissed(): boolean {
  return localStorage.getItem(CORE_TOUR_DISMISSED_KEY) === "1";
}

export function dismissCoreTour(): void {
  localStorage.setItem(CORE_TOUR_DISMISSED_KEY, "1");
  localStorage.setItem(`${CORE_TOUR_DISMISSED_KEY}.timestamp`, new Date().toISOString());
}

export function resetCoreTourState(): void {
  localStorage.removeItem(CORE_TOUR_COMPLETED_KEY);
  localStorage.removeItem(CORE_TOUR_DISMISSED_KEY);
  localStorage.removeItem(`${CORE_TOUR_COMPLETED_KEY}.timestamp`);
  localStorage.removeItem(`${CORE_TOUR_DISMISSED_KEY}.timestamp`);
}

// Feature-specific tour functions
export function hasCompletedCampaignsTour(): boolean {
  return localStorage.getItem(CAMPAIGNS_TOUR_COMPLETED_KEY) === "1";
}

export function markCampaignsTourCompleted(): void {
  localStorage.setItem(CAMPAIGNS_TOUR_COMPLETED_KEY, "1");
  localStorage.setItem(`${CAMPAIGNS_TOUR_COMPLETED_KEY}.timestamp`, new Date().toISOString());
}

export function hasCompletedAnalyticsTour(): boolean {
  return localStorage.getItem(ANALYTICS_TOUR_COMPLETED_KEY) === "1";
}

export function markAnalyticsTourCompleted(): void {
  localStorage.setItem(ANALYTICS_TOUR_COMPLETED_KEY, "1");
  localStorage.setItem(`${ANALYTICS_TOUR_COMPLETED_KEY}.timestamp`, new Date().toISOString());
}

// Onboarding checklist functions
export function getOnboardingChecklist(): OnboardingChecklist {
  const stored = localStorage.getItem(ONBOARDING_CHECKLIST_KEY);
  if (!stored) {
    return {};
  }
  
  try {
    const parsed = JSON.parse(stored);
    // Convert completedAt strings back to Date objects
    Object.keys(parsed).forEach(key => {
      if (parsed[key].completedAt) {
        parsed[key].completedAt = new Date(parsed[key].completedAt);
      }
    });
    return parsed;
  } catch (error) {
    console.warn("Failed to parse onboarding checklist:", error);
    return {};
  }
}

export function markOnboardingStepCompleted(step: OnboardingStep): void {
  const checklist = getOnboardingChecklist();
  checklist[step] = {
    completed: true,
    completedAt: new Date(),
  };
  localStorage.setItem(ONBOARDING_CHECKLIST_KEY, JSON.stringify(checklist));
}

export function isOnboardingStepCompleted(step: OnboardingStep): boolean {
  const checklist = getOnboardingChecklist();
  return checklist[step]?.completed ?? false;
}

export function getOnboardingProgress(): { completed: number; total: number; percentage: number } {
  const checklist = getOnboardingChecklist();
  const steps: OnboardingStep[] = [
    "add_client",
    "create_campaign", 
    "view_analytics",
    "export_report",
    "complete_profile"
  ];
  
  const completed = steps.filter(step => checklist[step]?.completed).length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
}

export function resetOnboardingChecklist(): void {
  localStorage.removeItem(ONBOARDING_CHECKLIST_KEY);
}

// Check if user should see the welcome modal
export function shouldShowWelcomeModal(): boolean {
  return !hasCompletedCoreTour() && !isCoreTourDismissed();
}

// Check if this is likely a first-time user
export function isLikelyFirstTimeUser(): boolean {
  const hasAnyTourCompleted = hasCompletedCoreTour() || 
                              hasCompletedCampaignsTour() || 
                              hasCompletedAnalyticsTour();
  
  const hasAnyOnboardingProgress = Object.values(getOnboardingChecklist())
    .some(step => step.completed);
  
  return !hasAnyTourCompleted && !hasAnyOnboardingProgress;
}

// Get user's tour preferences
export function getTourPreferences() {
  return {
    coreCompleted: hasCompletedCoreTour(),
    coreDismissed: isCoreTourDismissed(),
    campaignsCompleted: hasCompletedCampaignsTour(),
    analyticsCompleted: hasCompletedAnalyticsTour(),
    onboardingProgress: getOnboardingProgress(),
    isFirstTime: isLikelyFirstTimeUser(),
    shouldShowWelcome: shouldShowWelcomeModal(),
  };
}

// Reset all onboarding state (useful for testing)
export function resetAllOnboardingState(): void {
  resetCoreTourState();
  localStorage.removeItem(CAMPAIGNS_TOUR_COMPLETED_KEY);
  localStorage.removeItem(ANALYTICS_TOUR_COMPLETED_KEY);
  localStorage.removeItem(`${CAMPAIGNS_TOUR_COMPLETED_KEY}.timestamp`);
  localStorage.removeItem(`${ANALYTICS_TOUR_COMPLETED_KEY}.timestamp`);
  resetOnboardingChecklist();
}