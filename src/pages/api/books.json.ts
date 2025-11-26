import type { APIContext } from 'astro'
import { getCollection, getEntry } from 'astro:content'

type AuthorRef = {
  slug: { id: string } | string
  isMain?: boolean
  role?: string[] | string
}

type BookData = {
  title?: string
  cover?: string | { src: string }
  price?: number
  authors?: AuthorRef[]
  slug?: string
}

export async function GET({ url }: APIContext) {
  const slugsParam = url.searchParams.get('slugs') ?? ''
  const requested = slugsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Normalize requested values to compare against entry ids and frontmatter slugs
  const normalize = (s: string) => {
    const trimmed = s.trim()
    const withoutQuery = trimmed.split('?').at(0) ?? ''
    const lastSlash = withoutQuery.lastIndexOf('/')
    const lastSegment = lastSlash >= 0 ? withoutQuery.slice(lastSlash + 1) : withoutQuery
    return lastSegment.replace(/\.mdx?$/i, '')
  }
  // mapping kept simple; we normalize only for internal comparisons

  const result: Record<
    string,
    { title: string; cover?: string; price?: number; author?: string }
  > = {}

  // Simple, robust pass: resolve each requested slug independently
  await Promise.all(
    requested.map(async (orig) => {
      const s = normalize(orig)
      // Try by entry id first
      let entry = await getEntry('book', s)
      // If not found by id, try by frontmatter slug
      if (!entry) {
        const matches = await getCollection(
          'book',
          (e) => (e.data as BookData).slug === s,
        )
        entry = matches[0]
      }
      if (!entry) return

      const b = entry.data as unknown as BookData
      const authorRefs = Array.isArray(b.authors) ? b.authors : []
      const authorSlugs = authorRefs
        .filter(
          (a) =>
            a.isMain &&
            (Array.isArray(a.role)
              ? a.role.includes('author')
              : (a.role ?? '').includes('author')),
        )
        .map((a) => (typeof a.slug === 'string' ? a.slug : a.slug.id))
        .filter(Boolean)

      const authors = authorSlugs.length
        ? (await Promise.all(authorSlugs.map((as) => Promise.resolve(getEntry('author', as))))).filter(
            (a): a is NonNullable<typeof a> => Boolean(a),
          )
        : []

      const authorName = authors
        .map((a) => {
          const data = (a as { data: { firstname?: string; surname?: string } }).data
          const first = data.firstname ?? ''
          const last = data.surname ?? ''
          return `${first} ${last}`.trim()
        })
        .filter(Boolean)
        .join(', ')

      result[orig] = {
        title: b.title ?? orig,
        cover: typeof b.cover === 'string' ? b.cover : b.cover?.src,
        price: typeof b.price === 'number' ? b.price : undefined,
        author: authorName || undefined,
      }
    }),
  )

  // Safety net: if nothing matched (dev environment quirks), build a full index
  if (Object.keys(result).length === 0) {
    const all = await getCollection('book')
    await Promise.all(
      all.map(async (entry) => {
        const b = entry.data as unknown as BookData
        const authorRefs = Array.isArray(b.authors) ? b.authors : []
        const authorSlugs = authorRefs
          .filter(
            (a) =>
              a.isMain &&
              (Array.isArray(a.role)
                ? a.role.includes('author')
                : (a.role ?? '').includes('author')),
          )
          .map((a) => (typeof a.slug === 'string' ? a.slug : a.slug.id))
          .filter(Boolean)
        const authors = authorSlugs.length
          ? (await Promise.all(authorSlugs.map((as) => Promise.resolve(getEntry('author', as))))).filter(
              (a): a is NonNullable<typeof a> => Boolean(a),
            )
          : []
        const authorName = authors
          .map((a) => {
            const data = (a as { data: { firstname?: string; surname?: string } }).data
            const first = data.firstname ?? ''
            const last = data.surname ?? ''
            return `${first} ${last}`.trim()
          })
          .filter(Boolean)
          .join(', ')
        const value = {
          title: b.title ?? entry.id,
          cover: typeof b.cover === 'string' ? b.cover : b.cover?.src,
          price: typeof b.price === 'number' ? b.price : undefined,
          author: authorName || undefined,
        }
        // Map by both file id and frontmatter slug
        result[entry.id] = value
        if (b.slug) result[b.slug] = value
      }),
    )
  }

  return new Response(JSON.stringify(result), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
