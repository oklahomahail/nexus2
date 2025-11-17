/**
 * Donor Data Lab Export Service
 *
 * CSV export helpers for Data Lab results - segment-specific exports,
 * special cohort exports (upgrade-ready, monthly prospects, lookalikes).
 */

import { AnalysisResult, DonorAnalysis } from './donorDataLab';
import { downloadCsvFile } from '@/utils/csvExport';

function formatAskLadder(ladder: number[]): string {
  return ladder.map(a => `$${a}`).join(' | ');
}

function donorToBaseRow(d: DonorAnalysis): (string | number)[] {
  return [
    d.donorId,
    d.valueTier,
    d.recencyTier,
    d.daysSinceLastGift ?? '',
    d.mostRecentGift ?? '',
    d.lifetimeGiving ?? '',
    d.avgGift ?? '',
    d.giftCount ?? '',
  ];
}

/**
 * Export any subset of donors as a CSV with standard donor fields + ask ladder.
 */
export function exportDonorsCsv(
  filename: string,
  donors: DonorAnalysis[]
): void {
  const headers = [
    'donor_id',
    'value_tier',
    'recency_tier',
    'days_since_last_gift',
    'most_recent_gift',
    'lifetime_giving_est',
    'average_gift',
    'gift_count',
    'upgrade_ready',
    'monthly_prospect',
    'lookalike_cohorts',
    'ask_ladder',
  ];

  const rows = donors.map(d => [
    ...donorToBaseRow(d),
    d.upgradeReady ? '1' : '0',
    d.monthlyProspect ? '1' : '0',
    d.lookalikeCohorts.join(';'),
    formatAskLadder(d.askLadder),
  ]);

  downloadCsvFile(filename, headers, rows);
}

/**
 * Export donors in a specific suggested segment (using its filter).
 */
export function exportSuggestedSegmentCsv(
  analysis: AnalysisResult,
  suggestedId: string,
  filename?: string
): void {
  const seg = analysis.suggestedSegments.find(s => s.id === suggestedId);
  if (!seg) {
    throw new Error(`Suggested segment ${suggestedId} not found`);
  }

  const donors = analysis.donors.filter(seg.filter);
  const safeFilename = filename ?? `nexus_segment_${suggestedId}.csv`;
  exportDonorsCsv(safeFilename, donors);
}

/**
 * Export upgrade-ready donors.
 */
export function exportUpgradeReadyCsv(
  analysis: AnalysisResult,
  filename = 'upgrade_ready_donors.csv'
): void {
  const donors = analysis.donors.filter(d => d.upgradeReady);
  exportDonorsCsv(filename, donors);
}

/**
 * Export monthly prospect donors.
 */
export function exportMonthlyProspectsCsv(
  analysis: AnalysisResult,
  filename = 'monthly_prospect_donors.csv'
): void {
  const donors = analysis.donors.filter(d => d.monthlyProspect);
  exportDonorsCsv(filename, donors);
}

/**
 * Export lookalike seed cohorts.
 */
export function exportLookalikeSeedCsv(
  analysis: AnalysisResult,
  cohortId: 'core_high_value_seed' | 'monthly_lookalike_seed',
  filename?: string
): void {
  const donors = analysis.donors.filter(d => d.lookalikeCohorts.includes(cohortId));
  const fallbackName =
    cohortId === 'core_high_value_seed'
      ? 'lookalike_seed_core_high_value.csv'
      : 'lookalike_seed_monthly.csv';

  exportDonorsCsv(filename ?? fallbackName, donors);
}
