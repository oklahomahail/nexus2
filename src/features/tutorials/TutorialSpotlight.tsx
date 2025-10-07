import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui-kit/Button";

type Props = {
  anchorEl: HTMLElement | null;
  title: string;
  body: string;
  tip?: string;
  checklist?: string[];
  primaryCta?: string;
  secondaryCta?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onDismiss?: () => void;
};

export const TutorialSpotlight: React.FC<Props> = ({
  anchorEl,
  title,
  body,
  tip,
  checklist,
  primaryCta,
  secondaryCta,
  onPrimary,
  onSecondary,
  onDismiss,
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
    if (!anchorEl) {
      // Center modal for non-spotlight steps
      setPopoverPosition({
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 250,
        maxWidth: 500,
      });
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
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
  }, [anchorEl]);

  const haloStyle = anchorEl
    ? {
        position: "fixed" as const,
        top: anchorEl.getBoundingClientRect().top - 8,
        left: anchorEl.getBoundingClientRect().left - 8,
        width: anchorEl.getBoundingClientRect().width + 16,
        height: anchorEl.getBoundingClientRect().height + 16,
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
        {/* Title */}
        <h3
          id="tutorial-title"
          className="text-xl font-semibold text-slate-900 mb-3"
        >
          {title}
        </h3>

        {/* Body */}
        <p className="text-slate-700 mb-4 leading-relaxed">{body}</p>

        {/* Checklist */}
        {checklist && checklist.length > 0 && (
          <ul className="mb-4 space-y-2">
            {checklist.map((item, index) => (
              <li key={index} className="flex items-start text-slate-600">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Tip */}
        {tip && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">💡</span>
              <p className="text-sm text-blue-800 italic">{tip}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex space-x-3">
            {secondaryCta && onSecondary && (
              <Button variant="outline" size="sm" onClick={onSecondary}>
                {secondaryCta}
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
            {primaryCta || "Next"}
          </Button>
        </div>
      </div>
    </>
  );
};
