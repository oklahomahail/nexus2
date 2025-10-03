import { z } from "zod";
import { logger } from "./logger";

const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: "PORT must be a valid port number",
    })
    .default("4000"),
  HOST: z.string().default("localhost"),

  // Database Configuration
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // JWT Configuration
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // CORS Configuration
  CORS_ORIGIN: z.string().url().optional(),
  CORS_CREDENTIALS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("100"),

  // Optional configurations
  REDIS_URL: z.string().optional(),

  // Email Configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // File Upload
  MAX_FILE_SIZE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("10485760"),
  UPLOAD_DIR: z.string().default("./uploads"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().optional(),

  // External APIs
  CLAUDE_API_KEY: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

let validatedEnv: EnvConfig;

export function validateEnv(): EnvConfig {
  try {
    validatedEnv = envSchema.parse(process.env);
    logger.info("✅ Environment variables validated successfully");
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        logger.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      logger.error("❌ Environment validation failed:", error);
    }
    process.exit(1);
  }
}

export function getEnv(): EnvConfig {
  if (!validatedEnv) {
    return validateEnv();
  }
  return validatedEnv;
}
