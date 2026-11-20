import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { create, type Font } from 'fontkit'

const FONT_WEIGHT = 800
const TRACKING_EM = -0.02
const MARK_WIDTH_EM = 0.55
const DEFAULT_MAX_FONT_REM = 8
const DEFAULT_REFERENCE_WIDTH_REM = 33
const FONT_DIR = 'node_modules/@fontsource-variable/alegreya/files'
const FONT_FILES = [
  'alegreya-latin-wght-normal.woff2',
  'alegreya-latin-ext-wght-normal.woff2',
] as const

const loadFont = (file: string): Font | undefined => {
  const font = create(readFileSync(join(process.cwd(), FONT_DIR, file)))
  return 'getVariation' in font ? font.getVariation({ wght: FONT_WEIGHT }) : undefined
}

const fonts = FONT_FILES.map(loadFont).filter((font) => font !== undefined)

const getFontIndex = (char: string) =>
  Math.max(
    fonts.findIndex((font) => font.hasGlyphForCodePoint(char.codePointAt(0) ?? 0)),
    0,
  )

const measure = (text: string) => {
  const runs = Array.from(text).reduce<{ fontIndex: number; text: string }[]>(
    (acc, char) => {
      const fontIndex = getFontIndex(char)
      const last = acc.at(-1)
      return last?.fontIndex === fontIndex
        ? [...acc.slice(0, -1), { fontIndex, text: last.text + char }]
        : [...acc, { fontIndex, text: char }]
    },
    [],
  )

  const advance = runs.reduce((total, run) => {
    const font = fonts[run.fontIndex]
    return font
      ? total + font.layout(run.text).advanceWidth / font.unitsPerEm
      : total + run.text.length * 0.5
  }, 0)

  return advance + TRACKING_EM * Array.from(text).length
}

const getCandidates = (title: string) => {
  const words = title.split(' ')
  return [
    [title],
    ...words
      .slice(1)
      .map((_, index) => [
        words.slice(0, index + 1).join(' '),
        words.slice(index + 1).join(' '),
      ]),
  ]
}

const getWidthEm = (lines: string[]) =>
  Math.max(
    ...lines.map((line, index) =>
      index === lines.length - 1 ? measure(line) + MARK_WIDTH_EM : measure(line),
    ),
  )

type TitleFitOptions = {
  maxFontRem?: number
  referenceWidthRem?: number
}

export const getTitleFit = (
  title: string,
  {
    maxFontRem = DEFAULT_MAX_FONT_REM,
    referenceWidthRem = DEFAULT_REFERENCE_WIDTH_REM,
  }: TitleFitOptions = {},
) => {
  const getReferenceSizeRem = (widthEm: number) =>
    Math.min(maxFontRem, referenceWidthRem / widthEm)

  const [best] = getCandidates(title)
    .map((lines) => ({ lines, widthEm: getWidthEm(lines) }))
    .toSorted((a, b) => getReferenceSizeRem(b.widthEm) - getReferenceSizeRem(a.widthEm))

  return best ?? { lines: [title], widthEm: getWidthEm([title]) }
}
