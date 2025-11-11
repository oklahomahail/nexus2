/**
 * Supabase Client
 *
 * Singleton client instance for Supabase interactions
 * Based on Inkwell's battle-tested pattern
 *
 * Environment variables required:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

// TODO: Install @supabase/supabase-js when implementing Supabase integration
// import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// Stub types until Supabase is installed
type SupabaseClient = any;

// Supabase configuration from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  console.error('Please check your .env file')
}

// Singleton client instance
let supabaseInstance: SupabaseClient | null = null

/**
 * Get or create Supabase client instance
 *
 * Uses singleton pattern to ensure only one client exists
 * Includes error handling for missing environment variables
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
      )
    }

    // TODO: Uncomment when @supabase/supabase-js is installed
    supabaseInstance = {} as any; // createClient<Database>(supabaseUrl, supabaseAnonKey, {
    /*
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'nexus-auth-token',
      },
      // Realtime settings (can be disabled if not needed)
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }) */
  }

  return supabaseInstance!
}

/**
 * Primary export - Supabase client instance
 *
 * Usage:
 * import { supabase } from '@/lib/supabaseClient'
 * const { data, error } = await supabase.from('clients').select('*')
 */
export const supabase = getSupabaseClient()

/**
 * Check if Supabase is properly configured
 *
 * Useful for conditional features or error boundaries
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * Type helper for Supabase queries
 *
 * Usage:
 * type Client = Tables<'clients'>
 * type ClientInsert = TablesInsert<'clients'>
 * type ClientUpdate = TablesUpdate<'clients'>
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

/**
 * Type helper for Supabase enums
 */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

/**
 * Error handling helper for Supabase operations
 *
 * Usage:
 * const result = await handleSupabaseError(
 *   supabase.from('clients').select('*')
 * )
 */
export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise

  if (error) {
    console.error('Supabase error:', error)
    throw new Error(error.message || 'An unexpected error occurred')
  }

  if (!data) {
    throw new Error('No data returned from Supabase')
  }

  return data
}

/**
 * Batch operation helper
 *
 * Supabase doesn't have native batch operations, so we chunk and execute in parallel
 *
 * Usage:
 * await batchOperation(donors, 100, async (batch) => {
 *   return supabase.from('donors').insert(batch)
 * })
 */
export async function batchOperation<T>(
  items: T[],
  batchSize: number,
  operation: (batch: T[]) => Promise<any>
): Promise<void> {
  const batches: T[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  // Execute batches in parallel (Supabase can handle this)
  await Promise.all(batches.map((batch) => operation(batch)))
}

/**
 * Utility: Convert Supabase timestamp to Date object
 */
export function parseSupabaseTimestamp(timestamp: string | null): Date | null {
  return timestamp ? new Date(timestamp) : null
}

/**
 * Utility: Format Date for Supabase timestamp
 */
export function formatSupabaseTimestamp(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export default supabase
