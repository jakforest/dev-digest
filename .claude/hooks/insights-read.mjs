// UserPromptSubmit hook: before Claude answers, make it read the INSIGHTS.md of the module in scope.
// Lists only files that already contain entries, so empty templates cost no extra reads.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MODULES = ['server/src/modules/repo-intel', 'server', 'client', 'reviewer-core', 'e2e'];
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

const withEntries = MODULES.flatMap((dir) => {
  const file = join(root, dir, 'INSIGHTS.md');
  if (!existsSync(file)) return [];
  const count = readFileSync(file, 'utf8').split('\n').filter((l) => l.startsWith('- **')).length;
  return count ? [`${dir}/INSIGHTS.md (${count} entries)`] : [];
});

if (withEntries.length) {
  const context = [
    'engineering-insights: before planning or answering, decide which module(s) this prompt concerns',
    'and Read their INSIGHTS.md (skip any you already read in this session). Treat entries as',
    'high-confidence guidance. Files with entries:',
    ...withEntries.map((f) => `- ${f}`),
  ].join('\n');
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } }),
  );
}
