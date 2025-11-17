// Process Client Intake Edge Function
// Handles document upload → text extraction → Claude AI parsing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.20.9";

import { extractTextFromPDF } from "./extractors/pdf.ts";
import {
  extractTextFromPlainText,
  extractTextFromMarkdown,
} from "./extractors/text.ts";
import { BRAND_INTAKE_PARSER_PROMPT } from "./prompts/brandIntakeParser.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  fileUrl: string;
  clientId: string;
  jobId: string;
  fileType: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable not set");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { fileUrl, clientId, jobId, fileType }: RequestBody =
      await req.json();

    console.log(`Processing intake job ${jobId} for client ${clientId}`);
    console.log(`File: ${fileUrl}, Type: ${fileType}`);

    // Update job status to processing
    await supabase
      .from("client_intake_jobs")
      .update({ status: "processing" })
      .eq("id", jobId);

    // 1. Download file from Supabase Storage
    console.log("Downloading file from storage...");
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("client-intakes")
      .download(fileUrl);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // 2. Extract text based on file type
    console.log("Extracting text from document...");
    const arrayBuffer = await fileData.arrayBuffer();
    let extractedText: string;

    const lowerFileType = fileType.toLowerCase();

    if (lowerFileType.includes("pdf") || fileUrl.endsWith(".pdf")) {
      extractedText = await extractTextFromPDF(arrayBuffer);
    } else if (lowerFileType.includes("markdown") || fileUrl.endsWith(".md")) {
      extractedText = await extractTextFromMarkdown(arrayBuffer);
    } else if (
      lowerFileType.includes("text") ||
      fileUrl.endsWith(".txt") ||
      fileUrl.endsWith(".md")
    ) {
      extractedText = await extractTextFromPlainText(arrayBuffer);
    } else {
      throw new Error(
        `Unsupported file type: ${fileType}. Supported types: PDF, TXT, MD`,
      );
    }

    console.log(`Extracted ${extractedText.length} characters of text`);

    if (extractedText.length < 100) {
      throw new Error(
        "Extracted text is too short. Document may be empty or corrupted.",
      );
    }

    // 3. Call Claude API to parse the document
    console.log("Analyzing document with Claude AI...");
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent extraction
      messages: [
        {
          role: "user",
          content: `${BRAND_INTAKE_PARSER_PROMPT}\n\n---\n\nDocument content:\n\n${extractedText}`,
        },
      ],
    });

    // Extract the JSON response
    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    console.log("Claude response received, parsing JSON...");

    // Parse JSON response (handle markdown code blocks if present)
    let parsedData: any;
    try {
      // Remove markdown code blocks if present
      const jsonText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", parseError);
      console.error("Raw response:", responseText);
      throw new Error(
        "Failed to parse AI response. The document may not contain valid brand information.",
      );
    }

    // Validate required fields
    if (!parsedData.organization || !parsedData.organization.name) {
      throw new Error("Failed to extract organization name from document");
    }

    console.log(
      `Successfully parsed data. Confidence: ${parsedData.confidence_score}%`,
    );

    // 4. Update job with extracted data
    await supabase
      .from("client_intake_jobs")
      .update({
        status:
          parsedData.confidence_score >= 50 ? "completed" : "review_required",
        extracted_data: parsedData,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    console.log(`Job ${jobId} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        confidenceScore: parsedData.confidence_score,
        missingSections: parsedData.missing_sections,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing intake:", error);

    // Try to update job status to failed
    try {
      const { jobId } = await req.json();
      if (jobId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );

        await supabase
          .from("client_intake_jobs")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", jobId);
      }
    } catch (updateError) {
      console.error("Failed to update job status:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
