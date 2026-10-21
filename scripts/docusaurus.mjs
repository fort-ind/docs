import {spawnSync} from 'node:child_process';

const [command, ...args] = process.argv.slice(2);
const result = spawnSync(
  process.execPath,
  ['node_modules/@docusaurus/core/bin/docusaurus.mjs', command, ...args],
  {
    env: {...process.env, SKIP_HTML_MINIFICATION: 'true'},
    stdio: 'inherit',
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
