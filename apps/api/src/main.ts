import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({
  path: ['.env', '../.env', '../../.env'],
  ignore: ['MISSING_ENV_FILE'],
  quiet: true,
});

import('./bootstrap') //
  .then(({bootstrap}) => bootstrap())
  .catch((e: Error) => [console.log(e), process.exit(1)]);
