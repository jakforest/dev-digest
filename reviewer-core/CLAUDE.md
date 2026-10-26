# reviewer-core — @devdigest/reviewer-core

Pure review engine: diff → prompt → LLM → grounded findings. Pipeline & public API: README.md.
Package manager: **npm** (not pnpm).

## Commands
- `npm test` (hermetic, stubbed LLMProvider) · `npm run typecheck` (= build; never emits JS)

## Conventions
- No DB, filesystem, GitHub or env access. The only side effect is the injected `LLMProvider`.
- Contracts (`Review`, `Finding`, …) come from `@devdigest/shared` → ../server/src/vendor/shared.
- Public surface = `src/index.ts`; the server consumes TS source via path alias.
- Untrusted content (diff, PR body, repo map) goes into the prompt only through `wrapUntrusted()`.

## Do not touch
- The grounding gate (`src/grounding.ts`) is mandatory — never bypass or soften it to
  "keep more findings".
- Score is recomputed from surviving findings — never trust the model's score.

## Gotchas
- Optional prompt slots (`skills`, `memory`, `specs`, `callers`) are empty in the starter;
  lessons start feeding them — omitted slot = section left out of the prompt.
- A contract change here is a contract change for server AND client (two shared copies).

## Read when
- Changing prompt assembly → read src/prompt.ts and test/prompt.test.ts
- Changing structured output / JSON repair → read src/llm/structured.ts
- Implementing a lesson → read specs/ first, then INSIGHTS.md
