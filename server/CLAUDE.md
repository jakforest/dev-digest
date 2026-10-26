# server — @devdigest/api

Fastify 5 + Drizzle over Postgres (pgvector). Architecture, API map, env: README.md.
Package manager: **pnpm**.

## Commands
- `pnpm dev` (:3001) · `pnpm typecheck` · `pnpm test`
- Unit only: `pnpm exec vitest run --exclude '**/*.it.test.ts'`
- Integration (needs Docker): `pnpm exec vitest run .it.test`
- Schema change: edit `src/db/schema/*` → `pnpm db:generate` → `pnpm db:migrate`

## Conventions
- New feature = new `src/modules/<name>/` plugin, registered in `src/modules/index.ts`.
- Validate via route zod schemas (fastify-type-provider-zod) — never `Schema.parse(req.body)` in handlers.
- External deps only through adapters + DI container (`src/platform/container.ts`);
  every new adapter gets a mock in `src/adapters/mocks.ts`.
- Throw `AppError` (`src/platform/errors.ts`); the global handler maps it to the error envelope.
- `*.it.test.ts` = real Postgres (testcontainers); every other test must be hermetic.

## Gotchas
- `src/db/migrate.ts` and `src/db/seed.ts` are imported by tests and adapters —
  CLI-entry code must be a no-op on import (no `process.exit` outside the main-module branch).
- Review runs execute in the background (route doesn't await); progress streams via SSE.
- Unindexed repo → repo-intel returns empty context silently, no error.
- `@devdigest/shared` here is NOT the same copy the client uses — sync client/src/vendor/shared.

## Read when
- Changing DB schema → read .claude/skills/drizzle-orm-patterns/SKILL.md
- Touching run execution / traces → read src/modules/reviews/run-executor.ts and docs/
- Touching indexing / repo map → read src/modules/repo-intel/README.md and its INSIGHTS.md
- Implementing a lesson → read specs/ first, then INSIGHTS.md
