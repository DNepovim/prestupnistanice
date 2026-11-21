# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing/catalogue site for the Czech book publisher **Přestupní stanice** (knihyps). Astro 5 + Svelte 5 islands + Tailwind 4, content stored as Markdown, deployed to Vercel. All UI copy is Czech.

## Commands

Package manager is **pnpm**.

| Command | Action |
| :-- | :-- |
| `pnpm dev` | `astro dev` — Astro on `localhost:4321`. |
| `pnpm build` | `astro build` |
| `pnpm preview` | Serve `./dist` |
| `pnpm typecheck` | `tsc` (no emit config — whole repo, `astro/tsconfigs/strict`) |
| `pnpm lint:fix` / `lint:check` | ESLint over `src/**` |
| `pnpm format:write` / `format:check` | Prettier |
| `pnpm knip` | Dead-code / unused-dependency check |
| `pnpm check` | All four checks in sequence (fails fast) |

There is no test framework in this repo — don't assume one exists.

**After every task run the `check` skill (lint, Prettier, types, Knip) and fix all errors.** `pnpm check` is green on a clean tree — any failure is yours.

## Skills

`.claude/skills/` holds six project skills: **`check`** (the static-check suite and how to fix each failure), **`code-guide`** (style and pattern reference — consult before writing or reviewing code), **`design-guide`** (the site's visual language), **`design-variants`** (design a new feature as an Artifact with ten original, configurable variants in the site design), **`commit`** (gate on checks, then Conventional Commit(s) on the current branch), and **`ship`** (`commit`, then branch + PR or push to `main`).

## Architecture

### Content

Markdown files in `src/content/{books,authors,reviews,events,pages}` are the single data store, described by the Zod schemas in `src/content.config.ts` (used by `getCollection`/`getEntry`). Adding or renaming a frontmatter field means updating the schema, otherwise the build fails validation.

### The `slug` frontmatter field, not the entry id

Every book/author carries an explicit `slug` in frontmatter (`slugify(title)` for books — keep it in sync with the filename when adding entries; author references are file paths flattened to a slug via `getSlugFromPath`). Application code looks entries up by `data.slug`, and `book.authors[].slug` is an Astro `reference('author')` whose `.id` is the author's filename. When adding lookups, follow the existing `data.slug` convention rather than `entry.id`.

### Routing

`src/routes.ts` is the only place URL segments live (`knihy`, `autori`) plus the `CATEGORIES` map that pairs internal keys (`forKids`, `philosophy`, `novel`, `poetry`) with Czech slugs (`pro-deti`, …). Build URLs with `routes.*()` helpers; never hardcode segments.

`src/pages/knihy/[...slug].astro` serves **both** category listings and book details from one route — it generates paths from book slugs plus `categoryKeys`, then branches with `isOneOf(slug, categoryKeys)` into `BooksCategory` vs `BookDetail`. Adding a category means adding it to `CATEGORIES`, `categoriesSlugToKey`, `categoryKeys`, and the Zod enum.

### Per-book theming

Books optionally carry `color` / `bgColor`. `src/utils/geColorScale.ts` expands a single hex into a 50–950 tint/shade scale (colord). `Layout.astro` injects the scale as CSS custom properties and maps them into Tailwind's `@theme` as `--color-brand-first-*` / `--color-brand-second-*`, so utilities like `bg-brand-first-500` resolve to the current page's book colours. Defaults come from the promoted book, falling back to `src/consts.ts`.

`components/Theme.astro` does the same thing scoped to a subtree — used on the homepage so each book excerpt renders in its own palette. Use it instead of inline colours when a section needs different brand colours from the page.

### Czech typography

- `tp()` (`src/utils/tp.ts`) wraps `typopo`'s `fixTypos(s, 'cs')` — run user-authored strings (titles, claims, markdown text) through it before rendering.
- `Markdown.astro` renders markdown with `marked` using a custom renderer that applies Tailwind classes and `tp()` per node; the `html` tagged template in `src/utils/html.ts` builds those strings. Change markdown styling there, not with global CSS.
- Hyphenopoly is loaded in `Layout.astro` and hyphenates any element with the `hyphenate` class.

### Islands and search

Svelte 5 components are the interactive layer (`SearchButton`, `SearchModal`, `FloatingImage`, `FloatingPopup`). `Header.astro` calls `getSearchIndex()` (`src/utils/search/`) at build time — books, main authors with portraits, and a per-book brand-token style string — and hands the result to `SearchButton client:idle`. `SearchModal` orchestrates the overlay from small islands in `components/search/`; matching lives in `createSearcher` (Fuse.js for books and authors, plus category aliases such as "filosofie" → `philosophy`), the colour-bar geometry in `barLayout`. Books always outrank authors (the first book is preselected), and the selected book, author or category re-themes the overlay by applying its precomputed `--color-brand-*` tokens to the dialog root. Prefer `client:idle` / `client:visible`.

### Environment

Env vars are declared in `env.config.ts` and consumed through `astro:env/client` / `astro:env/server` — do not use `process.env` in app code (`astro.config.ts` is the exception, since it runs before the schema exists).

`vercel.json` carries a strict CSP; any new external script/font/API host must be added there or it will be blocked in production.

## Code conventions

Summary below; the full reference is the **`code-guide`** skill. From `.cursorrules`, plus what the config actually enforces:

- **No comments of any kind** — no `//`, `/* */`, JSDoc, or TODO. Use self-documenting names. Never add `eslint-disable` comments; fix the code or prefix unused names with `_`.
- Functional and immutable: `const` over `let`, prefer `.map`/`.filter`/`.reduce` over `for` loops, avoid mutation and side effects.
- TypeScript: named exports only, no `any`/`unknown` without narrowing, no non-null `!`. ESLint runs `strictTypeChecked` + `stylisticTypeChecked` + sonarjs, and `noUncheckedIndexedAccess` is on — index access is `T | undefined`, handle it.
- `type` over `interface` (enforced by lint).
- Imports: use the `@/*` alias for anything outside the current directory; ESLint bans `../` patterns (sibling `./` imports are fine). Prettier sorts imports into groups: `astro:*` → react → third-party → `@/*` → relative.
- Astro components: declare `type Props`, destructure `Astro.props`, accept `class?: string` and compose with `class:list`. Svelte uses array `class={[...]}`. There is no `cn` helper in this repo despite the `.cursorrules` mention.
- Styling is Tailwind-only; custom utilities and font tokens (`font-head`, `font-display`, `font-alt`, `font-liga`, `text-outline-*`, `animate-*`) live in `src/styles/global.css`. Use brand tokens, not raw hex.
- Prettier: no semicolons, single quotes, `printWidth: 90`.
- Icons come from `astro-icon` with the `ph` (Phosphor) set in `.astro`, and the `iconify-icon` web component in Svelte.
