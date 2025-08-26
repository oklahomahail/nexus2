export {};
import { useEffect } from "react";

export type KeyBinding = {
  key: string; // e.g. "k", "s", "Enter", "Escape", "/"
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // ⌘ on macOS, Windows key on Windows
  preventDefault?: boolean; // default true
  allowInInputs?: boolean; // default false
  when?: () => boolean; // optional guard; return true to enable
  handler: (e: KeyboardEvent) => void;
};

function isTypingField(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el instanceof HTMLInputElement) return true;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el.isContentEditable) return true;
  return false;
}

function match(e: KeyboardEvent, b: KeyBinding): boolean {
  if (b.key.toLowerCase() !== e.key.toLowerCase()) return false;
  if ((b.ctrl ?? false) !== e.ctrlKey) return false;
  if ((b.shift ?? false) !== e.shiftKey) return false;
  if ((b.alt ?? false) !== e.altKey) return false;
  if ((b.meta ?? false) !== e.metaKey) return false;
  return true;
}

/**
 * Registers window-level keydown handlers for the provided bindings.
 * Defaults: preventDefault = true, allowInInputs = false.
 */
export function useKeyboardShortcuts(bindings?: KeyBinding[]) {
  useEffect(() => {
    if (!bindings || bindings.length === 0) return;

    const onKeyDown = (e: KeyboardEvent) => {
      for (const b of bindings) {
        if (b.when && !b.when()) continue;
        if (!b.allowInInputs && isTypingField(e.target)) continue;

        if (match(e, b)) {
          if (b.preventDefault !== false) e.preventDefault();
          b.handler(e);
          break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bindings]);
}
