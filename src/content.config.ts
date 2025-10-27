import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'

const authorSchema = z.object({
  slug: z.string(),
  firstname: z.string(),
  firstnameSecond: z.string().optional(),
  surname: z.string(),
  surnameSecond: z.string().optional(),
  birthDate: z.date().optional(),
  deathDate: z.date().optional(),
  gender: z.enum(['male', 'female']),
  image: z.string().optional(),
  claim: z.string().optional(),
})

const author = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: authorSchema,
})

const book = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    date: z.number(),
    pagesCount: z.number().optional(),
    isbn: z.string().optional(),
    cover: z.string().optional(),
    authors: z.array(
      z.object({
        author: z.string(),
        slug: reference('author'),
        isMain: z.boolean().optional(),
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
    category: z.enum(['forKids', 'philosophy', 'novel', 'poetry']),
    claim: z.string().optional(),
    color: z.string().optional(),
    bgColor: z.string().optional(),
  }),
})

const page = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    content: z.string().optional(),
  }),
})
export const collections = { book, author, page }
