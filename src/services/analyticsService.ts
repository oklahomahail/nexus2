/**
 * Analytics Service
 *
 * Calculates and aggregates metrics for dashboards from Supabase database
 * Provides both platform-wide and client-specific analytics
 */

import { supabase } from "@/lib/supabaseClient";

/**
 * Platform-wide dashboard metrics (all clients)
 */
export interface PlatformMetrics {
  totalClients: number;
  activeCampaigns: number;
  totalDonors: number;
  monthlyRevenue: number;
  avgGiftSize: number;
  donorsChange: number; // percentage change from previous period
  revenueChange: number; // percentage change from previous period
}

/**
 * Client-specific dashboard metrics
 */
export interface ClientMetrics {
  totalRaised: number;
  activeCampaigns: number;
  totalDonors: number;
  conversionRate: number;
  avgDonationSize: number;
  donorRetentionRate: number;
  recentDonationCount: number; // last 30 days
  donationGrowth: number; // percentage change
}

/**
 * Recent activity item
 */
export interface ActivityItem {
  id: string;
  type: "donation" | "campaign" | "email" | "segment";
  message: string;
  time: string;
  clientId: string;
  clientName?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Fetch platform-wide metrics for the main dashboard
 */
export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  try {
    // Get total clients count
    const { count: totalClients, error: clientsError } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null);

    if (clientsError) throw clientsError;

    // Get active campaigns count
    const { count: activeCampaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null);

    if (campaignsError) throw campaignsError;

    // Get total donors count
    const { count: totalDonors, error: donorsError } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null);

    if (donorsError) throw donorsError;

    // Get monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentDonations, error: revenueError } = await supabase
      .from("donations")
      .select("amount_cents")
      .gte("date", thirtyDaysAgo.toISOString());

    if (revenueError) throw revenueError;

    const monthlyRevenue =
      recentDonations?.reduce(
        (sum, donation: any) => sum + (donation.amount_cents || 0),
        0,
      ) / 100 || 0;

    // Calculate average gift size
    const avgGiftSize =
      recentDonations && recentDonations.length > 0
        ? monthlyRevenue / recentDonations.length
        : 0;

    // Get previous period data for comparison
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: previousDonations, error: prevError } = await supabase
      .from("donations")
      .select("amount_cents")
      .gte("date", sixtyDaysAgo.toISOString())
      .lt("date", thirtyDaysAgo.toISOString());

    if (prevError) throw prevError;

    const previousRevenue =
      previousDonations?.reduce(
        (sum, donation: any) => sum + (donation.amount_cents || 0),
        0,
      ) / 100 || 0;

    // Calculate percentage changes
    const revenueChange =
      previousRevenue > 0
        ? ((monthlyRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Get donor count from previous period
    const { count: previousDonorCount, error: prevDonorsError } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null)
      .lte("created_at", thirtyDaysAgo.toISOString());

    if (prevDonorsError) throw prevDonorsError;

    const donorsChange =
      previousDonorCount && previousDonorCount > 0
        ? (((totalDonors || 0) - previousDonorCount) / previousDonorCount) * 100
        : 0;

    return {
      totalClients: totalClients || 0,
      activeCampaigns: activeCampaigns || 0,
      totalDonors: totalDonors || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
      avgGiftSize: Math.round(avgGiftSize),
      donorsChange: Math.round(donorsChange * 10) / 10, // Round to 1 decimal
      revenueChange: Math.round(revenueChange * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching platform metrics:", error);
    // Return default values on error
    return {
      totalClients: 0,
      activeCampaigns: 0,
      totalDonors: 0,
      monthlyRevenue: 0,
      avgGiftSize: 0,
      donorsChange: 0,
      revenueChange: 0,
    };
  }
}

/**
 * Fetch client-specific metrics for the client dashboard
 */
export async function getClientMetrics(
  clientId: string,
): Promise<ClientMetrics> {
  try {
    // Get total raised amount
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("amount_cents, date")
      .eq("client_id", clientId);

    if (donationsError) throw donationsError;

    const totalRaised =
      donations?.reduce(
        (sum, donation: any) => sum + (donation.amount_cents || 0),
        0,
      ) / 100 || 0;

    // Get active campaigns count
    const { count: activeCampaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("status", "active")
      .is("deleted_at", null);

    if (campaignsError) throw campaignsError;

    // Get total donors count
    const { count: totalDonors, error: donorsError } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("status", "active")
      .is("deleted_at", null);

    if (donorsError) throw donorsError;

    // Calculate average donation size
    const avgDonationSize =
      donations && donations.length > 0 ? totalRaised / donations.length : 0;

    // Get recent donations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDonations =
      donations?.filter((d: any) => new Date(d.date) >= thirtyDaysAgo) || [];
    const recentDonationCount = recentDonations.length;

    // Calculate donation growth (compare to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousPeriodDonations =
      donations?.filter(
        (d: any) =>
          new Date(d.date) >= sixtyDaysAgo && new Date(d.date) < thirtyDaysAgo,
      ) || [];

    const donationGrowth =
      previousPeriodDonations.length > 0
        ? ((recentDonationCount - previousPeriodDonations.length) /
            previousPeriodDonations.length) *
          100
        : 0;

    // Get behavioral events for conversion rate calculation
    const { data: events, error: eventsError } = await supabase
      .from("behavioral_events")
      .select("event_type")
      .eq("client_id", clientId)
      .gte("occurred_at", thirtyDaysAgo.toISOString());

    if (eventsError) throw eventsError;

    const totalEvents = events?.length || 0;
    const conversionRate =
      totalEvents > 0 ? (recentDonationCount / totalEvents) * 100 : 0;

    // Calculate donor retention rate (donors who gave in both periods)
    const recentDonorIds = new Set(recentDonations.map((d: any) => d.donor_id));
    const previousDonorIds = new Set(
      previousPeriodDonations.map((d: any) => d.donor_id),
    );

    const retainedDonors = Array.from(recentDonorIds).filter((id) =>
      previousDonorIds.has(id),
    ).length;

    const donorRetentionRate =
      previousDonorIds.size > 0
        ? (retainedDonors / previousDonorIds.size) * 100
        : 0;

    return {
      totalRaised: Math.round(totalRaised),
      activeCampaigns: activeCampaigns || 0,
      totalDonors: totalDonors || 0,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgDonationSize: Math.round(avgDonationSize),
      donorRetentionRate: Math.round(donorRetentionRate * 10) / 10,
      recentDonationCount,
      donationGrowth: Math.round(donationGrowth * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching client metrics:", error);
    // Return default values on error
    return {
      totalRaised: 0,
      activeCampaigns: 0,
      totalDonors: 0,
      conversionRate: 0,
      avgDonationSize: 0,
      donorRetentionRate: 0,
      recentDonationCount: 0,
      donationGrowth: 0,
    };
  }
}

/**
 * Fetch recent activity for the dashboard feed
 */
export async function getRecentActivity(
  clientId?: string,
  limit: number = 10,
): Promise<ActivityItem[]> {
  try {
    const activities: ActivityItem[] = [];

    // Get recent donations
    const donationsQuery = supabase
      .from("donations")
      .select(
        `
        id,
        amount_cents,
        created_at,
        client_id,
        donors (first_name, last_name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (clientId) {
      donationsQuery.eq("client_id", clientId);
    }

    const { data: donations, error: donationsError } = await donationsQuery;

    if (!donationsError && donations) {
      donations.forEach((donation: any) => {
        const donor = donation.donors as any;
        const donorName =
          donor?.first_name || donor?.last_name
            ? `${donor.first_name || ""} ${donor.last_name || ""}`.trim()
            : "Anonymous";

        activities.push({
          id: donation.id,
          type: "donation",
          message: `New donation of $${(donation.amount_cents / 100).toFixed(0)} from ${donorName}`,
          time: formatTimeAgo(new Date(donation.created_at)),
          clientId: donation.client_id,
        });
      });
    }

    // Get recent campaign updates
    const campaignsQuery = supabase
      .from("campaigns")
      .select(
        "id, name, created_at, client_id, status, raised_amount, goal_amount",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (clientId) {
      campaignsQuery.eq("client_id", clientId);
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery;

    if (!campaignsError && campaigns) {
      campaigns.forEach((campaign: any) => {
        const progress = campaign.goal_amount
          ? Math.round(
              ((campaign.raised_amount || 0) / campaign.goal_amount) * 100,
            )
          : 0;

        activities.push({
          id: campaign.id,
          type: "campaign",
          message: `${campaign.name} ${campaign.status === "active" ? `reached ${progress}% of goal` : `is now ${campaign.status}`}`,
          time: formatTimeAgo(new Date(campaign.created_at)),
          clientId: campaign.client_id,
          entityId: campaign.id,
        });
      });
    }

    // Sort all activities by time and return top N
    activities.sort(
      (a, b) => parseTimeAgo(b.time).getTime() - parseTimeAgo(a.time).getTime(),
    );

    return activities.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

/**
 * Parse a relative time string back to a Date (approximate)
 */
function parseTimeAgo(timeStr: string): Date {
  const now = new Date();

  if (timeStr === "just now") return now;

  const match = timeStr.match(/(\d+)\s+(minute|hour|day)s?\s+ago/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "minute":
        return new Date(now.getTime() - value * 60 * 1000);
      case "hour":
        return new Date(now.getTime() - value * 60 * 60 * 1000);
      case "day":
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
    }
  }

  return now;
}

// ============================================================================
// TRACK15-SPECIFIC ANALYTICS
// ============================================================================

/**
 * Donor segments for Track15 methodology
 */
export type DonorSegment =
  | "current"
  | "lapsed"
  | "high_value"
  | "prospects"
  | "monthly";

/**
 * Track15 segment performance metrics
 */
export interface SegmentPerformance {
  segment: DonorSegment;
  donorCount: number;
  totalRaised: number;
  avgGiftSize: number;
  retentionRate: number;
  growth: number; // percentage change
}

/**
 * Track15 retention metrics
 */
export interface RetentionMetrics {
  overallRetentionRate: number; // % of donors who gave in both periods
  renewalRate: number; // % of last year's donors who renewed
  lapsedReactivationRate: number; // % of lapsed donors reactivated
  newDonorRetention: number; // % of new donors who gave again
  averageGiftFrequency: number; // avg gifts per donor per year
}

/**
 * Track15 year-over-year comparison
 */
export interface YearOverYearMetrics {
  currentYearRevenue: number;
  previousYearRevenue: number;
  percentageChange: number;
  currentYearDonors: number;
  previousYearDonors: number;
  donorGrowth: number;
  avgGiftChange: number;
}

/**
 * Campaign lift metrics (week-over-week)
 */
export interface CampaignLiftMetrics {
  campaignId: string;
  campaignName: string;
  weeklyLift: Array<{
    week: string;
    revenue: number;
    donorCount: number;
    liftPercentage: number;
  }>;
  totalLift: number;
}

/**
 * Channel attribution data
 */
export interface ChannelAttribution {
  channel: string;
  touchpoints: number;
  conversions: number;
  revenue: number;
  averageGiftSize: number;
  conversionRate: number;
}

/**
 * Get segment performance for a client
 */
export async function getSegmentPerformance(
  clientId: string,
  periodDays: number = 365,
): Promise<SegmentPerformance[]> {
  try {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    // Get all donors with their donation history
    const { data: donors, error } = await supabase
      .from("donors")
      .select(
        `
        id,
        segment,
        donations!inner (
          amount_cents,
          date,
          client_id
        )
      `,
      )
      .eq("client_id", clientId)
      .eq("donations.client_id", clientId)
      .gte("donations.date", periodStart.toISOString());

    if (error) throw error;

    // Group by segment
    const segmentMap = new Map<DonorSegment, any[]>();

    donors?.forEach((donor: any) => {
      const segment = (donor.segment || "current") as DonorSegment;
      if (!segmentMap.has(segment)) {
        segmentMap.set(segment, []);
      }
      segmentMap.get(segment)!.push(donor);
    });

    // Calculate metrics for each segment
    const segments: DonorSegment[] = [
      "current",
      "lapsed",
      "high_value",
      "prospects",
      "monthly",
    ];

    const performance: SegmentPerformance[] = segments.map((segment) => {
      const segmentDonors = segmentMap.get(segment) || [];
      const donorCount = segmentDonors.length;

      const totalRaised =
        segmentDonors.reduce((sum, donor) => {
          const donorTotal =
            donor.donations?.reduce(
              (dSum: number, d: any) => dSum + (d.amount_cents || 0),
              0,
            ) || 0;
          return sum + donorTotal;
        }, 0) / 100;

      const avgGiftSize = donorCount > 0 ? totalRaised / donorCount : 0;

      // Calculate retention (simplified - donors who gave in last 90 days)
      const recentThreshold = new Date();
      recentThreshold.setDate(recentThreshold.getDate() - 90);

      const recentDonors = segmentDonors.filter((donor) =>
        donor.donations?.some((d: any) => new Date(d.date) >= recentThreshold),
      );
      const retentionRate =
        donorCount > 0 ? (recentDonors.length / donorCount) * 100 : 0;

      return {
        segment,
        donorCount,
        totalRaised: Math.round(totalRaised),
        avgGiftSize: Math.round(avgGiftSize),
        retentionRate: Math.round(retentionRate * 10) / 10,
        growth: 0, // TODO: Implement growth calculation
      };
    });

    return performance;
  } catch (error) {
    console.error("Error fetching segment performance:", error);
    return [];
  }
}

/**
 * Get retention metrics for a client
 */
export async function getRetentionMetrics(
  clientId: string,
): Promise<RetentionMetrics> {
  try {
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );
    const twoYearsAgo = new Date(
      now.getFullYear() - 2,
      now.getMonth(),
      now.getDate(),
    );

    // Get donations for current and previous year
    const { data: donations, error } = await supabase
      .from("donations")
      .select("donor_id, date, amount_cents")
      .eq("client_id", clientId)
      .gte("date", twoYearsAgo.toISOString());

    if (error) throw error;

    // Segment donations by period
    const currentYearDonors = new Set<string>();
    const previousYearDonors = new Set<string>();
    const newDonorGifts = new Map<string, number>();

    donations?.forEach((donation: any) => {
      const date = new Date(donation.date);
      const donorId = donation.donor_id;

      if (date >= oneYearAgo) {
        currentYearDonors.add(donorId);
        // Track repeat gifts for new donors
        newDonorGifts.set(donorId, (newDonorGifts.get(donorId) || 0) + 1);
      } else {
        previousYearDonors.add(donorId);
      }
    });

    // Calculate retention metrics
    const retainedDonors = Array.from(currentYearDonors).filter((id) =>
      previousYearDonors.has(id),
    );

    const overallRetentionRate =
      previousYearDonors.size > 0
        ? (retainedDonors.length / previousYearDonors.size) * 100
        : 0;

    const renewalRate = overallRetentionRate; // Same as retention for yearly donors

    // New donor retention (donors who gave multiple times this year)
    const newDonors = Array.from(currentYearDonors).filter(
      (id) => !previousYearDonors.has(id),
    );
    const repeatNewDonors = newDonors.filter(
      (id) => (newDonorGifts.get(id) || 0) > 1,
    );
    const newDonorRetention =
      newDonors.length > 0
        ? (repeatNewDonors.length / newDonors.length) * 100
        : 0;

    // Lapsed reactivation (donors who gave 2+ years ago but not last year, now giving again)
    const lapsedReactivated = retainedDonors.filter((id) => {
      const lastYearGifts = donations?.filter(
        (d: any) =>
          d.donor_id === id &&
          new Date(d.date) >= oneYearAgo &&
          new Date(d.date) < now,
      );
      return lastYearGifts && lastYearGifts.length === 0;
    });

    const lapsedReactivationRate =
      previousYearDonors.size > 0
        ? (lapsedReactivated.length / previousYearDonors.size) * 100
        : 0;

    // Average gift frequency
    const totalDonations = donations?.length || 0;
    const totalUniqueDonors = new Set(donations?.map((d: any) => d.donor_id))
      .size;
    const averageGiftFrequency =
      totalUniqueDonors > 0 ? totalDonations / totalUniqueDonors : 0;

    return {
      overallRetentionRate: Math.round(overallRetentionRate * 10) / 10,
      renewalRate: Math.round(renewalRate * 10) / 10,
      lapsedReactivationRate: Math.round(lapsedReactivationRate * 10) / 10,
      newDonorRetention: Math.round(newDonorRetention * 10) / 10,
      averageGiftFrequency: Math.round(averageGiftFrequency * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching retention metrics:", error);
    return {
      overallRetentionRate: 0,
      renewalRate: 0,
      lapsedReactivationRate: 0,
      newDonorRetention: 0,
      averageGiftFrequency: 0,
    };
  }
}

/**
 * Get year-over-year comparison metrics
 */
export async function getYearOverYearMetrics(
  clientId: string,
): Promise<YearOverYearMetrics> {
  try {
    const now = new Date();
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    const previousYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const previousYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    // Get current year data
    const { data: currentDonations, error: currentError } = await supabase
      .from("donations")
      .select("amount_cents, donor_id")
      .eq("client_id", clientId)
      .gte("date", currentYearStart.toISOString());

    if (currentError) throw currentError;

    // Get previous year data
    const { data: previousDonations, error: previousError } = await supabase
      .from("donations")
      .select("amount_cents, donor_id")
      .eq("client_id", clientId)
      .gte("date", previousYearStart.toISOString())
      .lte("date", previousYearEnd.toISOString());

    if (previousError) throw previousError;

    // Calculate totals
    const currentYearRevenue =
      currentDonations?.reduce(
        (sum, d: any) => sum + (d.amount_cents || 0),
        0,
      ) / 100 || 0;

    const previousYearRevenue =
      previousDonations?.reduce(
        (sum, d: any) => sum + (d.amount_cents || 0),
        0,
      ) / 100 || 0;

    const percentageChange =
      previousYearRevenue > 0
        ? ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) *
          100
        : 0;

    // Calculate unique donors
    const currentYearDonors = new Set(
      currentDonations?.map((d: any) => d.donor_id),
    ).size;
    const previousYearDonors = new Set(
      previousDonations?.map((d: any) => d.donor_id),
    ).size;

    const donorGrowth =
      previousYearDonors > 0
        ? ((currentYearDonors - previousYearDonors) / previousYearDonors) * 100
        : 0;

    // Calculate average gift change
    const currentAvgGift =
      currentDonations && currentDonations.length > 0
        ? currentYearRevenue / currentDonations.length
        : 0;
    const previousAvgGift =
      previousDonations && previousDonations.length > 0
        ? previousYearRevenue / previousDonations.length
        : 0;

    const avgGiftChange =
      previousAvgGift > 0
        ? ((currentAvgGift - previousAvgGift) / previousAvgGift) * 100
        : 0;

    return {
      currentYearRevenue: Math.round(currentYearRevenue),
      previousYearRevenue: Math.round(previousYearRevenue),
      percentageChange: Math.round(percentageChange * 10) / 10,
      currentYearDonors,
      previousYearDonors,
      donorGrowth: Math.round(donorGrowth * 10) / 10,
      avgGiftChange: Math.round(avgGiftChange * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching year-over-year metrics:", error);
    return {
      currentYearRevenue: 0,
      previousYearRevenue: 0,
      percentageChange: 0,
      currentYearDonors: 0,
      previousYearDonors: 0,
      donorGrowth: 0,
      avgGiftChange: 0,
    };
  }
}

/**
 * Get campaign lift metrics (weekly performance tracking)
 */
export async function getCampaignLift(
  campaignId: string,
): Promise<CampaignLiftMetrics | null> {
  try {
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, name, start_date, end_date, client_id")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) throw campaignError;

    const startDate = new Date(campaign.start_date);
    const endDate = campaign.end_date
      ? new Date(campaign.end_date)
      : new Date();

    // Get donations during campaign period
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("amount_cents, date, donor_id")
      .eq("client_id", campaign.client_id)
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString());

    if (donationsError) throw donationsError;

    // Group by week
    const weeklyData = new Map<
      string,
      { revenue: number; donors: Set<string> }
    >();

    donations?.forEach((donation: any) => {
      const date = new Date(donation.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { revenue: 0, donors: new Set() });
      }

      const weekData = weeklyData.get(weekKey)!;
      weekData.revenue += (donation.amount_cents || 0) / 100;
      weekData.donors.add(donation.donor_id);
    });

    // Calculate lift week-over-week
    const weeks = Array.from(weeklyData.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    const weeklyLift = weeks.map((entry, index) => {
      const [week, data] = entry;
      const previousWeek = index > 0 ? weeks[index - 1][1] : null;

      const liftPercentage = previousWeek
        ? previousWeek.revenue > 0
          ? ((data.revenue - previousWeek.revenue) / previousWeek.revenue) * 100
          : 0
        : 0;

      return {
        week,
        revenue: Math.round(data.revenue),
        donorCount: data.donors.size,
        liftPercentage: Math.round(liftPercentage * 10) / 10,
      };
    });

    // Calculate total lift (first week to last week)
    const totalLift =
      weeks.length > 1 && weeks[0][1].revenue > 0
        ? ((weeks[weeks.length - 1][1].revenue - weeks[0][1].revenue) /
            weeks[0][1].revenue) *
          100
        : 0;

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      weeklyLift,
      totalLift: Math.round(totalLift * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching campaign lift:", error);
    return null;
  }
}

/**
 * Get channel attribution data
 */
export async function getChannelAttribution(
  clientId: string,
  periodDays: number = 90,
): Promise<ChannelAttribution[]> {
  try {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    // Get behavioral events (touchpoints)
    const { data: events, error: eventsError } = await supabase
      .from("behavioral_events")
      .select("event_type, metadata, donor_id, occurred_at")
      .eq("client_id", clientId)
      .gte("occurred_at", periodStart.toISOString());

    if (eventsError) throw eventsError;

    // Get donations for conversion tracking
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("donor_id, amount_cents, date, metadata")
      .eq("client_id", clientId)
      .gte("date", periodStart.toISOString());

    if (donationsError) throw donationsError;

    // Map channels from events
    const channelMap = new Map<
      string,
      { touchpoints: number; conversions: number; revenue: number }
    >();

    // Count touchpoints by channel
    events?.forEach((event: any) => {
      const channel = event.metadata?.channel || "direct";
      if (!channelMap.has(channel)) {
        channelMap.set(channel, { touchpoints: 0, conversions: 0, revenue: 0 });
      }
      channelMap.get(channel)!.touchpoints++;
    });

    // Count conversions and revenue by channel
    donations?.forEach((donation: any) => {
      const channel = donation.metadata?.channel || "direct";
      if (!channelMap.has(channel)) {
        channelMap.set(channel, { touchpoints: 0, conversions: 0, revenue: 0 });
      }
      const data = channelMap.get(channel)!;
      data.conversions++;
      data.revenue += (donation.amount_cents || 0) / 100;
    });

    // Build attribution array
    const attribution: ChannelAttribution[] = Array.from(
      channelMap.entries(),
    ).map(([channel, data]) => ({
      channel,
      touchpoints: data.touchpoints,
      conversions: data.conversions,
      revenue: Math.round(data.revenue),
      averageGiftSize:
        data.conversions > 0 ? Math.round(data.revenue / data.conversions) : 0,
      conversionRate:
        data.touchpoints > 0
          ? Math.round((data.conversions / data.touchpoints) * 100 * 10) / 10
          : 0,
    }));

    return attribution.sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.error("Error fetching channel attribution:", error);
    return [];
  }
}
