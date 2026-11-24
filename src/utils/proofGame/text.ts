import { isOneOf } from 'narrowland'

import { tp } from '@/utils/tp'

import {
  PROOF_DECOY_DEFINITIONS,
  PROOF_ERROR_DEFINITIONS,
  PROOF_FIRST_PAGE_NUMBER,
  PROOF_SOURCE,
} from './source'

const NON_BREAKING_SPACE = ' '
const SINGLE_LETTER_WORD = /^[ksvzouai]$/i
const MARKED_RANGE = /(⟦[ed]\d+\|[^⟧]*⟧)/
const MARKED_RANGE_PARTS = /^⟦([ed]\d+)\|([^⟧]*)⟧$/

const LINE_KINDS = ['h', 'g', 'f', 'm', 'e', 'u'] as const

export type LineKind = (typeof LINE_KINDS)[number]

export type Word = {
  index: number
  line: number
  text: string
  recordId: string
  separator: string
  isGap: boolean
  isOnRight: boolean
}

export type Line = {
  number: number
  kind: LineKind
  words: readonly Word[]
}

type Page = {
  number: number
  lines: readonly Line[]
}

export type ProofRecord = {
  id: string
  kind: 'error' | 'decoy'
  tag: string
  description: string
  area: readonly number[]
}

type Char = { char: string; recordId: string }

type Draft = Pick<Word, 'text' | 'recordId' | 'separator' | 'isGap'>

type Tokenizer = { drafts: readonly Draft[]; current: Draft | null }

const isSeparator = (char: string) => isOneOf(char, [' ', '~', NON_BREAKING_SPACE])

const toChars = (raw: string): readonly Char[] =>
  raw.split(MARKED_RANGE).flatMap((part) => {
    const marked = MARKED_RANGE_PARTS.exec(part)
    return Array.from(marked?.[2] ?? part).map((char) => ({
      char,
      recordId: marked?.[1] ?? '',
    }))
  })

const feed = ({ drafts, current }: Tokenizer, { char, recordId }: Char): Tokenizer => {
  if (!isSeparator(char)) {
    return {
      drafts,
      current: current
        ? { ...current, text: current.text + char }
        : { text: char, recordId, separator: '', isGap: false },
    }
  }
  const separator = char === '~' ? NON_BREAKING_SPACE : char
  return {
    drafts: [
      ...drafts,
      current
        ? { ...current, separator }
        : { text: '', recordId, separator, isGap: true },
    ],
    current: null,
  }
}

const glueSingleLetter = (draft: Draft): Draft =>
  !draft.isGap && draft.separator === ' ' && SINGLE_LETTER_WORD.test(draft.text)
    ? { ...draft, separator: NON_BREAKING_SPACE }
    : draft

const toDrafts = (raw: string): readonly Draft[] => {
  const { drafts, current } = toChars(raw).reduce<Tokenizer>(feed, {
    drafts: [],
    current: null,
  })
  return [...drafts, ...(current ? [current] : [])].map(glueSingleLetter)
}

const toLineKind = (char: string): LineKind => (isOneOf(char, LINE_KINDS) ? char : 'm')

const sourceLines = PROOF_SOURCE.flatMap((page, pageIndex) =>
  page.map((raw) => {
    const kind = toLineKind(raw.charAt(0))
    return {
      pageIndex,
      kind,
      drafts: kind === 'g' ? [] : toDrafts(raw.slice(2)),
    }
  }),
)

export const PROOF_WORDS: readonly Word[] = sourceLines
  .flatMap((line, lineNumber) =>
    line.drafts.map((draft, position) => ({
      ...draft,
      line: lineNumber,
      isOnRight: position / line.drafts.length > 0.55,
    })),
  )
  .map((word, index) => ({ ...word, index }))

const PROOF_LINES: readonly Line[] = sourceLines.map((line, number) => ({
  number,
  kind: line.kind,
  words: PROOF_WORDS.filter((word) => word.line === number),
}))

export const PROOF_PAGES: readonly Page[] = PROOF_SOURCE.map((_page, pageIndex) => ({
  number: PROOF_FIRST_PAGE_NUMBER + pageIndex,
  lines: PROOF_LINES.filter((line) => sourceLines[line.number]?.pageIndex === pageIndex),
}))

export const getLine = (number: number) => PROOF_LINES[number]

const toRecord =
  (kind: ProofRecord['kind']) =>
  (definition: { id: string; tag: string; description: string }): ProofRecord => ({
    id: definition.id,
    kind,
    tag: tp(definition.tag),
    description: tp(definition.description),
    area: PROOF_WORDS.filter((word) => word.recordId === definition.id).map(
      (word) => word.index,
    ),
  })

export const PROOF_ERRORS = PROOF_ERROR_DEFINITIONS.map(toRecord('error'))

export const PROOF_DECOYS = PROOF_DECOY_DEFINITIONS.map(toRecord('decoy'))

export const PROOF_RECORDS: ReadonlyMap<string, ProofRecord> = new Map(
  [...PROOF_ERRORS, ...PROOF_DECOYS].map((record) => [record.id, record]),
)

export const splitOddGlyph = (text: string) => {
  const [before = text, glyph = '', after = ''] = text.split('*')
  return glyph.length === 1
    ? { before, glyph, after }
    : { before: text, glyph: '', after: '' }
}
