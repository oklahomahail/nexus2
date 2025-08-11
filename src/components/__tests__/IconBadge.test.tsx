import { render } from "@testing-library/react";
import { Send } from "lucide-react";
import { describe, it, expect } from "vitest";

import IconBadge from "../IconBadge";

import "@testing-library/jest-dom";

describe("IconBadge", () => {
  it("renders provided icon", () => {
    const { container } = render(<IconBadge icon={Send} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
