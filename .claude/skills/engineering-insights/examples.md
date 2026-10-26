# Vague vs useful — examples

These entries show the format and the quality bar. They are illustrations, not real insights: don't copy them into an INSIGHTS.md.

| ❌ Noise | ✅ Insight |
|---|---|
| Promises can be tricky. | `Promise.all()` in the ingest pipeline times out after ~30 items. Use `Promise.allSettled()` in batches of 10. |
| Be careful with async. | Checkout state always goes through Zustand (`cartStore.ts`) because 3 components share the cart. Local state desyncs here. |
| Tests can be flaky. | `*.it.test.ts` hangs when Docker isn't running (testcontainers waits forever). Check `docker ps` before debugging the test. |
| Watch out for shared types. | Changing a Zod contract in `server/src/vendor/shared` means also editing `client/src/vendor/shared`. The client typechecks against the stale copy and fails at runtime. |

## Per section

**What Doesn't Work**
```
- **2026-10-24** · Calling `process.exit()` at the top level of `src/db/seed.ts` kills vitest on import.
  Keep CLI code inside the main-module branch — `server/src/db/seed.ts:1`
```

**Recurring Errors & Fixes**
```
- **2026-10-24** · `relation "x" does not exist` on boot → migrations are not applied on start.
  Run `cd server && pnpm db:migrate` — `server/src/db/migrate.ts`
```

**Codebase Patterns** (always include the *why*)
```
- **2026-10-24** · Repo-intel returns empty context for an unindexed repo instead of throwing, so a review
  runs without context and nothing reports it. Check the index status before blaming the prompt — `server/src/modules/repo-intel/service.ts`
```

**Session Notes**
```
### 2026-10-24 — L02 findings grounding
Added line-anchoring for findings. Root cause of the offset bug was CRLF diffs on Windows (see Recurring Errors).
```

**Open Questions**
```
- **2026-10-24** · Does the SSE stream drop events when two runs start within 1s? Seen once, not reproduced.
```

## Rejected — don't write these
- "Fixed the bug in pulls service." → a history note, not a lesson (that belongs in git).
- "Fastify uses plugins." → generic knowledge.
- "Use zod for validation." → already in `server/CLAUDE.md`.
