import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'

const author = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      name: z.string().optional(),
      firstname: z.string(),
      firstnameSecond: z.string().optional(),
      surname: z.string(),
      surnameSecond: z.string().optional(),
      birthDate: z.date().optional(),
      deathDate: z.date().optional(),
      gender: z.enum(['male', 'female']),
      image: image().optional(),
      claim: z.string().optional(),
      showOnAboutPage: z.boolean().optional(),
      aboutRole: z.string().optional(),
    }),
})

const book = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: ({ image }) =>
    z
      .object({
        slug: z.string(),
        title: z.string(),
        originalName: z.string().optional(),
        date: z.number(),
        releaseNote: z.string().optional(),
        order: z.number(),
        pagesCount: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        paper: z.string().optional(),
        font: z.string().optional(),
        isbn: z.string().optional(),
        kosmasUrl: z.string().url().optional(),
        price: z.number().positive().optional(),
        stock: z.number().int().min(0).optional(),
        cover: image().optional(),
        coverImage: image().optional(),
        coverTop: image().optional(),
        samplePages: z.array(image()).optional(),
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
        isUpcoming: z.boolean().optional(),
        claim: z.string().optional(),
        color: z.string().optional(),
        bgColor: z.string().optional(),
      })
      .transform((data, ctx) => {
        const photo = data.cover ?? data.coverImage
        if (!photo) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Kniha potřebuje obálku nebo fotku knihy',
          })
          return z.NEVER
        }
        return { ...data, cover: photo }
      }),
})

const review = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
  schema: z.object({
    book: z.string(),
    source: z.enum(['kosmas', 'databazeknih', 'press', 'web']),
    url: z.string().url().optional(),
    reviewer: z.string(),
    date: z.date().optional(),
    rating: z.number().min(1).max(5).optional(),
    permission: z.enum(['consent', 'quote', 'own']),
  }),
})

const event = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      title: z.string(),
      date: z.date(),
      time: z.string().optional(),
      place: z.string(),
      images: z.array(image()).optional(),
      description: z.string().optional(),
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
export const collections = { book, author, event, page, review }
