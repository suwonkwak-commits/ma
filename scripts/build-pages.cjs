const { spawnSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');

const result = spawnSync(process.execPath, [
  require.resolve('expo/bin/cli'), 'export', '--platform', 'web',
  '--output-dir', 'dist-pages', '--max-workers', '2',
], {
  stdio: 'inherit',
  env: { ...process.env, EXPO_OFFLINE: '1', WEB_BASE_PATH: '/ma' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
// Pages must serve Expo's _expo folder without Jekyll filtering.
writeFileSync('dist-pages/.nojekyll', '');
