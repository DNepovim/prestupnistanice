import { getCollection } from 'astro:content'
import { isDefined } from 'narrowland'

import {
  DELIVERY_OPTIONS,
  isPaymentAvailable,
  PAYMENT_OPTIONS,
  PICKUP_LOCATIONS,
} from '@/configs/shipping'
import { isOnSale } from '@/utils/isOnSale'
import type { OrderRequest, OrderSummary } from '@/utils/order/orderSchema'
import { validateOrder } from '@/utils/order/validation'

type PricingResult = { ok: true; summary: OrderSummary } | { ok: false; message: string }

const fail = (message: string): PricingResult => ({ ok: false, message })

const getHandover = (request: OrderRequest) =>
  request.delivery === 'osobni-prevzeti' && request.pickupLocation !== null
    ? PICKUP_LOCATIONS[request.pickupLocation]
    : request.delivery === 'balikovna'
      ? request.balikovnaPoint?.name
      : undefined

export const priceOrder = async (request: OrderRequest): Promise<PricingResult> => {
  const { items, delivery, payment, pickupLocation, balikovnaPoint, customer } = request

  if (!isPaymentAvailable(payment, delivery)) {
    return fail('Zvolená platba není u této dopravy dostupná.')
  }

  const errors = validateOrder(
    { delivery, payment, pickupLocation, balikovnaPoint, customer },
    items.length,
  )
  if (Object.keys(errors).length > 0) {
    return fail('Objednávka není správně vyplněná.')
  }

  const catalog = (await getCollection('book')).filter(isOnSale)
  const authorEntries = await getCollection('author')

  const lines = items.map(({ slug, count }) => {
    const entry = catalog.find((book) => book.data.slug === slug)
    return entry?.data.price === undefined
      ? undefined
      : {
          slug,
          title: entry.data.title,
          author: entry.data.authors
            .filter((author) => author.isMain)
            .map((author) => authorEntries.find((entry) => entry.id === author.slug.id))
            .filter(isDefined)
            .map((author) => `${author.data.firstname} ${author.data.surname}`)
            .join(', '),
          count,
          unitPrice: entry.data.price,
          total: entry.data.price * count,
        }
  })

  if (lines.some((line) => line === undefined)) {
    return fail('Některá z knih není v nabídce.')
  }

  const pricedLines = lines.flatMap((line) => (line === undefined ? [] : [line]))
  const booksTotal = pricedLines.reduce((sum, line) => sum + line.total, 0)
  const deliveryOption = DELIVERY_OPTIONS[delivery]
  const paymentOption = PAYMENT_OPTIONS[payment]

  return {
    ok: true,
    summary: {
      items: pricedLines,
      delivery: {
        id: delivery,
        name: deliveryOption.name,
        price: deliveryOption.price,
        handover: getHandover(request),
      },
      payment: { id: payment, name: paymentOption.name, price: paymentOption.price },
      booksTotal,
      total: booksTotal + deliveryOption.price + paymentOption.price,
    },
  }
}
