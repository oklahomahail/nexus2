import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import ClaudePromptForm from "./ClaudePromptForm";

import "@testing-library/jest-dom";

describe("ClaudePromptForm", () => {
  it("submits custom prompt", () => {
    const handleSubmit = vi.fn();
    const handleChange = vi.fn();
    render(
      <ClaudePromptForm
        value=""
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={false}
      />,
    );
    const textarea = screen.getByPlaceholderText(/ask claude/i);
    fireEvent.change(textarea, { target: { value: "hello" } });
    expect(handleChange).toHaveBeenCalledWith("hello");
    const button = screen.getByRole("button", { name: /send to claude/i });
    fireEvent.click(button);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
