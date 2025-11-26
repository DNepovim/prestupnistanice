import { persistentAtom } from '@nanostores/persistent'

export type OrderState = 'cartContent' | 'deliveryPayment' | 'personalData' | 'summary'

export type CartItem = {
  slug: string
  count: number
}

export type DeliveryOption = 'balikovna' | 'balikovna-adresa' | 'osobni-prevzeti'
export type PaymentOption = 'prevodem' | 'dobirkou' | 'hotovost'
export type PickupLocation = 'praha-kralin' | 'melnik' | 'revnice'

export type PersonalData = {
  firstname: string
  surname: string
  email: string
  phone?: string
  street?: string
  number?: string
  city?: string
  postcode?: string
}

export type OrderStore = {
  currentState: OrderState
  cart: CartItem[]
  delivery: DeliveryOption | null
  pickupLocation: PickupLocation | null
  payment: PaymentOption | null
  personalData: PersonalData
}

const initialState: OrderStore = {
  currentState: 'cartContent',
  cart: [],
  delivery: null,
  pickupLocation: null,
  payment: null,
  personalData: {
    firstname: '',
    surname: '',
    email: '',
    phone: '',
    street: '',
    number: '',
    city: '',
    postcode: '',
  },
}

export const orderStore = persistentAtom<OrderStore>('order:v1', initialState, {
  encode: JSON.stringify,
  decode: (s) => {
    try {
      const parsed = JSON.parse(s) as Partial<OrderStore>
      return { ...initialState, ...parsed } as OrderStore
    } catch {
      return initialState
    }
  },
})

// Actions
export function setCurrentState(state: OrderState): void {
  const curr = orderStore.get()
  orderStore.set({ ...curr, currentState: state })
}

export function addToCart(slug: string, count = 1): void {
  const { cart } = orderStore.get()
  const existing = cart.find((i) => i.slug === slug)
  if (existing) {
    orderStore.set({
      ...orderStore.get(),
      cart: cart.map((i) => (i.slug === slug ? { ...i, count: i.count + count } : i)),
    })
  } else {
    orderStore.set({ ...orderStore.get(), cart: [...cart, { slug, count }] })
  }
}

export function updateQuantity(slug: string, count: number): void {
  const next = Math.max(1, count)
  const { cart } = orderStore.get()
  orderStore.set({
    ...orderStore.get(),
    cart: cart.map((i) => (i.slug === slug ? { ...i, count: next } : i)),
  })
}

export function removeFromCart(slug: string): void {
  const { cart } = orderStore.get()
  orderStore.set({ ...orderStore.get(), cart: cart.filter((i) => i.slug !== slug) })
}

export function emptyCart(): void {
  orderStore.set({ ...orderStore.get(), cart: [] })
}

export function getTotalItems(): number {
  return orderStore.get().cart.reduce((a, b) => a + b.count, 0)
}

export function setDelivery(delivery: DeliveryOption): void {
  const curr = orderStore.get()
  orderStore.set({
    ...curr,
    delivery,
    pickupLocation: delivery === 'osobni-prevzeti' ? curr.pickupLocation : null,
  })
}

export function setPickupLocation(location: PickupLocation): void {
  const curr = orderStore.get()
  orderStore.set({ ...curr, pickupLocation: location })
}

export function setPayment(payment: PaymentOption): void {
  const curr = orderStore.get()
  orderStore.set({ ...curr, payment })
}

export function updatePersonalData(data: PersonalData): void {
  const { personalData } = orderStore.get()
  orderStore.set({ ...orderStore.get(), personalData: { ...personalData, ...data } })
}

export function resetOrder(): void {
  orderStore.set(initialState)
}

export function isDeliveryValid(): boolean {
  const { delivery, pickupLocation } = orderStore.get()
  if (!delivery) return false
  if (delivery === 'osobni-prevzeti') {
    return !!pickupLocation
  }
  return true
}

export function isPaymentValid(): boolean {
  const { payment, delivery } = orderStore.get()
  if (!payment) return false
  // cash only for osobni-prevzeti, and dobirkou not allowed there
  if (delivery === 'osobni-prevzeti' && payment === 'dobirkou') return false
  return true
}

export function getDeliveryPrice(): number {
  const { delivery } = orderStore.get()
  if (delivery === 'balikovna') return 50
  if (delivery === 'balikovna-adresa') return 105
  if (delivery === 'osobni-prevzeti') return 0
  return 0
}

export function getPaymentPrice(): number {
  const { payment } = orderStore.get()
  if (payment === 'dobirkou') return 19
  return 0
}
