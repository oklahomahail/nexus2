/**
 * Vitest + Testing Library setup
 * - Registers jest-dom matchers (toBeInTheDocument, etc.)
 * - Cleans up the DOM between tests
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
