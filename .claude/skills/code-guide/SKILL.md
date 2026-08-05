---
name: code-guide
description: Coding style and conventions for the knihyps Astro site — TypeScript, Astro components, Svelte islands, Tailwind 4 and brand theming, content collections, value maps, conditionals, and Czech typography. Consult when writing or reviewing code.
---

# Code Guide

Style and pattern reference for the knihyps codebase. Consult before writing or
reviewing any code.

---

## Comments

**Write no comments, in any language.** No `//`, no `/* */`, no JSDoc, no
`TODO`/`FIXME`. Prefer clear names and structure instead. If a tool or template
generates comments, remove them before saving. Never add `eslint-disable`
comments — fix the code, or prefix a genuinely-unused binding with `_`.

The only exception is a legally-required license header that already exists.

---

## TypeScript

- Write functional, immutable TypeScript code
- Do not use `any`
- Do not use type assertions (`as`) — model the types correctly instead
- Do not use non-null assertions (`!`) — `noUncheckedIndexedAccess` is on; guard or use `??`
- Prefer `const` over `let`; avoid mutation
- Avoid `for` / `for...of` / `for...in`; use `.map`, `.filter`, `.reduce`, `.flatMap`
- Prefer early returns over nested conditionals
- Use `type` for all type definitions (not `interface`) — lint-enforced
- Use the `type` keyword on import-only lines: `import type { Foo } from '...'`
- Named exports only; avoid default exports
- Always use the `@/` path alias — parent-relative `../` imports are lint-banned
  (sibling `./` imports are fine)

---

## Astro components

- Declare `type Props` and destructure from `Astro.props`
- Accept `class?: string`, alias it (`class: className`), and compose with
  `class:list={[className, '...']}`
- Prefer semantic HTML; avoid inline `style` attributes (the exception is
  injecting computed CSS custom properties, as `Theme.astro` does)
- Fetch content in the frontmatter with `astro:content` APIs
  (`getCollection`, `getEntry`, `getEntries`) — never read files directly
- Optimise images with `astro:assets` (`<Image>`, or `getImage` when you need
  the raw result, e.g. for the search index)

```astro
---
type Props = {
  slug: string
  class?: string
}

const { slug, class: className } = Astro.props
---

<article class:list={[className, 'flex flex-col gap-4']}>
  <slot />
</article>
```

---

## Svelte islands

- Always `<script lang="ts">`
- Keep islands small — they are the only client-side JS on the page
- Mount with `client:idle` or `client:visible`; use `client:load` only when the
  component must be interactive before first paint
- Precompute as much as possible at build time in the parent `.astro` file and
  pass it in as props (see `Header.astro` building the whole search index)
- Use reactive statements (`$:`) rather than manual re-render plumbing
- Compose conditional classes with an array: `class={['base', cond && 'extra']}`.
  There is no `cn` helper in this repo — don't import one.

---

## Styling (Tailwind 4)

Tailwind utilities only — no ad-hoc CSS files, no inline `style` for anything
Tailwind can express. Custom utilities, keyframes, and font tokens live in
`src/styles/global.css` via `@utility` / `@theme`.

- Fonts: `font-head` (quiche-flare), `font-display` (montserrat), `font-alt`
  (montserrat-alternates), `font-liga` (ligatures + oldstyle numerals)
- Custom utilities: `text-stroke-*`, `text-outline-*`, `animate-width-expand`,
  `animate-rotate-on-load`, `animate-small-rotate-on-load`,
  `animate-opacity-on-load`, `animate-slide-on-load`
- Breakpoint `xs` (30rem) is custom; the codebase uses `min-sm:` / `max-sm:`
  range variants heavily

### Brand colours — never hardcode hex

Colours are derived per book. `getColorScale` (`src/utils/geColorScale.ts`)
expands one hex into a 50–950 scale; `Layout.astro` maps it onto
`--color-brand-first-*` / `--color-brand-second-*`. Always use the token
utilities — `text-brand-first-500`, `bg-brand-second-50`, etc.

To render a subtree in a *different* book's palette, wrap it in
`components/Theme.astro` with that book's `color` / `bgColor`. Do not inline
custom properties yourself.

```astro
<!-- ❌ raw hex -->
<div class="bg-[#434991]">

<!-- ✅ brand token -->
<div class="bg-brand-first-500">

<!-- ✅ per-book palette for a subtree -->
<Theme firstColor={book.color ?? undefined} secondColor={book.bgColor ?? undefined}>
  <BookExcerpt slug={book.slug} />
</Theme>
```

---

## Content and routing

- Content lives in `src/content/{books,authors,pages}` as markdown. Its shape is
  defined **twice** — `tina/collections/*.ts` (editor) and
  `src/content.config.ts` (Zod reader). Adding or renaming a field means editing
  both.
- Look entries up by the frontmatter `data.slug`, not by `entry.id` — the slug is
  written by Tina's `beforeSubmit` hook and is what every route and cross-reference
  uses. `book.authors[].slug` is an Astro `reference('author')`; its `.id` is the
  author's filename.
- Build every URL with the `routes` helpers in `src/routes.ts`. Never hardcode
  `/knihy` or `/autori`.
- Adding a category means updating `CATEGORIES`, `categoriesSlugToKey`,
  `categoryKeys` in `src/routes.ts` plus the enums in both schemas.
- Read env through `astro:env/client` / `astro:env/server` as declared in
  `env.config.ts` — never `process.env` in app code.

---

## Czech typography

- Run user-authored strings through `tp()` (`src/utils/tp.ts`, wraps typopo's
  `fixTypos(s, 'cs')`) before rendering — titles, claims, markdown text
- Render markdown with `components/Markdown.astro`; its `marked` renderer already
  applies `tp()` and the right Tailwind classes per node. Change markdown styling
  there, not with global CSS
- Add the `hyphenate` class to long-form prose so Hyphenopoly hyphenates it
- All user-facing copy is Czech

---

## Value maps

Do not use `if`/ternary chains or `switch` to select a value from a known set.
Use a module-level constant map instead:

```ts
// ❌ Breaks silently when a new category is added
const label = category === 'forKids' ? 'pro děti' : category === 'poetry' ? 'pro poéty' : ''

// ✅ Exhaustiveness enforced by the type
const CATEGORY_LABELS = {
  forKids: 'pro děti',
  philosophy: 'pro filosofy',
  novel: 'pro romantiky',
  poetry: 'pro poéty',
} as const satisfies Record<CategoryKey, string>

const label = CATEGORY_LABELS[category]
```

Always use `as const satisfies Record<KnownUnion, Value>` — `as const` preserves
literal types, `satisfies` enforces exhaustiveness at compile time. Never use
`Partial<Record<string, ...>>` — it silently accepts unknown keys and defeats the
exhaustiveness check.

`CATEGORIES` in `src/routes.ts` and `rolesMap` in `src/utils/rolesMap.ts` are the
existing examples — extend them rather than branching alongside them.

Use `switch` only for executing side effects per variant, never for computing a value.

---

## Conditionals

Use `if` only for guards and genuinely boolean checks (`if (!entry)`,
`if (isPromoted)`). For variant selection, use a value map (see above).

---

## Type narrowing

Use type guards from `narrowland` instead of manual comparisons. Import
individual guards:

```ts
import { isDefined, isNonEmptyArray, isNotNull, isOneOf } from 'narrowland'
```

| Pattern to replace               | narrowland equivalent     |
| -------------------------------- | ------------------------- |
| `a === 'x' \|\| a === 'y'`       | `isOneOf(a, ['x', 'y'])`  |
| `a !== 'x' && a !== 'y'`         | `!isOneOf(a, ['x', 'y'])` |
| `arr.length > 0`                 | `isNonEmptyArray(arr)`    |
| `arr.length === 0`               | `isEmptyArray(arr)`       |
| `value !== null`                 | `isNotNull(value)`        |
| `value !== undefined`            | `isDefined(value)`        |

`isOneOf` also narrows the type, which is how `knihy/[...slug].astro`
distinguishes a category slug from a book slug — follow that pattern.

Single comparisons that aren't about membership (`if (book.isPromoted)`, a lone
`!== null`) are fine as-is — reach for narrowland when it replaces a multi-part
check or adds semantic clarity.

---

## Accessibility

- ESLint runs `jsx-a11y-strict` on `.astro` — it will fail the build, not warn
- Use appropriate `aria-*` attributes on interactive UI (tooltips, modals, menus)
- Ensure keyboard interaction for dialogs and menus; manage focus deliberately
  (see `SearchModal.svelte` for the established pattern)

---

## Checks

After every task run the **`check`** skill (lint, Prettier, types, Knip) and fix
all errors. There is no test framework in this repo — do not add test files or
assume one exists.
