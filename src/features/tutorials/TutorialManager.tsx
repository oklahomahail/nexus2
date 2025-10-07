import React, { useCallback, useEffect } from "react";
import { useTutorial } from "./useTutorial";
import { TutorialSpotlight } from "./TutorialSpotlight";
import type { TutorialConfig } from "./types";

type Props = {
  config: TutorialConfig | null;
  onStart?: () => void;
  onComplete?: () => void;
  onDismiss?: () => void;
  autoStart?: boolean;
};

export const TutorialManager: React.FC<Props> = ({
  config,
  onStart,
  onComplete,
  onDismiss,
  autoStart = true,
}) => {
  const {
    active,
    currentStep,
    stepIndex,
    totalSteps,
    isCompleted,
    start,
    next,
    previous,
    dismiss,
    complete,
    anchorElement,
  } = useTutorial(config);

  // Handle primary action (next/complete)
  const handlePrimary = useCallback(() => {
    if (stepIndex === totalSteps - 1) {
      complete();
      onComplete?.();
    } else {
      next();
    }
  }, [stepIndex, totalSteps, complete, next, onComplete]);

  // Handle secondary action
  const handleSecondary = useCallback(() => {
    if (!currentStep) return;
    
    if (currentStep.secondaryAction === "dismiss") {
      dismiss();
      onDismiss?.();
      return;
    }
    
    if (currentStep.secondaryAction?.startsWith("goto:")) {
      const path = currentStep.secondaryAction.slice(5); // Remove "goto:" prefix
      // Use React Router navigation if available
      if (window.history && window.history.pushState) {
        window.history.pushState({}, "", path);
        // Trigger a popstate event to notify React Router
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
      return;
    }

    // Default behavior - go to next step
    next();
  }, [currentStep, dismiss, next, onDismiss]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    dismiss();
    onDismiss?.();
  }, [dismiss, onDismiss]);

  // Auto-start logic (if not disabled and conditions are met)
  useEffect(() => {
    if (!config || !autoStart || isCompleted || active) return;
    
    // Check if this is truly a first-time user
    const hasCompletedAnyTour = [
      "nexus.tour.core.completed",
      "nexus.tour.campaigns.completed", 
      "nexus.tour.analytics.completed",
      "nexus.tutorial.onboarding.completed"
    ].some(key => localStorage.getItem(key) === "1");

    if (!hasCompletedAnyTour) {
      // Small delay to ensure page is ready
      const timer = setTimeout(() => {
        start();
        onStart?.();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [config, autoStart, isCompleted, active, start, onStart]);

  // Provide manual start method via global function
  useEffect(() => {
    if (!config) return;
    
    // Expose global function for manual tutorial start
    const startTutorial = () => {
      start();
      onStart?.();
    };
    
    // Attach to window for dev tools / help menu access
    (window as any).__startNexusTutorial = startTutorial;
    
    return () => {
      delete (window as any).__startNexusTutorial;
    };
  }, [config, start, onStart]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!active) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          handleDismiss();
          break;
        case "ArrowRight":
        case "Enter":
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            handlePrimary();
          }
          break;
        case "ArrowLeft":
          if (!event.metaKey && !event.ctrlKey && stepIndex > 0) {
            event.preventDefault();
            previous();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, handlePrimary, handleDismiss, previous, stepIndex]);

  // Don't render if no config, completed, or not active
  if (!config || !active || !currentStep || isCompleted) {
    return null;
  }

  return (
    <TutorialSpotlight
      step={currentStep}
      anchorElement={anchorElement}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      onPrimary={handlePrimary}
      onSecondary={currentStep.secondaryCta ? handleSecondary : undefined}
      onDismiss={handleDismiss}
      showProgress={totalSteps > 1}
    />
  );
};

// Export a hook for imperative control
export const useTutorialManager = (config: TutorialConfig | null) => {
  const tutorial = useTutorial(config);
  
  return {
    ...tutorial,
    startTutorial: tutorial.start,
    resetTutorial: tutorial.reset,
    isTutorialActive: tutorial.active,
    canStartTutorial: !!config && !tutorial.isCompleted,
  };
};