// Client Intake Service
// Handles file upload, job creation, and data persistence for client onboarding

import { supabase } from "@/lib/supabaseClient";
import type {
  ClientIntakeJob,
  ExtractedBrandData,
  IntakeJobStatus,
} from "@/types/clientIntake";

/**
 * Upload a file and create an intake job for processing
 */
export async function uploadClientBrief(
  clientId: string,
  file: File,
): Promise<ClientIntakeJob> {
  try {
    // 1. Upload file to Supabase Storage
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${clientId}/${timestamp}_${sanitizedFileName}`;

    console.log("Uploading file to storage:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("client-intakes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    console.log("File uploaded successfully:", uploadData.path);

    // 2. Create intake job record
    const { data: job, error: jobError } = await supabase
      .from("client_intake_jobs")
      .insert({
        client_id: clientId,
        uploaded_file_url: uploadData.path,
        uploaded_file_name: file.name,
        uploaded_file_type: file.type,
        uploaded_file_size_bytes: file.size,
        status: "pending" as IntakeJobStatus,
      })
      .select()
      .single();

    if (jobError || !job) {
      // Clean up uploaded file if job creation fails
      await supabase.storage.from("client-intakes").remove([uploadData.path]);
      throw new Error(`Failed to create intake job: ${jobError?.message}`);
    }

    console.log("Intake job created:", job.id);

    // 3. Trigger Edge Function to process the document
    console.log("Invoking Edge Function...");

    const { error: functionError } = await supabase.functions.invoke(
      "process-client-intake",
      {
        body: {
          fileUrl: uploadData.path,
          clientId,
          jobId: job.id,
          fileType: file.type,
        },
      },
    );

    if (functionError) {
      console.error("Edge Function error:", functionError);
      // Update job status to failed
      await supabase
        .from("client_intake_jobs")
        .update({
          status: "failed" as IntakeJobStatus,
          error_message: `Processing failed: ${functionError.message}`,
        })
        .eq("id", job.id);

      throw new Error(`Failed to process document: ${functionError.message}`);
    }

    return job as ClientIntakeJob;
  } catch (error) {
    console.error("Error in uploadClientBrief:", error);
    throw error;
  }
}

/**
 * Get intake job by ID
 */
export async function getIntakeJob(
  jobId: string,
): Promise<ClientIntakeJob | null> {
  const { data, error } = await supabase
    .from("client_intake_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    console.error("Error fetching intake job:", error);
    return null;
  }

  return data as ClientIntakeJob;
}

/**
 * List all intake jobs for a client
 */
export async function listIntakeJobs(
  clientId: string,
): Promise<ClientIntakeJob[]> {
  const { data, error } = await supabase
    .from("client_intake_jobs")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing intake jobs:", error);
    return [];
  }

  return (data || []) as ClientIntakeJob[];
}

/**
 * Subscribe to intake job status changes
 */
export function subscribeToIntakeJob(
  jobId: string,
  callback: (job: ClientIntakeJob) => void,
) {
  const channel = supabase
    .channel(`intake-job-${jobId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "client_intake_jobs",
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        callback(payload.new as ClientIntakeJob);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Commit extracted data to brand_profiles and related tables
 */
export async function commitIntakeData(
  jobId: string,
  editedData: ExtractedBrandData,
): Promise<string> {
  try {
    // Get the job to find client_id
    const job = await getIntakeJob(jobId);
    if (!job) {
      throw new Error("Intake job not found");
    }

    // Get current user ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // 1. Create brand profile
    const { data: brandProfile, error: profileError } = await supabase
      .from("brand_profiles")
      .insert({
        client_id: job.client_id,
        name: editedData.organization.name,
        mission_statement: editedData.organization.mission,
        tone_of_voice: editedData.voice_tone.tone_of_voice,
        brand_personality: editedData.voice_tone.brand_personality,
        style_keywords: editedData.voice_tone.style_keywords,
        primary_colors: editedData.visual_identity.primary_colors,
        typography: editedData.visual_identity.typography
          ? { description: editedData.visual_identity.typography }
          : null,
        created_by: user.id,
      })
      .select()
      .single();

    if (profileError || !brandProfile) {
      throw new Error(
        `Failed to create brand profile: ${profileError?.message}`,
      );
    }

    console.log("Brand profile created:", brandProfile.id);

    // 2. Store original document in brand_corpus
    const documentText = JSON.stringify(editedData, null, 2);
    const { error: corpusError } = await supabase.from("brand_corpus").insert({
      client_id: job.client_id,
      brand_id: brandProfile.id,
      source_type: "doc",
      source_url: job.uploaded_file_url,
      title: job.uploaded_file_name,
      content: documentText,
      checksum: await generateChecksum(documentText),
      created_by: user.id,
    });

    if (corpusError) {
      console.error("Failed to save to corpus:", corpusError);
      // Non-fatal - continue
    }

    // 3. Update the client with extracted contact info (if not already set)
    if (
      editedData.contact_information.primary_contact_name ||
      editedData.contact_information.primary_contact_email
    ) {
      const { error: clientUpdateError } = await supabase
        .from("clients")
        .update({
          primary_contact_name:
            editedData.contact_information.primary_contact_name || undefined,
          primary_contact_email:
            editedData.contact_information.primary_contact_email || undefined,
          phone: editedData.contact_information.phone || undefined,
          description: editedData.organization.description || undefined,
          website: editedData.organization.website || undefined,
        })
        .eq("id", job.client_id);

      if (clientUpdateError) {
        console.error("Failed to update client:", clientUpdateError);
        // Non-fatal
      }
    }

    // 4. Update intake job with brand_profile_id
    await supabase
      .from("client_intake_jobs")
      .update({
        brand_profile_id: brandProfile.id,
        status: "completed" as IntakeJobStatus,
      })
      .eq("id", jobId);

    console.log("Intake data committed successfully");

    return brandProfile.id;
  } catch (error) {
    console.error("Error committing intake data:", error);
    throw error;
  }
}

/**
 * Generate checksum for deduplication
 */
async function generateChecksum(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Delete an intake job and its associated file
 */
export async function deleteIntakeJob(jobId: string): Promise<void> {
  try {
    const job = await getIntakeJob(jobId);
    if (!job) {
      throw new Error("Intake job not found");
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from("client-intakes")
      .remove([job.uploaded_file_url]);

    if (storageError) {
      console.error("Failed to delete file from storage:", storageError);
      // Continue anyway
    }

    // Delete job record
    const { error: deleteError } = await supabase
      .from("client_intake_jobs")
      .delete()
      .eq("id", jobId);

    if (deleteError) {
      throw new Error(`Failed to delete intake job: ${deleteError.message}`);
    }
  } catch (error) {
    console.error("Error deleting intake job:", error);
    throw error;
  }
}

export const clientIntakeService = {
  uploadClientBrief,
  getIntakeJob,
  listIntakeJobs,
  subscribeToIntakeJob,
  commitIntakeData,
  deleteIntakeJob,
};
