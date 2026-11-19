import Fuse from 'fuse.js'
import { isNonEmptyArray } from 'narrowland'

import { CATEGORY_ALIASES, SEARCH_CATEGORY_KEYS } from './categories'
import { normalizeText } from './normalizeText'
import type {
  SearchAuthor,
  SearchBook,
  SearchCategoryKey,
  SearchEntity,
  SearchIndex,
  SearchResult,
} from './types'

const MIN_ALIAS_LENGTH = 3
const FILLER_WORD = 'pro'

const FUSE_OPTIONS = {
  ignoreDiacritics: true,
  ignoreLocation: true,
  threshold: 0.3,
} as const

const tokenize = (query: string) =>
  normalizeText(query)
    .split(/\s+/)
    .filter((token) => token.length > 0)

const matchesCategory = (token: string, key: SearchCategoryKey) =>
  token.length >= MIN_ALIAS_LENGTH &&
  token !== FILLER_WORD &&
  CATEGORY_ALIASES[key].some((alias) => alias.startsWith(token))

const parseQuery = (query: string, activeCategory: SearchCategoryKey | null) => {
  const tokens = tokenize(query)
  const categories: SearchCategoryKey[] = activeCategory
    ? []
    : SEARCH_CATEGORY_KEYS.filter((key) =>
        tokens.some((token) => matchesCategory(token, key)),
      )
  const terms = tokens.filter(
    (token) =>
      !categories.some((key) => matchesCategory(token, key)) &&
      !(token === FILLER_WORD && isNonEmptyArray(categories)),
  )
  return { categories, terms }
}

const categoryEntity = (key: SearchCategoryKey): SearchEntity => ({
  id: `category-${key}`,
  kind: 'category',
  key,
})

const authorEntity = (author: SearchAuthor): SearchEntity => ({
  id: `author-${author.slug}`,
  kind: 'author',
  author,
})

const bookEntity = (book: SearchBook, indented: boolean): SearchEntity => ({
  id: `book-${book.slug}`,
  kind: 'book',
  book,
  indented,
})

type AuthorBlocks = {
  entities: SearchEntity[]
  placed: ReadonlySet<string>
}

const groupBooksUnderAuthors = (
  authors: SearchAuthor[],
  books: SearchBook[],
): AuthorBlocks =>
  authors.reduce<AuthorBlocks>(
    (blocks, author) => {
      const own = books.filter(
        (book) => book.authorSlugs.includes(author.slug) && !blocks.placed.has(book.slug),
      )
      return {
        entities: [
          ...blocks.entities,
          authorEntity(author),
          ...own.map((book) => bookEntity(book, true)),
        ],
        placed: new Set([...blocks.placed, ...own.map((book) => book.slug)]),
      }
    },
    { entities: [], placed: new Set() },
  )

export const createSearcher = (index: SearchIndex) => {
  const bookFuse = new Fuse(index.books, {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'title', weight: 1 },
      { name: 'authorsLabel', weight: 0.6 },
      { name: 'year', weight: 0.3 },
    ],
  })
  const authorFuse = new Fuse(index.authors, { ...FUSE_OPTIONS, keys: ['name'] })
  const categoryBySlug = new Map(index.books.map((book) => [book.slug, book.category]))

  return (query: string, activeCategory: SearchCategoryKey | null): SearchResult => {
    const { categories, terms } = parseQuery(query, activeCategory)
    const categoryFilter: SearchCategoryKey[] = activeCategory
      ? [activeCategory]
      : categories
    const isFiltered = isNonEmptyArray(categoryFilter)
    const hasTerms = isNonEmptyArray(terms)
    const searchText = terms.join(' ')

    const inFilter = (key: SearchCategoryKey | undefined) =>
      !isFiltered || (key !== undefined && categoryFilter.includes(key))

    const findAuthors = () => {
      if (hasTerms) {
        return authorFuse.search(searchText).map(({ item }) => item)
      }
      return isFiltered ? index.authors : []
    }

    const books = (
      hasTerms ? bookFuse.search(searchText).map(({ item }) => item) : index.books
    ).filter((book) => inFilter(book.category))

    const authors = findAuthors().filter(
      (author) =>
        !isFiltered ||
        author.bookSlugs.some((slug) => inFilter(categoryBySlug.get(slug))),
    )

    const { entities: authorEntities, placed } = groupBooksUnderAuthors(authors, books)

    return {
      entities: [
        ...categories.map(categoryEntity),
        ...authorEntities,
        ...books
          .filter((book) => !placed.has(book.slug))
          .map((book) => bookEntity(book, false)),
      ],
      terms,
      matchedBookSlugs: new Set([
        ...books.map((book) => book.slug),
        ...authors.flatMap((author) => author.bookSlugs),
      ]),
    }
  }
}
