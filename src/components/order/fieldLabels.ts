import type { FieldKey } from '@/utils/order/validation'

export const FIELD_LABELS = {
  cart: 'Košík',
  delivery: 'Doprava',
  pickupLocation: 'Místo převzetí',
  point: 'Výdejna',
  payment: 'Platba',
  firstname: 'Jméno',
  surname: 'Příjmení',
  email: 'E-mail',
  phone: 'Telefon',
  street: 'Ulice a číslo',
  city: 'Obec',
  postcode: 'PSČ',
  companyName: 'Název firmy',
  ico: 'IČO',
  dic: 'DIČ',
  consentTerms: 'Obchodní podmínky',
  consentPrivacy: 'Zpracování údajů',
} as const satisfies Record<FieldKey, string>

export const STEP_TITLES = {
  1: 'Obsah košíku',
  2: 'Doprava a platba',
  3: 'Osobní údaje',
} as const
