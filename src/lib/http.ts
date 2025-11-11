/**
 * HTTP utilities with retry, timeout, and jitter
 * Adapted from Inkwell's battle-tested patterns
 */

export interface RetryOptions {
  /** Number of retry attempts (default: 3) */
  retries?: number;
  /** Base delay in ms (default: 250) */
  baseMs?: number;
  /** Max delay in ms (default: 2000) */
  maxMs?: number;
  /** Request timeout in ms (default: 15000) */
  timeoutMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = (n: number) => Math.round(n * (0.8 + Math.random() * 0.4));

/**
 * Fetch JSON with retry + timeout
 *
 * @example
 * const data = await fetchJSON<User>('/api/user', { method: 'GET' })
 */
export async function fetchJSON<T>(
  url: string,
  init: RequestInit = {},
  opts: RetryOptions = {}
): Promise<T> {
  const { retries = 3, baseMs = 250, maxMs = 2000, timeoutMs = 15000 } = opts;
  let lastErr: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (e) {
      clearTimeout(timeoutId);
      lastErr = e;

      if (attempt === retries) break;

      // Exponential backoff with jitter
      const backoff = Math.min(maxMs, baseMs * 2 ** attempt);
      await sleep(jitter(backoff));
    }
  }

  throw lastErr;
}

/**
 * Retry any async function with exponential backoff
 *
 * @example
 * const data = await withRetry(() => supabase.from('users').select())
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { retries = 3, baseMs = 250, maxMs = 2000, timeoutMs = 15000 } = opts;
  let lastErr: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          ctrl.signal.addEventListener('abort', () =>
            reject(new Error('Request timeout'))
          )
        ),
      ]);

      clearTimeout(timeoutId);
      return result;
    } catch (e) {
      clearTimeout(timeoutId);
      lastErr = e;

      if (attempt === retries) break;

      // Exponential backoff with jitter
      const backoff = Math.min(maxMs, baseMs * 2 ** attempt);
      await sleep(jitter(backoff));
    }
  }

  throw lastErr;
}

/**
 * Add timeout to any promise
 *
 * @example
 * const data = await withTimeout(fetch('/api/slow'), 5000)
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Supabase Edge Function invocation with retry
 *
 * @example
 * const result = await invokeFn<Response>('ai-privacy-gateway', { prompt })
 */
export async function invokeFn<T = unknown>(
  supabase: any, // Type from @supabase/supabase-js when installed
  name: string,
  body: any,
  opts: RetryOptions = {}
): Promise<T> {
  return withRetry(
    async () => {
      const { data, error } = await supabase.functions.invoke(name, { body });
      if (error) throw error;
      if (!data) throw new Error('No data returned from Edge Function');
      return data as T;
    },
    { retries: 2, baseMs: 300, maxMs: 1200, timeoutMs: 15000, ...opts }
  );
}
