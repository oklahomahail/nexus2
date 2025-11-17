/**
 * TextArea Component
 * Premium editorial multi-line text input
 */

import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, helperText, label, className = "", ...props }, ref) => {
    const baseStyles =
      "w-full px-3 py-2 text-sm bg-white border rounded-[var(--nx-radius-sm)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y";

    const stateStyles = error
      ? "border-[var(--nx-error)] focus:ring-[var(--nx-error)] focus:border-[var(--nx-error)]"
      : "border-[var(--nx-border)] focus:ring-[var(--nx-charcoal)] focus:border-[var(--nx-charcoal)]";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-[var(--nx-text-primary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseStyles} ${stateStyles} ${className}`}
          {...props}
        />
        {helperText && (
          <p
            className={`mt-1 text-xs ${error ? "text-[var(--nx-error)]" : "text-[var(--nx-text-muted)]"}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
