/**
 * Data Quality Service
 *
 * Provides functions for detecting and reporting data quality issues:
 * - Duplicate donors (email, phone, name+ZIP matching)
 * - Missing critical fields (email, phone, address)
 * - Outliers (extreme donations, future dates, zero amounts)
 * - Overall quality score calculation
 */

import { supabase } from "@/lib/supabaseClient";

export interface DuplicateDonor {
  donor_id_1: string;
  donor_id_2: string;
  match_type: "email_exact" | "phone_exact" | "name_zip_fuzzy";
  match_score: number;
  details: {
    email?: string;
    phone?: string;
    name_1?: string;
    name_2?: string;
    zip?: string;
    email_1?: string;
    email_2?: string;
  };
}

export interface MissingField {
  table_name: string;
  field_name: string;
  missing_count: number;
  total_count: number;
  missing_percent: number;
}

export interface Outlier {
  outlier_type:
    | "donation_extreme_amount"
    | "donation_future_date"
    | "donation_zero_amount"
    | "campaign_past_end_date";
  severity: "high" | "medium" | "low";
  record_count: number;
  details: {
    threshold?: number;
    max_amount?: number;
    count?: number;
    examples?: Array<{
      id: string;
      amount?: number;
      date?: string;
      donor_id?: string;
      name?: string;
      end_date?: string;
    }>;
  };
}

export interface DataQualityScore {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  deductions: Array<{
    reason: string;
    count?: number;
    percent?: number;
    points: number;
  }>;
}

/**
 * Detect duplicate donors for a client
 */
export async function detectDuplicateDonors(
  clientId: string,
): Promise<DuplicateDonor[]> {
  const { data, error } = (await (supabase as any).rpc(
    "fn_detect_duplicate_donors",
    {
      p_client_id: clientId,
    },
  )) as { data: DuplicateDonor[] | null; error: any };

  if (error) {
    console.error("Error detecting duplicate donors:", error);
    throw error;
  }

  return data || [];
}

/**
 * Detect missing fields for a client
 */
export async function detectMissingFields(
  clientId: string,
): Promise<MissingField[]> {
  const { data, error } = (await (supabase as any).rpc(
    "fn_detect_missing_fields",
    {
      p_client_id: clientId,
    },
  )) as { data: MissingField[] | null; error: any };

  if (error) {
    console.error("Error detecting missing fields:", error);
    throw error;
  }

  return data || [];
}

/**
 * Detect outliers for a client
 */
export async function detectOutliers(clientId: string): Promise<Outlier[]> {
  const { data, error } = (await (supabase as any).rpc("fn_detect_outliers", {
    p_client_id: clientId,
  })) as { data: Outlier[] | null; error: any };

  if (error) {
    console.error("Error detecting outliers:", error);
    throw error;
  }

  return data || [];
}

/**
 * Calculate overall data quality score for a client
 */
export async function getDataQualityScore(
  clientId: string,
): Promise<DataQualityScore> {
  const { data, error } = (await (supabase as any).rpc(
    "fn_data_quality_score",
    {
      p_client_id: clientId,
    },
  )) as { data: DataQualityScore | null; error: any };

  if (error) {
    console.error("Error calculating data quality score:", error);
    throw error;
  }

  return data || { score: 0, grade: "F", deductions: [] };
}

/**
 * Get all data quality metrics for a client
 */
export async function getDataQualityMetrics(clientId: string) {
  const [score, duplicates, missingFields, outliers] = await Promise.all([
    getDataQualityScore(clientId),
    detectDuplicateDonors(clientId),
    detectMissingFields(clientId),
    detectOutliers(clientId),
  ]);

  return {
    score,
    duplicates,
    missingFields,
    outliers,
    summary: {
      totalIssues:
        duplicates.length +
        missingFields.filter((f) => f.missing_percent > 10).length +
        outliers.reduce((sum, o) => sum + o.record_count, 0),
      criticalIssues: outliers.filter((o) => o.severity === "high").length,
    },
  };
}
