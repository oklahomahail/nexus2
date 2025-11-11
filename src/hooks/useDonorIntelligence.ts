/**
 * useDonorIntelligence Hook
 *
 * Manages donor intelligence metric queries and state
 * Provides loading states, error handling, and data caching
 */

import { useState, useCallback } from 'react'
import {
  type MetricType,
  type MetricFilters,
  type RetainedDonorsResult,
  type YoyUpgradeResult,
  type GiftVelocityResult,
  type SeasonalityResult,
  computeMetric,
} from '@/services/donorIntelService'

// ============================================================================
// TYPES
// ============================================================================

interface UseDonorIntelligenceReturn {
  // State
  data: unknown
  isLoading: boolean
  error: string | null
  privacyEnforced: boolean

  // Actions
  fetchMetric: (metric: MetricType, filters?: MetricFilters) => Promise<void>
  clearData: () => void
}

// ============================================================================
// HOOK
// ============================================================================

export function useDonorIntelligence(clientId: string): UseDonorIntelligenceReturn {
  const [data, setData] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [privacyEnforced, setPrivacyEnforced] = useState(false)

  /**
   * Fetch a donor intelligence metric
   */
  const fetchMetric = useCallback(
    async (metric: MetricType, filters?: MetricFilters) => {
      if (!clientId) {
        setError('No client selected')
        return
      }

      setIsLoading(true)
      setError(null)
      setPrivacyEnforced(false)

      try {
        const response = await computeMetric({
          metric,
          filters,
          client_id: clientId,
        })

        if (!response.ok) {
          setError(response.error || 'Failed to fetch metric')
          setPrivacyEnforced(response.privacy_enforced || false)
          setData(null)
          return
        }

        setData(response.data || null)
        setPrivacyEnforced(response.privacy_enforced || false)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch metric'
        setError(message)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    },
    [clientId]
  )

  /**
   * Clear current data and error state
   */
  const clearData = useCallback(() => {
    setData(null)
    setError(null)
    setPrivacyEnforced(false)
  }, [])

  return {
    data,
    isLoading,
    error,
    privacyEnforced,
    fetchMetric,
    clearData,
  }
}

// ============================================================================
// TYPED HOOKS FOR SPECIFIC METRICS
// ============================================================================

/**
 * Hook for retained donors metric
 */
export function useRetainedDonors(clientId: string) {
  const { data, isLoading, error, privacyEnforced, fetchMetric, clearData } =
    useDonorIntelligence(clientId)

  const fetch = useCallback(
    (numYears: number = 5) => {
      return fetchMetric('retained_donors', { num_years: numYears })
    },
    [fetchMetric]
  )

  return {
    data: data as RetainedDonorsResult | null,
    isLoading,
    error,
    privacyEnforced,
    fetch,
    clearData,
  }
}

/**
 * Hook for year-over-year upgrade metric
 */
export function useYoyUpgrade(clientId: string) {
  const { data, isLoading, error, privacyEnforced, fetchMetric, clearData } =
    useDonorIntelligence(clientId)

  const fetch = useCallback(
    (yearFrom: number, yearTo: number) => {
      return fetchMetric('yoy_upgrade', { year_from: yearFrom, year_to: yearTo })
    },
    [fetchMetric]
  )

  return {
    data: data as YoyUpgradeResult | null,
    isLoading,
    error,
    privacyEnforced,
    fetch,
    clearData,
  }
}

/**
 * Hook for gift velocity metric
 */
export function useGiftVelocity(clientId: string) {
  const { data, isLoading, error, privacyEnforced, fetchMetric, clearData } =
    useDonorIntelligence(clientId)

  const fetch = useCallback(() => {
    return fetchMetric('gift_velocity')
  }, [fetchMetric])

  return {
    data: data as GiftVelocityResult | null,
    isLoading,
    error,
    privacyEnforced,
    fetch,
    clearData,
  }
}

/**
 * Hook for seasonality metric
 */
export function useSeasonality(clientId: string) {
  const { data, isLoading, error, privacyEnforced, fetchMetric, clearData } =
    useDonorIntelligence(clientId)

  const fetch = useCallback(
    (year?: number) => {
      return fetchMetric('seasonality', year ? { year } : undefined)
    },
    [fetchMetric]
  )

  return {
    data: data as SeasonalityResult | null,
    isLoading,
    error,
    privacyEnforced,
    fetch,
    clearData,
  }
}
