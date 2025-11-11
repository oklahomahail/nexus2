/**
 * usePostalAssumptions Hook
 *
 * Exposes MVP static postage rates with helpers for the Campaign Designer
 * Centralizes assumptions and makes it easy to override with live rates later
 */

import { useMemo } from 'react'
import type { MailClass, MailFormat } from '../services/postageEstimator'
import {
  getUnitRate,
  estimatePostage as estimatePostageService,
  getAvailableFormats,
  getAvailableMailClasses,
  getFormatDisplayName,
  getMailClassDisplayName,
} from '../services/postageEstimator'

// ============================================================================
// TYPES
// ============================================================================

interface UsePostalAssumptionsOptions {
  /**
   * Whether the organization is eligible for nonprofit rates
   * Defaults to true (most Nexus users are nonprofits)
   */
  nonprofitEligible?: boolean

  /**
   * Custom rate overrides (for testing or manual rate cards)
   */
  customRates?: Partial<Record<MailClass, Partial<Record<MailFormat, number>>>>
}

interface PostageEstimate {
  mailClass: MailClass
  format: MailFormat
  quantity: number
  unit: number
  total: number
  savings?: number
}

// ============================================================================
// HOOK
// ============================================================================

export function usePostalAssumptions(opts?: UsePostalAssumptionsOptions) {
  const nonprofitEligible = opts?.nonprofitEligible ?? true
  const customRates = opts?.customRates

  /**
   * Get unit rate for a specific format and mail class
   */
  const unitRate = useMemo(
    () => (format: MailFormat, mailClass?: MailClass) => {
      const cls = mailClass ?? (nonprofitEligible ? 'nonprofit' : 'first_class')

      // Check for custom rate override
      if (customRates?.[cls]?.[format] !== undefined) {
        return customRates[cls]![format]!
      }

      return getUnitRate(format, cls)
    },
    [nonprofitEligible, customRates]
  )

  /**
   * Estimate total postage for a mailing
   */
  const estimateTotal = useMemo(
    () => (quantity: number, format: MailFormat, mailClass?: MailClass): PostageEstimate => {
      const cls = mailClass ?? (nonprofitEligible ? 'nonprofit' : 'first_class')
      const unit = unitRate(format, cls)
      const total = Math.round(unit * quantity * 100) / 100

      // Calculate savings if using nonprofit rates
      let savings: number | undefined
      if (cls === 'nonprofit') {
        const firstClassUnit = unitRate(format, 'first_class')
        const firstClassTotal = firstClassUnit * quantity
        savings = Math.round((firstClassTotal - total) * 100) / 100
      }

      return {
        mailClass: cls,
        format,
        quantity,
        unit,
        total,
        savings,
      }
    },
    [nonprofitEligible, unitRate]
  )

  /**
   * Compare nonprofit vs first-class costs
   */
  const compareMailClasses = useMemo(
    () =>
      (quantity: number, format: MailFormat) => {
        const nonprofit = estimateTotal(quantity, format, 'nonprofit')
        const firstClass = estimateTotal(quantity, format, 'first_class')

        const savings = firstClass.total - nonprofit.total
        const savingsPercent = Math.round((savings / firstClass.total) * 100)

        return {
          nonprofit,
          firstClass,
          savings,
          savingsPercent,
        }
      },
    [estimateTotal]
  )

  /**
   * Get default mail class based on nonprofit eligibility
   */
  const defaultMailClass: MailClass = useMemo(
    () => (nonprofitEligible ? 'nonprofit' : 'first_class'),
    [nonprofitEligible]
  )

  /**
   * Available formats and mail classes
   */
  const formats = useMemo(() => getAvailableFormats(), [])
  const classes = useMemo(() => getAvailableMailClasses(), [])

  /**
   * Display name helpers
   */
  const formatDisplayName = useMemo(() => getFormatDisplayName, [])
  const mailClassDisplayName = useMemo(() => getMailClassDisplayName, [])

  /**
   * Format currency for display
   */
  const formatCurrency = useMemo(
    () => (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    },
    []
  )

  return {
    // Rate queries
    unitRate,
    estimateTotal,
    compareMailClasses,

    // Defaults
    defaultMailClass,
    nonprofitEligible,

    // Available options
    formats,
    classes,

    // Display helpers
    formatDisplayName,
    mailClassDisplayName,
    formatCurrency,
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// In Campaign Designer component:

import { usePostalAssumptions } from '@/hooks/usePostalAssumptions'

function CampaignDesignerPanel() {
  const { estimateTotal, formatCurrency, compareMailClasses } = usePostalAssumptions({
    nonprofitEligible: true
  })

  // Estimate postage for a mailing
  const estimate = estimateTotal(10000, 'letter')
  console.log(`Total: ${formatCurrency(estimate.total)}`)
  console.log(`Savings vs First Class: ${formatCurrency(estimate.savings || 0)}`)

  // Compare mail classes
  const comparison = compareMailClasses(10000, 'letter')
  console.log(`Nonprofit: ${formatCurrency(comparison.nonprofit.total)}`)
  console.log(`First Class: ${formatCurrency(comparison.firstClass.total)}`)
  console.log(`Savings: ${comparison.savingsPercent}%`)

  return (
    <div>
      <h2>Postage Estimate</h2>
      <p>Quantity: {estimate.quantity}</p>
      <p>Format: {estimate.format}</p>
      <p>Class: {estimate.mailClass}</p>
      <p>Unit Rate: {formatCurrency(estimate.unit)}</p>
      <p>Total: {formatCurrency(estimate.total)}</p>
      {estimate.savings && (
        <p>Savings vs First Class: {formatCurrency(estimate.savings)}</p>
      )}
    </div>
  )
}
*/
