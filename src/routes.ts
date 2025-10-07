const SLUGS = {
  books: 'knihy',
  auhtors: 'autori',
}

export const CATEGORIES = {
  all: { name: 'pro všechny', slug: '' },
  forKids: { name: 'pro děti', slug: 'pro-deti' },
  philosophy: { name: 'pro filosofy', slug: 'pro-filosofy' },
  novel: { name: 'pro romantiky', slug: 'pro-romantiky' },
  poetry: { name: 'pro poéty', slug: 'pro-poety' },
} as const

export type CategoryKey = keyof typeof CATEGORIES
export type CategorySlug = (typeof CATEGORIES)[CategoryKey]['slug']

export const categoriesSlugToKey = {
  '': 'all',
  'pro-deti': 'forKids',
  'pro-filosofy': 'philosophy',
  'pro-romantiky': 'novel',
  'pro-poety': 'poetry',
} as const

export const routes = {
  homepage: () => '/',
  books: {
    list: () => `/${SLUGS.books}`,
    detail: (book: { _sys: { filename: string } }) =>
      `/${SLUGS.books}/${book._sys.filename}`,
    category: (key: keyof typeof CATEGORIES) => `/${SLUGS.books}/${CATEGORIES[key].slug}`,
  },
  authors: {
    detail: (author: { _sys: { filename: string } }) =>
      `/${SLUGS.auhtors}/${author._sys.filename}`,
  },
}
