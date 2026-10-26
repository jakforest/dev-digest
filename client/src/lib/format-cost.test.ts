import { describe, it, expect } from "vitest";
import { formatUsd } from "./format-cost";

describe("formatUsd", () => {
  it("unknown cost renders a dash, never $0.00", () => {
    expect(formatUsd(null, 4)).toBe("—");
    expect(formatUsd(undefined, 3)).toBe("—");
  });

  it("keeps up to `decimals` places", () => {
    expect(formatUsd(0.0013, 4)).toBe("$0.0013");
    expect(formatUsd(0.014, 3)).toBe("$0.014");
    expect(formatUsd(0.0013, 3)).toBe("$0.001");
  });

  it("trims trailing zeros down to two decimals", () => {
    expect(formatUsd(0.06, 4)).toBe("$0.06");
    expect(formatUsd(0.06, 3)).toBe("$0.06");
    expect(formatUsd(1.2, 4)).toBe("$1.20");
    expect(formatUsd(0, 4)).toBe("$0.00"); // a real zero (free model)
  });
});
