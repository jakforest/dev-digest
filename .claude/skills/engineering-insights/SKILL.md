---
name: engineering-insights
description: Records non-obvious engineering lessons in the INSIGHTS.md of the module being worked on (client, server, server/src/modules/repo-intel, reviewer-core, e2e). Use proactively, without being asked, as soon as a session reveals something a future agent would otherwise rediscover the hard way — a surprising root cause, a failed approach or dead end, a library/tool quirk, a convention or decision and its reason, a recurring error and its fix, a correction from the user, or an unresolved question. Also use at the end of any task that involved debugging, a design decision or a discovery, and when the user says "wrap up", "save insights", "what did we learn", "запиши інсайт".
---

# Engineering Insights

Keep a per-module memory that the next session reads before it starts. One entry = one lesson
that an agent reading it **cold** knows how to act on.

## Lifecycle (hooks in .claude/settings.json enforce steps 1 and 3)
1. **Read first:** after the user's prompt and before planning or answering, Read the INSIGHTS.md of
   every module the prompt concerns. Apply the entries as high-confidence guidance.
2. **Capture as you go:** right after a fix is *confirmed* (a test passes, or the user agrees), not while you are still guessing.
3. **Wrap-up:** at the end of any turn that did real work:
   a. Re-read the target INSIGHTS.md. It may have changed during the session.
   b. List candidate lessons from the session and drop every one that fails the quality gate below.
   c. Survivors → append. Nothing survives → **write nothing** and reply `Insights: nothing new.`
   Writing nothing is the expected outcome for most turns. Never add filler to show activity.

## Quality gate — every entry must pass all four
1. **Significant and not obvious:** it would save a future agent 5+ minutes, and someone reading the code wouldn't already see it.
2. **Not already recorded:** the same lesson isn't in the INSIGHTS.md you just re-read, and isn't in the module's CLAUDE.md/README, even worded differently. If it's partly there, skip it. Append a new entry only if it adds a genuinely new fact.
3. **Actionable cold:** say what to do or avoid, where, and why. "Be careful with X" is noise.
4. **Evidence:** a `path:line`, a command, or an exact error string. Speculation goes only in Open Questions.

See [examples.md](examples.md) for vague vs useful entries from this repo.

## Where to write
Use the INSIGHTS.md **closest to the files the lesson is about**:
`server/src/modules/repo-intel/` → `server/` → `client/` → `reviewer-core/` → `e2e/`.
If a lesson spans packages (e.g. the duplicated shared contracts), write it once, where the fix lives,
and list every affected path in the entry.

## Sections (fixed, use only these)
| Section | Goes here |
|---|---|
| What Works | approach that proved effective here |
| What Doesn't Work | dead end / antipattern + why it fails — **don't skip this one, it saves the most time** |
| Codebase Patterns | conventions, architecture decisions **with the reason** |
| Tool & Library Notes | dependency quirks (Fastify, Drizzle, Next, Zod, Vitest, pnpm…) |
| Recurring Errors & Fixes | exact error text → root cause → fix |
| Session Notes | `### YYYY-MM-DD — <task>`: 1–3 lines on what was done and found |
| Open Questions | unresolved, needs a human or investigation |

## Entry format
```
- **YYYY-MM-DD** · <lesson: what to do/avoid + why, 1–3 lines> — `path/to/file.ts:42`
```

## Rules
- **Append-only.** Add entries under the right section heading. Never rewrite or delete existing entries.
  If an entry turns out to be wrong, append a new one: `Supersedes YYYY-MM-DD "<title>": …`.
- Use today's absolute date. Never write secrets, tokens or customer data.
- If an entry would stop the same mistake recurring in *every* session, propose promoting it
  to that package's CLAUDE.md. Propose only; let the user decide.
- If a file grows past ~200 entries, tell the user it needs pruning or splitting. Don't prune it yourself.
- After writing, tell the user in one line per entry what you recorded and where, so they can spot-check it.
