# Spec — Run cost (client)

Status: **implemented** (e2e header assertion not added) · Server side, data semantics and contracts:
[`server/specs/run-cost.md`](../../server/specs/run-cost.md) — implement that first.

## Screens

### 1. PR list — `COST` column
`src/app/repos/[repoId]/pulls/`
- `constants.ts`: add `"cost"` to `COLUMN_KEYS` between `status` and `updated`;
  extend `GRID` with a ~`84px` track at the same position
  (`"1fr 132px 92px 60px 118px 84px 78px"`).
- `messages/en/prReview.json` → `list.columns.cost: "Cost"`.
- `_components/PRRow/PRRow.tsx`: new cell after status →
  `<RunCostBadge variant="compact" usd={pr.cost_usd} />` → `$0.014` (mono) or
  muted `—`.
- Value = sum of all runs of the PR (server-computed). Refreshes with the existing
  `["pulls", repoId]` query, same as `score`.

### 2. PR detail — timeline run row
`src/app/repos/[repoId]/pulls/[number]/_components/RunHistory/RunHistory.tsx`
- Right-hand meta column (`:198`), under the time, for settled runs
  (`status === "done"`): `<RunCostBadge variant="tokens" usd={r.cost_usd}
  tokensIn={r.tokens_in} tokensOut={r.tokens_out} />` → `9,119 tok · $0.0013`.
- Tokens = `tokens_in + tokens_out`, `toLocaleString("en-US")`. Cost unknown →
  `9,119 tok · —`. Running / failed / cancelled rows: no line (matches design's
  error row).

### 3. Agent run drawer — `COST` stat
`.../RunTraceDrawer/`
- `helpers.ts`: restore `formatCost` → shared formatter at 2 decimals, plus a
  floor: `0 < usd < 0.01 → "<$0.01"` (so a real $0.0013 run never reads as
  `$0.00`). `0 → "$0.00"` (genuinely free), `null/undefined → "—"`.
- `_components/TraceBody/TraceBody.tsx`: `<Stat label={t("trace.stat.cost")}
  val={formatCost(stats.cost_usd)} />` between TOKENS and FINDINGS.
- `messages/en/runs.json` → `trace.stat.cost: "COST"`.

## Shared pieces
- `src/lib/format-cost.ts`
  `formatUsd(usd: number | null | undefined, decimals: 2 | 3 | 4): string` —
  `null/undefined → "—"`, else `usd.toFixed(decimals)` with trailing zeros
  stripped down to a minimum of 2 decimals: `0.06 @4 → "$0.06"`, `0.0013 @4 →
  "$0.0013"`, `0.014 @3 → "$0.014"`, `0 → "$0.00"`, `1.2 → "$1.20"`.
  Max precision per screen **follows the design** (decision): list 3, timeline 4,
  drawer 2.
- `src/components/run-cost-badge/` (`RunCostBadge.tsx · index.ts · styles.ts · RunCostBadge.test.tsx`;
  kebab-case dir like `page-shell/`, `repo-not-found/`)
  — two variants (as in the lesson slide): `compact` (list, `$0.014`) and `tokens`
  (timeline, `9,119 tok · $0.0013`). Mono font, `--text-muted`; `—` muted. No
  hardcoded user-facing words except the `tok` unit → i18n key
  `prReview.cost.tokens: "{count} tok"`.
- Contracts: `src/vendor/shared/contracts/{trace,platform}.ts` — same fields as the
  server copy (`RunStats.cost_usd` nullish, `RunSummary.cost_usd` nullable,
  `PrMeta.cost_usd` nullish). The client copy has drifted; edit fields, don't copy files.

## Tests (`cd client && pnpm typecheck && pnpm test`)
- `format-cost` unit: null → `—`; `0.0013` @4 → `$0.0013`; `0.06` @4 → `$0.06`;
  `0.06` @3 → `$0.06`; `1.2` @4 → `$1.20`; `0` → `$0.00` (real zero).
- `RunCostBadge`: both variants, null cost renders `—` not `$0.00`.
- `RunHistory.test.tsx`: fixture `run()` gains `cost_usd`; done row shows
  `tok · $`, failed row doesn't.
- `RunTraceDrawer.test.tsx`: TRACE fixture `cost_usd: 0.06` → `$0.06`;
  `0.0013` → `<$0.01`; `0` → `$0.00`; fixture without the key → `—`.
- e2e (optional): `e2e/specs/02-repo-pulls-detail.flow.json` — wait for text `Cost`
  in the list header. Seed has no agent runs, so seeded rows show `—`.

## Decisions
- Drawer floor (decided 2026-10-25): at 2 decimals a real $0.0013 run would show
  `$0.00` and read as "free", so the drawer shows `<$0.01` for `0 < usd < 0.01`.
  Drawer only — list (3) and timeline (4) keep plain `toFixed`.

## Acceptance criteria
1. All three screens show cost for new completed runs, in the design's format.
2. Missing data → `—` everywhere, never `$0.00`.
3. No new requests: cost comes from the existing `pulls`, `runs` and `trace` payloads.
4. All new text goes through `next-intl`.
