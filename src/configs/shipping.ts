export const DELIVERY_IDS = ['balikovna', 'balikovna-adresa', 'osobni-prevzeti'] as const
export const PAYMENT_IDS = ['prevodem', 'dobirkou', 'hotovost'] as const
export const PICKUP_IDS = ['praha-kralin', 'melnik', 'revnice'] as const

export type DeliveryId = (typeof DELIVERY_IDS)[number]
export type PaymentId = (typeof PAYMENT_IDS)[number]
export type PickupId = (typeof PICKUP_IDS)[number]

type DeliveryOption = {
  name: string
  description: string
  price: number
  needsPoint: boolean
  needsAddress: boolean
  needsPickupLocation: boolean
}

type PaymentOption = {
  name: string
  description: string
  price: number
  deliveries: readonly DeliveryId[]
  unavailableNote: string
}

export const DELIVERY_OPTIONS = {
  balikovna: {
    name: 'Balíkovna – výdejna',
    description: 'Vyzvednutí na výdejním místě, které si vyberete na mapě Balíkovny.',
    price: 50,
    needsPoint: true,
    needsAddress: false,
    needsPickupLocation: false,
  },
  'balikovna-adresa': {
    name: 'Balíkovna na adresu',
    description: 'Doručení na adresu, kterou vyplníte v osobních údajích.',
    price: 105,
    needsPoint: false,
    needsAddress: true,
    needsPickupLocation: false,
  },
  'osobni-prevzeti': {
    name: 'Osobní převzetí',
    description: 'Vyzvednutí u nás, bez poplatku.',
    price: 0,
    needsPoint: false,
    needsAddress: false,
    needsPickupLocation: true,
  },
} as const satisfies Record<DeliveryId, DeliveryOption>

export const PAYMENT_OPTIONS = {
  prevodem: {
    name: 'Převodem',
    description: 'Platba bankovním převodem před odesláním zásilky.',
    price: 0,
    deliveries: DELIVERY_IDS,
    unavailableNote: '',
  },
  dobirkou: {
    name: 'Dobírkou',
    description: 'Platba kurýrovi nebo na výdejně při převzetí zásilky.',
    price: 19,
    deliveries: ['balikovna', 'balikovna-adresa'],
    unavailableNote:
      'Dobírku nelze využít při osobním převzetí, platí se převodem nebo hotově.',
  },
  hotovost: {
    name: 'Hotově při převzetí',
    description: 'Platba v hotovosti na místě osobního převzetí.',
    price: 0,
    deliveries: ['osobni-prevzeti'],
    unavailableNote: 'Hotově lze platit jen při osobním převzetí.',
  },
} as const satisfies Record<PaymentId, PaymentOption>

export const PICKUP_LOCATIONS = {
  'praha-kralin': 'Praha-Králín',
  melnik: 'Mělník',
  revnice: 'Řevnice',
} as const satisfies Record<PickupId, string>

export const BALIKOVNA_WIDGET_ORIGIN = 'https://b2c.cpost.cz'
export const BALIKOVNA_WIDGET_URL = `${BALIKOVNA_WIDGET_ORIGIN}/locations/?type=BALIKOVNA`

export const getDeliveryPrice = (delivery: DeliveryId | null) =>
  delivery === null ? 0 : DELIVERY_OPTIONS[delivery].price

export const getPaymentPrice = (payment: PaymentId | null) =>
  payment === null ? 0 : PAYMENT_OPTIONS[payment].price

export const isPaymentAvailable = (payment: PaymentId, delivery: DeliveryId | null) =>
  delivery !== null && PAYMENT_OPTIONS[payment].deliveries.some((id) => id === delivery)
