// src/utils/validation.ts
// Form validation utilities using Zod

import { z } from "zod";

// Common validation rules
const requiredString = z.string().min(1, "This field is required");
const optionalString = z.string().optional();
const requiredEmail = z.string().email("Please enter a valid email address");
const optionalEmail = z
  .string()
  .email("Please enter a valid email address")
  .optional()
  .or(z.literal(""));
const positiveNumber = z.number().positive("Must be greater than 0");
const nonNegativeNumber = z.number().min(0, "Cannot be negative");
const optionalUrl = z
  .string()
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""));

// Date validation
const dateString = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Please enter a valid date");

const futureDateString = z.string().refine((date) => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime()) && parsed > new Date();
}, "Date must be in the future");

// Campaign validation schema
export const campaignSchema = z
  .object({
    name: requiredString.max(
      100,
      "Campaign name must be 100 characters or less",
    ),
    clientId: requiredString,
    description: optionalString.max(
      500,
      "Description must be 500 characters or less",
    ),
    goal: positiveNumber.max(10000000, "Goal must be $10M or less"),
    startDate: dateString,
    endDate: futureDateString,
    category: z.enum([
      "General",
      "Education",
      "Healthcare",
      "Environment",
      "Emergency",
    ]),
    targetAudience: optionalString.max(
      200,
      "Target audience must be 200 characters or less",
    ),
    tags: z.array(z.string()).optional(),
    notes: optionalString.max(1000, "Notes must be 1000 characters or less"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

// Campaign update schema (all fields optional except goal validation)
export const campaignUpdateSchema = campaignSchema.partial().extend({
  goal: positiveNumber.max(10000000, "Goal must be $10M or less").optional(),
  raised: nonNegativeNumber.optional(),
  status: z.enum(["Active", "Draft", "Completed", "Paused"]).optional(),
});

// Client validation schema
export const clientSchema = z.object({
  name: requiredString.max(
    100,
    "Organization name must be 100 characters or less",
  ),
  shortName: optionalString.max(50, "Short name must be 50 characters or less"),
  website: optionalUrl,
  primaryContactName: optionalString.max(
    100,
    "Contact name must be 100 characters or less",
  ),
  primaryContactEmail: optionalEmail,
  notes: optionalString.max(1000, "Notes must be 1000 characters or less"),
  brand: z
    .object({
      logoUrl: optionalUrl,
    })
    .optional(),
});

// Client update schema
export const clientUpdateSchema = clientSchema.partial();

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: Record<string, string>;
    } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }

    // Unexpected error
    return {
      success: false,
      errors: { _general: "Validation failed unexpectedly" },
    };
  }
}

// Validation helper for campaigns
export function validateCampaign(data: unknown) {
  return validateData(campaignSchema, data);
}

export function validateCampaignUpdate(data: unknown) {
  return validateData(campaignUpdateSchema, data);
}

// Validation helper for clients
export function validateClient(data: unknown) {
  return validateData(clientSchema, data);
}

export function validateClientUpdate(data: unknown) {
  return validateData(clientUpdateSchema, data);
}

// Form field validation helpers
export interface FieldValidation {
  value: string | number;
  error?: string;
  isValid: boolean;
}

export function validateField(
  value: unknown,
  schema: z.ZodSchema,
): FieldValidation {
  try {
    const validatedValue = schema.parse(value);
    return {
      value: validatedValue,
      isValid: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        value: value as string | number,
        error: error.errors[0]?.message || "Invalid value",
        isValid: false,
      };
    }

    return {
      value: value as string | number,
      error: "Validation error",
      isValid: false,
    };
  }
}

// Common field validators
export const fieldValidators = {
  required: (value: string) => validateField(value, requiredString),
  email: (value: string) => validateField(value, requiredEmail),
  optionalEmail: (value: string) => validateField(value, optionalEmail),
  url: (value: string) => validateField(value, optionalUrl),
  positiveNumber: (value: number) => validateField(value, positiveNumber),
  nonNegativeNumber: (value: number) => validateField(value, nonNegativeNumber),
  date: (value: string) => validateField(value, dateString),
  futureDate: (value: string) => validateField(value, futureDateString),
};

// Error message helpers
export function getFirstError(errors: Record<string, string>): string | null {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
}

export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

// Type exports for convenience
export type CampaignValidation = z.infer<typeof campaignSchema>;
export type ClientValidation = z.infer<typeof clientSchema>;
