import { render, screen, fireEvent } from "@testing-library/react";
import { MessageSquare } from "lucide-react";
import { describe, it, expect, vi } from "vitest";

import ClaudeActionList, { ClaudeAction } from "./ClaudeActionList";

import "@testing-library/jest-dom";

describe("ClaudeActionList", () => {
  const actions: ClaudeAction[] = [
    {
      id: "test",
      label: "Test Action",
      description: "desc",
      icon: MessageSquare,
      prompt: "",
    },
  ];

  it("calls onSelect when action clicked", () => {
    const handleSelect = vi.fn();
    render(
      <ClaudeActionList
        actions={actions}
        onSelect={handleSelect}
        isLoading={false}
      />,
    );
    fireEvent.click(screen.getByText(/test action/i));
    expect(handleSelect).toHaveBeenCalledWith("test");
  });
});
