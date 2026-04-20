import { Router } from 'express'
import { ApiError } from '../errors.js'
import { withTransaction } from '../db.js'
import {
  validatePositionInput,
  validateProductInput,
  validateWarehouseInput
} from '../validation.js'
import {
  normalizePositionPayload,
  normalizeProductPayload,
  normalizeWarehousePayload
} from '../utils/payloads.js'
import { wrap } from '../utils/http.js'

export const createSystemRouter = ({ db }) => {
  const router = Router()

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  router.post('/migration/import-local', wrap(async (req, res) => {
    const { warehouses, products, positions } = req.body || {}

    if (!Array.isArray(warehouses) || !Array.isArray(products) || !Array.isArray(positions)) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'warehouses, products, and positions must all be arrays')
    }

    const result = await withTransaction(db, async (tx) => {
      for (const warehouse of warehouses) {
        validateWarehouseInput(warehouse)

        if (!warehouse.id || typeof warehouse.id !== 'string') {
          throw new ApiError(422, 'VALIDATION_ERROR', 'Each warehouse must include string id for migration')
        }

        const payload = normalizeWarehousePayload(warehouse)

        await tx.query(
          `INSERT INTO warehouses (id, name, description)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               description = EXCLUDED.description`,
          [warehouse.id, payload.name, payload.description]
        )
      }

      for (const product of products) {
        validateProductInput(product)

        if (!product.id || typeof product.id !== 'string') {
          throw new ApiError(422, 'VALIDATION_ERROR', 'Each product must include string id for migration')
        }

        const payload = normalizeProductPayload(product)

        await tx.query(
          `INSERT INTO products (id, name, price)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               price = EXCLUDED.price`,
          [product.id, payload.name, payload.price]
        )
      }

      const invalidPositions = []

      for (const position of positions) {
        validatePositionInput(position)

        if (!position.id || typeof position.id !== 'string') {
          throw new ApiError(422, 'VALIDATION_ERROR', 'Each position must include string id for migration')
        }

        const payload = normalizePositionPayload(position)

        const [productResult, warehouseResult] = await Promise.all([
          tx.query('SELECT id FROM products WHERE id = $1', [payload.productId]),
          tx.query('SELECT id FROM warehouses WHERE id = $1', [payload.warehouseId])
        ])

        if (productResult.rowCount === 0 || warehouseResult.rowCount === 0) {
          invalidPositions.push({
            id: position.id,
            missingProduct: productResult.rowCount === 0,
            missingWarehouse: warehouseResult.rowCount === 0
          })
          continue
        }

        await tx.query(
          `INSERT INTO positions (id, product_id, warehouse_id, amount)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE
           SET product_id = EXCLUDED.product_id,
               warehouse_id = EXCLUDED.warehouse_id,
               amount = EXCLUDED.amount`,
          [position.id, payload.productId, payload.warehouseId, payload.amount]
        )
      }

      if (invalidPositions.length > 0) {
        throw new ApiError(422, 'VALIDATION_ERROR', 'Some positions reference unknown warehouses/products', {
          invalidPositions
        })
      }

      return {
        warehouses: warehouses.length,
        products: products.length,
        positions: positions.length
      }
    })

    res.status(200).json({ imported: result })
  }))

  return router
}
