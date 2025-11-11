/**
 * Donor Intelligence Service
 *
 * Client-side wrapper for invoking the analyze-donor-data Edge Function
 * Provides type-safe access to donor analytics with privacy enforcement
 */

import { supabase } from "@/lib/supabaseClient";

// ============================================================================
// TYPES
// ============================================================================

export type MetricType =
  | "retained_donors"
  | "yoy_upgrade"
  | "gift_velocity"
  | "seasonality";

export interface MetricFilters {
  num_years?: number;
  year_from?: number;
  year_to?: number;
  year?: number;
}

export interface MetricRequest {
  metric: MetricType;
  filters?: MetricFilters;
  client_id?: string;
}

export interface MetricResponse<T = unknown> {
  ok: boolean;
  metric: string;
  data?: T;
  error?: string;
  privacy_enforced?: boolean;
}

// ========== RETAINED DONORS ==========

export interface RetainedDonorRow {
  consecutive_years: number;
  donor_count: number;
}

export type RetainedDonorsResult = RetainedDonorRow[];

// ========== YOY UPGRADE ==========

export interface YoyUpgradeRow {
  anon_id: string;
  amount_from: number;
  amount_to: number;
  pct_change: number;
}

export type YoyUpgradeResult = YoyUpgradeRow[];

// ========== GIFT VELOCITY ==========

export interface GiftVelocityRow {
  anon_id: string;
  gift_count: number;
  median_days_between: number;
}

export type GiftVelocityResult = GiftVelocityRow[];

// ========== SEASONALITY ==========

export interface SeasonalityRow {
  year: number;
  quarter: number;
  gift_count: number;
  total_amount: number;
}

export type SeasonalityResult = SeasonalityRow[];

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Invoke donor intelligence metric computation
 *
 * This function calls the analyze-donor-data Edge Function which enforces:
 * - JWT authentication
 * - Client access verification
 * - Privacy threshold (minimum cohort size N ≥ 50)
 *
 * @param request - Metric request with type and filters
 * @returns Metric response with data or error
 * @throws Error if invocation fails
 */
export async function computeMetric<T = unknown>(
  request: MetricRequest,
): Promise<MetricResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke<MetricResponse<T>>(
      "analyze-donor-data",
      {
        body: request,
      },
    );

    if (error) {
      console.error("Donor intelligence error:", error);
      throw new Error(error.message || "Failed to compute metric");
    }

    if (!data) {
      throw new Error("No response from analytics function");
    }

    return data;
  } catch (err) {
    console.error("Donor intelligence exception:", err);
    throw err instanceof Error
      ? err
      : new Error("An unexpected error occurred");
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get retained donor counts
 * Returns counts of donors who gave consecutively for N years
 *
 * @param clientId - Client UUID
 * @param numYears - Minimum consecutive years (default: 5)
 * @returns Array of {consecutive_years, donor_count}
 */
export async function getRetainedDonors(
  clientId: string,
  numYears: number = 5,
): Promise<RetainedDonorsResult> {
  const response = await computeMetric<RetainedDonorsResult>({
    metric: "retained_donors",
    filters: { num_years: numYears },
    client_id: clientId,
  });

  if (!response.ok || !response.data) {
    throw new Error(response.error || "Failed to get retained donors");
  }

  return response.data;
}

/**
 * Get year-over-year upgrade leaderboard
 * Returns top donors by percentage increase between two years
 *
 * @param clientId - Client UUID
 * @param yearFrom - Starting year
 * @param yearTo - Ending year
 * @returns Array of {anon_id, amount_from, amount_to, pct_change}
 */
export async function getYoyUpgrade(
  clientId: string,
  yearFrom: number,
  yearTo: number,
): Promise<YoyUpgradeResult> {
  const response = await computeMetric<YoyUpgradeResult>({
    metric: "yoy_upgrade",
    filters: { year_from: yearFrom, year_to: yearTo },
    client_id: clientId,
  });

  if (!response.ok || !response.data) {
    throw new Error(response.error || "Failed to get upgrade data");
  }

  return response.data;
}

/**
 * Get gift velocity for repeat donors
 * Returns median days between gifts
 *
 * @param clientId - Client UUID
 * @returns Array of {anon_id, gift_count, median_days_between}
 */
export async function getGiftVelocity(
  clientId: string,
): Promise<GiftVelocityResult> {
  const response = await computeMetric<GiftVelocityResult>({
    metric: "gift_velocity",
    client_id: clientId,
  });

  if (!response.ok || !response.data) {
    throw new Error(response.error || "Failed to get gift velocity");
  }

  return response.data;
}

/**
 * Get seasonality by quarter
 * Returns gift counts and totals by quarter
 *
 * @param clientId - Client UUID
 * @param year - Optional year filter (null = all years)
 * @returns Array of {year, quarter, gift_count, total_amount}
 */
export async function getSeasonality(
  clientId: string,
  year?: number,
): Promise<SeasonalityResult> {
  const response = await computeMetric<SeasonalityResult>({
    metric: "seasonality",
    filters: year ? { year } : undefined,
    client_id: clientId,
  });

  if (!response.ok || !response.data) {
    throw new Error(response.error || "Failed to get seasonality data");
  }

  return response.data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate summary statistics from retained donors data
 */
export function summarizeRetention(data: RetainedDonorsResult): {
  total_donors: number;
  avg_consecutive_years: number;
  max_consecutive_years: number;
} {
  if (data.length === 0) {
    return {
      total_donors: 0,
      avg_consecutive_years: 0,
      max_consecutive_years: 0,
    };
  }

  const total_donors = data.reduce((sum, row) => sum + row.donor_count, 0);
  const weighted_sum = data.reduce(
    (sum, row) => sum + row.consecutive_years * row.donor_count,
    0,
  );
  const avg_consecutive_years = weighted_sum / total_donors;
  const max_consecutive_years = Math.max(
    ...data.map((row) => row.consecutive_years),
  );

  return {
    total_donors,
    avg_consecutive_years: Math.round(avg_consecutive_years * 10) / 10,
    max_consecutive_years,
  };
}

/**
 * Calculate summary statistics from gift velocity data
 */
export function summarizeVelocity(data: GiftVelocityResult): {
  total_repeat_donors: number;
  avg_days_between: number;
  median_days_between: number;
} {
  if (data.length === 0) {
    return {
      total_repeat_donors: 0,
      avg_days_between: 0,
      median_days_between: 0,
    };
  }

  const total_repeat_donors = data.length;
  const avg_days_between =
    data.reduce((sum, row) => sum + row.median_days_between, 0) /
    total_repeat_donors;

  // Calculate median of medians
  const sorted = [...data].sort(
    (a, b) => a.median_days_between - b.median_days_between,
  );
  const mid = Math.floor(sorted.length / 2);
  const median_days_between =
    sorted.length % 2 === 0
      ? (sorted[mid - 1].median_days_between +
          sorted[mid].median_days_between) /
        2
      : sorted[mid].median_days_between;

  return {
    total_repeat_donors,
    avg_days_between: Math.round(avg_days_between),
    median_days_between: Math.round(median_days_between),
  };
}

/**
 * Group seasonality data by year
 */
export function groupSeasonalityByYear(
  data: SeasonalityResult,
): Map<number, SeasonalityRow[]> {
  const grouped = new Map<number, SeasonalityRow[]>();

  for (const row of data) {
    if (!grouped.has(row.year)) {
      grouped.set(row.year, []);
    }
    grouped.get(row.year)!.push(row);
  }

  return grouped;
}
