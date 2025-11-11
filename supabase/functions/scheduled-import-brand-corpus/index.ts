// deno-lint-ignore-file no-explicit-any
/**
 * Supabase Edge Function: scheduled-import-brand-corpus
 *
 * Fetches brand materials (web pages, PDFs, manual text) and imports into brand_corpus table
 * Supports:
 * - HTML pages (extracts article content, strips scripts/styles)
 * - PDF documents (text extraction via pdf.js)
 * - Manual/social pasted text
 *
 * Auth: Webhook secret (X-Brand-Import-Secret header)
 * Can be triggered manually or via cron
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { DOMParser, Element } from "jsr:@b-fuze/deno-dom@0.1.47"

// ============================================================================
// PDF TEXT EXTRACTION
// ============================================================================

/**
 * Extract text from PDF bytes using pdf.js
 * Lazy-loaded to avoid importing unless needed
 */
async function extractPdfText(pdfBytes: Uint8Array): Promise<string> {
  const pdfjs = await import("https://esm.sh/pdfjs-dist@3.11.174/build/pdf.min.mjs")
  const loadingTask = pdfjs.getDocument({ data: pdfBytes })
  const pdf = await loadingTask.promise
  let output = ""

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    output += content.items.map((it: any) => it.str).join(" ") + "\n"
  }

  return output
}

// ============================================================================
// TEXT NORMALIZATION
// ============================================================================

/**
 * Normalize text: collapse whitespace, remove non-breaking spaces
 */
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim()
}

/**
 * Generate SHA-256 checksum for deduplication
 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// ============================================================================
// CONTENT FETCHING
// ============================================================================

interface FetchedContent {
  text: string
  title?: string
  contentType?: string
}

/**
 * Fetch and extract text from URL
 * Handles HTML and PDF content types
 */
async function fetchAsText(url: string): Promise<FetchedContent> {
  const res = await fetch(url, { redirect: "follow" })
  const contentType = res.headers.get("content-type") || ""

  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${url}`)
  }

  // Handle PDF
  if (contentType.includes("application/pdf")) {
    const bytes = new Uint8Array(await res.arrayBuffer())
    const text = await extractPdfText(bytes)
    const title = url.split("/").pop() || "PDF Document"
    return { text: normalizeText(text), title, contentType }
  }

  // Handle HTML or plain text
  const raw = await res.text()

  if (contentType.includes("html")) {
    const doc = new DOMParser().parseFromString(raw, "text/html")
    if (!doc) return { text: normalizeText(raw), title: "Page", contentType }

    const title = (doc.querySelector("title")?.textContent || "").trim()

    // Strip script/style tags
    for (const sel of ["script", "style", "noscript"]) {
      doc.querySelectorAll(sel).forEach((n) => n.remove())
    }

    // Try to extract main content (article-ish)
    const articleCandidates = ["article", "main", "section", "[role=main]"]
    let bodyText = ""

    for (const sel of articleCandidates) {
      const el = doc.querySelector(sel) as Element | null
      if (el) {
        bodyText = el.textContent.trim()
        if (bodyText.split(" ").length > 200) break
      }
    }

    // Fallback to full body if article extraction didn't yield enough
    if (!bodyText || bodyText.split(" ").length < 50) {
      bodyText = doc.body?.textContent.trim() ?? raw
    }

    return { text: normalizeText(bodyText), title: title || "Page", contentType }
  }

  // Plain text fallback
  return {
    text: normalizeText(raw),
    title: url.split("/").pop() || "Text",
    contentType,
  }
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface Source {
  url?: string
  source_type: "website" | "pdf" | "doc" | "social" | "manual"
  title?: string
  content?: string // For manual/social pasted text
}

interface ImportRequest {
  client_id: string
  brand_id: string
  sources: Source[]
}

interface ImportResult {
  url?: string
  title?: string
  status: "upserted" | "skipped_small" | "error"
  note?: string
  error?: string
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  try {
    // ========== AUTHENTICATION ==========
    const secret = Deno.env.get("BRAND_IMPORT_WEBHOOK_SECRET") || ""
    const provided = req.headers.get("X-Brand-Import-Secret") || ""

    if (!secret || secret !== provided) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or missing webhook secret" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      )
    }

    // ========== PARSE REQUEST ==========
    const payload = (await req.json()) as ImportRequest

    const { client_id, brand_id, sources } = payload

    if (!client_id || !brand_id || !Array.isArray(sources) || sources.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid payload: requires client_id, brand_id, and sources array",
        }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      )
    }

    // ========== INITIALIZE SUPABASE CLIENT ==========
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    )

    // ========== PROCESS SOURCES ==========
    const results: ImportResult[] = []

    for (const src of sources) {
      try {
        let text = ""
        let title = src.title ?? ""

        // Handle manual/social pasted content
        if (src.source_type === "manual" || (src.content && !src.url)) {
          text = normalizeText(src.content || "")
          title ||= "Manual Entry"
        }
        // Fetch from URL
        else if (src.url) {
          const fetched = await fetchAsText(src.url)
          text = fetched.text
          title ||= fetched.title || "Source"
        } else {
          throw new Error("Source missing both url and content")
        }

        // Skip very short content (likely navigation/footer artifacts)
        if (text.length < 200) {
          results.push({
            url: src.url,
            title,
            status: "skipped_small",
            note: "Content too short (<200 chars)",
          })
          continue
        }

        // Generate checksum for deduplication
        const checksum = await sha256Hex(`${title}\n${text.slice(0, 5000)}`)

        // Estimate token count (rough approximation: words * 1.3)
        const tokens = Math.ceil(text.split(/\s+/g).length * 1.3)

        // Upsert into brand_corpus
        const { error } = await supabase.from("brand_corpus").upsert(
          {
            client_id,
            brand_id,
            source_type: src.source_type,
            source_url: src.url ?? null,
            title,
            checksum,
            content: text,
            tokens,
          },
          {
            onConflict: "client_id,brand_id,checksum",
            ignoreDuplicates: false,
          }
        )

        if (error) throw error

        results.push({
          url: src.url ?? "(manual)",
          title,
          status: "upserted",
        })

        // Courtesy delay to be polite to origin servers
        await new Promise((resolve) => setTimeout(resolve, 150))
      } catch (e) {
        results.push({
          url: src.url ?? "(manual)",
          title: src.title,
          status: "error",
          error: String(e?.message || e),
        })
      }
    }

    // ========== RETURN RESULTS ==========
    return new Response(
      JSON.stringify({
        ok: true,
        client_id,
        brand_id,
        processed: sources.length,
        results,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: String(e?.message || e),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    )
  }
})
