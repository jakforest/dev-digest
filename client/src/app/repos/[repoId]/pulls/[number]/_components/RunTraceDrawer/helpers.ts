import type { LogLine } from "@devdigest/ui";
import type { RunTrace } from "@devdigest/shared";
import { formatUsd } from "@/lib/format-cost";

interface RawEvent {
  t: string;
  kind: string;
  msg: string;
}

/** Map run-bus events to the LiveLogStream LogLine shape. */
export function eventsToLog(events: RawEvent[]): LogLine[] {
  return events.map((e) => ({ t: e.t, k: e.kind as LogLine["k"], m: e.msg }));
}

/** Map a persisted trace's log to the LiveLogStream LogLine shape. */
export function traceLog(trace: RunTrace | undefined): LogLine[] {
  return trace?.log.map((l) => ({ t: l.t, k: l.kind as LogLine["k"], m: l.msg })) ?? [];
}

/** Seconds-formatted duration. */
export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Token in→out summary (e.g. "12k→1.5k"). */
export function formatTokens(tokensIn: number, tokensOut: number): string {
  return `${(tokensIn / 1000).toFixed(0)}k→${(tokensOut / 1000).toFixed(1)}k`;
}

/** Stat-tile cost at 2 decimals. A real sub-cent cost reads "<$0.01" so it never
 *  looks free; "—" when unknown (incl. traces stored before cost was tracked). */
export function formatCost(usd: number | null | undefined): string {
  if (usd != null && usd > 0 && usd < 0.01) return "<$0.01";
  return formatUsd(usd, 2);
}
