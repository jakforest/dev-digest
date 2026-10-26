# Spec — Run cost (server)

Status: **implemented** (migration `0010_groovy_namorita`; client done too) · Counterpart: [`client/specs/run-cost.md`](../../client/specs/run-cost.md)

## Goal

Show what each review run cost (USD) and what a PR's reviews cost in total, on
three screens:

| # | Screen | What is shown | Source field |
|---|--------|---------------|--------------|
| 1 | PR list (`/repos/:repoId/pulls`) | `COST` column, sum of all runs of the PR | `PrMeta.cost_usd` |
| 2 | PR detail → Agent runs timeline | `9,119 tok · $0.0013` under the run time | `RunSummary.cost_usd` + `tokens_in/out` |
| 3 | Agent run drawer → Stats | `COST` stat between TOKENS and FINDINGS | `RunTrace.stats.cost_usd` |

Out of scope: VerdictBanner cost line, FINDINGS / Run Review columns on the PR
list (present in the design, not part of this feature), backfilling old runs.

## Background — what already exists

This feature was removed in `d45ab0d` ("remove per-PR/run cost, keep model
pricing"). Only **persistence + display** were removed; the computation is intact:

- `reviewer-core/src/review/run.ts:184` — `reviewPullRequest()` returns
  `costUsd`, summed over every LLM call (single-pass = 1 call, map-reduce = 1 per
  file). If **any** call's cost is unknown the whole run is `null` (never a
  partial sum that reads as the full price).
- Per-call cost: OpenRouter's reported cost → else `PriceBook.estimate` (live
  `/models` prices, `server/src/platform/price-book.ts`) → else the static table
  (`server/src/adapters/llm/pricing.ts`). OpenAI/Anthropic adapters use the table.
- `ReviewRunExecutor` (`server/src/modules/reviews/run-executor.ts:213`)
  receives `outcome` but currently drops `costUsd`.

⇒ **Zero additional model calls.** Cost = tokens × price, already computed.

## Data semantics

- `cost_usd: number | null` — `null` means **unknown** (model not priced, run
  failed/cancelled, or run predates this feature). The UI renders `—`, never `$0.00`.
- `0` is a real value (free model) and is shown as a number.
- Failed / cancelled runs store `null` (they persist 0 tokens today; partial
  spend before the failure is not tracked — same as tokens).
- Old runs (before migration 0010) stay `null` → `—`. **No backfill** (decision:
  showing today's price for a past run would be a made-up number).
- PR total = `SUM(cost_usd)` over **all** `agent_runs` of the PR (any agent, any
  source, re-runs included). SQL `SUM` skips nulls; if every run is null (or the
  PR has no runs) the total is `null` → `—`. Deleting a run lowers the total.
  Accepted limitation: a PR mixing priced and unpriced runs shows the sum of the
  priced ones only.

## Changes

### 1. DB — re-add `agent_runs.cost_usd`
- `server/src/db/schema/runs.ts`: `costUsd: doublePrecision('cost_usd')` (nullable,
  re-import `doublePrecision`). Same type as `ci.ts` / `eval.ts`.
- `cd server && pnpm db:generate` → new migration `0010_*.sql`
  (`ALTER TABLE "agent_runs" ADD COLUMN "cost_usd" double precision;`).
  **Never hand-edit migrations.** Apply with `pnpm db:migrate` (not on boot).

### 2. Contracts — BOTH copies (`server/src/vendor/shared`, `client/src/vendor/shared`)
- `contracts/trace.ts`
  - `RunStats.cost_usd: z.number().nullish()` — **nullish, not nullable**: old
    `run_traces.trace` jsonb documents have no key at all.
  - `RunSummary.cost_usd: z.number().nullable()`.
- `contracts/platform.ts`
  - `PrMeta.cost_usd: z.number().nullish()` — list endpoint only, like `score`.

### 3. Persist on completion — `run-executor.ts`
- Destructure `costUsd` from `outcome`; pass to `completeAgentRun` and into
  `trace.stats.cost_usd`.
- Failure / cancel paths (`:80`, `:300`) and the synthetic error trace (`:424`):
  `costUsd: null` / `cost_usd: null`.
- `repository/run.repo.ts` `completeAgentRun` + `repository.ts` facade signature:
  accept `costUsd: number | null`, write `costUsd`.

### 4. Read paths
- `run.repo.ts` `listRunsForPull`: map `cost_usd: run.costUsd`.
- `GET /runs/:id/trace`: no change — the stored jsonb carries `stats.cost_usd`.
- `modules/pulls/routes.ts` `GET /repos/:id/pulls`: next to the latest-score
  query, one grouped query:
  ```ts
  db.select({ prId: t.agentRuns.prId, cost: sum(t.agentRuns.costUsd).mapWith(Number) })
    .from(t.agentRuns)
    .where(and(eq(t.agentRuns.workspaceId, workspaceId), inArray(t.agentRuns.prId, prIds)))
    .groupBy(t.agentRuns.prId)
  ```
  Map → `cost_usd: costByPr.get(r.id) ?? null`. Watch out: Drizzle `sum()`
  returns a **string** (`numeric`); `mapWith(Number)` must keep `null` as `null`
  (verify — `Number(null) === 0` would turn "unknown" into `$0`).
- Update `server/README.md` API map if it lists response fields.

### 5. Tests (`cd server && pnpm typecheck && pnpm test`)
- `test/contracts.test.ts`: `RunTrace` fixture with `cost_usd: 0.06` **and** one
  without the key (old trace) both parse; `PrMeta` with/without `cost_usd`.
- Executor test (or extend existing): completed run persists `outcome.costUsd`;
  failed run persists `null`; `mocks.ts` already returns `costUsd: 0.001`.
- PR list (SQL aggregation → `*.it.test.ts`, real Postgres): sum across 2 runs;
  all-null runs → `null`; PR without runs → `null`.

## Acceptance criteria
1. Every new completed run has `cost_usd` in `agent_runs`, in `RunSummary` and in
   `trace.stats` (when the model is priced).
2. A run/PR without cost data returns `null` → UI `—`, never `$0.00`.
3. No extra LLM calls (verify: call count in executor tests unchanged).
4. Old runs and old traces load without errors.
5. `pnpm typecheck` + `pnpm test` green in `server/`.
