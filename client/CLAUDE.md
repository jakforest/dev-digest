# client — @devdigest/web

Next.js 15 App Router + React 19 + TanStack Query. Route map & API usage: README.md.
Package manager: **pnpm**.

## Commands
- `pnpm dev` (:3000, needs API on :3001) · `pnpm typecheck` · `pnpm test` (vitest + jsdom, fetch mocked)

## Conventions
- Pages (`src/app/**/page.tsx`) stay thin; feature UI lives in colocated
  `_components/<Name>/` = `Name.tsx · index.ts · constants.ts · helpers.ts · styles.ts · Name.test.tsx`.
- Data only via hooks in `src/lib/hooks/*` → `src/lib/api.ts`; no raw `fetch` in components.
- All user-facing text via `next-intl` (`messages/en/<area>.json`) — no hardcoded strings.
- UI primitives from `@devdigest/ui` (`src/vendor/ui`); don't add a component library.
- API base: `NEXT_PUBLIC_API_BASE` (default `http://localhost:3001`).

## Gotchas
- `src/vendor/shared` is a separate copy of `@devdigest/shared` and has drifted from
  server/src/vendor/shared — contract changes must be applied to both.
- Cross-cutting chrome (nav, breadcrumbs, `g`-then-key shortcuts) is in `src/components/app-shell`.

## Read when
- Writing component tests → read .claude/skills/react-testing-library/SKILL.md
- RSC / client boundary or data-fetching questions → read .claude/skills/next-best-practices/SKILL.md
- Adding a page or flow that e2e covers → read ../e2e/README.md
- Implementing a lesson → read specs/ first, then INSIGHTS.md
