import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Step = {
  id: string;
  type: "modal" | "spotlight";
  title: string;
  body: string;
  anchors?: string[];              // NEW: multiple candidates
  anchor?: string;                 // backward compatible
  navigateTo?: string;             // NEW: route to push before step shows
  primaryCta?: string;
  secondaryCta?: string;
  secondaryAction?: "dismiss" | "restart" | string;
  tip?: string;
  checklist?: string[];
  waitForAnchorMs?: number;        // NEW: wait for element
};

export type TutorialConfig = {
  id: string;
  title: string;
  version: number;
  completionStorageKey: string;
  steps: Step[];
  demoSeeds?: { clientSlug?: string; campaignSlug?: string };
};

export function useTutorial(config?: TutorialConfig) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const steps = config?.steps ?? [];
  const step = steps[index];
  const baseKey = config?.completionStorageKey ?? "tutorialDone";
  const versionKey = `${baseKey}:v${config?.version ?? 1}`;
  const navigate = useNavigate();
  const hasAutoStartedRef = useRef(false);
  const suppressKey = `${baseKey}:suppressSession`; // prevents re-autostart in same session after skip

  // Resolve first existing anchor
  const anchorSelector = useMemo(() => {
    if (!step) return null;
    const cands = step.anchors && step.anchors.length ? step.anchors : step.anchor ? [step.anchor] : [];
    for (const sel of cands) {
      if (document.querySelector(sel)) return sel;
    }
    return cands[0] || null;
  }, [step]);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!step) return;

    async function resolveAnchor() {
      if (step.navigateTo) {
        navigate(step.navigateTo);
      }
      const timeout = step.waitForAnchorMs ?? 0;
      if (!anchorSelector) {
        setAnchorEl(null);
        return;
      }
      // wait loop
      let el: Element | null = null;
      const start = Date.now();
      while (!cancelled && !(el = document.querySelector(anchorSelector)) && Date.now() - start < timeout) {
        await new Promise(r => setTimeout(r, 100));
      }
      setAnchorEl((el as HTMLElement) || null);
      if (el) {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    void resolveAnchor();
    return () => { cancelled = true; };
  }, [step, anchorSelector, navigate]);

  const start = useCallback(() => {
    if (!config) return;
    setActive(true);
    setIndex(0);
  }, [config]);

  const markComplete = useCallback(() => {
    localStorage.setItem(baseKey, "1");
    localStorage.setItem(versionKey, "1");
  }, [baseKey, versionKey]);

  const dismiss = useCallback(() => {
    setActive(false);
    markComplete();
    sessionStorage.setItem(suppressKey, "1");
  }, [markComplete, suppressKey]);

  const restart = useCallback(() => {
    setIndex(0);
    setActive(true);
    // do not clear completion keys here, this is a manual restart from the user
  }, []);

  const next = useCallback(() => {
    if (index < steps.length - 1) setIndex(i => i + 1);
    else dismiss();
  }, [index, steps.length, dismiss]);

  const prev = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
  }, []);

  const isCompleted = useMemo(() => {
    return localStorage.getItem(versionKey) === "1";
  }, [versionKey]);

  // Auto start one time per session when not completed and not suppressed
  useEffect(() => {
    if (!config) return;
    if (hasAutoStartedRef.current) return;
    const forced = new URLSearchParams(window.location.search).get("tour") === "1";
    const suppressed = sessionStorage.getItem(suppressKey) === "1";
    if ((forced || !isCompleted) && !suppressed) {
      hasAutoStartedRef.current = true;
      setActive(true);
      setIndex(0);
    }
  }, [config, isCompleted, suppressKey]);

  return {
    active,
    setActive,
    step,
    index,
    steps,
    start,
    next,
    prev,
    dismiss,
    restart,
    anchorEl,
    isCompleted
  };
}
