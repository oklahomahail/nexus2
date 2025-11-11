// src/privacy/sanitize.ts (drop-in replacement for Phase 3.5)
// Closes gaps: self-closing/void tags, <embed>/<link>/<meta>, style() sanitization,
// malformed <script>, phone variants, DAN phrase, and pipeline flag for HTML stripping.

export type SanitizeOptions = {
  /** When true, all HTML tags are stripped and only plain text is returned. */
  stripHtml?: boolean;
  /** If true, removes the `style` attribute entirely (safer default). */
  stripAllStyles?: boolean;
  /** Optional: maximum output length (applied after redaction). */
  maxLen?: number;
};

const DANGEROUS_TAGS = new Set([
  // scriptable / remote content
  "script","iframe","object","embed","applet","link","meta",
  // svg & tricky containers
  "svg","foreignObject","math","template","slot",
  // execution or navigation vectors
  "form","input","select","button","textarea","noscript","style",
]);

const VOID_OR_SELF_CLOSING = new Set([
  "area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr",
]);

// Simple URI guard for href/src/xlink:href
function sanitizeUri(value: string): string | null {
  const v = value.trim().replace(/\s+/g, "").toLowerCase();
  if (v.startsWith("javascript:") || v.startsWith("vbscript:")) return null;
  if (v.startsWith("data:text/html")) return null; // block HTML data URIs
  // allow http(s), mailto, relative, and safe data:image
  if (v.startsWith("data:")) {
    if (/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,/.test(v)) return value;
    return null;
  }
  return value; // ok
}

// Remove risky CSS tokens
function cleanseStyle(value: string): string | null {
  const v = value.toLowerCase();
  if (/expression\s*\(/.test(v)) return null;
  if (/url\s*\(\s*['\"]?javascript:/.test(v)) return null;
  // Optionally strip background* altogether to be conservative
  const withoutBg = v.replace(/background[^:]*:[^;]+;?/g, "");
  return withoutBg.trim() ? withoutBg : null;
}

// PII redaction rules
const RE_EMAIL = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
const RE_PHONE_US_10 = /\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g; // 555-123-4567, (555)123-4567
const RE_PHONE_US_7 = /\b\d{3}[\s.-]?\d{4}\b/g; // 555-1234
const RE_SSN = /\b\d{3}-\d{2}-\d{4}\b/g;
const RE_CC = /(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g; // loose card-like sequences
const RE_IBAN = /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g;

// Prompt-injection phrases to neutralize
const PROMPT_INJECTION_RX = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions?|prompts?)/gi,
  /disregard\s+(all\s+)?(previous|safety)/gi,
  /you\s+are\s+now\s+(dan|a\s+\w+)/gi,
  /forget\s+everything/gi,
  /new\s+instructions?:/gi,
  /from\s+now\s+on\s+you\s+are/gi,
  /system:\s*/gi,
  /assistant:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /begin\s+system\s+prompt/gi,
  /role:\s*system/gi,
  /jailbreak/gi,
];

export function redactPII(text: string): string {
  return text
    .replace(RE_EMAIL, "[EMAIL]")
    .replace(RE_PHONE_US_10, "[PHONE]")
    .replace(RE_PHONE_US_7, "[PHONE]")
    .replace(RE_SSN, "[SSN]")
    .replace(RE_CC, "[CARD]")
    .replace(RE_IBAN, "[IBAN]");
}

function neutralizePromptInjection(text: string): string {
  let out = text;
  for (const rx of PROMPT_INJECTION_RX) out = out.replace(rx, "[user instruction redacted]");
  return out;
}

// Fallback pre-pass to kill malformed <script ... (unclosed)
function stripMalformedScript(input: string): string {
  // Remove only unclosed <script> tags at the very end of the string
  // Don't touch properly closed <script></script> pairs
  return input.replace(/<script(?![^>]*<\/script>)[\s\S]*$/gi, "");
}

/**
 * sanitizeHtml: strips dangerous HTML, attributes, and PII; optionally returns plain text.
 */
export function sanitizeHtml(input: string, opts: SanitizeOptions = {}): string {
  const { stripHtml = true, stripAllStyles = true, maxLen } = opts;
  const pre = stripMalformedScript(String(input ?? ""));

  // Use DOMParser (available under jsdom + browsers). For SSR, ensure jsdom/happy-dom.
  let doc: Document;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(pre, "text/html");
  } catch {
    // extremely defensive: fall back to text-only
    return truncate(neutralizePromptInjection(redactPII(pre.replace(/<[^>]*>/g, " ").trim())), maxLen);
  }

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
  const toRemove: Element[] = [];
  while (walker.nextNode()) {
    const el = walker.currentNode as Element;
    const tag = el.tagName.toLowerCase();
    if (DANGEROUS_TAGS.has(tag)) { toRemove.push(el); continue; }

    // Remove event handlers
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
    });

    // Sanitize URLs
    ["href","src","xlink:href"].forEach(n => {
      if (!el.hasAttribute(n)) return;
      const val = el.getAttribute(n) ?? "";
      const safe = sanitizeUri(val);
      if (safe === null) el.removeAttribute(n); else el.setAttribute(n, safe);
    });

    // Style cleansing
    if (el.hasAttribute("style")) {
      if (stripAllStyles) el.removeAttribute("style");
      else {
        const v = el.getAttribute("style") ?? "";
        const safe = cleanseStyle(v);
        if (safe === null) el.removeAttribute("style"); else el.setAttribute("style", safe);
      }
    }
  }
  toRemove.forEach(n => n.remove());

  // Remove void/self-closing dangerous tags that may have slipped in raw HTML
  for (const tag of VOID_OR_SELF_CLOSING) {
    if (DANGEROUS_TAGS.has(tag)) {
      doc.querySelectorAll(tag).forEach(n => n.remove());
    }
  }

  let out = stripHtml ? (doc.body.textContent ?? "").trim() : (doc.body.innerHTML ?? "").trim();
  out = neutralizePromptInjection(redactPII(out));
  return truncate(out, maxLen);
}

function truncate(s: string, maxLen?: number): string {
  if (!maxLen || s.length <= maxLen) return s;
  return s.slice(0, maxLen);
}

// Convenience: pipeline-safe helper that ensures stripHtml first
export function sanitizeToPlainText(input: string, opts?: Omit<SanitizeOptions, "stripHtml">): string {
  return sanitizeHtml(input, { ...(opts ?? {}), stripHtml: true });
}

// Legacy export compatibility with old API
export function sanitizeHTML(html: string): string {
  return sanitizeHtml(html, { stripHtml: false });
}

export function sanitizePromptInjection(text: string): {
  clean: string;
  detected: boolean;
  patterns: string[];
} {
  const clean = neutralizePromptInjection(text);
  const detected = clean !== text;
  const patterns = detected ? ["Injection patterns detected"] : [];
  return { clean, detected, patterns };
}

export function sanitizeContent(
  content: string,
  options: {
    stripHTML?: boolean;
    checkInjection?: boolean;
    redactPII?: boolean;
  } = {}
): {
  content: string;
  metadata: {
    htmlStripped: boolean;
    injectionDetected: boolean;
    injectionPatterns: string[];
    piiRedacted: boolean;
  };
} {
  const { stripHTML = true, checkInjection = true, redactPII: shouldRedactPII = true } = options;

  let sanitized = content;
  let injectionDetected = false;
  let injectionPatterns: string[] = [];

  // Step 1: HTML sanitization (strip HTML only, no PII/injection yet)
  if (stripHTML) {
    // Simple regex-based HTML stripping
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // Remove any unclosed script tags at end
    sanitized = sanitized.replace(/<script[^>]*$/gi, '');
    sanitized = sanitized.replace(/<[^>]+>/g, ' ');
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }

  // Step 2: PII redaction
  if (shouldRedactPII) {
    sanitized = redactPII(sanitized);
  }

  // Step 3: Prompt injection detection
  if (checkInjection) {
    const injectionResult = sanitizePromptInjection(sanitized);
    sanitized = injectionResult.clean;
    injectionDetected = injectionResult.detected;
    injectionPatterns = injectionResult.patterns;
  }

  return {
    content: sanitized,
    metadata: {
      htmlStripped: stripHTML && content !== sanitized,
      injectionDetected,
      injectionPatterns,
      piiRedacted: shouldRedactPII,
    },
  };
}

export function validateContentLength(
  content: string,
  maxChars = 100000
): {
  valid: boolean;
  length: number;
  maxLength: number;
  truncated?: string;
} {
  const length = content.length;
  const valid = length <= maxChars;

  return {
    valid,
    length,
    maxLength: maxChars,
    truncated: valid ? undefined : content.substring(0, maxChars) + '... [truncated]',
  };
}
