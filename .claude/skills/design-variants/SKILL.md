---
name: design-variants
description: Design a new feature, component or page of the knihyps site as an Artifact with ten original, switchable variants in the real site design (paper background, print-sheet layout, site fonts and tokens), using real content and every state. Use when asked to redesign, propose, prototype or "show me options" for a UI element before it is built in code.
---

# Design variants

The count (ten) and the layout are defaults. When the user says to keep some
variants and add others, or to keep the current layout (for example one item per
row), follow that: keep the chosen variants unchanged and add only the requested
new ones, in the layout asked for.

Produces **one Artifact with ten configurable, original design variants** of a
feature, built in the real visual language of the site. The user picks a
direction here; only then is it written as Astro/Svelte code (`code-guide`).

Always read the **`design-guide`** skill first. It is the design system. This
skill is the process for turning it into ten proposals.

## The brief this skill encodes

1. **Ten variants**, not three. Each must be a different idea, not a restyle.
2. **Original, not banal.** Do not ship the first solution that comes to mind.
   Surprise the user. Clarity comes first, but a distinctive design is the goal.
3. **Looks like the real site, full screen.** The artifact is a whole page, not a
   demo document: the real header and footer, the real page title and category
   navigation, full viewport height. Nothing explanatory sits in the page itself.
4. **In the site's design.** Start from the existing colours, fonts and
   elements. Extending or changing them is welcome, always inside the layout
   and visual style of the site.
5. **Real data and real images.** Never lorem ipsum, never stock covers.
6. **Every piece of current information** of the feature is present in every
   variant. Removing information to make a variant look cleaner is a bug.
7. **Configurable.** The user switches variants, states and sample data inside
   the page, and tries each variant with different content.
8. **Edge cases are test data**, picked on purpose (see step 2).

## Process

### 1. Read the real thing

- The current component(s) and every place the feature appears (`src/components/`,
  `src/pages/`). Note where two components do the same job.
- `src/styles/global.css` (paper texture, `@theme` tokens), `Header.astro`,
  `Footer.astro`, `PageTitle.astro`, `Section.astro`, `PrintSheet.astro`, the
  page the feature lives on (for the book list: `BooksList.astro`, with its
  category navigation and counts), `consts.ts`, `routes.ts`.
- The content schemas (`src/content.config.ts`) and a few real entries. List
  **every field** the feature shows, and every state it has (for a book: stock,
  Kosmas only, unavailable, upcoming; missing claim; missing price).

### 2. Pick the cast

Choose six or more real entries so that, together, they cover:

- a very long and a very short title (title fitting breaks first)
- one author and two authors (and one author without a portrait)
- every availability or status state, without forcing it
- a long and a missing optional text (claim)
- different aspect ratios (a landscape cover is a good stress test)
- light, dark and saturated brand colours

Resize images and portraits to small JPEGs (`sips -s format jpeg --resampleHeight 520`,
portraits 160 px wide) and embed them as `data:` URIs. Artifact CSP blocks any
other image source. Keep the page under 16 MB. `build-data.example.py` shows the
embedding step and the data shape.

### 3. Find ten ideas before drawing any

Write the ten concepts down first (name plus one-sentence print or editorial
analogue). Reject any that look like another on the list or that a generic UI
kit would produce (plain card with shadow, left image and right text, badge
chips, gradient hero).

Every concept must come from the world of **publishing and print production**:
prepress job sheets, colour control strips, colour separations and
misregistration, imposition and signatures, rulers and typometers, proofs,
colophons, library catalogue cards, annotated drawings. That is the site's
identity (see "print proof" in `design-guide`). **Do not use railway, station,
train or ticket motifs**, even though the publisher is called "Přestupní
stanice". The user rejected that direction. Ideas that worked: anatomy drawing
with dimension lines, title-page typesetting fitted to column width, job sheet
with check boxes for availability, 11-step tint strip per row, typometer
timeline of publication years, page count drawn as 16-page signatures, CMY
plates that snap into register on hover.

Vary the **structure** across the ten (portrait, landscape, list row, wide
strip, overlapping, 3D), not only the decoration. At least two should be bold
risks; at least two should be quiet and maximally scannable.

### 4. Build the page from the scaffold

Copy `scaffold.html` and replace `__BOOKS__` with the data JSON
(`build-data.example.py`). It already contains the site shell. Replace the
`VARIANTS` array with the new feature's variants; keep the shell.

The scaffold provides:

- the real site paper (both `--paper-image` layers, fixed) as body background
- the **page frame**, reproduced from the real components: sticky header
  (brand in Alegreya, nav with hairline separators, search, fades out on
  scroll), `PageTitle`-style `h1` with gradient underline, category navigation
  with the real counts, and the **real footer** (dark brand block, corner marks,
  newsletter sentence with inline input, Obsah / Kontakty / Tiráž columns,
  outlined wordmark). Layout is a flex column with `min-height:100vh`, so the
  footer sits at the bottom of the screen. Links go nowhere (`href="#"`).
- the white **print sheet** (`max-w 64rem`, `5rem` side padding, crop marks,
  two registration marks, slug above, vertical side slug) wrapping the active
  variant, exactly like `PrintSheet.astro`
- two sheet modes: all entries inside one print sheet (default), or
  `sheets:true` on a variant for **one sheet per entry** with its own crop marks,
  cut lines between sheets, a right registration mark, a top slug (order, title,
  authors) and a vertical side slug (year, category), as on the real book list
- a **design panel**, a dark sticky bar at the bottom of the screen that is
  clearly not part of the site: variant switcher (hash routed `#v1`…), one-line
  description of the current variant, state switcher (real data / each forced
  state), entry chips to show or hide cast members, a working cart counter as
  an example interaction, and a button that collapses it. It sits after the
  footer with `position:sticky; bottom:0`, so it never covers the footer.
- per-entry colour tokens computed in JS: `--c1`/`--c2` (book colours), `--c5`
  (the first colour darkened until it has ≥4.6:1 contrast on paper), `--on2`
  (black or white text on the second colour), `--ar` (cover aspect ratio)
- helpers: `tp()` (Czech non-breaking spaces), authors with hover portrait
  (`FloatingImage` behaviour), the site's `ArrowLink` effect (`.al`), buttons in
  the site style, title fitting by canvas measurement
- container queries on every card, so a card adapts to its column

When the feature is not the book list, swap the page title, category
navigation and sheet content for what the real page has, but keep header,
footer and the panel exactly as they are.

Variant card CSS is namespaced `.v1-…`, `.v2-…` and so on. Cards get
`container-type:inline-size`.

### 5. Rules for the design itself

- **No explanatory UI on the page.** Variant names, notes and caveats go into the
  design panel only. The page area must read as the live site.
- **Single light theme.** The site has no dark mode. Do not add one. Tokens still
  live on `:root`; `body` keeps an explicit paper background.
- **Fonts**: Alegreya (`--head`, extrabold titles, prices), Montserrat Alternates
  (`--alt`, labels, authors, claims, links), Montserrat (`--body`). Handwriting
  (Caveat) is allowed only for deliberate proof-reader annotations.
- **Colour** only from the book's own tokens plus paper, white and black. No raw
  extra hex, apart from physical subjects (film base, swatch values).
- **Text is black on white or paper; all headings are black.** No shades of grey
  for text (no `--muted`-style greys, no alpha or `opacity` on informative text).
  Grey only for decoration without information (hairlines, crop marks, frames).
  Book colours go on backgrounds and accents where contrast holds; text on them
  is black or white, whichever contrasts more (`--on2`).
- **Accessibility is mandatory**: WCAG AA (4.5:1 for text, 3:1 for large text and
  UI parts), visible `:focus-visible`, keyboard operation, `prefers-reduced-motion`
  for every animation, semantic HTML with meaningful ARIA, touch targets of at
  least 24 px (44 px preferred on mobile), meaning never by colour alone.
- **Shape**: squared corners. Circles only for registration targets, punched
  holes, stickers and similar physical objects.
- **Print marks stay quiet and `aria-hidden`.** They never carry information.
- **Buttons and links** exactly as in `design-guide`: solid `brand-first-700`
  buttons, `ArrowLink` for the single CTA style. Do not invent another hover.
- The whole card is clickable via a stretched title link; author links, the
  cart button and the Kosmas link sit above it (`z-index`).
- **No invented data.** If a sample value is needed (a price the entry lacks),
  say so in the page footnote. Absence is handled by the design, not filled.
- Copy is Czech and goes through `tp()`.

### 6. Check once, publish

- Syntax-check the script (`node --check`) after extracting it from the HTML.
- **Check contrast and accessibility of every variant**: text against its
  background (including text on book colours across the whole cast, light, dark
  and saturated), focus visibility, keyboard reachability, reduced motion, touch
  targets, headings black, no grey informative text. Fix what fails; list any
  unresolved spots per variant in the reply.
- Take one look at the rendered page if a browser is available (chrome-devtools
  MCP, desktop and a 400 px viewport). If none is available, say that the page
  was not visually checked.
- Publish with the Artifact tool, `icon` on first publish. Update the same URL
  on later rounds (publish with the same `file_path`, or `edits`).
- Do not commit scaffold output or images to the repo.

Then in the reply: link, the ten names in one line each, what to look at first,
anything unverified, and the unresolved contrast or accessibility spots per variant. Do not describe hex values or font names.

## Pitfalls already met

- Dark mode and system-dark viewers: the first version showed dark paper because
  of an invented `prefers-color-scheme` block. Never add one.
- Sheet width is `64rem` minus `10rem` padding, so cards live in about `49rem`.
  Choose grid minimums so two or three columns really fit, and choose container
  query thresholds against that, not against the viewport.
- Knock-outs (holes, dog-ears, dimension labels) must use the **sheet** colour
  (white), not the page colour.
- `mask` on an element removes its border and `box-shadow`. Put the shadow on a
  wrapper with `filter: drop-shadow`.
- Fit titles only after `document.fonts.ready` and again on resize.
- `-webkit-line-clamp` for long claims; keep the full text in a `title`
  attribute so nothing is lost.
- `aspect-ratio` plus `height:min(var(--h), calc(var(--maxw)/var(--ar)))` keeps
  portrait and landscape covers inside the same slot.
- Hash routing in Artifacts: only plain `#name` values (`#v3`), never `#/path`.
- Artifact CSP blocks anything but Google Fonts CSS, listed CDNs and `data:`.
- Page frame first: an artifact that opens with an intro, titles and a toolbar looks
  like a demo. Reproduce header, title and footer from the real components and
  put all tooling into the bottom panel.
- When deleting CSS ranges while patching the scaffold, re-check small shared
  rules (`.row`) that sat between the deleted blocks.
