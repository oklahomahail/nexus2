/**
 * Brand File Processor
 * Extracts text content from uploaded brand guideline files
 * Supports: PDF, DOCX, TXT, MD
 */

/**
 * Process an uploaded brand file and extract its text content
 * @param file - The uploaded file
 * @returns Plain text content from the file
 */
export async function processBrandFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
    case "md":
      return await readTextFile(file);

    case "pdf":
      // For MVP, we'll ask users to paste content or use text files
      // PDF parsing in browser requires pdf.js which is a large dependency
      throw new Error(
        "PDF files are not yet supported. Please convert to TXT or paste content directly.",
      );

    case "docx":
      // DOCX parsing in browser requires mammoth.js
      // For MVP, we'll ask users to paste content or use text files
      throw new Error(
        "DOCX files are not yet supported. Please convert to TXT or paste content directly.",
      );

    default:
      throw new Error(
        `Unsupported file type: ${ext}. Please use TXT or MD files.`,
      );
  }
}

/**
 * Read a text file using the FileReader API
 */
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        resolve(text);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate file size (max 5MB for text processing)
 */
export function validateFileSize(file: File): boolean {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  return file.size <= MAX_SIZE;
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return ["txt", "md"];
}
