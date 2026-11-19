---
name: design-guide
description: Design system and visual language of the knihyps site, derived from the book detail page — the "print proof" metaphor (sheets with crop marks, registration marks, colour bars, non-printing characters), paper texture, typography roles, per-book colour theming, spacing and layout patterns. Consult when designing or restyling any page or component so it feels like the same publication.
---

# Design Guide

The visual language of **Přestupní stanice**, as established by the book detail
page (`src/components/BookDetail.astro`). Use it when building or restyling UI so
new work reads as part of the same system. For code-level conventions (Tailwind,
Astro, no comments) see the `code-guide` skill; this one covers *what it should
look like and why*.

## Concept: the page is a print proof

A book page is presented as the publisher's **prepress proof**: content lives on
trimmed sheets surrounded by the marks a printer uses. It signals craft and
shows the publisher's job (typesetting, paper, print) without explaining it.

Every decorative element should be traceable to something real in book
production. Do not add ornament that has no print analogue.

| Print artefact | Where it appears | Component |
| :-- | :-- | :-- |
| Crop (trim) marks | Corners of a sheet | `PrintSheet` (`edge`) |
| Cut line between sheets | Short hairline ticks at the sides between stacked sheets | `PrintSheet` (`EDGE_HAS_CUT`) |
| Registration target | Mid-edge circle + cross | `PrintSheet` (`regs`) |
| File slug / job name | Tiny caps above the sheet's top edge | `PrintSheet` (`slug`) |
| Slug in the margin (vertical) | Book facts down the left edge | `PrintSheet` (`sideSlug`) |
| Colour bar | Gradient strip from the book's two colours | `ColorBar` |
| CMYK control strip | 11 swatches (CMYK, tints, grey) | `CmykBar` |
| Bleed | Hero image oversized by 3 mm behind the trim | `BookDetail` hero |
| Non-printing characters | `¶` after paragraphs/claim, `⇥` indent, `↵` after the title | `Markdown showMarks`, `NON_PRINTING_MARK` |
| Dimension callouts | Trim size measured around a cover thumbnail | `BookMeta` |
| Barcode | ISBN | `Barcode` |
| Index / contents list | Numbered dotted-rule rows | `BooksIndex` |

Marks are always **quiet**: `text-brand-first-300/60` for lines, `opacity-50` for
bars, `text-brand-first-700/45` for non-printing characters, all
`aria-hidden="true"` and `pointer-events-none`. They frame the content; they
never compete with it.

## Page structure

- Background is warm **paper**: `--color-paper` (`#fcf9f2`) with a fixed,
  two-layer SVG noise texture (`--paper-image` in `global.css`). Use
  `bg-paper` / `bg-paper-fixed`; never pure white or flat grey for page ground.
- Content is a vertical stack of **sheets** inside `PrintSheet` — a centred
  column, `max-w-[64rem]`, side padding `5rem` (`9` on mobile) so marks have
  room in the margin.
- Each sheet gets an `edge` computed from its position in the stack
  (`first` / `middle` / `last` / `only`): top corners only on the first,
  bottom corners only on the last, a cut line between neighbours, larger
  bottom margin on the last. Compute edges from the list of sheets that are
  actually rendered (`sheetKeys` → `getEdge`) — optional sheets must not leave
  orphaned marks.
- One concern per sheet: hero, text, sample, gallery, meta/crew, other books by
  author, other books in category. Order runs from emotional (cover, claim) to
  factual (specs, credits) to navigational (more books).
- Sheet inner padding: `px-[0.9rem] py-[2.2rem]`, growing to
  `min-md:px-[2.6rem] min-md:py-[2.5rem]`. Keep it identical across sheets.
- Main text sheet: two columns on `min-md` — text (`minmax(0,1fr)`) plus a
  sticky `aside` (`10rem`, `15.5rem` on `min-lg`) holding the cover, colour bar
  and purchase block. On mobile the aside collapses into the flow.
- When the hero image exists, the aside cover is hidden until the hero scrolls
  away, then reveals (`data-reveal-on-stick`). Don't show the same image twice
  at once.

## Colour

- **Brand scale, not hex.** Each book supplies `color` and `bgColor`;
  `getColorScale` expands each into a 50–950 scale, exposed as
  `brand-first-*` / `brand-second-*`. Always style with those tokens so a page
  re-themes automatically (`Theme.astro` re-scopes them for a subtree).
- **Book detail keeps the hue** (`<Layout keepHue>`); the rest of the site
  defaults to the greyscale variant of the scale. A new page that should feel
  monochrome must *not* pass `keepHue`.
- Scales are darkened until the base reaches **4.6:1 contrast** — so
  `brand-first-500` is always safe for text on paper. Don't lighten it.

| Role | Token |
| :-- | :-- |
| Title, drop caps, links, accents | `brand-first-500` |
| Small labels, metadata, quiet text | `brand-first-700` |
| Buttons | `bg-brand-first-700` → `hover:bg-brand-first-800`, `text-white` |
| Crop/registration/hairlines | `brand-first-300` at 60 % |
| Dimension lines, connectors | `brand-first-500` |
| Selection, secondary highlights | `brand-second-*` |
| Body text | `text-gray-900` (sheet), headings/bylines `text-gray-800` |
| Prices, strongest figures | `text-black` |
| Hover tint on rows | `color-mix(in srgb, var(--c1) 9%, transparent)` from the book's colour |

Raw hex is allowed only where it is the literal subject: the CMYK swatches and
the fallback colours in `src/consts.ts`.

## Typography

Three families, each with a fixed job (tokens in `global.css`):

| Token | Family | Use |
| :-- | :-- | :-- |
| `font-head` | Alegreya Variable (serif) | Titles, headings, prices, index numbers — always `font-extrabold`, tight leading (`1.04`–`1.12`) |
| `font-alt` | Montserrat Alternates | Labels, bylines, claims, `em`/`strong`, link text, UI chrome |
| `font-display` | Montserrat | Body default on `<body>` |

Patterns:

- **Title** (`h1`): `font-head`, `brand-first-500`, `font-extrabold`,
  `tracking-[-0.02em]`, size fitted to the container with
  `getTitleFit` → `font-size: min(8rem, 100cqw / title-width)`; lines are
  `block whitespace-nowrap`, header is a `[container-type:inline-size]`. The
  title ends with a `↵` non-printing mark.
- **Section label / kicker**: `font-alt`, `text-[0.7rem]` (or `0.62rem` for
  micro-labels), `leading-none`/`1.2`, `tracking-[0.1em]`, `uppercase`,
  `brand-first-700`. Used for category, "Recenze", "Ukázka z knihy", `dt`s.
- **Byline / authors**: `font-alt italic`, `1.2rem` → `1.4rem` → `1.6rem` by
  breakpoint, `text-gray-800`, hover to black.
- **Claim**: `font-alt italic`, `1rem`/`1.15rem`, `leading-[1.45]`, with a
  floated **drop cap** (`first-letter`: `3.1em`, `brand-first-500`, bold,
  not italic, `leading-[0.82]`), followed by `¶`.
- **Body**: `1rem`, `leading-[1.6]`, **justified** with `hyphens-auto`;
  paragraphs `mb-[0.7em]` and marked with `⇥` / `¶` on the book page
  (`showMarks`). Elsewhere: `indent-12`, `mb-6`, class `hyphenate`.
- **Numerals**: `oldstyle-nums` in running/heading context (index numbers),
  `lining-nums` for data (prices, years, pages, ISBN).
- Base `html` size is `18px`; sizes are in `rem`, micro-type never below
  `0.55rem`.
- All Czech copy goes through `tp()` (typopo) — non-breaking spaces after
  one-letter prepositions, proper quotes and dashes. Hyphenation via
  `Hyphenopoly` on `.hyphenate`.

## Imagery

- Covers sit on paper with a soft drop shadow
  (`shadow-[0_0.3rem_1.4rem_rgba(0,0,0,0.18)]`, `0.2rem 0.9rem` for small
  ones). No borders, no rounded corners — books are rectangles.
- Keep each cover's true **aspect ratio** (`style="aspect-ratio:w/h"`).
- Hero is `aspect-[5/2]`, oversized by `3mm` on each side (bleed) with
  `object-cover`; colour and CMYK bars hang below it.
- Portraits are small, square-ish and revealed to full colour on hover
  (`Portrait revealOnHover`). Author photos float in on hover of the name
  (`FloatingImage`); book covers float in on hover of index rows
  (`data-preview` + `LinkPreviewScript`).
- Radii: effectively none. Squared corners everywhere except the circular
  registration target and the dot terminals on dimension callouts.

## Spacing and rhythm

- Vertical rhythm is rem-based and generous: `mt-10`/`mt-12` between blocks
  inside a sheet, `gap-8` between author blocks, `mb-7`/`mb-8` after a
  heading/label.
- Sheets are separated by `mb-16` (`mb-24` after the last), measured from the
  trim, so marks and the colour bar fit between.
- Column gutter in the text sheet is `2.6rem`; in meta it is `--kg: 1rem`
  growing to `2.6rem`.
- Use **fixed hairlines** (`border-t`, `border-dashed` with
  `border-brand-first-300/60`) rather than boxes or cards to organise content.

## Components and idioms

- **Index row** (`BooksIndex`): dashed top/bottom rules, three columns
  `[2.4rem _ 1fr _ auto]`; right-aligned oldstyle order number, title in
  `font-head`, author in `font-alt italic`, date as a small uppercase label,
  price and buy action stacked to the right. The whole row is the link
  (`after:absolute after:inset-0`), hover tints the row and the title with the
  book colour; secondary links sit above with `relative z-10`.
- **Contact sheet** (`BooksContactSheet`): 12-column grid with faint column
  guides (`bg-brand-second-200/12`); on hover a cover gets a selection frame
  with eight handles, long crosshair guides and a `W × H mm` tag — the
  designer's-tool view of a book.
- **Meta / callouts** (`BookMeta`): a trim-size-accurate cover thumbnail with
  dimension brackets, and a `dl` whose entries connect to the cover with a
  hairline ending in a dot. Label above value, label in micro-caps.
- **Crew list** (`BookCrew`): small portraits joined by a vertical hairline,
  role in `font-alt` above the name.
- **Buttons**: solid `brand-first-700`, white `text-sm font-semibold`,
  `tracking-[0.03em]`, `px-5 py-3`, square, only a colour transition on hover.
  Secondary actions are plain underlined links in `text-[0.7rem]`.
- **Links** in prose: `font-alt`, `brand-first-500`, transparent bottom border
  that turns `brand-second-500` on hover.
- **Tooltips / info icons**: Phosphor (`ph:*`) in `brand-first-700`, `size-4`.

## Motion

Restrained and purposeful: opacity and small transforms only
(`animate-*-on-load` utilities, 0.6–0.8 s ease-out), `transition-colors` on
links, a `duration-500` grid-rows/opacity reveal for the sticky cover. Always
honour reduced motion (`motion-reduce:transition-none`). No parallax, no
bouncing, no looping animation.

## Responsive

- Breakpoints: Tailwind's `min-md` / `min-lg` (mobile-first), plus `xs` = 30 rem.
  Prefer `max-md:` only for the few mobile-only exceptions.
- Mobile keeps the print language but trims it: marginal `sideSlug` is hidden
  (`hidden min-md:block`), padding drops to `0.9rem`/`2.2rem`, ISBN barcode
  moves below the meta grid, columns collapse to one.
- Layouts must stay readable at 320 px; marks live in the page margin
  (`px-9` minimum) so nothing is clipped by the viewport.

## Accessibility

- All print marks and non-printing characters are `aria-hidden="true"`.
- Brand scale guarantees ≥ 4.6:1 for `*-500` and darker on paper; never put
  `*-300` or lighter text on paper except in decorative marks.
- External links: `target="_blank"` with `rel="noopener"` and a
  `<span class="sr-only">(otevře se v novém okně)</span>`.
- Visible focus: `focus-visible:outline-2` using the book colour; the skip
  link (`#obsah`) in `Layout` must stay.
- Respect `prefers-reduced-motion`.

## Do / Don't

**Do**

- Derive new sections from a print or editorial artefact (proof, imposition,
  colophon, index, errata) before inventing a new visual.
- Reuse `PrintSheet`, `ColorBar`, `Theme`, `BooksIndex` etc. instead of
  re-implementing marks.
- Let the book's colours do the work; keep everything else paper, black and
  grey.
- Keep micro-typography tidy: caps labels with tracking, lining numerals for
  data, `tp()` on all copy.

**Don't**

- No rounded corners, cards with shadows, gradients over text, glassmorphism,
  emoji, or stock icons beyond Phosphor accents.
- No pure white backgrounds; no hardcoded hex outside the CMYK strip and
  `consts.ts` fallbacks.
- No decorative marks that carry meaning or are focusable.
- Don't mix the roles of the three typefaces (serif only for display/headings,
  never for labels; Montserrat Alternates never for long body copy).
- Don't stack more than the necessary marks on one sheet — one or two `regs`
  at most.
