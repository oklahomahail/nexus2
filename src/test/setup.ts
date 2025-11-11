/**
 * Vitest + Testing Library + MSW setup
 * - Registers jest-dom matchers (toBeInTheDocument, etc.)
 * - Cleans up the DOM between tests
 * - Sets up MSW for API mocking
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => server.close());

// Polyfill AbortSignal.timeout where needed
if (!("AbortSignal" in globalThis) || !(AbortSignal as any).timeout) {
  (AbortSignal as any).timeout = (ms: number) => {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(new DOMException("TimeoutError", "AbortError")), ms);
    return ctrl.signal;
  };
}
