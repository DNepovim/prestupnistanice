# Přestupní stanice

Static catalogue site for the Czech book publisher **Přestupní stanice**, built with
Astro 5, Svelte 5 islands and Tailwind 4, deployed to Vercel.

Content lives as Markdown in `src/content/` (books, authors, reviews, events, pages)
and is validated by the Zod schemas in `src/content.config.ts`.

## Commands

| Command        | Action                                        |
| :------------- | :-------------------------------------------- |
| `pnpm install` | Install dependencies                          |
| `pnpm dev`     | Start the dev server at `localhost:4321`      |
| `pnpm build`   | Build the production site to `./dist/`        |
| `pnpm preview` | Preview the build locally                     |
| `pnpm check`   | Lint, Prettier, TypeScript and Knip in series |
