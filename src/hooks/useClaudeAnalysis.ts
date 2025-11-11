/**
 * useClaudeAnalysis Hook
 *
 * Generates AI narratives from anonymized donor analytics
 * All requests pass through ai-privacy-gateway for PII protection
 */

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { MetricType } from '@/services/donorIntelService'

// ============================================================================
// TYPES
// ============================================================================

interface UseClaudeAnalysisReturn {
  // State
  narrative: string | null
  isLoading: boolean
  error: string | null

  // Actions
  generateNarrative: (metric: MetricType, data: any) => Promise<void>
  clearNarrative: () => void
}

// ============================================================================
// HOOK
// ============================================================================

export function useClaudeAnalysis(): UseClaudeAnalysisReturn {
  const [narrative, setNarrative] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generate AI narrative from analytics data
   * CRITICAL: All requests go through ai-privacy-gateway
   */
  const generateNarrative = useCallback(async (metric: MetricType, data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Call AI Privacy Gateway with analytics category
      const { data: response, error: invokeError } = await supabase.functions.invoke<{
        ok: boolean
        data?: {
          content: Array<{ text: string }>
        }
        error?: string
        blocked_reason?: string
      }>('ai-privacy-gateway', {
        body: {
          category: 'analytics' as const,
          payload: {
            metric,
            data,
            summary_only: true,
          },
        },
      })

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to generate narrative')
      }

      if (!response || !response.ok) {
        const reason = response?.blocked_reason || response?.error || 'Unknown error'
        throw new Error(`Privacy gateway blocked request: ${reason}`)
      }

      if (!response.data) {
        throw new Error('No response from AI service')
      }

      // Extract narrative from Claude response
      const text = response.data.content?.[0]?.text || 'No narrative generated'
      setNarrative(text)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate narrative'
      setError(message)
      console.error('Claude analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Clear narrative and error state
   */
  const clearNarrative = useCallback(() => {
    setNarrative(null)
    setError(null)
  }, [])

  return {
    narrative,
    isLoading,
    error,
    generateNarrative,
    clearNarrative,
  }
}
