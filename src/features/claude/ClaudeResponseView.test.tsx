import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import ClaudeResponseView from "./ClaudeResponseView";

import "@testing-library/jest-dom";

describe("ClaudeResponseView", () => {
  it("handles copy and new request actions", () => {
    const handleCopy = vi.fn();
    const handleNew = vi.fn();
    render(
      <ClaudeResponseView
        response="test"
        copySuccess={false}
        onCopy={handleCopy}
        onNewRequest={handleNew}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    fireEvent.click(screen.getByRole("button", { name: /new request/i }));
    expect(handleCopy).toHaveBeenCalled();
    expect(handleNew).toHaveBeenCalled();
  });
});
