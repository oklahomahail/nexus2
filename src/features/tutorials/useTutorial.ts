import { useCallback, useEffect, useMemo, useState } from "react";

import type { TutorialConfig, TutorialHookReturn } from "./types";

export function useTutorial(
  config?: TutorialConfig | null,
): TutorialHookReturn {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = config?.steps ?? [];
  const currentStep = steps[stepIndex] ?? null;
  const totalSteps = steps.length;
  const completionKey =
    config?.completionStorageKey ?? "nexus.tutorial.default.completed";

  // Check if tutorial is completed
  const isCompleted = useMemo(() => {
    if (!config) return false;
    return localStorage.getItem(completionKey) === "1";
  }, [completionKey, config]);

  // Find anchor element for spotlight steps
  const anchorElement = useMemo<HTMLElement | null>(() => {
    if (!currentStep?.anchor || currentStep.type !== "spotlight") return null;
    return document.querySelector(currentStep.anchor) as HTMLElement | null;
  }, [currentStep?.anchor, currentStep?.type]);

  // Tutorial actions
  const start = useCallback(() => {
    if (!config || isCompleted) return;
    setActive(true);
    setStepIndex(0);
  }, [config, isCompleted]);

  const next = useCallback(() => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      // Complete the tutorial
      if (config) {
        localStorage.setItem(completionKey, "1");
        localStorage.setItem(
          `${completionKey}.timestamp`,
          new Date().toISOString(),
        );
      }
      setActive(false);
    }
  }, [stepIndex, totalSteps, completionKey, config]);

  const previous = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }, [stepIndex]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setStepIndex(index);
      }
    },
    [totalSteps],
  );

  const dismiss = useCallback(() => {
    setActive(false);
    if (config) {
      localStorage.setItem(completionKey, "1");
      localStorage.setItem(
        `${completionKey}.timestamp`,
        new Date().toISOString(),
      );
    }
  }, [completionKey, config]);

  const complete = useCallback(() => {
    if (config) {
      localStorage.setItem(completionKey, "1");
      localStorage.setItem(
        `${completionKey}.timestamp`,
        new Date().toISOString(),
      );
    }
    setActive(false);
  }, [completionKey, config]);

  const reset = useCallback(() => {
    if (config) {
      localStorage.removeItem(completionKey);
      localStorage.removeItem(`${completionKey}.timestamp`);
    }
    setActive(false);
    setStepIndex(0);
  }, [completionKey, config]);

  // Auto-scroll to anchor element when it changes
  useEffect(() => {
    if (anchorElement && active) {
      setTimeout(() => {
        anchorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [anchorElement, active]);

  // Auto-start tutorial if conditions are met
  useEffect(() => {
    if (!config || isCompleted) return;

    // Check if this is a first-time user (integrating with existing onboarding)
    const hasAnyTourCompleted =
      localStorage.getItem("nexus.tour.core.completed") === "1" ||
      localStorage.getItem("nexus.tour.campaigns.completed") === "1" ||
      localStorage.getItem("nexus.tour.analytics.completed") === "1";

    // Only auto-start if no other tours have been completed
    if (!hasAnyTourCompleted && !active) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        start();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [config, isCompleted, active, start]);

  return {
    // State
    active,
    currentStep,
    stepIndex,
    totalSteps,
    isCompleted,

    // Actions
    start,
    next,
    previous,
    goToStep,
    dismiss,
    complete,
    reset,

    // Additional data
    anchorElement,
    config,
  };
}
