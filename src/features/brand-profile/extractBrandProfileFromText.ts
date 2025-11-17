/**
 * Extract Brand Profile from Text
 * Uses Claude to intelligently parse brand guideline documents
 * and extract structured data for the brand profile form
 */

import { callClaude } from "@/services/ai/claudeService";

import { BrandProfile } from "./brandProfile.types";

/**
 * Extract brand profile fields from unstructured text using Claude
 * @param text - Raw text from brand guideline document
 * @returns Partial brand profile with extracted fields
 */
export async function extractBrandProfileFromText(
  text: string,
): Promise<Partial<BrandProfile>> {
  const prompt = buildExtractionPrompt(text);

  try {
    const response = await callClaude(prompt, {
      model: "claude-3-5-sonnet-20241022",
      maxTokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent extraction
      system: buildSystemPrompt(),
    });

    const extracted = parseClaudeResponse(response.text);
    return extracted;
  } catch (error) {
    console.error("Failed to extract brand profile:", error);
    throw new Error(
      "Unable to analyze brand guidelines. Please try again or fill fields manually.",
    );
  }
}

/**
 * Build the system prompt for Claude
 */
function buildSystemPrompt(): string {
  return `You are an expert brand analyst specializing in extracting structured information from brand guideline documents.

Your task is to carefully analyze brand documents and extract key information in a specific JSON format.

Guidelines:
- Only extract information that is explicitly stated or clearly implied in the document
- Do not make up or infer information that isn't present
- Be precise and concise in your extractions
- Preserve the authentic voice and tone of the original document
- Return ONLY valid JSON, no additional text or explanation`;
}

/**
 * Build the extraction prompt with the document text
 */
function buildExtractionPrompt(text: string): string {
  return `Analyze the following brand guideline document and extract these fields:

1. **name**: The organization or brand name
2. **mission**: The mission statement or organizational purpose (1-3 sentences)
3. **tone**: Array of 3-7 descriptive words/phrases that capture the brand's voice and tone
4. **pillars**: Array of 3-6 key messaging pillars or core values
5. **corpus**: Any additional brand narrative, storytelling guidelines, or general content that could help generate campaigns (optional, keep under 500 words)

Return ONLY a valid JSON object with this exact structure:
{
  "name": "string or empty",
  "mission": "string or empty",
  "tone": ["array", "of", "strings"],
  "pillars": ["array", "of", "strings"],
  "corpus": "string or empty"
}

Important:
- If a field is not found, use an empty string "" or empty array []
- Do not include any text before or after the JSON
- Ensure all strings are properly escaped
- Do not add fields that aren't in the schema

Document to analyze:

${truncateText(text, 10000)}`;
}

/**
 * Parse Claude's response into a BrandProfile object
 */
function parseClaudeResponse(responseText: string): Partial<BrandProfile> {
  try {
    // Remove any markdown code blocks if present
    let cleaned = responseText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Validate and clean the extracted data
    return {
      name: typeof parsed.name === "string" ? parsed.name.trim() : "",
      mission: typeof parsed.mission === "string" ? parsed.mission.trim() : "",
      tone: Array.isArray(parsed.tone)
        ? parsed.tone.filter((t: any) => typeof t === "string")
        : [],
      pillars: Array.isArray(parsed.pillars)
        ? parsed.pillars.filter((p: any) => typeof p === "string")
        : [],
      corpus: typeof parsed.corpus === "string" ? parsed.corpus.trim() : "",
    };
  } catch (error) {
    console.error("Failed to parse Claude response:", error);
    console.error("Response text:", responseText);
    throw new Error("Failed to parse extracted data. Please try again.");
  }
}

/**
 * Truncate text to a maximum length while trying to preserve complete sentences
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastNewline = truncated.lastIndexOf("\n");
  const breakPoint = Math.max(lastPeriod, lastNewline);

  if (breakPoint > maxLength * 0.8) {
    // If we found a good break point in the last 20%, use it
    return truncated.substring(0, breakPoint + 1);
  }

  // Otherwise just truncate and add ellipsis
  return truncated + "...";
}
