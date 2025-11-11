/**
 * Postage Estimator Service
 *
 * MVP static rate table for direct mail cost estimation
 * Future: integrate with USPS Web Tools API for live rates
 */

// ============================================================================
// TYPES
// ============================================================================

export type MailClass = 'nonprofit' | 'first_class'
export type MailFormat = 'postcard' | 'letter' | 'flat_6x11'

export interface PostageRate {
  mailClass: MailClass
  format: MailFormat
  unit: number
}

export interface PostageEstimate {
  mailClass: MailClass
  format: MailFormat
  quantity: number
  unit: number
  total: number
  savings?: number // If comparing nonprofit vs first class
}

// ============================================================================
// RATE TABLE (MVP - Static Rates as of 2024)
// ============================================================================

/**
 * Static postage rate table
 * Based on USPS 2024 rates for nonprofit and first-class mail
 *
 * NOTE: These are approximations. Actual rates vary by:
 * - Permit status (nonprofit presort, automation, etc.)
 * - Volume discounts
 * - Destination (local vs non-local)
 * - Weight (letters >1oz, flats >3oz)
 *
 * For production, consider:
 * - USPS Web Tools API integration
 * - Print vendor rate cards
 * - Volume discount tiers
 */
const RATE_TABLE: Record<MailClass, Record<MailFormat, number>> = {
  nonprofit: {
    postcard: 0.155, // Nonprofit presort postcard
    letter: 0.19, // Nonprofit presort letter (≤1oz)
    flat_6x11: 0.225, // Nonprofit flat (≤3oz)
  },
  first_class: {
    postcard: 0.55, // First-class postcard
    letter: 0.68, // First-class letter (≤1oz)
    flat_6x11: 1.35, // First-class flat (≤3oz)
  },
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get unit postage rate for a format and mail class
 */
export function getUnitRate(format: MailFormat, mailClass: MailClass): number {
  return RATE_TABLE[mailClass][format]
}

/**
 * Estimate total postage cost
 */
export function estimatePostage(opts: {
  mailClass: MailClass
  format: MailFormat
  quantity: number
}): PostageEstimate {
  const { mailClass, format, quantity } = opts
  const unit = getUnitRate(format, mailClass)
  const total = Math.round(unit * quantity * 100) / 100

  // Calculate savings if nonprofit vs first class
  let savings: number | undefined
  if (mailClass === 'nonprofit') {
    const firstClassUnit = getUnitRate(format, 'first_class')
    const firstClassTotal = firstClassUnit * quantity
    savings = Math.round((firstClassTotal - total) * 100) / 100
  }

  return {
    mailClass,
    format,
    quantity,
    unit,
    total,
    savings,
  }
}

/**
 * Compare nonprofit vs first-class costs
 */
export function compareMailClasses(opts: {
  format: MailFormat
  quantity: number
}): {
  nonprofit: PostageEstimate
  firstClass: PostageEstimate
  savings: number
  savingsPercent: number
} {
  const { format, quantity } = opts

  const nonprofit = estimatePostage({ mailClass: 'nonprofit', format, quantity })
  const firstClass = estimatePostage({ mailClass: 'first_class', format, quantity })

  const savings = firstClass.total - nonprofit.total
  const savingsPercent = Math.round((savings / firstClass.total) * 100)

  return {
    nonprofit,
    firstClass,
    savings,
    savingsPercent,
  }
}

/**
 * Get all available formats
 */
export function getAvailableFormats(): MailFormat[] {
  return ['postcard', 'letter', 'flat_6x11']
}

/**
 * Get all available mail classes
 */
export function getAvailableMailClasses(): MailClass[] {
  return ['nonprofit', 'first_class']
}

/**
 * Get format display name
 */
export function getFormatDisplayName(format: MailFormat): string {
  const names: Record<MailFormat, string> = {
    postcard: 'Postcard (4x6)',
    letter: 'Letter (#10 envelope)',
    flat_6x11: 'Flat (6x11)',
  }
  return names[format]
}

/**
 * Get mail class display name
 */
export function getMailClassDisplayName(mailClass: MailClass): string {
  const names: Record<MailClass, string> = {
    nonprofit: 'Nonprofit Presort',
    first_class: 'First-Class',
  }
  return names[mailClass]
}

/**
 * Get format recommendations based on content length
 */
export function recommendFormat(opts: {
  wordCount: number
  hasReplyDevice?: boolean
  includesInserts?: boolean
}): {
  format: MailFormat
  reason: string
}[] {
  const { wordCount, hasReplyDevice, includesInserts } = opts

  const recommendations: Array<{ format: MailFormat; reason: string }> = []

  // Postcard: short, urgent appeals
  if (wordCount <= 150 && !hasReplyDevice && !includesInserts) {
    recommendations.push({
      format: 'postcard',
      reason: 'Short message, no reply device needed. Lowest cost option.',
    })
  }

  // Letter: standard appeals
  if (wordCount >= 150 && wordCount <= 600) {
    recommendations.push({
      format: 'letter',
      reason: 'Standard letter format. Good balance of space and cost.',
    })
  }

  // Flat: long-form content or multiple inserts
  if (wordCount > 600 || includesInserts) {
    recommendations.push({
      format: 'flat_6x11',
      reason: 'Longer content or multiple inserts. More visual impact.',
    })
  }

  // Default to letter if no clear recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      format: 'letter',
      reason: 'Standard format for most appeals.',
    })
  }

  return recommendations
}

// ============================================================================
// ADVANCED ESTIMATIONS
// ============================================================================

/**
 * Estimate full campaign mailing costs including production
 */
export interface CampaignMailingEstimate {
  postage: PostageEstimate
  printing: number
  production: number // Folding, inserting, etc.
  total: number
  costPerPiece: number
}

export function estimateCampaignMailing(opts: {
  mailClass: MailClass
  format: MailFormat
  quantity: number
  printingCostPerPiece?: number // Default estimates provided
  productionCostPerPiece?: number // Default estimates provided
}): CampaignMailingEstimate {
  const { mailClass, format, quantity } = opts

  // Default printing costs (rough estimates)
  const defaultPrintingCosts: Record<MailFormat, number> = {
    postcard: 0.15, // 4x6 postcard printing
    letter: 0.25, // Letter + envelope printing
    flat_6x11: 0.45, // Larger flat printing
  }

  // Default production costs (folding, inserting, sealing)
  const defaultProductionCosts: Record<MailFormat, number> = {
    postcard: 0.05, // Minimal handling
    letter: 0.15, // Folding, inserting, sealing
    flat_6x11: 0.25, // More complex production
  }

  const postage = estimatePostage({ mailClass, format, quantity })
  const printingPerPiece = opts.printingCostPerPiece ?? defaultPrintingCosts[format]
  const productionPerPiece = opts.productionCostPerPiece ?? defaultProductionCosts[format]

  const printing = Math.round(printingPerPiece * quantity * 100) / 100
  const production = Math.round(productionPerPiece * quantity * 100) / 100
  const total = Math.round((postage.total + printing + production) * 100) / 100
  const costPerPiece = Math.round((total / quantity) * 100) / 100

  return {
    postage,
    printing,
    production,
    total,
    costPerPiece,
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Calculate ROI for direct mail campaign
 */
export function calculateDirectMailROI(opts: {
  totalCost: number
  responseRate: number // 0.01 = 1%
  averageGift: number
}): {
  expectedRevenue: number
  expectedProfit: number
  roi: number
  roiPercent: number
  breakEvenResponseRate: number
} {
  const { totalCost, responseRate, averageGift } = opts

  const expectedRevenue = totalCost * responseRate * averageGift
  const expectedProfit = expectedRevenue - totalCost
  const roi = expectedProfit / totalCost
  const roiPercent = Math.round(roi * 100)
  const breakEvenResponseRate = totalCost / averageGift / totalCost

  return {
    expectedRevenue: Math.round(expectedRevenue * 100) / 100,
    expectedProfit: Math.round(expectedProfit * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    roiPercent,
    breakEvenResponseRate: Math.round(breakEvenResponseRate * 10000) / 100, // As percentage
  }
}
