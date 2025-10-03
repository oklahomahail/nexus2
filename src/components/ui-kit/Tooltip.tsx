import clsx from "clsx";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click" | "focus";
  delay?: number;
  disabled?: boolean;
  className?: string;
  arrow?: boolean;
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  trigger = "hover",
  delay = 200,
  disabled = false,
  className,
  arrow = true,
  maxWidth = "200px",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + scrollY + 8;
        left =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case "right":
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    setPosition({ top, left });
  }, [placement]);

  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Handle trigger events
  const handleMouseEnter = () => {
    if (trigger === "hover") showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") hideTooltip();
  };

  const handleClick = () => {
    if (trigger === "click") {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === "focus") showTooltip();
  };

  const handleBlur = () => {
    if (trigger === "focus") hideTooltip();
  };

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition();

      // Recalculate on scroll/resize
      const handleReposition = () => {
        if (isVisible) calculatePosition();
      };

      window.addEventListener("scroll", handleReposition);
      window.addEventListener("resize", handleReposition);

      return () => {
        window.removeEventListener("scroll", handleReposition);
        window.removeEventListener("resize", handleReposition);
      };
    }
  }, [isVisible, placement, calculatePosition]);

  // Close tooltip on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        hideTooltip();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isVisible]);

  // Close tooltip when clicking outside (for click trigger)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        trigger === "click" &&
        isVisible &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        hideTooltip();
      }
    };

    if (trigger === "click" && isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [trigger, isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Arrow styles
  const getArrowStyles = () => {
    const arrowSize = 6;
    const arrowStyles: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
    };

    switch (placement) {
      case "top":
        arrowStyles.bottom = -arrowSize;
        arrowStyles.left = "50%";
        arrowStyles.transform = "translateX(-50%)";
        arrowStyles.borderLeft = `${arrowSize}px solid transparent`;
        arrowStyles.borderRight = `${arrowSize}px solid transparent`;
        arrowStyles.borderTop = `${arrowSize}px solid rgb(30 41 59)`; // slate-800
        break;
      case "bottom":
        arrowStyles.top = -arrowSize;
        arrowStyles.left = "50%";
        arrowStyles.transform = "translateX(-50%)";
        arrowStyles.borderLeft = `${arrowSize}px solid transparent`;
        arrowStyles.borderRight = `${arrowSize}px solid transparent`;
        arrowStyles.borderBottom = `${arrowSize}px solid rgb(30 41 59)`;
        break;
      case "left":
        arrowStyles.right = -arrowSize;
        arrowStyles.top = "50%";
        arrowStyles.transform = "translateY(-50%)";
        arrowStyles.borderTop = `${arrowSize}px solid transparent`;
        arrowStyles.borderBottom = `${arrowSize}px solid transparent`;
        arrowStyles.borderLeft = `${arrowSize}px solid rgb(30 41 59)`;
        break;
      case "right":
        arrowStyles.left = -arrowSize;
        arrowStyles.top = "50%";
        arrowStyles.transform = "translateY(-50%)";
        arrowStyles.borderTop = `${arrowSize}px solid transparent`;
        arrowStyles.borderBottom = `${arrowSize}px solid transparent`;
        arrowStyles.borderRight = `${arrowSize}px solid rgb(30 41 59)`;
        break;
    }

    return arrowStyles;
  };

  // Clone children with event handlers and ref
  const clonedChildren = React.cloneElement(children as any, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      // Call original ref if it exists
      const originalRef = (children as any).ref;
      if (originalRef) {
        if (typeof originalRef === "function") {
          originalRef(node);
        } else if (originalRef && typeof originalRef === "object") {
          originalRef.current = node;
        }
      }
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    onFocus: handleFocus,
    onBlur: handleBlur,
  });

  // Tooltip component
  const tooltip =
    isVisible && content ? (
      <div
        ref={tooltipRef}
        className={clsx(
          "absolute z-50 px-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-lg shadow-xl pointer-events-none",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className,
        )}
        style={{
          top: position.top,
          left: position.left,
          maxWidth,
        }}
        role="tooltip"
      >
        {content}
        {arrow && <div style={getArrowStyles()} />}
      </div>
    ) : null;

  return (
    <>
      {clonedChildren}
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
};

export default Tooltip;
