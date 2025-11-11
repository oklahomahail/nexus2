/**
 * Privacy Scrubber
 *
 * Ensures no PII reaches AI services via:
 * - Allowlist-only fields by category
 * - Regex-based PII detection (emails, phones, addresses)
 * - Deep object scanning
 *
 * CRITICAL: All AI requests MUST pass through this scrubber
 */

// ============================================================================
// TYPES
// ============================================================================

export type AICategory = "campaign" | "analytics";

// ============================================================================
// PII DETECTION PATTERNS
// ============================================================================

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_RE =
  /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/;
const ADDRESS_HINT_RE =
  /\b(\d{1,6}\s+[A-Za-z0-9.'\-]+\s+(Ave|Ave\.|Street|St\.|Rd|Road|Blvd|Boulevard|Lane|Ln|Dr|Drive|Ct|Court|Way|Circle|Cir|Pkwy|Parkway))\b/i;
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/;
const CREDIT_CARD_RE = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/;

// ============================================================================
// ALLOWLISTS BY CATEGORY
// ============================================================================

/**
 * Hard allowlist: only these fields can appear in final AI requests
 * Arrays use "[]" notation to match any index
 */
const ALLOWLIST: Record<AICategory, string[]> = {
  // Campaign Designer: brand identity + campaign params only
  campaign: [
    "profile.name",
    "profile.mission_statement",
    "profile.tone_of_voice",
    "profile.brand_personality",
    "profile.style_keywords",
    "profile.primary_colors",
    "profile.typography",
    "snippets[].title",
    "snippets[].content",
    "params.name",
    "params.type",
    "params.season",
    "params.audience",
    "params.goal",
    "params.tone",
    "params.channels",
    "params.durationWeeks",
    "postage",
    "postage.unit",
    "postage.total",
    "postage.quantity",
    "postage.mailClass",
    "postage.savings",
    "system",
    "turns",
    "turns[].role",
    "turns[].content",
  ],

  // Analytics: only aggregates and summary strings, no donor rows
  analytics: [
    "metric",
    "data",
    "data[].consecutive_years",
    "data[].donor_count",
    "data[].year",
    "data[].quarter",
    "data[].month",
    "data[].gift_count",
    "data[].total_amount",
    "data[].avg_amount",
    "data[].median_gift",
    "data[].recency_bucket",
    "data[].pct_change",
    "data[].amount_from",
    "data[].amount_to",
    "data[].median_days_between",
    "result",
    "summary",
    "summary_only",
  ],
};

// ============================================================================
// ALLOWLIST FILTERING
// ============================================================================

/**
 * Walk object and keep only allowed paths
 * Drops anything not in the allowlist for the category
 */
export function allowlistObject<T = any>(
  obj: T,
  category: AICategory,
): Partial<T> {
  const allowed = ALLOWLIST[category];
  const res: any = {};

  function visit(prefix: string, val: any, parentObj: any, key: string) {
    if (val === null || val === undefined) {
      // Keep null/undefined if the path is allowed
      if (allowed.includes(prefix)) {
        parentObj[key] = val;
      }
      return;
    }

    const isArray = Array.isArray(val);

    // Primitive types
    if (typeof val !== "object" || val instanceof Date) {
      if (allowed.includes(prefix)) {
        parentObj[key] = val;
      }
      return;
    }

    // Arrays
    if (isArray) {
      const base = prefix + "[]";
      const permitted = allowed.some((p) => p.startsWith(base));
      if (!permitted) return;

      const items: any[] = [];
      for (const item of val) {
        if (typeof item !== "object") {
          // Primitive array items
          if (allowed.includes(base)) {
            items.push(item);
          }
        } else {
          // Object array items
          const sub: any = {};
          for (const k of Object.keys(item || {})) {
            const itemPath = `${base}.${k}`;
            if (allowed.includes(itemPath)) {
              sub[k] = item[k];
            } else {
              visit(itemPath, item[k], sub, k);
            }
          }
          if (Object.keys(sub).length) {
            items.push(sub);
          }
        }
      }
      if (items.length) {
        parentObj[key] = items;
      }
      return;
    }

    // Objects
    const sub: any = {};
    for (const k of Object.keys(val)) {
      const fullPath = prefix ? `${prefix}.${k}` : k;
      if (allowed.includes(fullPath)) {
        sub[k] = val[k];
      } else {
        visit(fullPath, val[k], sub, k);
      }
    }
    if (Object.keys(sub).length) {
      parentObj[key] = sub;
    }
  }

  // Start the walk
  for (const k of Object.keys(obj as any)) {
    if (allowed.includes(k)) {
      res[k] = (obj as any)[k];
    } else {
      visit(k, (obj as any)[k], res, k);
    }
  }

  return res;
}

// ============================================================================
// PII DETECTION
// ============================================================================

/**
 * Check if string contains PII patterns
 */
export function containsPII(s: string): boolean {
  if (!s || typeof s !== "string") return false;

  return (
    EMAIL_RE.test(s) ||
    PHONE_RE.test(s) ||
    ADDRESS_HINT_RE.test(s) ||
    SSN_RE.test(s) ||
    CREDIT_CARD_RE.test(s)
  );
}

/**
 * Recursively check if object contains PII
 */
export function deepContainsPII(obj: any): boolean {
  if (obj == null) return false;

  if (typeof obj === "string") return containsPII(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return false;
  if (obj instanceof Date) return false;

  if (Array.isArray(obj)) {
    return obj.some(deepContainsPII);
  }

  if (typeof obj === "object") {
    return Object.values(obj).some(deepContainsPII);
  }

  return false;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate payload is safe for AI
 * Returns { safe: true, payload } or { safe: false, reason }
 */
export function validateAIPayload(
  payload: any,
  category: AICategory,
): { safe: true; payload: any } | { safe: false; reason: string } {
  if (!payload) {
    return { safe: false, reason: "empty_payload" };
  }

  // Apply allowlist
  const filtered = allowlistObject(payload, category);

  // Check for PII in filtered payload
  if (deepContainsPII(filtered)) {
    return { safe: false, reason: "pii_detected_in_allowlisted_data" };
  }

  return { safe: true, payload: filtered };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Mask sensitive fields for logging (never log full bodies)
 */
export function maskForLogging(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const masked: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Mask known sensitive fields
    if (
      lowerKey.includes("email") ||
      lowerKey.includes("phone") ||
      lowerKey.includes("address") ||
      lowerKey.includes("name") ||
      lowerKey.includes("ssn") ||
      lowerKey.includes("card")
    ) {
      masked[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      masked[key] = maskForLogging(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Get allowed fields for a category (for documentation/debugging)
 */
export function getAllowedFields(category: AICategory): string[] {
  return [...ALLOWLIST[category]];
}
