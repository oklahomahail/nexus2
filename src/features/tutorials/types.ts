export type TutorialStepType = "modal" | "spotlight";

export type TutorialStep = {
  id: string;
  type: TutorialStepType;
  title: string;
  body: string;
  anchor?: string; // CSS selector for spotlight steps
  primaryCta?: string;
  secondaryCta?: string;
  secondaryAction?: "dismiss" | string; // allow goto:/path format
  tip?: string;
  checklist?: string[];
  options?: string[];
  examples?: Record<string, unknown>;
  formDefaults?: Record<string, unknown>;
};

export type TutorialConfig = {
  id: string;
  title: string;
  version: number;
  completionStorageKey: string;
  steps: TutorialStep[];
  demoSeeds?: {
    clientSlug?: string;
    campaignSlug?: string;
  };
};

export type TutorialState = {
  active: boolean;
  currentStep: TutorialStep | null;
  stepIndex: number;
  totalSteps: number;
  isCompleted: boolean;
};

export type TutorialActions = {
  start: () => void;
  next: () => void;
  previous: () => void;
  goToStep: (index: number) => void;
  dismiss: () => void;
  complete: () => void;
  reset: () => void;
};

export type TutorialHookReturn = TutorialState & TutorialActions & {
  anchorElement: HTMLElement | null;
  config: TutorialConfig | null | undefined;
};
