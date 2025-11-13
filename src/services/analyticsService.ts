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
    const { count: previousDonorCount, error: prevDonorsError } =
      await supabase
        .from("donors")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .is("deleted_at", null)
        .lte("created_at", thirtyDaysAgo.toISOString());

    if (prevDonorsError) throw prevDonorsError;

    const donorsChange =
      previousDonorCount && previousDonorCount > 0
        ? (((totalDonors || 0) - previousDonorCount) / previousDonorCount) *
          100
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
      donations && donations.length > 0
        ? totalRaised / donations.length
        : 0;

    // Get recent donations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDonations =
      donations?.filter(
        (d: any) => new Date(d.date) >= thirtyDaysAgo,
      ) || [];
    const recentDonationCount = recentDonations.length;

    // Calculate donation growth (compare to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousPeriodDonations =
      donations?.filter(
        (d: any) =>
          new Date(d.date) >= sixtyDaysAgo &&
          new Date(d.date) < thirtyDaysAgo,
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
    const recentDonorIds = new Set(
      recentDonations.map((d: any) => d.donor_id),
    );
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

    const { data: donations, error: donationsError } =
      await donationsQuery;

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
      .select("id, name, created_at, client_id, status, raised_amount, goal_amount")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (clientId) {
      campaignsQuery.eq("client_id", clientId);
    }

    const { data: campaigns, error: campaignsError } =
      await campaignsQuery;

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
      (a, b) =>
        parseTimeAgo(b.time).getTime() - parseTimeAgo(a.time).getTime(),
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
  if (diffHour < 24)
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
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
