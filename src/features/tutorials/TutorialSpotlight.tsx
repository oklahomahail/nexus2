import clsx from "clsx";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui-kit/Button";

import type { TutorialStep } from "./types";

type Props = {
  step: TutorialStep;
  anchorElement: HTMLElement | null;
  stepIndex: number;
  totalSteps: number;
  onPrimary: () => void;
  onSecondary?: () => void;
  onDismiss?: () => void;
  showProgress?: boolean;
};

export const TutorialSpotlight: React.FC<Props> = ({
  step,
  anchorElement,
  stepIndex,
  totalSteps,
  onPrimary,
  onSecondary,
  onDismiss,
  showProgress = true,
}) => {
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
    maxWidth: number;
  }>({
    top: 0,
    left: 0,
    maxWidth: 420,
  });

  // Calculate popover position
  useEffect(() => {
    if (!anchorElement) {
      // Center modal for non-spotlight steps
      setPopoverPosition({
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 250,
        maxWidth: 500,
      });
      return;
    }

    const rect = anchorElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popoverWidth = 420;
    const popoverHeight = 300; // estimated

    let top = rect.bottom + 16;
    let left = rect.left;
    let maxWidth = popoverWidth;

    // Adjust horizontal position if popover would go off screen
    if (left + popoverWidth > viewportWidth - 20) {
      left = viewportWidth - popoverWidth - 20;
    }
    if (left < 20) {
      left = 20;
      maxWidth = Math.min(popoverWidth, viewportWidth - 40);
    }

    // Adjust vertical position if popover would go off screen
    if (top + popoverHeight > viewportHeight - 20) {
      // Try positioning above the element
      const topPosition = rect.top - popoverHeight - 16;
      if (topPosition > 20) {
        top = topPosition;
      } else {
        // Position to the side if neither top nor bottom works
        top = Math.max(
          20,
          Math.min(rect.top, viewportHeight - popoverHeight - 20),
        );
        left = rect.right + 16;

        // If positioning to the right doesn't work, try left
        if (left + popoverWidth > viewportWidth - 20) {
          left = rect.left - popoverWidth - 16;
          if (left < 20) {
            // Fallback to center of viewport
            top = viewportHeight / 2 - popoverHeight / 2;
            left = viewportWidth / 2 - popoverWidth / 2;
          }
        }
      }
    }

    setPopoverPosition({ top, left, maxWidth });
  }, [anchorElement, step]);

  const haloStyle = anchorElement
    ? {
        position: "fixed" as const,
        top: anchorElement.getBoundingClientRect().top - 8,
        left: anchorElement.getBoundingClientRect().left - 8,
        width: anchorElement.getBoundingClientRect().width + 16,
        height: anchorElement.getBoundingClientRect().height + 16,
        border: "3px solid #3b82f6",
        borderRadius: 12,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        pointerEvents: "none" as const,
        zIndex: 9998,
        animation: "tutorial-pulse 2s ease-in-out infinite",
      }
    : undefined;

  const popoverStyle: React.CSSProperties = {
    position: "fixed",
    top: popoverPosition.top,
    left: popoverPosition.left,
    maxWidth: popoverPosition.maxWidth,
    background: "white",
    borderRadius: 16,
    padding: 24,
    zIndex: 9999,
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e5e7eb",
  };

  return (
    <>
      {/* Add keyframe animation to document head */}
      <style>{`
        @keyframes tutorial-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>

      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9997]" onClick={onDismiss} />

      {/* Halo effect around target element */}
      {haloStyle && <div style={haloStyle} />}

      {/* Tutorial popover */}
      <div
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="tutorial-popover"
      >
        {/* Progress indicator */}
        {showProgress && (
          <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
            <span>
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-2 h-2 rounded-full transition-colors",
                    i === stepIndex ? "bg-blue-600" : "bg-slate-300",
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <h3
          id="tutorial-title"
          className="text-xl font-semibold text-slate-900 mb-3"
        >
          {step.title}
        </h3>

        {/* Body */}
        <p className="text-slate-700 mb-4 leading-relaxed">{step.body}</p>

        {/* Checklist */}
        {step.checklist && step.checklist.length > 0 && (
          <ul className="mb-4 space-y-2">
            {step.checklist.map((item, index) => (
              <li key={index} className="flex items-start text-slate-600">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Options */}
        {step.options && step.options.length > 0 && (
          <ul className="mb-4 space-y-2">
            {step.options.map((option, index) => (
              <li key={index} className="flex items-start text-slate-600">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span className="text-sm">{option}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Examples */}
        {step.examples && Object.keys(step.examples).length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
            <div className="text-sm text-slate-600 space-y-1">
              {Object.entries(step.examples).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize font-medium">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        {step.tip && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">💡</span>
              <p className="text-sm text-blue-800 italic">{step.tip}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex space-x-3">
            {step.secondaryCta && onSecondary && (
              <Button variant="outline" size="sm" onClick={onSecondary}>
                {step.secondaryCta}
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
                className="text-slate-500 hover:text-slate-700"
              >
                Skip Tutorial
              </Button>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onPrimary}
            className="ml-auto"
          >
            {step.primaryCta ||
              (stepIndex === totalSteps - 1 ? "Complete" : "Next")}
          </Button>
        </div>
      </div>
    </>
  );
};
