import { getDeliveryPrice, getPaymentPrice } from '@/configs/shipping'
import type { OrderState } from '@/stores/order'
import type { CartBook, CartIndex } from '@/utils/cart/types'

type CartItem = {
  slug: string
  count: number
}

export type OrderLine = {
  book: CartBook
  count: number
  total: number
}

export type OrderTotals = {
  booksCount: number
  booksTotal: number
  deliveryPrice: number
  paymentPrice: number
  total: number
}

export const getOrderLines = (
  items: readonly CartItem[],
  books: CartIndex,
): OrderLine[] =>
  items.flatMap(({ slug, count }) => {
    const book = books[slug]
    return book ? [{ book, count, total: book.price * count }] : []
  })

export const getOrderTotals = (
  lines: readonly OrderLine[],
  state: Pick<OrderState, 'delivery' | 'payment'>,
): OrderTotals => {
  const booksTotal = lines.reduce((sum, line) => sum + line.total, 0)
  const deliveryPrice = getDeliveryPrice(state.delivery)
  const paymentPrice = getPaymentPrice(state.payment)
  return {
    booksCount: lines.reduce((sum, line) => sum + line.count, 0),
    booksTotal,
    deliveryPrice,
    paymentPrice,
    total: booksTotal + deliveryPrice + paymentPrice,
  }
}
