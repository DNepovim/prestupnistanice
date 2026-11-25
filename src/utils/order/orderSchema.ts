import { z } from 'astro/zod'

import { MAX_ITEM_COUNT, MAX_ITEM_LINES } from '@/configs/order'
import { DELIVERY_IDS, PAYMENT_IDS, PICKUP_IDS } from '@/configs/shipping'

const SHORT_TEXT = 200
const LONG_TEXT = 2000

const text = (max = SHORT_TEXT) => z.string().max(max)

const itemSchema = z.object({
  slug: text(),
  count: z.number().int().min(1).max(MAX_ITEM_COUNT),
})

const customerSchema = z.object({
  firstname: text(),
  surname: text(),
  email: text(),
  phone: text(),
  street: text(),
  city: text(),
  postcode: text(),
  needsInvoice: z.boolean(),
  isCompany: z.boolean(),
  companyName: text(),
  ico: text(),
  dic: text(),
  note: text(LONG_TEXT),
  consentTerms: z.boolean().refine(Boolean),
  consentPrivacy: z.boolean().refine(Boolean),
})

const balikovnaPointSchema = z.object({
  id: text(),
  name: text(),
  address: text().optional(),
  detailUrl: text().optional(),
})

export const orderRequestSchema = z.object({
  items: z
    .array(itemSchema)
    .min(1)
    .max(MAX_ITEM_LINES)
    .refine((items) => new Set(items.map((item) => item.slug)).size === items.length),
  delivery: z.enum(DELIVERY_IDS),
  pickupLocation: z.enum(PICKUP_IDS).nullable(),
  balikovnaPoint: balikovnaPointSchema.nullable(),
  payment: z.enum(PAYMENT_IDS),
  customer: customerSchema,
  website: z.string().max(0),
})

export type OrderRequest = z.infer<typeof orderRequestSchema>

const summaryItemSchema = z.object({
  slug: text(),
  title: text(),
  author: text(),
  cover: z.string(),
  count: z.number().int(),
  unitPrice: z.number(),
  total: z.number(),
})

export const orderSummarySchema = z.object({
  items: z.array(summaryItemSchema),
  delivery: z.object({
    id: z.enum(DELIVERY_IDS),
    name: text(),
    price: z.number(),
    handover: text().optional(),
  }),
  payment: z.object({
    id: z.enum(PAYMENT_IDS),
    name: text(),
    price: z.number(),
  }),
  booksTotal: z.number(),
  total: z.number(),
})

export const orderResultSchema = z.object({
  orderNumber: text(),
  summary: orderSummarySchema,
})

export type OrderSummary = z.infer<typeof orderSummarySchema>
export type OrderResult = z.infer<typeof orderResultSchema>

export type PlacedOrder = OrderResult & {
  request: OrderRequest
}
