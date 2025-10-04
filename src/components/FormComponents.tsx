// src/components/FormComponents.tsx - Advanced form components with validation

import { clsx } from "clsx";
import React, { useId, useState, useRef, useEffect } from "react";

import type { ZodSchema } from "zod";

// Types and interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  className?: string;
  helpText?: string;
  children: React.ReactNode;
}

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "onBlur"
  > {
  label?: string;
  error?: string;
  touched?: boolean;
  helpText?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  onBlur?: (field: string) => void;
  name: string;
}

export interface TextAreaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "onBlur"
  > {
  label?: string;
  error?: string;
  touched?: boolean;
  helpText?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  onBlur?: (field: string) => void;
  name: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  touched?: boolean;
  helpText?: string;
  containerClassName?: string;
  className?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (field: string) => void;
  name: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
}

export interface DatePickerProps {
  label?: string;
  error?: string;
  touched?: boolean;
  helpText?: string;
  containerClassName?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (field: string) => void;
  name: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
}

// Form Validation Hook moved to @/hooks/useForm.ts

// Form Field Container Component
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  touched,
  required,
  className,
  helpText,
  children,
}) => {
  const id = useId();
  const showError = touched && error;

  return (
    <div className={clsx("form-field", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement<any>, { id })}
      </div>
      {showError && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !showError && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Input Component
export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  helpText,
  containerClassName,
  className,
  onChange,
  onBlur,
  name,
  required,
  ...props
}) => {
  const id = useId();
  const showError = touched && error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.(name);
  };

  return (
    <FormField
      label={label}
      error={error}
      touched={touched}
      required={required}
      className={containerClassName}
      helpText={helpText}
    >
      <input
        id={id}
        name={name}
        className={clsx(
          "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
          showError && "border-red-300 focus:ring-red-500 focus:border-red-500",
          className,
        )}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={showError ? "true" : "false"}
        aria-describedby={showError ? `${id}-error` : undefined}
        {...props}
      />
    </FormField>
  );
};

// TextArea Component
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  touched,
  helpText,
  containerClassName,
  className,
  onChange,
  onBlur,
  name,
  required,
  rows = 4,
  ...props
}) => {
  const id = useId();
  const showError = touched && error;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.(name);
  };

  return (
    <FormField
      label={label}
      error={error}
      touched={touched}
      required={required}
      className={containerClassName}
      helpText={helpText}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        className={clsx(
          "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
          showError && "border-red-300 focus:ring-red-500 focus:border-red-500",
          className,
        )}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={showError ? "true" : "false"}
        aria-describedby={showError ? `${id}-error` : undefined}
        {...props}
      />
    </FormField>
  );
};

// Select Component
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  touched,
  helpText,
  containerClassName,
  className,
  options,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  required,
  disabled,
  multiple,
}) => {
  const id = useId();
  const showError = touched && error;
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    if (!multiple) {
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    onBlur?.(name);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <FormField
      label={label}
      error={error}
      touched={touched}
      required={required}
      className={containerClassName}
      helpText={helpText}
    >
      <div ref={selectRef} className="relative">
        <button
          id={id}
          type="button"
          className={clsx(
            "relative w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
            showError &&
              "border-red-300 focus:ring-red-500 focus:border-red-500",
            disabled && "bg-gray-50 cursor-not-allowed",
            className,
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onBlur={handleBlur}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={showError ? "true" : "false"}
        >
          <span className="block truncate">
            {selectedOption?.label || placeholder || "Select an option"}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={clsx(
                "h-5 w-5 text-gray-400 transition-transform",
                isOpen && "transform rotate-180",
              )}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(
                  "w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                  option.value === value && "bg-blue-50 text-blue-900",
                  option.disabled && "text-gray-400 cursor-not-allowed",
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
              >
                <span className="block truncate">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
};

// DatePicker Component
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  touched,
  helpText,
  containerClassName,
  className,
  value,
  onChange,
  onBlur,
  name,
  min,
  max,
  required,
  disabled,
  ...props
}) => {
  const id = useId();
  const showError = touched && error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.(name);
  };

  return (
    <FormField
      label={label}
      error={error}
      touched={touched}
      required={required}
      className={containerClassName}
      helpText={helpText}
    >
      <input
        id={id}
        name={name}
        type="date"
        value={value || ""}
        min={min}
        max={max}
        disabled={disabled}
        className={clsx(
          "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
          showError && "border-red-300 focus:ring-red-500 focus:border-red-500",
          disabled && "bg-gray-50 cursor-not-allowed",
          className,
        )}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={showError ? "true" : "false"}
        aria-describedby={showError ? `${id}-error` : undefined}
        {...props}
      />
    </FormField>
  );
};

// Common validation schemas moved to @/utils/validationSchemas.ts
