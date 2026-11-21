import type { CollectionEntry } from 'astro:content'

export const isOnSale = (book: CollectionEntry<'book'>) =>
  !book.data.isUpcoming && book.data.price !== undefined
