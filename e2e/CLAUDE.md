# e2e — @devdigest/e2e

Deterministic browser flows driven by the agent-browser CLI. Spec format & runner: README.md.
Package manager: **npm**.

## Commands
- `npm test` (needs client :3000 + API :3001 + freshly seeded DB) · `npm run typecheck`
- Hermetic full run (stack + seed + flows): `npm run e2e:hermetic` (= ../scripts/e2e.sh)

## Conventions
- One flow = `specs/NN-name.flow.json`; keep the numeric prefix order.
- Assertions are `wait --text` / `wait --url` (non-zero exit fails) or `assert.stdoutIncludes`.
- Deterministic locators only (`--url`, `--text`, `find role|text|label`).

## Do not touch
- Never use agent-browser's AI `chat` command — runs must stay key-free and stable.
- Flows are read-only over seeded data (`acme/payments-api`, PR #482, seeded agents) —
  never trigger a review / LLM call.

## Gotchas
- Flow 02 follows the home redirect to the *first* repo — assumes the seeded repo is the only one.
- Changing seed data (server/src/db/seed.ts) or UI text can break flows — grep `specs/` first.

## Read when
- Adding or debugging a flow → read README.md and run.ts
- CI behaviour → read ../.github/workflows/e2e-web.yml
- Implementing a lesson → read docs/ first, then INSIGHTS.md
  (here `specs/` holds the executable flows, not feature specs)
