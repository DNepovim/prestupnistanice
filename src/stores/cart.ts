import { persistentAtom } from '@nanostores/persistent'
import { computed } from 'nanostores'

type CartItem = {
  slug: string
  count: number
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isCartItem = (value: unknown): value is CartItem =>
  isRecord(value) &&
  typeof value.slug === 'string' &&
  typeof value.count === 'number' &&
  Number.isInteger(value.count) &&
  value.count > 0

const decodeCart = (raw: string): CartItem[] => {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

export const cart = persistentAtom<CartItem[]>('cart:v1', [], {
  encode: JSON.stringify,
  decode: decodeCart,
})

export const cartCount = computed(cart, (items) =>
  items.reduce((total, item) => total + item.count, 0),
)

export const addToCart = (slug: string) => {
  const items = cart.get()
  cart.set(
    items.some((item) => item.slug === slug)
      ? items.map((item) =>
          item.slug === slug ? { ...item, count: item.count + 1 } : item,
        )
      : [...items, { slug, count: 1 }],
  )
}

export const updateQuantity = (slug: string, count: number) => {
  cart.set(
    count > 0
      ? cart.get().map((item) => (item.slug === slug ? { ...item, count } : item))
      : cart.get().filter((item) => item.slug !== slug),
  )
}

export const removeFromCart = (slug: string) => {
  cart.set(cart.get().filter((item) => item.slug !== slug))
}

export const emptyCart = () => {
  cart.set([])
}
