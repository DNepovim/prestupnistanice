import { defineCollection, z } from 'astro:content'
import { isDefined } from 'narrowland'

import client from '../tina/__generated__/client'

const authorSchema = z.object({
  slug: z.string(),
  firstname: z.string(),
  firstnameSecond: z.string().nullable(),
  surname: z.string(),
  surnameSecond: z.string().nullable(),
  birthDate: z.coerce.date().nullable(),
  deathDate: z.coerce.date().nullable(),
  gender: z.enum(['male', 'female']),
  image: z.string().nullable(),
  claim: z.string().nullable(),
  description: z.string().nullable(),
})

const author = defineCollection({
  loader: async () => {
    const authorsResponse = await client.queries.authorsConnection()

    return (authorsResponse.data.authorsConnection.edges ?? [])
      .filter(isDefined)
      .map(({ node }) => ({
        ...node,
        id: node?.slug ?? '',
        tinaInfo: node?._sys,
      }))
  },
  schema: authorSchema,
})

const book = defineCollection({
  loader: async () => {
    const booksResponse = await client.queries.booksConnection()

    // Map Tina posts to the correct format for Astro
    return (booksResponse.data.booksConnection.edges ?? [])
      .filter((book) => !!book)
      .map((book) => {
        const node = book.node

        return {
          ...node,
          id: node?._sys.relativePath.replace(/\.mdx?$/, '') ?? '', // Generate clean URLs
          tinaInfo: node?._sys, // Include Tina system info if needed
        }
      })
  },
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    date: z.number().nullish(),
    pagesCount: z.number().nullish(),
    isbn: z.string().nullish(),
    cover: z.string().nullish(),
    authors: z.array(
      z.object({
        author: authorSchema,
        isMain: z.boolean().nullish(),
        role: z.array(
          z.enum([
            'author',
            'translate',
            'editor',
            'supereditor',
            'illustration',
            'cover',
            'typesetting',
            'reviewer',
            'corrector',
            'consultation',
          ]),
        ),
      }),
    ),
    category: z.string().nullish(),
    image: z.string().nullish(),
    description: z.any(),
    color: z.string().nullish(),
    bgColor: z.string().nullish(),
  }),
})

const page = defineCollection({
  loader: async () => {
    const postsResponse = await client.queries.pagesConnection()

    // Map Tina posts to the correct format for Astro
    return (postsResponse.data.pagesConnection.edges ?? [])
      .filter((p) => !!p)
      .map((p) => {
        const node = p.node

        return {
          ...node,
          id: node?._sys.relativePath.replace(/\.mdx?$/, '') ?? '', // Generate clean URLs
          tinaInfo: node?._sys, // Include Tina system info if needed
        }
      })
  },
  schema: z.object({
    title: z.string(),
    content: z.any().nullish(),
  }),
})
export const collections = { book, author, page }
