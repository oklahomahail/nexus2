/**
 * Rate Limiting
 *
 * Sliding window / token bucket hybrid for Edge runtimes
 * Works with Vercel KV, Cloudflare KV, or in-memory fallback
 */

export interface RateLimitOptions {
  /** Stable identifier (clientId, IP, userId) */
  id: string;

  /** Maximum tokens per window */
  limit: number;

  /** Window duration in milliseconds */
  windowMs: number;

  /** Refill rate per millisecond (defaults to limit/windowMs) */
  refillRatePerMs?: number;

  /** Time function (for testing) */
  now?: () => number;

  /** KV get function */
  get?: (key: string) => Promise<string | null>;

  /** KV set function */
  set?: (key: string, value: string, ttlSec: number) => Promise<void>;
}

interface TokenBucket {
  tokens: number;
  updatedAt: number;
}

/**
 * Rate limit check with token bucket algorithm
 *
 * @param opts - Rate limit configuration
 * @returns Result with allowed status and metadata
 *
 * @example
 * const { allowed, remaining } = await rateLimit({
 *   id: req.headers.get('x-forwarded-for') ?? 'anon',
 *   limit: 60,
 *   windowMs: 60_000,
 *   get: (k) => kv.get(k),
 *   set: (k, v, ttl) => kv.set(k, v, { ex: ttl }),
 * });
 */
export async function rateLimit(opts: RateLimitOptions): Promise<{
  allowed: boolean;
  remaining: number;
  resetInMs: number;
  limit: number;
}> {
  const {
    id,
    limit,
    windowMs,
    refillRatePerMs = limit / windowMs,
    now = () => Date.now(),
    get,
    set,
  } = opts;

  const currentTime = now();
  const key = `rl:${id}:${Math.floor(currentTime / windowMs)}`;

  // Get current bucket state
  const raw = get ? await get(key) : null;
  const bucket: TokenBucket = raw
    ? JSON.parse(raw)
    : { tokens: limit, updatedAt: currentTime };

  // Refill tokens based on elapsed time
  const elapsed = Math.max(0, currentTime - bucket.updatedAt);
  bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillRatePerMs);
  bucket.updatedAt = currentTime;

  // Try to consume one token
  const allowed = bucket.tokens >= 1;
  if (allowed) {
    bucket.tokens -= 1;
  }

  // Save updated bucket
  if (set) {
    await set(key, JSON.stringify(bucket), Math.ceil(windowMs / 1000));
  }

  const resetInMs = windowMs - (currentTime % windowMs);
  const remaining = Math.max(0, Math.floor(bucket.tokens));

  return {
    allowed,
    remaining,
    resetInMs,
    limit,
  };
}

/**
 * Create rate limit middleware for Edge functions
 *
 * @example
 * export const rateLimitMiddleware = createRateLimitMiddleware({
 *   limit: 100,
 *   windowMs: 60_000,
 *   getKV: () => env.KV,
 * });
 */
export function createRateLimitMiddleware(config: {
  limit: number;
  windowMs: number;
  getId?: (req: Request) => string;
  getKV?: () => {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, opts: { expirationTtl: number }) => Promise<void>;
  };
}) {
  return async (req: Request): Promise<Response | null> => {
    const id = config.getId?.(req) ?? req.headers.get('x-forwarded-for') ?? 'anon';
    const kv = config.getKV?.();

    const result = await rateLimit({
      id,
      limit: config.limit,
      windowMs: config.windowMs,
      get: kv ? (k) => kv.get(k) : undefined,
      set: kv
        ? (k, v, ttl) => kv.set(k, v, { expirationTtl: ttl })
        : undefined,
    });

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          limit: result.limit,
          resetInMs: result.resetInMs,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Math.ceil(result.resetInMs / 1000)),
            'Retry-After': String(Math.ceil(result.resetInMs / 1000)),
          },
        }
      );
    }

    return null; // allowed, continue
  };
}
