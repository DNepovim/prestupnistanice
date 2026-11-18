import { getImage } from 'astro:assets'
import { getCollection } from 'astro:content'

import { routes } from '@/routes'

const PREVIEW_WIDTH = 336
const LINK_PATTERN = /\]\(([^)\s]+)\)/g

const getHrefs = (markdown: string) =>
  Array.from(markdown.matchAll(LINK_PATTERN), (match) => match[1]).filter(
    (href) => href !== undefined,
  )

const toUrl = async (image: Parameters<typeof getImage>[0]['src']) =>
  (await getImage({ src: image, width: PREVIEW_WIDTH })).src

export const getLinkPreviews = async (markdown: string) => {
  const hrefs = getHrefs(markdown)
  if (hrefs.length === 0) {
    return new Map<string, string>()
  }

  const [authors, books] = await Promise.all([
    getCollection('author'),
    getCollection('book'),
  ])

  const entries = await Promise.all(
    hrefs.map(async (href) => {
      const author = authors.find((a) => routes.authors.detail(a.data.slug) === href)
      const book = books.find((b) => routes.books.detail(b.data.slug) === href)
      const image = author?.data.image ?? book?.data.cover
      return image ? ([href, await toUrl(image)] as const) : undefined
    }),
  )

  return new Map(entries.filter((entry) => entry !== undefined))
}
