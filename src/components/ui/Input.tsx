/**
 * Input Component
 * Premium editorial text input
 */

import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, helperText, label, className = "", ...props }, ref) => {
    const baseStyles =
      "w-full px-3 py-2 text-sm bg-white border rounded-[var(--nx-radius-sm)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0";

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
        <input
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

Input.displayName = "Input";

export default Input;
