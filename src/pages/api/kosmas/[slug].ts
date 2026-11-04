import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

import { fetchKosmasStatus } from '@/utils/kosmas'

export const prerender = false

const SUCCESS_CACHE = 'max-age=21600, stale-while-revalidate=86400'
const FAILURE_CACHE = 'max-age=300'

const json = (body: object, status: number, cdnCache: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=600',
      'vercel-cdn-cache-control': cdnCache,
    },
  })

export const GET: APIRoute = async ({ params }) => {
  const [book] = await getCollection('book', (b) => b.data.slug === params.slug)
  const kosmasUrl = book?.data.kosmasUrl

  if (!kosmasUrl) {
    return json({ error: 'not-found' }, 404, FAILURE_CACHE)
  }

  const status = await fetchKosmasStatus(kosmasUrl).catch(() => undefined)

  if (!status) {
    return json({ error: 'unavailable-upstream' }, 502, FAILURE_CACHE)
  }

  return json({ status }, 200, SUCCESS_CACHE)
}
