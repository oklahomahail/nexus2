import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import ClaudePromptForm from "./ClaudePromptForm";

import "@testing-library/jest-dom";

describe("ClaudePromptForm", () => {
  it("submits custom prompt", () => {
    const handleSubmit = vi.fn();
    const handleChange = vi.fn();

    const { rerender } = render(
      <ClaudePromptForm
        value=""
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={false}
      />,
    );

    // Find the input and change it
    const input = screen.getByRole("textbox", { name: /prompt/i });
    fireEvent.change(input, { target: { value: "hello" } });
    expect(handleChange).toHaveBeenCalledWith("hello");

    // Re-render with the updated value to simulate controlled component behavior
    rerender(
      <ClaudePromptForm
        value="hello"
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={false}
      />,
    );

    // Now submit the form (button should be enabled)
    const form = screen.getByRole("form", { name: /claude prompt form/i });
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalledWith("hello");
  });
});
