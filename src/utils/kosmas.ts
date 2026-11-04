import { isOneOf } from 'narrowland'

export type KosmasStatus = 'available' | 'outOfStock' | 'soldOut'

const SCHEMA_AVAILABILITY = [
  'InStock',
  'InStoreOnly',
  'OnlineOnly',
  'LimitedAvailability',
  'PreOrder',
  'PreSale',
  'BackOrder',
  'MadeToOrder',
  'OutOfStock',
  'SoldOut',
  'Discontinued',
] as const

type SchemaAvailability = (typeof SCHEMA_AVAILABILITY)[number]

const AVAILABILITY_TO_STATUS = {
  InStock: 'available',
  InStoreOnly: 'available',
  OnlineOnly: 'available',
  LimitedAvailability: 'available',
  PreOrder: 'available',
  PreSale: 'available',
  BackOrder: 'available',
  MadeToOrder: 'available',
  OutOfStock: 'outOfStock',
  SoldOut: 'soldOut',
  Discontinued: 'soldOut',
} as const satisfies Record<SchemaAvailability, KosmasStatus>

const AVAILABILITY_PATTERN = /"availability"\s*:\s*"(?:https?:\/\/schema\.org\/)?(\w+)"/

const FETCH_TIMEOUT_MS = 8000

const parseStatus = (html: string): KosmasStatus | undefined => {
  const availability = AVAILABILITY_PATTERN.exec(html)?.[1]
  return availability && isOneOf(availability, SCHEMA_AVAILABILITY)
    ? AVAILABILITY_TO_STATUS[availability]
    : undefined
}

export const fetchKosmasStatus = async (url: string) => {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; prestupnistanice.cz)' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!response.ok) {
    return undefined
  }

  return parseStatus(await response.text())
}
