// src/utils/validationSchemas.ts

import { z } from "zod";

// Common validation schemas
export const validationSchemas = {
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  required: z.string().min(1, "This field is required"),
  phone: z
    .string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  url: z.string().url("Please enter a valid URL"),
  positiveNumber: z.number().positive("Must be a positive number"),
  date: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Please enter a valid date" },
  ),
};
