# Insights — client

Append-only memory of non-obvious lessons from working in `client/`.
Read it before starting work here. Written via the `engineering-insights` skill
(.claude/skills/engineering-insights/SKILL.md). Entry format:
`- **YYYY-MM-DD** · <what to do or avoid + why> — path:line`
Never edit or delete entries; correct one by appending `Supersedes YYYY-MM-DD …`.

## What Works
- **2026-10-25** · To test a component that uses next-intl, wrap it in `<NextIntlClientProvider locale="en" messages={{ <ns>: json }}>` with the namespace JSON imported. ICU `{count, number}` then renders "9,119", so asserting the exact `container.textContent` is stable — `client/src/components/run-cost-badge/RunCostBadge.test.tsx`
- **2026-10-25** · `RunTraceDrawer.test.tsx` mocks `useRunTrace` at module level with ONE fixed `TRACE`, so per-value variants can't be rendered there. Put value formatting in `RunTraceDrawer/helpers.ts` and unit-test it in `helpers.test.ts`; keep the drawer test as a smoke check — `client/src/app/repos/[repoId]/pulls/[number]/_components/RunTraceDrawer/helpers.test.ts`

## What Doesn't Work

## Codebase Patterns

## Tool & Library Notes

## Recurring Errors & Fixes

## Session Notes
### 2026-10-25 — Run cost UI (spec: `client/specs/run-cost.md`)
- New `src/lib/format-cost.ts` (`formatUsd`, trims trailing zeros to a minimum of 2 decimals) and `src/components/run-cost-badge/` (`compact` | `tokens`). COST column in `PRRow`, tokens·cost line in `RunHistory`, COST stat (`<$0.01` floor) in `TraceBody`.
- Tests: `format-cost.test.ts`, `RunCostBadge.test.tsx`, `RunTraceDrawer/helpers.test.ts` (new); `RunHistory.test.tsx`, `RunTraceDrawer.test.tsx` (extended). The `react-testing-library` skill was NOT read despite CLAUDE.md "Read when writing component tests"; tests follow the existing files.

## Open Questions
- **2026-10-25** · Run-cost UI test gaps: no test for the `PRRow` COST cell (it needs a `next/navigation` `useRouter` mock), and `e2e/specs/02-repo-pulls-detail.flow.json` does not assert the "Cost" header — `client/src/app/repos/[repoId]/pulls/_components/PRRow/PRRow.tsx`
