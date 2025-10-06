// Export all tour functions and utilities
export { createTour, createTourWithValidation, validateTourElements, waitForElement } from './driverService';
export type { TourStep, TourOptions } from './driverService';

export { startCoreTour, coreTourSteps } from './coreTour';
export { startCampaignsTour, campaignsTourSteps } from './campaignsTour';

// Re-export onboarding utilities for convenience
export {
  shouldShowWelcomeModal,
  hasCompletedCoreTour,
  hasCompletedCampaignsTour,
  hasCompletedAnalyticsTour,
  markCoreTourCompleted,
  markCampaignsTourCompleted,
  markAnalyticsTourCompleted,
  dismissCoreTour,
  resetCoreTourState,
  getOnboardingChecklist,
  getOnboardingProgress,
  markOnboardingStepCompleted,
  isOnboardingStepCompleted,
  getTourPreferences,
  resetAllOnboardingState,
} from '@/utils/onboarding';