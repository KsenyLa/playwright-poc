export const normalizeWarehousePayload = (payload) => ({
  name: payload.name.trim(),
  description: payload.description ? payload.description.trim() : ''
})

export const normalizeProductPayload = (payload) => ({
  name: payload.name.trim(),
  price: Number(payload.price)
})

export const normalizePositionPayload = (payload) => ({
  productId: payload.productId,
  warehouseId: payload.warehouseId,
  amount: Number(payload.amount)
})
