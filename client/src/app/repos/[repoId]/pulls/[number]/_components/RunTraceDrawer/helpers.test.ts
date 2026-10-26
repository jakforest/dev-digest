import { describe, it, expect } from "vitest";
import { formatCost } from "./helpers";

describe("formatCost (drawer COST stat)", () => {
  it("2 decimals for cents and up", () => {
    expect(formatCost(0.06)).toBe("$0.06");
    expect(formatCost(1.2)).toBe("$1.20");
  });

  it("a real sub-cent cost reads <$0.01, never $0.00", () => {
    expect(formatCost(0.0013)).toBe("<$0.01");
  });

  it("a real zero stays $0.00; unknown is a dash", () => {
    expect(formatCost(0)).toBe("$0.00");
    expect(formatCost(null)).toBe("—");
    expect(formatCost(undefined)).toBe("—"); // trace stored before cost was tracked
  });
});
