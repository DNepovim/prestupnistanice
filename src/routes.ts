
const SLUGS = {
  books: "knihy",
  auhtors: "autori",
};

export const routes = {
  homepage: () => "/",
  books: {
    list: () => `/${SLUGS.books}`,
    detail: (book: { _sys: { filename: string } }) =>
      `/${SLUGS.books}/${book._sys.filename}`,
  },
  authors: {
    detail: (author: { _sys: { filename: string } }) =>
      `/${SLUGS.auhtors}/${author._sys.filename}`,
  },
};
