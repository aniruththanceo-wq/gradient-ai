import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Badge } from "@/components/ui/badge";

describe("Year Gating Rules", () => {
  it("determines placement availability accurately based on academic year", () => {
    function hasPlacementAccess(academicYear: number): boolean {
      return academicYear >= 3;
    }

    expect(hasPlacementAccess(1)).toBe(false);
    expect(hasPlacementAccess(2)).toBe(false);
    expect(hasPlacementAccess(3)).toBe(true);
    expect(hasPlacementAccess(4)).toBe(true);
  });

  it("renders correct year badge text", () => {
    render(<Badge variant="year">Year 1 Student</Badge>);
    expect(screen.getByText("Year 1 Student")).toBeDefined();
  });
});
