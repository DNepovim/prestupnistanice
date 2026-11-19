import { isNonEmptyArray } from 'narrowland'

import { SEARCH_CATEGORY_KEYS } from './categories'
import type { SearchBook, SearchCategoryKey } from './types'

type BarGroup = {
  category: SearchCategoryKey
  books: SearchBook[]
  startColumn: number
  endColumn: number
}

type BarSegment = {
  book: SearchBook
  column: number
}

type BarLayout = {
  segments: BarSegment[]
  groups: BarGroup[]
  columns: string
  totalColumns: number
}

type CardPlacement = {
  start: number
  end: number
  side: 'left' | 'right'
}

const GROUP_GAP = '0.5rem'

const byYearThenTitle = (a: SearchBook, b: SearchBook) =>
  a.year - b.year || a.title.localeCompare(b.title, 'cs')

type Placement = {
  groups: BarGroup[]
  consumed: number
}

export const createBarLayout = (books: SearchBook[]): BarLayout => {
  const { groups } = SEARCH_CATEGORY_KEYS.map((category) => ({
    category,
    books: books.filter((book) => book.category === category).toSorted(byYearThenTitle),
  }))
    .filter((group) => isNonEmptyArray(group.books))
    .reduce<Placement>(
      ({ groups: placed, consumed }, group, index) => {
        const startColumn = consumed + index + 1
        return {
          groups: [
            ...placed,
            { ...group, startColumn, endColumn: startColumn + group.books.length },
          ],
          consumed: consumed + group.books.length,
        }
      },
      { groups: [], consumed: 0 },
    )

  return {
    groups,
    segments: groups.flatMap((group) =>
      group.books.map((book, offset) => ({ book, column: group.startColumn + offset })),
    ),
    columns: groups
      .map((group) => `repeat(${String(group.books.length)},minmax(0,1fr))`)
      .join(` ${GROUP_GAP} `),
    totalColumns: (groups.at(-1)?.endColumn ?? 1) - 1,
  }
}

export const getCardPlacement = (
  columns: number[],
  totalColumns: number,
): CardPlacement | undefined => {
  if (!isNonEmptyArray(columns)) {
    return undefined
  }
  const start = Math.min(...columns)
  const end = Math.max(...columns) + 1
  return {
    start,
    end,
    side: (start + end - 1) / 2 < (totalColumns + 1) / 2 ? 'left' : 'right',
  }
}
