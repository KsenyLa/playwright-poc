export const mapWarehouse = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || ''
})

export const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price)
})

export const mapPosition = (row) => ({
  id: row.id,
  productId: row.product_id,
  warehouseId: row.warehouse_id,
  amount: row.amount
})
