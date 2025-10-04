import clsx from "clsx";
import React from "react";

// Single Checkbox Props
export interface CheckboxProps {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "minimal";
  className?: string;
  required?: boolean;
  indeterminate?: boolean;
}

// Checkbox Group Props
export interface CheckboxGroupProps {
  value: string[];
  onChange: (values: string[]) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "minimal";
  direction?: "horizontal" | "vertical";
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

// Radio Props
export interface RadioProps {
  id?: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "minimal";
  className?: string;
}

// Radio Group Props
export interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "minimal";
  direction?: "horizontal" | "vertical";
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

// Single Checkbox Component
export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  error,
  size = "md",
  variant = "default",
  className,
  required = false,
  indeterminate = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  };

  const variantClasses = {
    default:
      "border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900",
    bordered:
      "border-2 border-slate-500 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900",
    minimal:
      "border-slate-700 text-blue-500 focus:ring-blue-400 focus:ring-offset-transparent",
  };

  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("flex items-start gap-3", className)}>
      <div className="flex items-center">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          required={required}
          ref={(input) => {
            if (input) input.indeterminate = indeterminate;
          }}
          className={clsx(
            "rounded transition-colors",
            sizeClasses[size],
            variantClasses[variant],
            {
              "bg-slate-800": !checked,
              "opacity-50 cursor-not-allowed": disabled,
              "border-red-500 focus:ring-red-500": error,
            },
          )}
        />
      </div>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className={clsx(
                "block font-medium cursor-pointer",
                textSizeClasses[size],
                disabled ? "text-slate-500" : "text-slate-200",
                error && "text-red-300",
              )}
            >
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}
          {description && (
            <p
              className={clsx(
                "mt-1 text-slate-400",
                size === "sm" ? "text-xs" : "text-sm",
              )}
            >
              {description}
            </p>
          )}
          {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
};

// Checkbox Group Component
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value,
  onChange,
  options,
  label,
  description,
  disabled = false,
  error,
  required = false,
  size = "md",
  variant = "default",
  direction = "vertical",
  columns = 1,
  className,
}) => {
  const handleOptionChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const containerClass =
    direction === "horizontal" && columns === 1
      ? "flex flex-wrap gap-6"
      : `grid gap-4 ${gridClasses[columns]}`;

  return (
    <div className={clsx("space-y-3", className)}>
      {label && (
        <div>
          <h3 className="text-sm font-medium text-slate-200">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </h3>
          {description && (
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          )}
        </div>
      )}

      <div className={containerClass}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={value.includes(option.value)}
            onChange={(checked) => handleOptionChange(option.value, checked)}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
            size={size}
            variant={variant}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

// Single Radio Component
export const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  variant = "default",
  className,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  };

  const variantClasses = {
    default:
      "border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900",
    bordered:
      "border-2 border-slate-500 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900",
    minimal:
      "border-slate-700 text-blue-500 focus:ring-blue-400 focus:ring-offset-transparent",
  };

  const radioId =
    id || `radio-${value}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("flex items-start gap-3", className)}>
      <div className="flex items-center">
        <input
          id={radioId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          disabled={disabled}
          className={clsx(
            "transition-colors",
            sizeClasses[size],
            variantClasses[variant],
            {
              "bg-slate-800": !checked,
              "opacity-50 cursor-not-allowed": disabled,
            },
          )}
        />
      </div>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={radioId}
              className={clsx(
                "block font-medium cursor-pointer",
                textSizeClasses[size],
                disabled ? "text-slate-500" : "text-slate-200",
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              className={clsx(
                "mt-1 text-slate-400",
                size === "sm" ? "text-xs" : "text-sm",
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Radio Group Component
export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
  name,
  label,
  description,
  disabled = false,
  error,
  required = false,
  size = "md",
  variant = "default",
  direction = "vertical",
  columns = 1,
  className,
}) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const containerClass =
    direction === "horizontal" && columns === 1
      ? "flex flex-wrap gap-6"
      : `grid gap-4 ${gridClasses[columns]}`;

  return (
    <div className={clsx("space-y-3", className)}>
      {label && (
        <div>
          <h3 className="text-sm font-medium text-slate-200">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </h3>
          {description && (
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          )}
        </div>
      )}

      <div className={containerClass}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
            size={size}
            variant={variant}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default { Checkbox, CheckboxGroup, Radio, RadioGroup };
