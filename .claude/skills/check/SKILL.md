---
name: check
description: Run the full static-check suite for the knihyps site — ESLint, Prettier, TypeScript, and Knip — and fix any failures. Use when asked to check, verify, or QA the code (e.g. "run the checks", "is it clean?", before committing/deploying).
---

# Static checks (knihyps)

Run all four checks, then fix everything until they pass clean. The combined
command is `pnpm check` (fails fast); when something fails, run the checks
individually so you see every problem, fix them, and re-run.

## The four checks

Run each from the repo root:

| Check     | Command             | Auto-fix           |
| --------- | ------------------- | ------------------ |
| Lint      | `pnpm lint:check`   | `pnpm lint:fix`    |
| Format    | `pnpm format:check` | `pnpm format:write` |
| Types     | `pnpm typecheck`    | manual             |
| Dead code | `pnpm knip`         | manual             |

Or all at once: `pnpm check`.

`format:check` and `format:write` share a glob (`**/*.{ts,tsx,js,cjs,json,svg}`),
so anything the check flags, the write fixes. Generated and vendored output is
excluded via `.prettierignore` (`tina/__generated__`, `tina/tina-lock.json`,
`public`, `dist`, `.astro`, `.vercel`).

`.astro` and `.svelte` files are **not** in the Prettier globs — they are linted
but not format-checked. The plugins are installed, so if you want to format one
you touched, do it explicitly:
`pnpm exec prettier --write 'src/**/*.{astro,svelte}'`. Six components currently
have drift, so don't run that repo-wide unless you intend that diff.

## How to fix

1. **Prettier** — run `pnpm format:write`; it rewrites to the configured style
   (no semicolons, single quotes, width 90, sorted import groups). Never
   hand-format.
2. **ESLint** — run `pnpm lint:fix` for the auto-fixable rules, then hand-fix
   the rest. Config is `eslint.config.js` (`strictTypeChecked` +
   `stylisticTypeChecked` + sonarjs + astro + svelte + jsx-a11y-strict).
   - Use the `@/` alias — parent-relative (`../`) imports are banned; sibling
     `./` imports are fine.
   - `type` over `interface`; named `react` imports only.
   - **Never add `eslint-disable` comments.** The repo bans comments entirely —
     fix the code, or prefix a genuinely-unused binding with `_`.
3. **TypeScript** — `noUncheckedIndexedAccess` is on, so guard or `??` index
   accesses rather than asserting with `!` (non-null assertions are banned).
   `pnpm typecheck` runs `tsc` over the whole repo including `tina/` and
   `astro.config.ts`.
   - If types for content collections look stale, run `pnpm astro sync` to
     regenerate `.astro/types.d.ts`, then re-run typecheck.
4. **Knip** — `knip.config.ts` sets Astro entries (`src/pages/**`) plus
   `tina/config.ts`, and ignores only `tina/__generated__`. Resolve findings by
   deleting unused files, un-`export`ing internal-only symbols, or removing
   unused deps. If a dep is used implicitly (not import-referenced, e.g.
   `sharp` for Astro's image service, `eslint-plugin-jsx-a11y` pulled in by
   `eslint-plugin-astro`), add it to `ignoreDependencies` instead of removing it.

## Notes

- ESLint uses `projectService: true`. `astro-eslint-parser` doesn't support that
  option and prints one "does not support the `projectService` option" line per
  `.astro` file to stderr. It's harmless noise — the run still exits 0. Filter it
  with `| grep -v 'does not support the .projectService.'` if it's in the way.
- `tina/collections/*.ts` carry `@ts-expect-error wrongly typed tina cms`
  directives. These are load-bearing: TinaCMS's own packages contradict each
  other (`wrapFieldsWithMeta` returns props requiring `form: FormApi`, while the
  `Component` type that `ui.component` must satisfy never passes `form`). Don't
  remove them expecting the code to still compile.

Until this is cleaned up, the practical bar is **no *new* findings in files you
touched**. Delete this section once `pnpm check` is green.

## Done criterion

`pnpm check` exits 0 (all four clean). Report a short summary of what each check
found and what you changed.
