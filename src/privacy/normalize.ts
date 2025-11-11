/**
 * Content Normalization
 *
 * Converts HTML to plain text, collapses whitespace, and trims content
 * to fit token budgets for AI processing.
 *
 * Based on Inkwell's text processing pipeline.
 */

/**
 * Convert HTML to plain text
 * Preserves semantic structure (paragraphs, lists) while removing markup
 *
 * @param html - HTML content
 * @returns Plain text with preserved structure
 */
export function htmlToText(html: string): string {
  let text = html;

  // Replace block-level elements with line breaks
  text = text.replace(/<\/?(p|div|br|hr|h[1-6])[^>]*>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<li[^>]*>/gi, '\n• ');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = decodeHTMLEntities(text);

  return text;
}

/**
 * Decode common HTML entities
 *
 * @param text - Text with HTML entities
 * @returns Text with decoded entities
 */
export function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
  };

  let decoded = text;
  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  });

  // Decode numeric entities (&#123; or &#x7B;)
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  return decoded;
}

/**
 * Collapse whitespace
 * Reduces multiple spaces/newlines to single instances
 *
 * @param text - Text with excessive whitespace
 * @returns Text with normalized whitespace
 */
export function collapseWhitespace(text: string): string {
  let normalized = text;

  // Replace multiple spaces with single space
  normalized = normalized.replace(/ {2,}/g, ' ');

  // Replace multiple newlines with double newline (paragraph break)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // Trim lines
  normalized = normalized
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  // Remove leading/trailing whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Truncate text to token budget
 * Estimates ~4 characters per token (conservative)
 *
 * @param text - Text to truncate
 * @param maxTokens - Maximum token count (default: 4000)
 * @returns Truncated text
 */
export function truncateToTokenBudget(text: string, maxTokens = 4000): string {
  const CHARS_PER_TOKEN = 4;
  const maxChars = maxTokens * CHARS_PER_TOKEN;

  if (text.length <= maxChars) {
    return text;
  }

  // Try to truncate at sentence boundary
  const truncated = text.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');

  const cutPoint = Math.max(lastPeriod, lastNewline);

  if (cutPoint > maxChars * 0.8) {
    // If we can cut at a sentence/paragraph and keep 80%+ of content
    return truncated.substring(0, cutPoint + 1).trim() + '\n\n[Content truncated]';
  }

  // Otherwise just hard truncate
  return truncated.trim() + '... [truncated]';
}

/**
 * Remove duplicate lines
 * Useful for cleaning up pasted content or web scraping artifacts
 *
 * @param text - Text with potential duplicates
 * @returns Text with duplicates removed
 */
export function removeDuplicateLines(text: string): string {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const unique: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      unique.push(line);
    }
  });

  return unique.join('\n');
}

/**
 * Normalize text for AI processing
 * Full pipeline: HTML→text, whitespace collapse, deduplication, truncation
 *
 * @param content - Raw content (HTML or text)
 * @param options - Normalization options
 * @returns Normalized text ready for AI
 */
export function normalizeContent(
  content: string,
  options: {
    fromHTML?: boolean;
    collapseWhitespace?: boolean;
    removeDuplicates?: boolean;
    maxTokens?: number;
  } = {}
): {
  normalized: string;
  metadata: {
    originalLength: number;
    normalizedLength: number;
    truncated: boolean;
    estimatedTokens: number;
  };
} {
  const {
    fromHTML = false,
    collapseWhitespace: shouldCollapse = true,
    removeDuplicates = false,
    maxTokens = 4000,
  } = options;

  const originalLength = content.length;
  let normalized = content;

  // Step 1: HTML to text (if needed)
  if (fromHTML) {
    normalized = htmlToText(normalized);
  }

  // Step 2: Collapse whitespace
  if (shouldCollapse) {
    normalized = collapseWhitespace(normalized);
  }

  // Step 3: Remove duplicates
  if (removeDuplicates) {
    normalized = removeDuplicateLines(normalized);
  }

  // Step 4: Truncate to token budget
  const beforeTruncation = normalized;
  normalized = truncateToTokenBudget(normalized, maxTokens);
  const truncated = normalized !== beforeTruncation;

  const normalizedLength = normalized.length;
  const estimatedTokens = Math.ceil(normalizedLength / 4);

  return {
    normalized,
    metadata: {
      originalLength,
      normalizedLength,
      truncated,
      estimatedTokens,
    },
  };
}

/**
 * Extract text from Markdown
 * Removes Markdown syntax while preserving content
 *
 * @param markdown - Markdown content
 * @returns Plain text
 */
export function markdownToText(markdown: string): string {
  let text = markdown;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove headers
  text = text.replace(/^#+\s+/gm, '');

  // Remove bold/italic
  text = text.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}$/gm, '');

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');

  // Clean up list markers
  text = text.replace(/^[-*+]\s+/gm, '• ');
  text = text.replace(/^\d+\.\s+/gm, '');

  return collapseWhitespace(text);
}
