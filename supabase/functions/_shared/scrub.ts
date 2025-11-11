/**
 * Privacy Scrubber (Edge Function version)
 *
 * Ensures no PII reaches AI services
 * Duplicated from src/privacy/scrub.ts for Deno runtime
 */

export type AICategory = "campaign" | "analytics";

// PII Detection Patterns
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_RE =
  /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/;
const ADDRESS_HINT_RE =
  /\b(\d{1,6}\s+[A-Za-z0-9.'\-]+\s+(Ave|Ave\.|Street|St\.|Rd|Road|Blvd|Boulevard|Lane|Ln|Dr|Drive|Ct|Court|Way|Circle|Cir|Pkwy|Parkway))\b/i;
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/;
const CREDIT_CARD_RE = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/;

// Allowlists
const ALLOWLIST: Record<AICategory, string[]> = {
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

export function allowlistObject<T = any>(
  obj: T,
  category: AICategory,
): Partial<T> {
  const allowed = ALLOWLIST[category];
  const res: any = {};

  function visit(prefix: string, val: any, parentObj: any, key: string) {
    if (val === null || val === undefined) {
      if (allowed.includes(prefix)) {
        parentObj[key] = val;
      }
      return;
    }

    const isArray = Array.isArray(val);

    if (typeof val !== "object" || val instanceof Date) {
      if (allowed.includes(prefix)) {
        parentObj[key] = val;
      }
      return;
    }

    if (isArray) {
      const base = prefix + "[]";
      const permitted = allowed.some((p) => p.startsWith(base));
      if (!permitted) return;

      const items: any[] = [];
      for (const item of val) {
        if (typeof item !== "object") {
          if (allowed.includes(base)) {
            items.push(item);
          }
        } else {
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

  for (const k of Object.keys(obj as any)) {
    if (allowed.includes(k)) {
      res[k] = (obj as any)[k];
    } else {
      visit(k, (obj as any)[k], res, k);
    }
  }

  return res;
}

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

export function deepContainsPII(obj: any): boolean {
  if (obj == null) return false;
  if (typeof obj === "string") return containsPII(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return false;
  if (obj instanceof Date) return false;
  if (Array.isArray(obj)) return obj.some(deepContainsPII);
  if (typeof obj === "object") return Object.values(obj).some(deepContainsPII);
  return false;
}

export function validateAIPayload(
  payload: any,
  category: AICategory,
): { safe: true; payload: any } | { safe: false; reason: string } {
  if (!payload) {
    return { safe: false, reason: "empty_payload" };
  }

  const filtered = allowlistObject(payload, category);

  if (deepContainsPII(filtered)) {
    return { safe: false, reason: "pii_detected_in_allowlisted_data" };
  }

  return { safe: true, payload: filtered };
}
