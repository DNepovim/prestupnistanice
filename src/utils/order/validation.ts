import { DELIVERY_OPTIONS, isPaymentAvailable } from '@/configs/shipping'
import type { Customer, OrderState } from '@/stores/order'

export type FieldKey =
  | 'cart'
  | 'delivery'
  | 'pickupLocation'
  | 'point'
  | 'payment'
  | 'firstname'
  | 'surname'
  | 'email'
  | 'phone'
  | 'street'
  | 'city'
  | 'postcode'
  | 'companyName'
  | 'ico'
  | 'dic'
  | 'consentTerms'
  | 'consentPrivacy'

type FieldErrors = Partial<Record<FieldKey, string>>

type FieldCheck = readonly [FieldKey, string | undefined]

const WHITESPACE_PATTERN = /\s/
const MIN_TLD_LENGTH = 2
const POSTCODE_PATTERN = /^\d{3}\s?\d{2}$/
const ICO_PATTERN = /^\d{8}$/
const DIC_PATTERN = /^[A-Za-z]{2}\d{8,10}$/
const MIN_PHONE_DIGITS = 9

export const FIELD_STEPS = {
  cart: 1,
  delivery: 2,
  pickupLocation: 2,
  point: 2,
  payment: 2,
  firstname: 3,
  surname: 3,
  email: 3,
  phone: 3,
  street: 3,
  city: 3,
  postcode: 3,
  companyName: 3,
  ico: 3,
  dic: 3,
  consentTerms: 3,
  consentPrivacy: 3,
} as const satisfies Record<FieldKey, 1 | 2 | 3>

export const FIELD_ORDER = Object.keys(FIELD_STEPS).filter(
  (key): key is FieldKey => key in FIELD_STEPS,
)

const validateRequired = (value: string, message: string) =>
  value.trim() === '' ? message : undefined

const isEmailFormat = (value: string) => {
  const [local, domain, ...rest] = value.split('@')
  const tld = domain?.split('.').at(-1)
  return (
    rest.length === 0 &&
    !WHITESPACE_PATTERN.test(value) &&
    local !== undefined &&
    local !== '' &&
    domain?.includes('.') === true &&
    !domain.startsWith('.') &&
    tld !== undefined &&
    tld.length >= MIN_TLD_LENGTH
  )
}

const validateEmail = (value: string) =>
  value.trim() === ''
    ? 'Vyplňte e-mail.'
    : isEmailFormat(value.trim())
      ? undefined
      : 'Zadejte e-mail ve tvaru jmeno@domena.cz.'

const validatePhone = (value: string) =>
  value.trim() === ''
    ? 'Vyplňte telefon.'
    : value.replace(/\D/g, '').length >= MIN_PHONE_DIGITS
      ? undefined
      : 'Telefon má mít alespoň devět číslic.'

const validatePostcode = (value: string) =>
  value.trim() === ''
    ? 'Vyplňte PSČ.'
    : POSTCODE_PATTERN.test(value.trim())
      ? undefined
      : 'PSČ má pět číslic, například 110 00.'

const validateIco = (value: string) =>
  value.trim() === ''
    ? 'Vyplňte IČO.'
    : ICO_PATTERN.test(value.replace(/\s/g, ''))
      ? undefined
      : 'IČO má osm číslic.'

const validateDic = (value: string) =>
  value.trim() === '' || DIC_PATTERN.test(value.trim())
    ? undefined
    : 'DIČ zadejte ve tvaru CZ12345678.'

export const requiresAddress = (state: Pick<OrderState, 'delivery' | 'customer'>) =>
  state.customer.isCompany ||
  (state.delivery !== null && DELIVERY_OPTIONS[state.delivery].needsAddress)

const toErrors = (checks: readonly FieldCheck[]): FieldErrors =>
  Object.fromEntries(
    checks.filter((check): check is [FieldKey, string] => check[1] !== undefined),
  )

const validateCart = (lineCount: number): FieldErrors =>
  toErrors([['cart', lineCount > 0 ? undefined : 'Košík je prázdný.']])

const validateShipping = (
  state: Pick<OrderState, 'delivery' | 'pickupLocation' | 'balikovnaPoint' | 'payment'>,
): FieldErrors => {
  const option = state.delivery === null ? undefined : DELIVERY_OPTIONS[state.delivery]
  return toErrors([
    ['delivery', option ? undefined : 'Vyberte způsob dopravy.'],
    [
      'pickupLocation',
      option?.needsPickupLocation === true && state.pickupLocation === null
        ? 'Vyberte místo převzetí.'
        : undefined,
    ],
    [
      'point',
      option?.needsPoint === true && state.balikovnaPoint === null
        ? 'Vyberte výdejní místo Balíkovny.'
        : undefined,
    ],
    [
      'payment',
      state.payment !== null && isPaymentAvailable(state.payment, state.delivery)
        ? undefined
        : 'Vyberte způsob platby.',
    ],
  ])
}

const validateCustomer = (customer: Customer, needsAddress: boolean): FieldErrors =>
  toErrors([
    ['firstname', validateRequired(customer.firstname, 'Vyplňte jméno.')],
    ['surname', validateRequired(customer.surname, 'Vyplňte příjmení.')],
    ['email', validateEmail(customer.email)],
    ['phone', validatePhone(customer.phone)],
    [
      'street',
      needsAddress
        ? validateRequired(customer.street, 'Vyplňte ulici a číslo domu.')
        : undefined,
    ],
    ['city', needsAddress ? validateRequired(customer.city, 'Vyplňte obec.') : undefined],
    ['postcode', needsAddress ? validatePostcode(customer.postcode) : undefined],
    [
      'companyName',
      customer.isCompany
        ? validateRequired(customer.companyName, 'Vyplňte název firmy.')
        : undefined,
    ],
    ['ico', customer.isCompany ? validateIco(customer.ico) : undefined],
    ['dic', customer.isCompany ? validateDic(customer.dic) : undefined],
    [
      'consentTerms',
      customer.consentTerms
        ? undefined
        : 'Pro odeslání je nutný souhlas s obchodními podmínkami.',
    ],
    [
      'consentPrivacy',
      customer.consentPrivacy
        ? undefined
        : 'Pro odeslání je nutný souhlas se zpracováním osobních údajů.',
    ],
  ])

export const validateOrder = (state: OrderState, lineCount: number): FieldErrors => ({
  ...validateCart(lineCount),
  ...validateShipping(state),
  ...validateCustomer(state.customer, requiresAddress(state)),
})
