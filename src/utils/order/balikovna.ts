import { BALIKOVNA_DETAIL_URL, POSTA_DETAIL_URL } from '@/configs/shipping'
import type { BalikovnaPoint } from '@/stores/order'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toText = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined

const ZIP_PATTERN = /^\d{5}$/

const ADDRESS_PARTS = ['street', 'city', 'zip'] as const

const toAddress = (point: Record<string, unknown>) => {
  const raw = point.address
  const text = isRecord(raw)
    ? Object.values(raw)
        .map(toText)
        .filter((part) => part !== undefined && part !== '')
        .join(', ')
    : (toText(raw) ??
      ADDRESS_PARTS.map((key) => toText(point[key]))
        .filter((part) => part !== undefined && part !== '')
        .join(', '))
  return text === '' ? undefined : text
}

const toDetailUrl = (point: Record<string, unknown>) => {
  const zip = toText(point.zip)?.replace(/\s/g, '')
  if (zip === undefined || !ZIP_PATTERN.test(zip)) {
    return undefined
  }
  return point.type === 'BALIKOVNY'
    ? `${BALIKOVNA_DETAIL_URL}${zip}`
    : `${POSTA_DETAIL_URL}${zip}`
}

export const parseBalikovnaMessage = (data: unknown): BalikovnaPoint | undefined => {
  if (!isRecord(data) || data.message !== 'pickerResult' || !isRecord(data.point)) {
    return undefined
  }
  const id = toText(data.point.id) ?? toText(data.id)
  if (id === undefined) {
    return undefined
  }
  const name = toText(data.point.name) ?? `Výdejní místo ${id}`
  const address = toAddress(data.point)
  const detailUrl = toDetailUrl(data.point)
  return {
    id,
    name,
    ...(address === undefined ? {} : { address }),
    ...(detailUrl === undefined ? {} : { detailUrl }),
  }
}
