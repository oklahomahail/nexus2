// src/hooks/useForm.ts

import { useState, useCallback } from "react";
import { ZodError, type ZodSchema } from "zod";

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

// Form Validation Hook
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  validateOnChange = false,
  validateOnBlur = true,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validateField = useCallback(
    (field: string, value: any): string | null => {
      if (!validationSchema) return null;

      try {
        validationSchema.parse({ [field]: value });
        return null;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.issues.find((issue) =>
            issue.path.includes(field),
          );
          return fieldError?.message || "Invalid value";
        }
        return "Invalid value";
      }
    },
    [validationSchema],
  );

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const setValue = useCallback(
    (field: string, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      if (validateOnChange) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error || "",
        }));
      }
    },
    [validateField, validateOnChange],
  );

  const setFieldTouched = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur) {
        const error = validateField(field, values[field as keyof T]);
        setErrors((prev) => ({
          ...prev,
          [field]: error || "",
        }));
      }
    },
    [validateField, validateOnBlur, values],
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsSubmitting(true);

      const isValid = validateForm();
      if (isValid && onSubmit) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error("Form submission error:", error);
        }
      }

      setIsSubmitting(false);
    },
    [validateForm, onSubmit, values],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  const getFieldProps = useCallback(
    (field: string) => ({
      name: field,
      value: values[field as keyof T] || "",
      error: errors[field],
      touched: touched[field],
      onChange: (value: any) => setValue(field, value),
      onBlur: () => setFieldTouched(field),
    }),
    [values, errors, touched, setValue, setFieldTouched],
  );

  const isValid =
    Object.keys(errors).length === 0 && Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    setValue,
    setFieldTouched,
    validateForm,
    handleSubmit,
    reset,
    getFieldProps,
  };
}
