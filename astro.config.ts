// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

import tinaDirective from './astro-tina-directive/register'
import { envConfig } from './env.config.ts'

const { SITE_URL } = loadEnv(process.env.SITE_URL!, process.cwd(), '')
const { VERCEL_URL } = loadEnv(process.env.VERCEL_URL!, process.cwd(), '')
const { ENV_NAME } = loadEnv(process.env.ENV_NAME!, process.cwd(), '')

// https://astro.build/config
export default defineConfig({
  env: envConfig,
  site: SITE_URL || `https://${VERCEL_URL}`,
  integrations: [
    mdx(),
    sitemap(),
    react(),
    tinaDirective(),
    ENV_NAME === 'production' && sitemap({ lastmod: new Date() }),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
})
