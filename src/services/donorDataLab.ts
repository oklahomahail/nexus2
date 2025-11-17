// src/services/donorDataLab.ts

export type ValueTier = "small" | "medium" | "large" | "major";
export type RecencyTier = "recent" | "at_risk" | "lapsed" | "long_lapsed";

export interface DonorRawRow {
  donorId: string;
  mostRecentGift?: number;
  lifetimeGiving?: number;
  avgGift?: number;
  giftCount?: number;
  lastGiftDate?: string;
  firstGiftDate?: string;
  lastChannel?: string;
  tags?: string[];
}

export interface DonorAnalysis {
  donorId: string;

  valueTier: ValueTier;
  recencyTier: RecencyTier;

  daysSinceLastGift?: number;
  mostRecentGift?: number;
  lifetimeGiving?: number;
  avgGift?: number;
  giftCount?: number;

  upgradeReady: boolean;
  monthlyProspect: boolean;

  askLadder: number[];

  lookalikeCohorts: string[]; // e.g. ['core_high_value_seed']
}

export interface DatasetStats {
  giftPercentiles: { p25: number; p50: number; p75: number; p90: number };
  avgGiftPercentiles: { p25: number; p50: number; p75: number; p90: number };
  giftCountPercentiles: { p25: number; p50: number; p75: number; p90: number };
}

export interface AnalysisResult {
  donors: DonorAnalysis[];
  stats: DatasetStats;
  suggestedSegments: {
    id: string;
    name: string;
    description: string;
    filter: (d: DonorAnalysis) => boolean;
  }[];
}

export interface CohortSize {
  count: number;
  percentage: number; // 0–100
}

export interface LabRecommendations {
  overview: string;
  upgradeStrategy: string[];
  monthlyStrategy: string[];
  reactivationStrategy: string[];
  lookalikeStrategy: string[];
  channelAndCadenceNotes: string[];
}

export interface ColumnMapping {
  donorId: string;
  mostRecentGift?: string;
  lifetimeGiving?: string;
  avgGift?: string;
  giftCount?: string;
  lastGiftDate?: string;
  firstGiftDate?: string;
  lastChannel?: string;
  tags?: string;
}

const DAYS = 1000 * 60 * 60 * 24;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  const weight = idx - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function computeStats(rows: DonorRawRow[]): DatasetStats {
  const lifetime = rows
    .map(
      (r) =>
        r.lifetimeGiving ??
        (r.mostRecentGift && r.giftCount
          ? r.mostRecentGift * r.giftCount
          : undefined),
    )
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);

  const avgGifts = rows
    .map((r) => r.avgGift ?? r.mostRecentGift)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);

  const giftCounts = rows
    .map((r) => r.giftCount)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);

  const giftPercentiles = {
    p25: percentile(lifetime, 25),
    p50: percentile(lifetime, 50),
    p75: percentile(lifetime, 75),
    p90: percentile(lifetime, 90),
  };

  const avgGiftPercentiles = {
    p25: percentile(avgGifts, 25),
    p50: percentile(avgGifts, 50),
    p75: percentile(avgGifts, 75),
    p90: percentile(avgGifts, 90),
  };

  const giftCountPercentiles = {
    p25: percentile(giftCounts, 25),
    p50: percentile(giftCounts, 50),
    p75: percentile(giftCounts, 75),
    p90: percentile(giftCounts, 90),
  };

  return { giftPercentiles, avgGiftPercentiles, giftCountPercentiles };
}

function classifyValueTier(
  lifetime: number | undefined,
  stats: DatasetStats,
): ValueTier {
  if (!lifetime || lifetime <= 0) return "small";
  const { p25, p75, p90 } = stats.giftPercentiles;
  if (lifetime < p25) return "small";
  if (lifetime < p75) return "medium";
  if (lifetime < p90) return "large";
  return "major";
}

function classifyRecency(lastGiftDate?: string): {
  tier: RecencyTier;
  days?: number;
} {
  if (!lastGiftDate) return { tier: "long_lapsed", days: undefined };
  const last = new Date(lastGiftDate).getTime();
  if (Number.isNaN(last)) return { tier: "long_lapsed", days: undefined };

  const now = Date.now();
  const diffDays = Math.round((now - last) / DAYS);

  if (diffDays <= 90) return { tier: "recent", days: diffDays };
  if (diffDays <= 365) return { tier: "at_risk", days: diffDays };
  if (diffDays <= 730) return { tier: "lapsed", days: diffDays };
  return { tier: "long_lapsed", days: diffDays };
}

function roundAsk(amount: number): number {
  if (amount < 200) {
    return Math.round(amount / 5) * 5;
  } else if (amount < 1000) {
    return Math.round(amount / 10) * 10;
  } else {
    return Math.round(amount / 50) * 50;
  }
}

function buildAskLadder(mostRecentGift?: number): number[] {
  if (!mostRecentGift || mostRecentGift <= 0) {
    // generic starter ladder
    return [25, 50, 100];
  }

  if (mostRecentGift < 100) {
    return [25, 50, 100];
  }

  const base = mostRecentGift;
  const a1 = roundAsk(base);
  const a2 = roundAsk(base * 1.25);
  const a3 = roundAsk(base * 1.5);
  const a4 = roundAsk(base * 2.0);

  const ladder = Array.from(new Set([a1, a2, a3, a4])).sort((x, y) => x - y);
  return ladder;
}

function isUpgradeReady(
  valueTier: ValueTier,
  recencyTier: RecencyTier,
  giftCount?: number,
  mostRecentGift?: number,
  avgGift?: number,
): boolean {
  if (!giftCount || !mostRecentGift || !avgGift) return false;
  if (!(valueTier === "medium" || valueTier === "large")) return false;
  if (!(recencyTier === "recent" || recencyTier === "at_risk")) return false;
  if (giftCount < 3) return false;
  if (mostRecentGift < avgGift * 0.9) return false;
  return true;
}

function isMonthlyProspect(
  recencyTier: RecencyTier,
  giftCount?: number,
  avgGift?: number,
  stats?: DatasetStats,
): boolean {
  if (!giftCount || !avgGift || !stats) return false;
  if (!(recencyTier === "recent" || recencyTier === "at_risk")) return false;
  if (giftCount < 4) return false;

  const { p25, p75 } = stats.avgGiftPercentiles;
  return avgGift >= p25 && avgGift <= p75;
}

export function analyzeDonorData(rows: DonorRawRow[]): AnalysisResult {
  const stats = computeStats(rows);

  const donors: DonorAnalysis[] = rows.map((row) => {
    const lifetime =
      row.lifetimeGiving ??
      (row.mostRecentGift && row.giftCount
        ? row.mostRecentGift * row.giftCount
        : undefined);

    const { tier: recencyTier, days } = classifyRecency(row.lastGiftDate);
    const valueTier = classifyValueTier(lifetime, stats);

    const upgradeReady = isUpgradeReady(
      valueTier,
      recencyTier,
      row.giftCount,
      row.mostRecentGift,
      row.avgGift ?? row.mostRecentGift,
    );

    const monthlyProspect = isMonthlyProspect(
      recencyTier,
      row.giftCount,
      row.avgGift ?? row.mostRecentGift,
      stats,
    );

    const askLadder = buildAskLadder(row.mostRecentGift);

    const lookalikeCohorts: string[] = [];
    if (valueTier === "major" && recencyTier === "recent") {
      lookalikeCohorts.push("core_high_value_seed");
    }
    if (monthlyProspect) {
      lookalikeCohorts.push("monthly_lookalike_seed");
    }

    return {
      donorId: row.donorId,
      valueTier,
      recencyTier,
      daysSinceLastGift: days,
      mostRecentGift: row.mostRecentGift,
      lifetimeGiving: lifetime,
      avgGift: row.avgGift ?? row.mostRecentGift,
      giftCount: row.giftCount,
      upgradeReady,
      monthlyProspect,
      askLadder,
      lookalikeCohorts,
    };
  });

  const suggestedSegments = [
    {
      id: "high_value_at_risk",
      name: "High-value, at-risk donors",
      description: "Large/major donors who haven't given recently.",
      filter: (d: DonorAnalysis) =>
        (d.valueTier === "large" || d.valueTier === "major") &&
        (d.recencyTier === "at_risk" || d.recencyTier === "lapsed"),
    },
    {
      id: "upgrade_ready_core",
      name: "Upgrade-ready core donors",
      description: "Medium/large donors with recent gifts and strong patterns.",
      filter: (d: DonorAnalysis) => d.upgradeReady,
    },
    {
      id: "monthly_candidates",
      name: "Monthly giving prospects",
      description: "Multi-gift donors likely to say yes to monthly giving.",
      filter: (d: DonorAnalysis) => d.monthlyProspect,
    },
    {
      id: "reactivation_value",
      name: "Lapsed high-value reactivation",
      description: "High-value donors who have gone quiet for a while.",
      filter: (d: DonorAnalysis) =>
        (d.valueTier === "large" || d.valueTier === "major") &&
        (d.recencyTier === "lapsed" || d.recencyTier === "long_lapsed"),
    },
  ];

  return { donors, stats, suggestedSegments };
}

function cohortSize(
  donors: DonorAnalysis[],
  filter: (d: DonorAnalysis) => boolean,
): CohortSize {
  const total = donors.length || 1;
  const count = donors.filter(filter).length;
  return {
    count,
    percentage: Math.round((count / total) * 100),
  };
}

export function generateNaturalLanguageRecommendations(
  analysis: AnalysisResult,
): LabRecommendations {
  const { donors } = analysis;

  const total = donors.length || 1;

  const upgrade = cohortSize(donors, (d) => d.upgradeReady);
  const monthly = cohortSize(donors, (d) => d.monthlyProspect);
  const highValueAtRisk = cohortSize(
    donors,
    (d) =>
      (d.valueTier === "large" || d.valueTier === "major") &&
      (d.recencyTier === "at_risk" || d.recencyTier === "lapsed"),
  );
  const reactivation = cohortSize(
    donors,
    (d) =>
      (d.valueTier === "large" || d.valueTier === "major") &&
      (d.recencyTier === "lapsed" || d.recencyTier === "long_lapsed"),
  );
  const highValueRecent = cohortSize(
    donors,
    (d) =>
      (d.valueTier === "large" || d.valueTier === "major") &&
      d.recencyTier === "recent",
  );
  const smallGiftsRecent = cohortSize(
    donors,
    (d) => d.valueTier === "small" && d.recencyTier === "recent",
  );

  const overview = [
    `We analyzed ${total.toLocaleString()} donors in this file.`,
    `${upgrade.count.toLocaleString()} donors (${upgrade.percentage}% of file) look ready for a targeted upgrade ask.`,
    `${monthly.count.toLocaleString()} donors (${monthly.percentage}%) show patterns consistent with monthly giving prospects.`,
    `${highValueAtRisk.count.toLocaleString()} high-value donors (${highValueAtRisk.percentage}%) are showing early signs of risk (recency slipping).`,
  ].join(" ");

  const upgradeStrategy: string[] = [
    `Create a dedicated "Upgrade-ready core donors" segment targeting the ${upgrade.count.toLocaleString()} donors flagged as upgrade-ready.`,
    `For this segment, use an ask ladder that starts at their most recent gift (100%), then offers 125% and 150% options. Keep the top ask within a reasonable stretch (usually 150–200% of their recent gift).`,
    `Use copy that references their consistent support and positions the upgrade as "the next natural step" rather than a one-time spike.`,
    `Prioritize channels where you can personalize the ask amount (email with merge fields, direct mail letters, or 1:1 outreach for the largest upgrade candidates).`,
  ];

  const monthlyStrategy: string[] = [
    `Build a "Monthly giving prospects" segment for the ${monthly.count.toLocaleString()} donors (${monthly.percentage}% of file) showing multi-gift patterns at moderate amounts.`,
    `Offer a monthly ladder based on their average gift: e.g., if average single gift is $50, suggest $15, $25, $35 per month with language about steady impact.`,
    `Run a focused 3-touch monthly upgrade series over 45 days:`,
    `• Touch 1: Story-driven invitation to join the monthly community.`,
    `• Touch 2: Social proof + impact framing ("supporters like you...").`,
    `• Touch 3: Clear, time-bounded nudge ("last chance to be part of this year's monthly circle").`,
    `Suppress major donors and large one-off gifts from the standard monthly series; consider a separate major-donor stewardship track for them.`,
  ];

  const reactivationStrategy: string[] = [
    `Create a "High-value reactivation" segment for the ${reactivation.count.toLocaleString()} lapsed high-value donors.`,
    `Lead with gratitude and past impact: reference the difference their giving has already made before introducing a new need or campaign.`,
    `Use a softer ask ladder: consider anchoring at 75–100% of their most recent gift, not 150%, to reduce friction on the first reactivation gift.`,
    `Use a 2–3 touch sequence across channels (email + mail) over 30–45 days, and clearly acknowledge the time since their last gift rather than ignoring it.`,
  ];

  const lookalikeStrategy: string[] = [
    `Use the "core_high_value_seed" donors (recent large/major givers) as your primary lookalike seed for acquisition in Meta and Google Ads.`,
    `Aim for a seed size of at least 200–500 donors if possible; if this dataset is smaller, combine recent large and medium donors with strong recency to reach a viable seed size.`,
    `Create a separate seed audience for "monthly_lookalike_seed" donors—those flagged as strong monthly prospects—to power a monthly-acquisition-specific campaign.`,
    `When exporting for ad platforms, keep only the anonymous IDs or CRM IDs that your team can match back to email or phone on your side; Nexus never exports PII directly.`,
  ];

  const channelAndCadenceNotes: string[] = [
    `High-value, recent donors (${highValueRecent.count.toLocaleString()} donors) are ideal for higher-touch channels like personal email or phone outreach, especially when combined with upgrade asks.`,
    `Small, recent donors (${smallGiftsRecent.count.toLocaleString()} donors) are strong candidates for digital-only journeys: use email + social retargeting and standard ask ladders like $25 / $50 / $100.`,
    `For lapsed donors, avoid over-messaging. Limit to 2–3 reactivation attempts per campaign cycle and rotate stories or programs so it doesn't feel repetitive.`,
    `Use monthly candidates as a testing ground for channel mix: A/B test email-only versus email + light SMS reminder to see which combination yields higher monthly conversions.`,
  ];

  return {
    overview,
    upgradeStrategy,
    monthlyStrategy,
    reactivationStrategy,
    lookalikeStrategy,
    channelAndCadenceNotes,
  };
}

export function runDonorDataLab(rows: DonorRawRow[]): {
  analysis: AnalysisResult;
  recommendations: LabRecommendations;
} {
  const analysis = analyzeDonorData(rows);
  const recommendations = generateNaturalLanguageRecommendations(analysis);
  return { analysis, recommendations };
}
