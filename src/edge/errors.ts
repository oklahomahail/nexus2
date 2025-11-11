/**
 * Structured Error Handling for Edge Functions
 *
 * Provides typed HTTP errors and response formatting
 */

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Common HTTP error constructors
 */
export const errors = {
  BadRequest: (msg = "Bad Request", details?: unknown) =>
    new HttpError(400, msg, details),
  Unauthorized: (msg = "Unauthorized", details?: unknown) =>
    new HttpError(401, msg, details),
  Forbidden: (msg = "Forbidden", details?: unknown) =>
    new HttpError(403, msg, details),
  NotFound: (msg = "Not Found", details?: unknown) =>
    new HttpError(404, msg, details),
  Conflict: (msg = "Conflict", details?: unknown) =>
    new HttpError(409, msg, details),
  TooManyRequests: (msg = "Too Many Requests", details?: unknown) =>
    new HttpError(429, msg, details),
  ServerError: (msg = "Internal Server Error", details?: unknown) =>
    new HttpError(500, msg, details),
  ServiceUnavailable: (msg = "Service Unavailable", details?: unknown) =>
    new HttpError(503, msg, details),
};

/**
 * Convert error to HTTP Response
 *
 * @param error - Error to convert
 * @param init - Additional response init
 * @returns HTTP Response with error JSON
 *
 * @example
 * export default async function handler(req: Request) {
 *   try {
 *     // ... do work
 *   } catch (e) {
 *     return errorResponse(e);
 *   }
 * }
 */
export function errorResponse(error: unknown, init?: ResponseInit): Response {
  const err =
    error instanceof HttpError ? error : errors.ServerError("Unknown error");

  const body = {
    error: err.message,
    status: err.status,
    ...(err.details ? { details: err.details } : {}),
  };

  return new Response(JSON.stringify(body), {
    status: err.status,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
}

/**
 * Validation helper
 * Throws BadRequest if condition is false
 *
 * @example
 * validate(req.method === 'POST', 'Only POST allowed');
 * validate(body.email, 'Email is required');
 */
export function validate(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw errors.BadRequest(message);
  }
}

/**
 * Require authentication
 * Throws Unauthorized if token is missing/invalid
 *
 * @example
 * const userId = requireAuth(req.headers.get('authorization'));
 */
export function requireAuth(
  authHeader: string | null,
  validateFn?: (token: string) => string,
): string {
  if (!authHeader?.startsWith("Bearer ")) {
    throw errors.Unauthorized("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  if (!token) {
    throw errors.Unauthorized("Missing token");
  }

  if (validateFn) {
    return validateFn(token);
  }

  return token;
}

/**
 * CORS helper for Edge functions
 *
 * @example
 * if (req.method === 'OPTIONS') {
 *   return corsResponse();
 * }
 * return corsResponse(jsonResponse, { origin: 'https://app.nexus.com' });
 */
export function corsResponse(
  response?: Response,
  options: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  } = {},
): Response {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    headers = ["Content-Type", "Authorization"],
    credentials = true,
  } = options;

  const corsHeaders = {
    "Access-Control-Allow-Origin": Array.isArray(origin)
      ? origin.join(",")
      : origin,
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": headers.join(", "),
    ...(credentials ? { "Access-Control-Allow-Credentials": "true" } : {}),
  };

  if (!response) {
    // OPTIONS preflight
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Add CORS headers to existing response
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
