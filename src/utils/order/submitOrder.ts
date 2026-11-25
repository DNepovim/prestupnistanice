import type { PlacedOrder } from '@/utils/order/orderSchema'

export const submitOrder = (order: PlacedOrder): Promise<PlacedOrder> =>
  Promise.resolve(order)
