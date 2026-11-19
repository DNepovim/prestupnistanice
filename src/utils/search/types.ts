import type { CategoryKey } from '@/routes'

export type SearchCategoryKey = Exclude<CategoryKey, 'all'>

export type SearchImage = {
  src: string
  width: number
  height: number
}

export type SearchBook = {
  slug: string
  title: string
  year: number
  category: SearchCategoryKey
  authorSlugs: string[]
  authorsLabel: string
  cover: SearchImage
  colors: { first: string; second: string }
}

export type SearchAuthor = {
  slug: string
  name: string
  life: string
  initials: string
  portrait?: SearchImage
  bookSlugs: string[]
  themeBookSlug: string
}

export type SearchIndex = {
  books: SearchBook[]
  authors: SearchAuthor[]
  themes: Record<string, string>
}

export type SearchEntity =
  | { id: string; kind: 'category'; key: SearchCategoryKey }
  | { id: string; kind: 'author'; author: SearchAuthor }
  | { id: string; kind: 'book'; book: SearchBook; indented: boolean }

export type SearchPreviewEntity = Exclude<SearchEntity, { kind: 'author' }>

export type SearchResult = {
  entities: SearchEntity[]
  terms: string[]
  matchedBookSlugs: ReadonlySet<string>
}
