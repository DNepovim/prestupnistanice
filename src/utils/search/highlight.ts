type TextPart = {
  text: string
  match: boolean
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const foldKeepingLength = (text: string) =>
  text
    .split('')
    .map((char) => char.normalize('NFD').charAt(0).toLowerCase())
    .join('')

const findRanges = (folded: string, term: string) =>
  Array.from(folded.matchAll(new RegExp(escapeRegExp(term), 'g')), (found) => {
    const start = found.index
    return { start, end: start + term.length }
  })

export const highlightParts = (text: string, terms: string[]): TextPart[] => {
  const folded = foldKeepingLength(text)
  const ranges = terms.flatMap((term) => findRanges(folded, term))

  return text.split('').reduce<TextPart[]>((parts, char, index) => {
    const match = ranges.some(({ start, end }) => index >= start && index < end)
    const last = parts.at(-1)
    return last?.match === match
      ? [...parts.slice(0, -1), { text: last.text + char, match }]
      : [...parts, { text: char, match }]
  }, [])
}
