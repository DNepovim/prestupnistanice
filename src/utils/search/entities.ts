import { pluralize } from '@/utils/pluralize'

import type {
  SearchAuthor,
  SearchBook,
  SearchCategoryKey,
  SearchEntity,
  SearchIndex,
} from './types'

export const findDefaultEntity = (entities: SearchEntity[]) =>
  entities.find((entity) => entity.kind === 'book') ?? entities[0]

export const getAuthorBooks = (author: SearchAuthor, books: SearchBook[]) =>
  books.filter((book) => author.bookSlugs.includes(book.slug))

export const getCategoryBooks = (key: SearchCategoryKey, books: SearchBook[]) =>
  books.filter((book) => book.category === key)

export const getOptionId = (entityId: string) => `search-option-${entityId}`

export const getFocusedBookSlugs = (entity: SearchEntity, books: SearchBook[]) => {
  if (entity.kind === 'book') {
    return [entity.book.slug]
  }
  if (entity.kind === 'author') {
    return entity.author.bookSlugs
  }
  return books.filter((book) => book.category === entity.key).map((book) => book.slug)
}

const getNewestBookSlug = (books: SearchBook[], category: SearchCategoryKey) =>
  books
    .filter((book) => book.category === category)
    .toSorted((a, b) => b.year - a.year)[0]?.slug ?? ''

export const getThemeSlug = (entity: SearchEntity, books: SearchBook[]) => {
  if (entity.kind === 'book') {
    return entity.book.slug
  }
  if (entity.kind === 'author') {
    return entity.author.themeBookSlug
  }
  return getNewestBookSlug(books, entity.key)
}

export const getCategoryStats = (key: SearchCategoryKey, index: SearchIndex) => {
  const slugs = new Set(
    index.books.filter((book) => book.category === key).map((book) => book.slug),
  )
  const authorsCount = index.authors.filter((author) =>
    author.bookSlugs.some((slug) => slugs.has(slug)),
  ).length

  return `${pluralize(slugs.size, ['kniha', 'knihy', 'knih'])} · ${pluralize(authorsCount, ['autor', 'autoři', 'autorů'])}`
}
