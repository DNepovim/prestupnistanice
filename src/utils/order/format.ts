const POSTCODE_DIGITS = 5
const POSTCODE_GROUP = 3

export const formatPostcode = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, POSTCODE_DIGITS)
  return digits.length > POSTCODE_GROUP
    ? `${digits.slice(0, POSTCODE_GROUP)} ${digits.slice(POSTCODE_GROUP)}`
    : digits
}
