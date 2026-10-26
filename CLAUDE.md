# DevDigest

Local-first AI PR review. Course starter: each lesson (L01–L08) adds one feature back.
4 independent packages — NOT a monorepo/workspace. Each has its own lockfile;
code is shared only via tsconfig path aliases. Architecture: README.md.

## Stack
Node ≥22 · TypeScript 5.7 · Zod 3.24 · Vitest 2.1
- server/        Fastify 5 · Drizzle 0.38 · Postgres + pgvector (Docker) · **pnpm**
- client/        Next.js 15 (App Router) · React 19 · TanStack Query 5 · Tailwind 4 · **pnpm**
- reviewer-core/ pure review engine, no DB/IO except injected LLMProvider · **npm**
- e2e/           agent-browser JSON flows (no Playwright, no LLM) · **npm**

## Commands
- Full stack from zero: `./scripts/dev.sh` (flags: `--no-seed` `--db-only` `--no-client`)
- Per package (run inside its dir): `typecheck` · `test`
- DB: `cd server && pnpm db:migrate && pnpm db:seed` — migrations are NOT applied on boot

## Map
- `server/src/modules/<name>/`  feature = routes → service → repository
- `server/src/vendor/shared/`   `@devdigest/shared` Zod contracts (server + reviewer-core)
- `client/src/vendor/shared/`   SEPARATE copy for the client — see Gotchas
- `docs/agent-prompts/`         built-in reviewer system prompts
- `.claude/skills/`             project skills (catalog: .claude/skills/README.md)
- `<pkg>/docs/` deep docs · `<pkg>/specs/` feature specs · `<pkg>/INSIGHTS.md` lessons learned
  (exception: `e2e/specs/` = executable browser flows)

## Gotchas
- Shared contracts exist TWICE (server/src/vendor/shared, client/src/vendor/shared)
  and have already diverged. Changing a contract → update both copies.
- reviewer-core never emits JS; server imports its TS source via path alias.
- Root `package.json` / `pnpm-lock.yaml` are not the project setup — never install from root.
- Secrets live in `~/.devdigest/secrets.json` (env as fallback), never in DB or git.

## Do not touch
- `server/src/db/migrations/**` — generate with `pnpm db:generate`, never hand-edit.
- DB tables for future lessons are empty on purpose — empty ≠ unused, don't delete.

## Read when
- Changing review flow / prompt / findings / grounding → read reviewer-core/README.md
- Adding or changing an API route → read server/README.md (API map, error envelope)
- Touching repo indexing / repo map → read server/src/modules/repo-intel/README.md
- Adding a UI page or data hook → read client/README.md (route map)
- Writing or debugging tests, CI → read TESTING.md
- Implementing a lesson feature → read `<pkg>/specs/` first, then `<pkg>/INSIGHTS.md`
- Any prompt → before answering, read `INSIGHTS.md` of the module(s) it concerns (a hook reminds you)
- End of a turn that did work → `engineering-insights` wrap-up: re-read, append only significant
  lessons that aren't already there, otherwise write nothing (the Stop hook enforces it)
