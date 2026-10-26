# Insights — server

Append-only memory of non-obvious lessons from working in `server/`.
Read it before starting work here. Written via the `engineering-insights` skill
(.claude/skills/engineering-insights/SKILL.md). Entry format:
`- **YYYY-MM-DD** · <what to do or avoid + why> — path:line`
Never edit or delete entries; correct one by appending `Supersedes YYYY-MM-DD …`.

## What Works
- **2026-10-25** · Testing per-PR aggregates over `agent_runs`: do ONE real run through the API, then insert extra `agent_runs` rows directly (only `workspaceId` is required; set `prId`/`status`/`costUsd`). This avoids more mocked review runs. `MockLLMProvider` reports `costUsd: 0.001` per call, so a run's cost of 0.001 × N confirms N LLM calls — `server/test/reviews.it.test.ts` ("run cost"), `server/src/adapters/mocks.ts:101`

## What Doesn't Work

## Codebase Patterns
- **2026-10-25** · Each run's trace is saved once as a jsonb document (`run_traces.trace`) and old documents are never backfilled. So a field added to `RunStats`/`RunTrace` must be `.nullish()` (not `.nullable()`), and the UI must handle the key being absent; old traces simply lack it. Applies to both shared-contract copies — `server/src/db/schema/runs.ts:35`, `server/src/vendor/shared/contracts/trace.ts`, `client/src/vendor/shared/contracts/trace.ts`

## Tool & Library Notes
- **2026-10-25** · Drizzle `sum(col)` is typed as a string (Postgres `numeric`), so use `.mapWith(Number)` to get numbers. This is safe for a group whose values are all NULL: the decoder is skipped and the result stays `null`, not `0`. That is how "unknown cost" reaches the client as `null`; the it-test asserts it — `server/src/modules/pulls/routes.ts` (costByPr), `server/test/reviews.it.test.ts` ("run cost")

## Recurring Errors & Fixes
- **2026-10-25** · On Windows, `pnpm test` has 6 failing tests in `test/indexer-pipeline.test.ts` with `ENOENT: no such file or directory, open '...\Temp\repo-intel-inc-*\src\a.ts'`. This is not a regression: the test helper `writeFileAt` finds the parent dir with `lastIndexOf('/')`, but `join()` produces backslashes, so `src/` is never created. CI is Linux-only, so it stays green. Fix (if wanted) is `mkdir(dirname(full))` — `server/test/indexer-pipeline.test.ts:142`

## Session Notes
### 2026-10-25 — Run cost (re-added after `d45ab0d` removed it)
- `agent_runs.cost_usd` (migration `0010_groovy_namorita`), `cost_usd` on `RunStats`/`RunSummary`/`PrMeta` (both contract copies), persisted by `run-executor.ts`, summed per PR in `GET /repos/:id/pulls`. Spec: `server/specs/run-cost.md`.
- Tests: `test/contracts.test.ts` (old trace without key, RunSummary/PrMeta cost) and `test/reviews.it.test.ts` "run cost" (persist → trace → runs → PR sum, null for unpriced/no runs). The `drizzle-orm-patterns` skill was NOT read despite CLAUDE.md "Read when changing DB schema"; the change mirrored the reverted column.

## Open Questions
- **2026-10-25** · Run-cost test gaps: (1) nothing asserts that the executor's failed/cancelled paths persist `cost_usd = null`; the it-test inserts a failed row by hand. (2) "zero extra LLM calls" is only implied by cost = 0.001 and is not asserted via `MockLLMProvider.calls.length` — `server/src/modules/reviews/run-executor.ts`, `server/test/reviews.it.test.ts`
