/**
 * USD for display. `null`/`undefined` means the cost is unknown (unpriced model,
 * failed run, or a run from before cost was tracked) → "—", never "$0.00".
 * Shows at most `decimals` places, trimming trailing zeros down to a minimum of
 * two: 0.06 @4 → "$0.06", 0.0013 @4 → "$0.0013", 0 → "$0.00".
 */
export function formatUsd(usd: number | null | undefined, decimals: 2 | 3 | 4): string {
  if (usd == null) return "—";
  return `$${usd.toFixed(decimals).replace(/(\.\d{2}\d*?)0+$/, "$1")}`;
}
