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

`.claude/skills/` holds eleven project skills: **`check`** (the static-check suite and how to fix each failure), **`code-guide`** (style and pattern reference — consult before writing or reviewing code), **`design-guide`** (the site's visual language), **`design-variants`** (design a new feature as an Artifact with ten original, configurable variants in the site design), **`commit`** (gate on checks, then Conventional Commit(s) on the current branch), **`ship`** (`commit`, then branch + PR or push to `main`), and five ticket-workflow skills (`ticket-shape`, `ticket-build`, `ticket-review`, `ticket-ship`, `ticket-standup`; see "Pracovní postup s tickety").

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

## Pracovní postup s tickety

Práce se řídí tickety, které jsou **soubory** `.claude/tickets/<id>.md` (gitignorované; epicy `.claude/tickets/epics/<id>.md`). Cairn panel je jen zobrazuje, žádné nástroje ani dialogy nejsou: schvalování a kontrola přechodů jsou **konvence v chatu** a skilly `ticket-*`. Stav ticketu zapisuje jen hlavní chat (Read/Edit), subagenti soubory ticketů nečtou ani nemění.

### Formát ticketu

```
---
id: 6
title: Název
status: building
epic: 1
blocked: false
branch: ticket/6-nazev
worktree: /Users/dominik/projects/knihyps/.claude/worktrees/ticket-6
round: 2
---
## Kontext
(zadání; u queued původní slova uživatele)
## Poznámka
## Náhled
(kde to najít a jak to otestovat, číslované kroky)
## Review
### Kolo 1 · produkt · changes
### Kolo 1 · kód · pass
### Kolo 2 · uživatel · changes
```

Frontmatter jsou jen řádky `klíč: hodnota` (bez uvozovek, prázdná hodnota = klíč vynech). Povinné `id`, `title`, `status`; volitelné `epic`, `blocked`, `branch`, `worktree`, `round`. Nový ticket: `id` = nejvyšší existující + 1, `status: queued`, uživatelova slova do `## Kontext`. `round` je číslo kola buildu: při `ready → building` se nastaví na 0, při každém `building → review` se zvýší o 1.

### Manažerská role hlavního chatu

V hlavním chatu jen řídíš práci, nedělíš ji. Nic, co zabere víc než pár krátkých volání nástrojů (úpravy kódu a obsahu, build, průzkum repa, tvorba návrhů, ověřování, ship), nedělej sám: deleguj to subagentům na pozadí, rozsáhlou práci rozděl mezi víc souběžných agentů, každý s vlastními soubory a společným briefem v souboru. Díky tomu zůstáváš dostupný. Když uživatel napíše během práce agentů, hned mu odpověz a zapiš to; nečekej na agenty, jejich výsledky přijdou jako oznámení. Změny stavu zapisuj do souboru hned, jak nastanou.

### Nové požadavky jdou do backlogu

Každý požadavek od uživatele, i drobný a napsaný mimochodem, zapiš hned jako nový ticket ve stavu `queued` na konec backlogu a **nezačínej na něm pracovat**, dokud uživatel výslovně neřekne, že se do něj máš pustit (např. „pusť se do toho“, „udělej to teď“, „začni“). Po zapsání jen stručně potvrď číslo ticketu. Výjimka: věci zadané výslovně jako akce „teď“.

**Volná kapacita:** když neběží nic, na co se čeká, nebo se jen čeká na subagenty, **vezmi rovnou další ticket z backlogu** v pořadí (epicy mají přednost) a pusť ho do životního cyklu (shaping s průzkumem agentem), bez ptaní. Schvalování zadání a hotové práce zůstává vždy na uživateli.

### Životní cyklus a povolené přechody

`queued → shaping → spec → ready → building → review → accept → shipping → done`

| Z | Smí do | Skill / podmínka |
| :-- | :-- | :-- |
| `queued` | `shaping` | `ticket-shape`, uživatel ticket spustil nebo je volná kapacita |
| `shaping` | `spec`, `queued` | zadání zapsané v `## Kontext` |
| `spec` | `ready`, `shaping` | `ready` jen po odpovědi „schvaluji“ na zadání; jinak zpět s komentářem |
| `ready` | `building`, `shaping` | `ticket-build` (nastaví `round: 0`) |
| `building` | `review`, `shaping` | `review` jen po úspěšném buildu a kontrolách; zvýší `round` |
| `review` | `accept`, `building` | `accept` jen když jsou v `## Review` pro aktuální `round` oba bloky (produkt i kód) `pass`; jinak `building` |
| `accept` | `shipping`, `building` | `shipping` jen s vyplněným `## Náhled` a po odpovědi „schvaluji“ na hotovou implementaci; jinak `building` + blok `· uživatel · changes` |
| `shipping` | `done`, `building` | `ticket-ship`; konflikt nebo selhání kontrol vrací do `building` |
| `done` | nic | |

Před každou změnou `status:` ověř, že přechod v tabulce je (nic se to nevynucuje automaticky, hlídáš to ty). `blocked: true` nastav, když práce stojí na rozhodnutí uživatele (důvod do `## Poznámka`); stav se tím nemění.

Skilly: `ticket-shape` (queued → spec → ready), `ticket-build` (ready/building → review), `ticket-review` (review → accept/building, příprava schválení), `ticket-ship` (shipping → done), `ticket-standup` (přehled). Nejsou to skilly `commit` a `ship` projektu; ty slouží k ručnímu commitu a PR.

### Schvalování

Uživatel schvaluje třikrát a vždy **dotazem v chatu** (`AskUserQuestion` s volbami „Schvaluji“ / „Upravit“, nebo prostý text). Ticket se posune až po jeho jednoznačné odpovědi „schvaluji“; mlčení, mezitímní zpráva ani nejasná odpověď schválením není a za uživatele nikdy neschvaluj.

1. **Zadání** (`spec → ready`): ukaž celé zadání přehledně naformátované (nadpisy, číslovaný seznam kritérií), ne surový text souboru.
2. **Design** (výběr varianty při shapování): nejdřív publikuj návrhy jako artefakt a dej odkaz, nikdy je nepopisuj jen slovy.
3. **Hotová implementace** (`accept → shipping`): nejdřív věc rozjeď (u vizuální změny `pnpm exec astro dev` ve worktree ticketu na volném portu na pozadí, ověř `curl`em) a zapiš do ticketu `## Náhled`. Bez vyplněného `## Náhled` se do `shipping` nejde.

U každé žádosti o schválení **nejdřív výslovně napiš, co se schvaluje**: zadání ticketu, design (výběr varianty), nebo hotová implementace; tyto tři věci nikdy nemíchej. Vždy uveď **kde to uživatel najde** (konkrétní adresy, soubory, `.claude/tickets/<id>.md`) a **jak to otestovat** (číslované kroky, co má vidět). Práci neověřuj v prohlížeči, pokud o to uživatel výslovně nepožádá (výjimka: příprava náhledu ke schválení výše).

Vrácení: u zadání `shaping` + komentář do `## Poznámka`; u implementace `building` + komentář doslova jako blok `### Kolo N · uživatel · changes` v `## Review`.

### Hlavní větev projektu (dočasné pravidlo)

**Dočasně je hlavní větev projektu lokální větev `feat/book-detail-print-design`, ne `main`** (print redesign, nemá remote, na kterém stojí košík a další práce). Dokud pravidlo platí, je tato větev **základem i cílem všeho**: builder zakládá větev ticketu a worktree z ní, reviewer porovnává diff proti ní, `ticket-ship` ji posune fast-forwardem v hlavním checkoutu, je-li čistý (jinak to ohlásí), bez pushe. **Nikdy nepushuj do `main` ani `origin/main` a nezakládej z nich větve**, pokud uživatel výslovně neřekne jinak.

Jak pravidlo změnit: uživatel řekne „hlavní větev je zase main“ (nebo jinou větev). Pak v této sekci nahraď název větve `feat/book-detail-print-design` novým (u `main`: odstraň celý oddíl a skilly se vrátí k defaultu `origin/main` + push do `main`) a řekni to v chatu. Pravidlo se mění jen na výslovný pokyn uživatele.

### Předávání do subagentů

Subagenti o pravidlech nevědí. **Do každého promptu** buildera, reviewerů a shippera výslovně dej **základní větev a cíl** (včetně zákazu `origin/main`, platí-li dočasné pravidlo).

**Izolace kontextu:** každý subagent dostane jen zadání, odkaz na práci (větev, worktree, základ) a případně připomínky; nikdy ne úvahy nebo shrnutí jiného agenta. Reviewerům nepředávej výstup buildera ani druhého reviewera (ve druhém kole jen jejich vlastní předchozí připomínky), builderovi jen číslovaný seznam připomínek.

**Přiřazení agenta k ticketu:** `description` každého subagenta začíná `#<id> ` (např. `#5 Build: Přidat do košíku`), aby ho cairn panel přiřadil k ticketu.

Agenti (`.claude/agents/`): `ticket-builder`, `ticket-product-reviewer`, `ticket-code-reviewer`, `ticket-designer`, `ticket-shipper`.

### Hotová schválená práce

Žádné MR: schválená práce jde rovnou do hlavní větev projektu (viz výše; po ukončení dočasného pravidla do `main`). Podrobnosti v `ticket-ship`.
