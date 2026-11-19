import type { ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import { getCollection, type CollectionEntry } from 'astro:content'
import { colord } from 'colord'
import { isDefined } from 'narrowland'

import { FALLBACK_COLOR_FIRST, FALLBACK_COLOR_SECOND } from '@/consts'
import { getColorScale } from '@/utils/geColorScale'
import { joinWords } from '@/utils/joinWords'

import type { SearchAuthor, SearchBook, SearchImage, SearchIndex } from './types'

const COVER_WIDTH = 240
const PORTRAIT_SIZE = 160
const LIFE_YEAR_TIME_ZONE = 'Europe/Prague'
const THEME_DESATURATION = 0.4

const OVERLAY_THEME_TOKENS = [
  'color-brand-first-100',
  'color-brand-first-300',
  'color-brand-first-500',
  'color-brand-first-700',
  'color-brand-first-900',
  'color-brand-second-50',
  'color-brand-second-100',
  'color-brand-second-200',
]

const getCoverImage = async (src: ImageMetadata): Promise<SearchImage> => {
  const optimized = await getImage({ src, width: COVER_WIDTH, format: 'webp' })
  return {
    src: optimized.src,
    width: COVER_WIDTH,
    height: Math.round((COVER_WIDTH * src.height) / src.width),
  }
}

const getPortraitImage = async (src: ImageMetadata): Promise<SearchImage> => {
  const optimized = await getImage({
    src,
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    fit: 'cover',
    position: 'top',
    format: 'webp',
  })
  return { src: optimized.src, width: PORTRAIT_SIZE, height: PORTRAIT_SIZE }
}

const formatYear = (date: Date) =>
  date.toLocaleDateString('cs-CZ', { year: 'numeric', timeZone: LIFE_YEAR_TIME_ZONE })

const getLife = ({ birthDate, deathDate }: CollectionEntry<'author'>['data']) => {
  if (!birthDate) {
    return ''
  }
  if (!deathDate) {
    return `nar. ${formatYear(birthDate)}`
  }
  return `${formatYear(birthDate)}–${formatYear(deathDate)}`
}

const softenColor = (color: string) =>
  colord(color).desaturate(THEME_DESATURATION).toHex()

const toStyle = (scale: Record<string, string>) =>
  Object.entries(scale)
    .filter(([key]) => OVERLAY_THEME_TOKENS.includes(key))
    .map(([key, value]) => `--${key}:${value}`)
    .join(';')

const getFullName = ({ data }: CollectionEntry<'author'>) =>
  `${data.firstname} ${data.surname}`

export const getSearchIndex = async (): Promise<SearchIndex> => {
  const bookEntries = (await getCollection('book')).toSorted(
    (a, b) => b.data.order - a.data.order,
  )
  const authorEntries = await getCollection('author')

  const getMainAuthors = ({ data }: CollectionEntry<'book'>) =>
    data.authors
      .filter((author) => author.isMain)
      .map((author) => authorEntries.find((entry) => entry.id === author.slug.id))
      .filter(isDefined)

  const books: SearchBook[] = await Promise.all(
    bookEntries.map(async (entry) => {
      const mainAuthors = getMainAuthors(entry)
      return {
        slug: entry.data.slug,
        title: entry.data.title,
        year: entry.data.date,
        category: entry.data.category,
        authorSlugs: mainAuthors.map((author) => author.data.slug),
        authorsLabel: joinWords(mainAuthors.map(getFullName)),
        cover: await getCoverImage(entry.data.cover),
        colors: {
          first: entry.data.color ?? FALLBACK_COLOR_FIRST,
          second: entry.data.bgColor ?? FALLBACK_COLOR_SECOND,
        },
      }
    }),
  )

  const authors: SearchAuthor[] = await Promise.all(
    bookEntries
      .flatMap(getMainAuthors)
      .filter((author, index, all) => index === all.findIndex((a) => a.id === author.id))
      .toSorted((a, b) => a.data.surname.localeCompare(b.data.surname, 'cs'))
      .map(async (entry) => {
        const own = books.filter((book) => book.authorSlugs.includes(entry.data.slug))
        return {
          slug: entry.data.slug,
          name: getFullName(entry),
          life: getLife(entry.data),
          initials: `${entry.data.firstname.charAt(0)}${entry.data.surname.charAt(0)}`,
          portrait: entry.data.image
            ? await getPortraitImage(entry.data.image)
            : undefined,
          bookSlugs: own.map((book) => book.slug),
          themeBookSlug: own.toSorted((a, b) => b.year - a.year)[0]?.slug ?? '',
        }
      }),
  )

  const themes = Object.fromEntries(
    books.map((book) => [
      book.slug,
      toStyle({
        ...getColorScale(softenColor(book.colors.first), 'color-brand-first', true),
        ...getColorScale(softenColor(book.colors.second), 'color-brand-second', true),
      }),
    ]),
  )

  return { books, authors, themes }
}
