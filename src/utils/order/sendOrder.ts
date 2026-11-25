import { ORDER_STORAGE_KEY } from '@/configs/order'
import { routes } from '@/routes'
import { emptyCart } from '@/stores/cart'
import { resetOrder, type OrderState } from '@/stores/order'
import {
  orderResultSchema,
  type OrderRequest,
  type OrderResult,
} from '@/utils/order/orderSchema'

type CartItem = {
  slug: string
  count: number
}

type SendResult = { ok: true; result: OrderResult } | { ok: false; message: string }

const NETWORK_MESSAGE =
  'Objednávku se nepodařilo odeslat. Zkontrolujte připojení a zkuste to znovu, košík zůstal beze změny.'

const SERVER_MESSAGE =
  'Objednávku se nepodařilo odeslat. Zkuste to prosím za chvíli, košík zůstal beze změny.'

const fail = (message: string): SendResult => ({ ok: false, message })

const readMessage = (body: unknown): string | undefined =>
  typeof body === 'object' &&
  body !== null &&
  'message' in body &&
  typeof body.message === 'string'
    ? body.message
    : undefined

export const buildOrderRequest = (
  items: readonly CartItem[],
  state: OrderState,
  website: string,
): OrderRequest | undefined =>
  state.delivery === null || state.payment === null
    ? undefined
    : {
        items: items.map(({ slug, count }) => ({ slug, count })),
        delivery: state.delivery,
        pickupLocation: state.pickupLocation,
        balikovnaPoint: state.balikovnaPoint,
        payment: state.payment,
        customer: state.customer,
        website,
      }

export const sendOrder = async (request: OrderRequest): Promise<SendResult> => {
  const response = await fetch(routes.api.order(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  }).catch(() => undefined)

  if (response === undefined) {
    return fail(NETWORK_MESSAGE)
  }

  const body: unknown = await response.json().catch(() => undefined)

  if (!response.ok) {
    return fail(
      response.status < 500 ? (readMessage(body) ?? SERVER_MESSAGE) : SERVER_MESSAGE,
    )
  }

  const parsed = orderResultSchema.safeParse(body)
  return parsed.success ? { ok: true, result: parsed.data } : fail(SERVER_MESSAGE)
}

const storeResult = (result: OrderResult) => {
  try {
    window.sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(result))
  } catch {
    return
  }
}

export const completeOrder = (result: OrderResult) => {
  storeResult(result)
  emptyCart()
  resetOrder()
  window.location.assign(routes.thanks())
}
