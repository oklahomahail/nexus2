// src/lib/sentry.ts - Sentry initialization for Phase 4 monitoring
import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_API_ENVIRONMENT || "development";

export function initSentry() {
  // Skip if DSN is not configured or is still using placeholder
  if (!SENTRY_DSN || SENTRY_DSN === "your_sentry_dsn_here") {
    console.warn("Sentry DSN not configured - monitoring disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    // Sample 10% of transactions in production for performance monitoring
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    // Sample 10% of sessions for replay in production
    replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.1 : 0,
    // Capture 100% of sessions with errors for replay
    replaysOnErrorSampleRate: 1.0,
    // Don't send errors in development
    enabled: ENVIRONMENT !== "development",

    // Strip PII before sending to Sentry
    beforeSend(event) {
      // Remove user email and IP address
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Redact potentially sensitive breadcrumb data
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((crumb) => {
          if (crumb.data) {
            // Remove any keys that might contain PII
            const sanitized = { ...crumb.data };
            ["email", "phone", "ssn", "card", "iban"].forEach((key) => {
              if (key in sanitized) delete sanitized[key];
            });
            return { ...crumb, data: sanitized };
          }
          return crumb;
        });
      }

      return event;
    },

    // Integration configuration
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Don't record PII in session replays
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

/**
 * Report rate limit exceeded (429) events to Sentry for telemetry
 * Usage: call from edge handlers when rate limit is hit
 */
export function reportRateLimitExceeded(
  route: string,
  context?: Record<string, unknown>,
) {
  Sentry.captureMessage("rate_limit_exceeded", {
    level: "warning",
    tags: {
      component: "edge",
      route,
    },
    extra: context
      ? {
          // Only include non-PII context
          ...Object.fromEntries(
            Object.entries(context).filter(
              ([key]) =>
                !["email", "phone", "user_id", "ip_address"].includes(key),
            ),
          ),
        }
      : undefined,
  });
}

/**
 * Capture sanitization events for security monitoring
 * Usage: call when prompt injection or XSS is detected
 */
export function reportSecurityEvent(
  type: "prompt_injection" | "xss_attempt" | "pii_detected",
  context?: Record<string, unknown>,
) {
  Sentry.captureMessage(`security_event_${type}`, {
    level: "warning",
    tags: {
      component: "privacy",
      security_event: type,
    },
    extra: context,
  });
}
