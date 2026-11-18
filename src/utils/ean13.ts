const LEFT_ODD = [
  '0001101',
  '0011001',
  '0010011',
  '0111101',
  '0100011',
  '0110001',
  '0101111',
  '0111011',
  '0110111',
  '0001011',
] as const

const LEFT_EVEN = [
  '0100111',
  '0110011',
  '0011011',
  '0100001',
  '0011101',
  '0111001',
  '0000101',
  '0010001',
  '0001001',
  '0010111',
] as const

const RIGHT = [
  '1110010',
  '1100110',
  '1101100',
  '1000010',
  '1011100',
  '1001110',
  '1010000',
  '1000100',
  '1001000',
  '1110100',
] as const

const PARITY = [
  'OOOOOO',
  'OOEOEE',
  'OOEEOE',
  'OOEEEO',
  'OEOOEE',
  'OEEOOE',
  'OEEEOO',
  'OEOEOE',
  'OEOEEO',
  'OEEOEO',
] as const

const hasValidChecksum = (digits: number[]) => {
  const sum = digits
    .slice(0, 12)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3), 0)
  return (10 - (sum % 10)) % 10 === digits[12]
}

export const getEan13Modules = (isbn: string) => {
  const digits = Array.from(isbn.replaceAll(/\D/g, ''), Number)
  const [first, ...rest] = digits

  if (digits.length !== 13 || first === undefined || !hasValidChecksum(digits)) {
    return undefined
  }

  const parity = PARITY[first]
  const left = rest
    .slice(0, 6)
    .map((digit, index) => (parity?.[index] === 'E' ? LEFT_EVEN : LEFT_ODD)[digit])
  const right = rest.slice(6).map((digit) => RIGHT[digit])

  return ['101', ...left, '01010', ...right, '101'].join('')
}
