const toPlainText = (markdown: string) =>
  markdown.replace(/\]\([^)]*\)/g, '').replace(/[!*_>#`[\]]/g, '')

export const getExcerptText = (markdown: string, maxLength: number) => {
  const firstParagraph = markdown
    .split(/\n\s*\n/)
    .map((paragraph) => toPlainText(paragraph).replace(/\s+/g, ' ').trim())
    .find((paragraph) => paragraph.length > 0)

  if (!firstParagraph || firstParagraph.length <= maxLength) {
    return firstParagraph
  }

  const cut = firstParagraph.slice(0, maxLength)
  const atWordEnd = cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)).trimEnd()
  return `${atWordEnd.replace(/[,.;:–-]$/, '')}…`
}
