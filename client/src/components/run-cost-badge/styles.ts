import type { CSSProperties } from "react";

/** Co-located styles for RunCostBadge. */
export const s = {
  compact: (unknown: boolean): CSSProperties => ({
    fontSize: 12.5,
    color: unknown ? "var(--text-muted)" : "var(--text-secondary)",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  }),
  tokens: {
    fontSize: 11,
    color: "var(--text-secondary)",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  unknown: { color: "var(--text-muted)" } satisfies CSSProperties,
};
