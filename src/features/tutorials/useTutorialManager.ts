import { useTutorial } from "./useTutorial";

import type { TutorialConfig } from "./types";

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
