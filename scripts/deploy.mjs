import { spawnSync } from 'node:child_process';

// Update the existing Worker without recreating its managed custom domain.
const tag = `test-${Date.now()}`;
for (const args of [
  ['versions', 'upload', '--tag', tag],
  ['versions', 'deploy', '--version-tag', `${tag}@100`, '--yes'],
]) {
  const result = spawnSync('wrangler', args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
