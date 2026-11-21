const priceFormat = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
})

export const formatPrice = (price: number) => priceFormat.format(price)
