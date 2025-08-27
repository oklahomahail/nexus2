// src/hooks/useKeyboardShortcuts.ts
import { useEffect, useRef } from "react";

type Shortcut = {
  key: string;
  handler: (e: KeyboardEvent) => void | Promise<void>;
  /** Prevent default browser behavior for this key */
  preventDefault?: boolean;
  /** Allow shortcut when focused inside inputs/textareas/contentEditable */
  allowInInputs?: boolean;
  /** Extra guard to enable/disable dynamically */
  when?: () => boolean;
};

/**
 * Register global keyboard shortcuts.
 * NOTE: This hook returns void and never bubbles up a Promise,
 * so it won't trigger no-floating-promises at the callsite.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  const shortcutsRef = useRef(shortcuts);

  // Always keep latest shortcuts without re-subscribing the listener
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);

      for (const s of shortcutsRef.current) {
        if (s.key !== e.key) continue;
        if (!s.allowInInputs && isInput) continue;
        if (s.when && !s.when()) continue;

        if (s.preventDefault) e.preventDefault();

        try {
          const maybe = s.handler(e);
          // Swallow any async rejections inside the hook so the caller
          // never sees a Promise and ESLint stays happy.
          if (maybe && typeof (maybe as Promise<void>).then === "function") {
            void (maybe as Promise<void>).catch((err) => {
              if (process.env.NODE_ENV !== "production") {
                console.error("Keyboard shortcut handler failed:", err);
              }
            });
          }
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Keyboard shortcut handler threw:", err);
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
