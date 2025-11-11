/**
 * Deterministic tests for rateLimit using injected clock and memory KV
 */

import { describe, it, expect } from "vitest";

import { createMemoryKV } from "./kv/shims";
import { rateLimit } from "./rateLimit";

describe("rateLimit", () => {
  it("allows requests within limit", async () => {
    const kv = createMemoryKV();
    let t = 0;
    const now = () => t;

    const opts = {
      id: "user:1",
      limit: 5,
      windowMs: 1000,
      now,
      get: kv.get,
      set: kv.set,
    };

    // Should allow 5 requests
    for (let i = 0; i < 5; i++) {
      const result = await rateLimit(opts);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5 - i - 1);
    }
  });

  it("blocks requests when limit exceeded", async () => {
    const kv = createMemoryKV();
    let t = 0;
    const now = () => t;

    const opts = {
      id: "user:2",
      limit: 3,
      windowMs: 1000,
      now,
      get: kv.get,
      set: kv.set,
    };

    // Consume all tokens
    await rateLimit(opts);
    await rateLimit(opts);
    await rateLimit(opts);

    // Should block
    const blocked = await rateLimit(opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("refills tokens over time", async () => {
    const kv = createMemoryKV();
    let t = 0;
    const now = () => t;

    const opts = {
      id: "user:3",
      limit: 10,
      windowMs: 1000,
      now,
      get: kv.get,
      set: kv.set,
    };

    // Consume 5 tokens
    for (let i = 0; i < 5; i++) {
      await rateLimit(opts);
    }

    // Advance time by 500ms (should refill ~5 tokens)
    t = 500;

    // Should have refilled some tokens
    const result = await rateLimit(opts);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("resets tokens in new window", async () => {
    const kv = createMemoryKV();
    let t = 0;
    const now = () => t;

    const opts = {
      id: "user:4",
      limit: 3,
      windowMs: 1000,
      now,
      get: kv.get,
      set: kv.set,
    };

    // Exhaust tokens
    await rateLimit(opts);
    await rateLimit(opts);
    await rateLimit(opts);

    expect((await rateLimit(opts)).allowed).toBe(false);

    // Advance to next window
    t = 1001;

    // Should have full tokens again
    const result = await rateLimit(opts);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeLessThanOrEqual(opts.limit - 1);
  });

  it("works without KV (memory-only mode)", async () => {
    let t = 0;
    const now = () => t;

    const opts = {
      id: "user:5",
      limit: 2,
      windowMs: 1000,
      now,
      // No get/set provided
    };

    // Should still work (won't persist across calls)
    const r1 = await rateLimit(opts);
    expect(r1.allowed).toBe(true);

    const r2 = await rateLimit(opts);
    expect(r2.allowed).toBe(true);
  });

  it("provides correct reset time", async () => {
    const kv = createMemoryKV();
    let t = 500; // Start mid-window
    const now = () => t;

    const opts = {
      id: "user:6",
      limit: 10,
      windowMs: 1000,
      now,
      get: kv.get,
      set: kv.set,
    };

    const result = await rateLimit(opts);
    expect(result.resetInMs).toBe(500); // 1000 - 500
  });

  it("handles concurrent requests from different users", async () => {
    const kv = createMemoryKV();
    const now = () => Date.now();

    const opts1 = {
      id: "user:7",
      limit: 2,
      windowMs: 1000,
      now,
      get: kv.get,
      set: kv.set,
    };

    const opts2 = {
      ...opts1,
      id: "user:8",
    };

    // User 7 exhausts their limit
    await rateLimit(opts1);
    await rateLimit(opts1);
    expect((await rateLimit(opts1)).allowed).toBe(false);

    // User 8 should still have tokens
    expect((await rateLimit(opts2)).allowed).toBe(true);
    expect((await rateLimit(opts2)).allowed).toBe(true);
  });

  it("respects custom refill rate", async () => {
    const kv = createMemoryKV();
    let t = 0;
    const now = () => t;

    const opts = {
      id: "user:9",
      limit: 10,
      windowMs: 1000,
      refillRatePerMs: 0.1, // 1 token per 10ms
      now,
      get: kv.get,
      set: kv.set,
    };

    // Consume 5 tokens
    for (let i = 0; i < 5; i++) {
      await rateLimit(opts);
    }

    // Advance 100ms -> should refill 10 tokens (but capped at limit)
    t = 100;

    const result = await rateLimit(opts);
    expect(result.allowed).toBe(true);
    // Should have close to full tokens
    expect(result.remaining).toBeGreaterThanOrEqual(8);
  });
});
