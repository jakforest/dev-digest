// Stop hook: when a turn did real work (any tool call), block the stop once and make Claude
// run the engineering-insights wrap-up. Pure Q&A turns stop normally. stop_hook_active
// prevents a loop: the wrap-up turn itself is always allowed to stop.
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
if (input.stop_hook_active || !input.transcript_path) process.exit(0);

let entries;
try {
  entries = readFileSync(input.transcript_path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
} catch {
  process.exit(0); // never block the user because the transcript is unreadable
}

const isRealPrompt = (e) =>
  e.type === 'user' &&
  !e.isMeta &&
  (typeof e.message?.content === 'string' ||
    (Array.isArray(e.message?.content) && !e.message.content.some((c) => c.type === 'tool_result')));

let start = 0;
for (let i = entries.length - 1; i >= 0; i--) {
  if (isRealPrompt(entries[i])) { start = i; break; }
}

const toolCalls = entries
  .slice(start)
  .filter((e) => e.type === 'assistant' && Array.isArray(e.message?.content))
  .flatMap((e) => e.message.content.filter((c) => c.type === 'tool_use'));

// Already wrapped up during this turn (skill invoked or an INSIGHTS.md written) → nothing to enforce.
const alreadyDone = toolCalls.some(
  (c) =>
    (c.name === 'Skill' && c.input?.skill === 'engineering-insights') ||
    /INSIGHTS\.md$/.test(c.input?.file_path ?? ''),
);

if (toolCalls.length && !alreadyDone) {
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason:
        'engineering-insights wrap-up (mandatory): use the engineering-insights skill. Re-read the INSIGHTS.md of ' +
        'every module touched this turn, then append only lessons that are significant AND not already there. ' +
        'If nothing qualifies, write nothing and reply with one line: "Insights: nothing new."',
    }),
  );
}
