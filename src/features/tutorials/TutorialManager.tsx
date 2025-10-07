import React, { useCallback, useEffect, useState } from "react";
import { useTutorial, type TutorialConfig } from "./useTutorial";
import { TutorialSpotlight } from "./TutorialSpotlight";

type Props = { config: TutorialConfig | null; onDismiss?: () => void };

export const TutorialManager: React.FC<Props> = ({ config, onDismiss }) => {
  const { active, step, start, next, prev, dismiss, restart, anchorEl } = useTutorial(config || undefined);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!config) return;
    setVisible(true);
  }, [config]);

  const handlePrimary = useCallback(() => { next(); }, [next]);

  const handleSecondary = useCallback(() => {
    if (!step) return;
    if (step.secondaryAction === "dismiss") {
      dismiss();
      setVisible(false);
      onDismiss?.();
      return;
    }
    if (step.secondaryAction === "restart") {
      restart();
      return;
    }
    if (step.secondaryAction?.startsWith("goto:")) {
      const path = step.secondaryAction.slice("goto:".length);
      window.history.pushState({}, "", path);
    }
  }, [step, dismiss, restart, onDismiss]);

  if (!config || !active || !step || !visible) return null;

  const props = {
    title: step.title,
    body: step.body,
    tip: (step as any).tip,
    checklist: (step as any).checklist,
    primaryCta: step.primaryCta || "Next",
    secondaryCta: step.secondaryCta,
    onPrimary: handlePrimary,
    onSecondary: handleSecondary
  };

  return step.type === "modal" ? (
    <TutorialSpotlight anchorEl={null} {...props} />
  ) : (
    <TutorialSpotlight anchorEl={anchorEl} {...props} />
  );
};