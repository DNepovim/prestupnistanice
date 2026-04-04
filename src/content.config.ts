import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'

const author = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      firstname: z.string(),
      firstnameSecond: z.string().optional(),
      surname: z.string(),
      surnameSecond: z.string().optional(),
      birthDate: z.date().optional(),
      deathDate: z.date().optional(),
      gender: z.enum(['male', 'female']),
      image: image().optional(),
      claim: z.string().optional(),
    }),
})

const book = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string(),
      date: z.number(),
      order: z.number(),
      pagesCount: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      paper: z.string().optional(),
      font: z.string().optional(),
      isbn: z.string().optional(),
      cover: image(),
      authors: z.array(
        z.object({
          author: z.string(),
          slug: reference('author'),
          isMain: z.boolean().optional(),
          col: z.string().optional(),
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
      isPromoted: z.boolean().optional(),
      claim: z.string().optional(),
      color: z.string().optional(),
      bgColor: z.string().optional(),
    }),
})

const page = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    content: z.string().optional(),
  }),
})
export const collections = { book, author, page }
