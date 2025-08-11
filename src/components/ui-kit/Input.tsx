import React, { forwardRef } from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    className = "",
    wrapperClassName = "",
    id,
    ...rest
  },
  ref,
) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  const base =
    "input-base w-full placeholder-slate-400 text-slate-200 bg-slate-800/50 border-slate-700/50";
  const withLeft = leftIcon ? "pl-10" : "";
  const withRight = rightIcon ? "pr-10" : "";
  const invalid = error ? "border-red-500 focus:ring-red-500" : "";

  const inputClass = [base, withLeft, withRight, invalid, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={["w-full", wrapperClassName].filter(Boolean).join(" ")}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-1 text-slate-200"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={inputClass}
          {...rest}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {(hint || error) && (
        <div className="mt-1">
          {error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : (
            <p className="text-xs text-slate-400">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
});

export default Input;
// Support both `import Input from ...` and `import { Input } from ...`
export { Input };
