// Text Extraction Utilities
// Simple text extraction for TXT and MD files

export async function extractTextFromPlainText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(arrayBuffer);

    // Clean up excessive whitespace while preserving structure
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
      .trim();
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

export async function extractTextFromMarkdown(arrayBuffer: ArrayBuffer): Promise<string> {
  // For markdown, we just extract as plain text
  // In future, could parse markdown structure for better extraction
  return extractTextFromPlainText(arrayBuffer);
}
