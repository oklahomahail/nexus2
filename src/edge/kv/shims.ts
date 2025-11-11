/**
 * Pluggable KV Shims
 *
 * Adapters for different KV stores (Vercel KV, Cloudflare KV, in-memory)
 * Used by rate limiting and caching logic
 */

export type KVGet = (key: string) => Promise<string | null>;
export type KVSet = (key: string, value: string, ttlSec: number) => Promise<void>;

export interface KVAdapter {
  get: KVGet;
  set: KVSet;
}

/**
 * In-memory KV (for tests and local development)
 *
 * @example
 * const kv = createMemoryKV();
 * await kv.set('key', 'value', 60);
 * const value = await kv.get('key');
 */
export function createMemoryKV(): KVAdapter & { _store: Map<string, { value: string; expiresAt: number }> } {
  const store = new Map<string, { value: string; expiresAt: number }>();
  const now = () => Date.now();

  const get: KVGet = async (key) => {
    const entry = store.get(key);
    if (!entry) return null;

    if (entry.expiresAt < now()) {
      store.delete(key);
      return null;
    }

    return entry.value;
  };

  const set: KVSet = async (key, value, ttlSec) => {
    store.set(key, {
      value,
      expiresAt: now() + ttlSec * 1000,
    });
  };

  return { get, set, _store: store };
}

/**
 * Vercel KV adapter
 *
 * @example
 * import { kv } from '@vercel/kv';
 * const adapter = vercelKV(kv);
 * await adapter.set('key', 'value', 60);
 */
export function vercelKV(client: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, opts: { ex: number }) => Promise<void>;
}): KVAdapter {
  return {
    get: (key) => client.get(key),
    set: (key, value, ttlSec) => client.set(key, value, { ex: ttlSec }),
  };
}

/**
 * Cloudflare KV adapter
 *
 * @example
 * // In Cloudflare Worker
 * const adapter = cloudflareKV(env.MY_KV_NAMESPACE);
 * await adapter.set('key', 'value', 60);
 */
export function cloudflareKV(namespace: {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, opts: { expirationTtl: number }) => Promise<void>;
}): KVAdapter {
  return {
    get: (key) => namespace.get(key),
    set: (key, value, ttlSec) => namespace.put(key, value, { expirationTtl: ttlSec }),
  };
}

/**
 * Redis adapter (for self-hosted Redis or Upstash)
 *
 * @example
 * import Redis from 'ioredis';
 * const redis = new Redis(process.env.REDIS_URL);
 * const adapter = redisKV(redis);
 */
export function redisKV(client: {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, ttlSec: number, value: string) => Promise<void>;
}): KVAdapter {
  return {
    get: (key) => client.get(key),
    set: (key, value, ttlSec) => client.setex(key, ttlSec, value),
  };
}

/**
 * No-op adapter (for testing or when caching is disabled)
 */
export function noopKV(): KVAdapter {
  return {
    get: async () => null,
    set: async () => undefined,
  };
}
