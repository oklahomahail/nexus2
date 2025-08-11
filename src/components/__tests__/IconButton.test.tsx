import { render, screen, fireEvent } from "@testing-library/react";
import { Send } from "lucide-react";
import { describe, it, expect, vi } from "vitest";

import IconButton from "../IconButton";

import "@testing-library/jest-dom";

describe("IconButton", () => {
  it("renders label and handles click", () => {
    const handleClick = vi.fn();
    render(<IconButton label="Send" icon={Send} onClick={handleClick} />);

    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
