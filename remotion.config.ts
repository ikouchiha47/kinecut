import { Config } from '@remotion/cli/config';
import path from 'path';

const root = process.cwd();

Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...((config.resolve?.alias as Record<string, string>) ?? {}),
        '@platform': path.resolve(root, 'src/platform'),
      },
    },
  };
});
