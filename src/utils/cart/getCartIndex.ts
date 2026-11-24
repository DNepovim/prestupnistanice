import { getImage } from 'astro:assets'
import { getCollection } from 'astro:content'
import { isDefined } from 'narrowland'

import { FALLBACK_COLOR_FIRST } from '@/consts'
import { isOnSale } from '@/utils/isOnSale'
import { joinWords } from '@/utils/joinWords'

import type { CartBook, CartIndex } from './types'

const COVER_WIDTH = 128

export const getCartIndex = async (): Promise<CartIndex> => {
  const bookEntries = (await getCollection('book')).filter(isOnSale)
  const authorEntries = await getCollection('author')

  const books = await Promise.all(
    bookEntries.map(async ({ data }): Promise<CartBook | undefined> => {
      if (data.price === undefined) {
        return undefined
      }
      const authors = data.authors
        .filter((author) => author.isMain)
        .map((author) => authorEntries.find((entry) => entry.id === author.slug.id))
        .filter(isDefined)
        .map((author) => `${author.data.firstname} ${author.data.surname}`)
      const cover = await getImage({
        src: data.cover,
        width: COVER_WIDTH,
        format: 'webp',
      })
      return {
        slug: data.slug,
        title: data.title,
        author: joinWords(authors),
        price: data.price,
        cover: cover.src,
        color: data.color ?? FALLBACK_COLOR_FIRST,
      }
    }),
  )

  return Object.fromEntries(books.filter(isDefined).map((book) => [book.slug, book]))
}
