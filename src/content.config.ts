import { defineCollection, z } from 'astro:content'

import client from '../tina/__generated__/client'

const authorSchema = z.object({
  tinaInfo: z
    .object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    })
    .nullish(),
  slug: z.string(),
  firstname: z.string(),
  surname: z.string(),
  birthdate: z.string().nullish(),
  deathdate: z.string().nullish(),
  description: z.any(),
  image: z.string().nullish(),
})

const author = defineCollection({
  loader: async () => {
    const authorsResponse = await client.queries.authorsConnection()

    // Map Tina posts to the correct format for Astro
    return (authorsResponse.data.authorsConnection.edges ?? [])
      .filter((author) => !!author)
      .map((author) => {
        const node = author.node

        return {
          ...node,
          id: node?._sys.relativePath.replace(/\.mdx?$/, '') ?? '', // Generate clean URLs
          tinaInfo: node?._sys, // Include Tina system info if needed
        }
      })
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
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
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
    price: z.number().nullish(),
    description: z.any(),
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
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    title: z.string(),
    content: z.any().nullish(),
  }),
})
export const collections = { book, author, page }
