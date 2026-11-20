export type SheetEdge = 'first' | 'middle' | 'last' | 'only'

export const getSheetEdge = (index: number, total: number): SheetEdge => {
  if (total === 1) {
    return 'only'
  }
  if (index === 0) {
    return 'first'
  }
  return index === total - 1 ? 'last' : 'middle'
}
