import type { KnipConfig } from 'knip'

export default {
  astro: {
    config: ['astro.config.{js,cjs,mjs,ts,mts}'],
    entry: [
      'src/content/config.ts',
      'src/pages/**/*.{astro,mdx,ts}',
      '!src/pages/**/_*',
      '!src/pages/**/_*/**',
      'src/content/**/*.mdx',
    ],
    project: ['src/**/*'],
  },
  ignore: [ 'tina/**/*', 'public/**/*', 'astro-tina-directive/**/*'],
  ignoreDependencies: ['@iconify-json/ph'],
} satisfies KnipConfig
