import { persistentAtom } from '@nanostores/persistent'
import { isOneOf } from 'narrowland'

import {
  DELIVERY_IDS,
  DELIVERY_OPTIONS,
  isPaymentAvailable,
  PAYMENT_IDS,
  PICKUP_IDS,
  type DeliveryId,
  type PaymentId,
  type PickupId,
} from '@/configs/shipping'

export const ORDER_STEPS = [1, 2, 3, 4] as const

export type OrderStep = (typeof ORDER_STEPS)[number]

export type BalikovnaPoint = {
  id: string
  name: string
}

export type Customer = {
  firstname: string
  surname: string
  email: string
  phone: string
  street: string
  city: string
  postcode: string
  isCompany: boolean
  companyName: string
  ico: string
  dic: string
  note: string
  consentTerms: boolean
  consentPrivacy: boolean
}

export type OrderState = {
  step: OrderStep
  delivery: DeliveryId | null
  pickupLocation: PickupId | null
  balikovnaPoint: BalikovnaPoint | null
  payment: PaymentId | null
  customer: Customer
}

const TEXT_FIELDS = [
  'firstname',
  'surname',
  'email',
  'phone',
  'street',
  'city',
  'postcode',
  'companyName',
  'ico',
  'dic',
  'note',
] as const satisfies readonly (keyof Customer)[]

const FLAG_FIELDS = [
  'isCompany',
  'consentTerms',
  'consentPrivacy',
] as const satisfies readonly (keyof Customer)[]

const initialState: OrderState = {
  step: 1,
  delivery: null,
  pickupLocation: null,
  balikovnaPoint: null,
  payment: null,
  customer: {
    firstname: '',
    surname: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postcode: '',
    isCompany: false,
    companyName: '',
    ico: '',
    dic: '',
    note: '',
    consentTerms: false,
    consentPrivacy: false,
  },
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNullableOf = <T>(value: unknown, guard: (candidate: unknown) => candidate is T) =>
  value === null || guard(value)

const isOrderStep = (value: unknown): value is OrderStep =>
  ORDER_STEPS.some((step) => step === value)

const isDeliveryId = (value: unknown): value is DeliveryId => isOneOf(value, DELIVERY_IDS)

const isPaymentId = (value: unknown): value is PaymentId => isOneOf(value, PAYMENT_IDS)

const isPickupId = (value: unknown): value is PickupId => isOneOf(value, PICKUP_IDS)

const isBalikovnaPoint = (value: unknown): value is BalikovnaPoint =>
  isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string'

const isCustomer = (value: unknown): value is Customer =>
  isRecord(value) &&
  TEXT_FIELDS.every((field) => typeof value[field] === 'string') &&
  FLAG_FIELDS.every((field) => typeof value[field] === 'boolean')

const isOrderState = (value: unknown): value is OrderState =>
  isRecord(value) &&
  isOrderStep(value.step) &&
  isNullableOf(value.delivery, isDeliveryId) &&
  isNullableOf(value.pickupLocation, isPickupId) &&
  isNullableOf(value.balikovnaPoint, isBalikovnaPoint) &&
  isNullableOf(value.payment, isPaymentId) &&
  isCustomer(value.customer)

const decodeOrder = (raw: string): OrderState => {
  try {
    const parsed: unknown = JSON.parse(raw)
    return isOrderState(parsed) ? parsed : initialState
  } catch {
    return initialState
  }
}

export const order = persistentAtom<OrderState>('order:v1', initialState, {
  encode: JSON.stringify,
  decode: decodeOrder,
})

export const setStep = (step: OrderStep) => {
  order.set({ ...order.get(), step })
}

export const setDelivery = (delivery: DeliveryId) => {
  const current = order.get()
  const option = DELIVERY_OPTIONS[delivery]
  order.set({
    ...current,
    delivery,
    pickupLocation: option.needsPickupLocation ? current.pickupLocation : null,
    balikovnaPoint: option.needsPoint ? current.balikovnaPoint : null,
    payment:
      current.payment !== null && isPaymentAvailable(current.payment, delivery)
        ? current.payment
        : null,
  })
}

export const setPickupLocation = (pickupLocation: PickupId) => {
  order.set({ ...order.get(), pickupLocation })
}

export const setBalikovnaPoint = (balikovnaPoint: BalikovnaPoint) => {
  order.set({ ...order.get(), balikovnaPoint })
}

export const setPayment = (payment: PaymentId) => {
  order.set({ ...order.get(), payment })
}

export const updateCustomer = (patch: Partial<Customer>) => {
  const current = order.get()
  order.set({ ...current, customer: { ...current.customer, ...patch } })
}
