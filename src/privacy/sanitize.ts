/**
 * Content Sanitization
 *
 * Removes dangerous HTML, scripts, styles, and prompt-injection patterns
 * before sending content to AI or storing in database.
 *
 * Based on Inkwell's privacy-first content handling.
 */

/**
 * Dangerous HTML tags that should be stripped
 */
const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'meta',
  'link',
  'style',
  'form',
  'input',
  'button',
  'textarea',
] as const;

/**
 * Prompt injection patterns to detect and neutralize
 * These patterns attempt to manipulate LLM behavior
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|commands?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)/gi,
  /forget\s+(everything|all)\s+(you\s+)?(know|learned)/gi,
  /new\s+(instructions?|prompts?|system\s+message)/gi,
  /you\s+are\s+now\s+(a|an)\s+\w+/gi,
  /from\s+now\s+on\s+you\s+are/gi,
  /system:\s*/gi,
  /assistant:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
] as const;

/**
 * Sanitize HTML content
 * Removes scripts, styles, dangerous tags, and event handlers
 *
 * @param html - Raw HTML content
 * @returns Sanitized HTML-like text (not safe for rendering, just for AI)
 */
export function sanitizeHTML(html: string): string {
  let sanitized = html;

  // Remove script and style tags with their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove dangerous tags
  DANGEROUS_TAGS.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: and data: URIs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, '');

  return sanitized.trim();
}

/**
 * Detect and neutralize prompt injection attempts
 *
 * @param text - User-provided text
 * @returns Object with detection results and sanitized text
 */
export function sanitizePromptInjection(text: string): {
  clean: string;
  detected: boolean;
  patterns: string[];
} {
  const detectedPatterns: string[] = [];
  let clean = text;

  PROMPT_INJECTION_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(text)) {
      detectedPatterns.push(`Pattern ${index + 1}`);
      // Replace with benign text
      clean = clean.replace(pattern, '[user instruction redacted]');
    }
  });

  return {
    clean,
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
  };
}

/**
 * Remove PII patterns (emails, phone numbers, SSNs)
 * Used as additional safety layer before AI processing
 *
 * @param text - Text that might contain PII
 * @returns Text with PII patterns redacted
 */
export function redactPII(text: string): string {
  let redacted = text;

  // Email addresses
  redacted = redacted.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    '[EMAIL]'
  );

  // US Phone numbers (various formats)
  redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
  redacted = redacted.replace(/\(\d{3}\)\s*\d{3}[-.]?\d{4}/g, '[PHONE]');

  // US SSN (xxx-xx-xxxx)
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

  // Credit card numbers (simplified - matches 13-19 digit sequences)
  redacted = redacted.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');

  return redacted;
}

/**
 * Full sanitization pipeline for user-provided content
 * Combines HTML sanitization, prompt injection detection, and PII redaction
 *
 * @param content - Raw user content
 * @param options - Sanitization options
 * @returns Sanitized content and metadata
 */
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

  // Step 1: HTML sanitization
  if (stripHTML) {
    sanitized = sanitizeHTML(sanitized);
  }

  // Step 2: Prompt injection detection
  if (checkInjection) {
    const injectionResult = sanitizePromptInjection(sanitized);
    sanitized = injectionResult.clean;
    injectionDetected = injectionResult.detected;
    injectionPatterns = injectionResult.patterns;
  }

  // Step 3: PII redaction
  if (shouldRedactPII) {
    sanitized = redactPII(sanitized);
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

/**
 * Validate content length before AI processing
 * Prevents token budget overflow
 *
 * @param content - Content to validate
 * @param maxChars - Maximum character count (default: 100k for ~25k tokens)
 * @returns Validation result
 */
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
