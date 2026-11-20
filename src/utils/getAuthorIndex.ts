import { getImage } from 'astro:assets'
import { getCollection } from 'astro:content'
import { isDefined } from 'narrowland'

import { FALLBACK_COLOR_FIRST } from '@/consts'
import { getSlugFromPath } from '@/utils/getSlugFromPath'

const PREVIEW_WIDTH = 336
const collator = new Intl.Collator('cs')

type AuthorIndexBook = {
  slug: string
  title: string
  preview: string
}

export type AuthorIndexEntry = {
  slug: string
  surname: string
  firstname: string
  life: string | undefined
  books: AuthorIndexBook[]
  color: string
  preview: string | undefined
}

export type AuthorIndexGroup = {
  letter: string
  entries: AuthorIndexEntry[]
}

const formatLife = (birthDate: Date | undefined, deathDate: Date | undefined) => {
  if (!birthDate) {
    return undefined
  }
  const born = String(birthDate.getUTCFullYear())
  return deathDate ? `${born}–${String(deathDate.getUTCFullYear())}` : `nar. ${born}`
}

const getLetter = (surname: string) => surname.charAt(0).toLocaleUpperCase('cs')

export const getAuthorIndex = async (): Promise<AuthorIndexGroup[]> => {
  const [books, authors] = await Promise.all([
    getCollection('book'),
    getCollection('author'),
  ])
  const sortedBooks = books.toSorted((a, b) => a.data.order - b.data.order)

  const entries = await Promise.all(
    authors.map(async ({ data }) => {
      const authored = sortedBooks.filter((book) =>
        book.data.authors.some(
          (credit) => credit.isMain && getSlugFromPath(credit.author) === data.slug,
        ),
      )
      const [firstBook] = authored
      if (!firstBook) {
        return undefined
      }
      const [preview, authoredBooks] = await Promise.all([
        data.image
          ? getImage({ src: data.image, width: PREVIEW_WIDTH }).then((image) => image.src)
          : undefined,
        Promise.all(
          authored.map(async (book) => ({
            slug: book.data.slug,
            title: book.data.title,
            preview: (await getImage({ src: book.data.cover, width: PREVIEW_WIDTH })).src,
          })),
        ),
      ])
      return {
        slug: data.slug,
        surname: data.surname,
        firstname: data.firstname,
        life: formatLife(data.birthDate, data.deathDate),
        books: authoredBooks,
        color: firstBook.data.color ?? FALLBACK_COLOR_FIRST,
        preview,
      }
    }),
  )

  return entries
    .filter(isDefined)
    .toSorted(
      (a, b) =>
        collator.compare(a.surname, b.surname) ||
        collator.compare(a.firstname, b.firstname),
    )
    .reduce<AuthorIndexGroup[]>((groups, entry) => {
      const letter = getLetter(entry.surname)
      const last = groups.at(-1)
      return last?.letter === letter
        ? [...groups.slice(0, -1), { letter, entries: [...last.entries, entry] }]
        : [...groups, { letter, entries: [entry] }]
    }, [])
}
