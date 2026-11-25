import type { APIRoute } from 'astro'

import { createOrderNumber } from '@/utils/order/orderNumber'
import { orderRequestSchema } from '@/utils/order/orderSchema'
import { priceOrder } from '@/utils/order/priceOrder'
import { submitOrder } from '@/utils/order/submitOrder'

export const prerender = false

const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })

const MAX_BODY_LENGTH = 20_000

const isTooLarge = (request: Request) =>
  Number(request.headers.get('content-length') ?? 0) > MAX_BODY_LENGTH

const readBody = async (request: Request): Promise<unknown> => {
  const text = await request.text().catch(() => '')
  if (text.length > MAX_BODY_LENGTH) {
    return undefined
  }
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) {
    return json(
      { error: 'unsupported-media-type', message: 'Nepodporovaný formát.' },
      415,
    )
  }

  if (isTooLarge(request)) {
    return json({ error: 'too-large', message: 'Objednávka je příliš velká.' }, 413)
  }

  const parsed = orderRequestSchema.safeParse(await readBody(request))

  if (!parsed.success) {
    return json(
      { error: 'invalid-order', message: 'Objednávku se nepodařilo ověřit.' },
      400,
    )
  }

  try {
    const priced = await priceOrder(parsed.data)

    if (!priced.ok) {
      return json({ error: 'invalid-order', message: priced.message }, 422)
    }

    const placed = await submitOrder({
      orderNumber: createOrderNumber(),
      summary: priced.summary,
      request: parsed.data,
    })

    return json({ orderNumber: placed.orderNumber, summary: placed.summary }, 200)
  } catch {
    return json(
      {
        error: 'server-error',
        message: 'Objednávku se nepodařilo odeslat. Zkuste to prosím za chvíli.',
      },
      500,
    )
  }
}
