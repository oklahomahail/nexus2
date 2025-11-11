/**
 * Brand Import Function Wrapper
 *
 * Client-side wrapper for invoking the scheduled-import-brand-corpus Edge Function
 * Handles authentication and error handling
 */

import { supabase } from "@/lib/supabaseClient";

// ============================================================================
// TYPES
// ============================================================================

export interface BrandImportSource {
  source_type: "website" | "pdf" | "doc" | "social" | "manual";
  url?: string;
  title?: string;
  content?: string;
}

export interface BrandImportParams {
  client_id: string;
  brand_id: string;
  sources: BrandImportSource[];
}

export interface BrandImportResult {
  url?: string;
  title?: string;
  status: "upserted" | "skipped_small" | "error";
  note?: string;
  error?: string;
}

export interface BrandImportResponse {
  ok: boolean;
  client_id?: string;
  brand_id?: string;
  processed?: number;
  results: BrandImportResult[];
  error?: string;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Import brand sources via Edge Function
 *
 * This function invokes the scheduled-import-brand-corpus Edge Function
 * which fetches content from URLs (websites, PDFs) and saves to brand_corpus table
 *
 * @param params - Import parameters (client_id, brand_id, sources)
 * @returns Import results with status per source
 * @throws Error if invocation fails
 */
export async function importBrandSources(
  params: BrandImportParams,
): Promise<BrandImportResponse> {
  try {
    // @ts-expect-error - Supabase not yet installed
    const { data, error } =
      await supabase.functions.invoke<BrandImportResponse>(
        "scheduled-import-brand-corpus",
        {
          body: params,
        },
      );

    if (error) {
      console.error("Brand import error:", error);
      throw new Error(error.message || "Failed to import brand sources");
    }

    if (!data) {
      throw new Error("No response from import function");
    }

    return data;
  } catch (err) {
    console.error("Brand import exception:", err);
    throw err instanceof Error
      ? err
      : new Error("An unexpected error occurred during import");
  }
}

/**
 * Import a single URL
 * Convenience wrapper for importing one source at a time
 */
export async function importSingleUrl(
  clientId: string,
  brandId: string,
  url: string,
  sourceType: BrandImportSource["source_type"] = "website",
): Promise<BrandImportResult> {
  const response = await importBrandSources({
    client_id: clientId,
    brand_id: brandId,
    sources: [{ source_type: sourceType, url }],
  });

  if (!response.ok || response.results.length === 0) {
    throw new Error("Import failed");
  }

  return response.results[0];
}

/**
 * Import multiple URLs in batch
 * Useful for bulk importing from a list of sources
 */
export async function importMultipleUrls(
  clientId: string,
  brandId: string,
  urls: Array<{ url: string; sourceType?: BrandImportSource["source_type"] }>,
): Promise<BrandImportResponse> {
  return importBrandSources({
    client_id: clientId,
    brand_id: brandId,
    sources: urls.map(({ url, sourceType = "website" }) => ({
      source_type: sourceType,
      url,
    })),
  });
}

/**
 * Validate URL before import
 * Basic client-side validation to catch obvious issues
 */
export function validateImportUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const parsed = new URL(url);

    // Check protocol
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS protocol" };
    }

    // Check for localhost/private IPs (optional security check)
    if (
      parsed.hostname === "localhost" ||
      parsed.hostname.startsWith("127.") ||
      parsed.hostname.startsWith("192.168.") ||
      parsed.hostname.startsWith("10.")
    ) {
      return {
        valid: false,
        error: "Cannot import from localhost or private IPs",
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Estimate tokens for manual content
 * Rough approximation: words * 1.3
 */
export function estimateTokens(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3);
}
