const SLUGS = {
  books: "knihy",
  auhtors: "autori",
};

export const CATEGORIES = {
  forKids: { name: "Pro děti", slug: "pro-deti" },
  philosophy: { name: "Pro filosofy", slug: "pro-filosofy" },
  novel: { name: "Pro romantiky", slug: "pro-romantiky" },
  poetry: { name: "Pro poéty", slug: "pro-poety" },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
export type CategorySlug = (typeof CATEGORIES)[CategoryKey]["slug"];

export const categoriesSlugToKey = {
  "pro-deti": "forKids",
  "pro-filosofy": "philosophy",
  "pro-romantiky": "novel",
  "pro-poety": "poetry",
} as const;

export const routes = {
  homepage: () => "/",
  books: {
    list: () => `/${SLUGS.books}`,
    detail: (book: { _sys: { filename: string } }) =>
      `/${SLUGS.books}/${book._sys.filename}`,
    category: (key: keyof typeof CATEGORIES) =>
      `/${SLUGS.books}/${CATEGORIES[key].slug}`,
  },
  authors: {
    detail: (author: { _sys: { filename: string } }) =>
      `/${SLUGS.auhtors}/${author._sys.filename}`,
  },
};
