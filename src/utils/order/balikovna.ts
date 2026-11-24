import type { BalikovnaPoint } from '@/stores/order'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toText = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined

export const parseBalikovnaMessage = (data: unknown): BalikovnaPoint | undefined => {
  if (!isRecord(data) || data.message !== 'pickerResult' || !isRecord(data.point)) {
    return undefined
  }
  const id = toText(data.point.id) ?? toText(data.id)
  if (id === undefined) {
    return undefined
  }
  const name = toText(data.point.name) ?? `Výdejní místo ${id}`
  const address = toText(data.point.address)
  return { id, name: address === undefined ? name : `${name}, ${address}` }
}
