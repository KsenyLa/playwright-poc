import { Router } from 'express'
import { ApiError } from '../errors.js'
import { assertIdParam, validatePositionInput } from '../validation.js'
import { makeId } from '../id.js'
import { mapPosition } from '../utils/mappers.js'
import { normalizePositionPayload } from '../utils/payloads.js'
import { wrap } from '../utils/http.js'

const ensurePositionReferences = async (db, payload) => {
  const [productResult, warehouseResult] = await Promise.all([
    db.query('SELECT id FROM products WHERE id = $1', [payload.productId]),
    db.query('SELECT id FROM warehouses WHERE id = $1', [payload.warehouseId])
  ])

  const missing = []

  if (productResult.rowCount === 0) {
    missing.push(`product:${payload.productId}`)
  }

  if (warehouseResult.rowCount === 0) {
    missing.push(`warehouse:${payload.warehouseId}`)
  }

  if (missing.length > 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Position references unknown entities', { missing })
  }
}

export const createPositionRouter = ({ db }) => {
  const router = Router()

  router.get('/positions', wrap(async (_req, res) => {
    const result = await db.query('SELECT id, product_id, warehouse_id, amount FROM positions ORDER BY id ASC')
    res.json(result.rows.map(mapPosition))
  }))

  router.post('/positions', wrap(async (req, res) => {
    validatePositionInput(req.body)
    const payload = normalizePositionPayload(req.body)
    await ensurePositionReferences(db, payload)
    const id = makeId()

    const result = await db.query(
      'INSERT INTO positions (id, product_id, warehouse_id, amount) VALUES ($1, $2, $3, $4) RETURNING id, product_id, warehouse_id, amount',
      [id, payload.productId, payload.warehouseId, payload.amount]
    )

    res.status(201).json(mapPosition(result.rows[0]))
  }))

  router.put('/positions/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)
    validatePositionInput(req.body)
    const payload = normalizePositionPayload(req.body)
    await ensurePositionReferences(db, payload)

    const result = await db.query(
      'UPDATE positions SET product_id = $2, warehouse_id = $3, amount = $4 WHERE id = $1 RETURNING id, product_id, warehouse_id, amount',
      [req.params.id, payload.productId, payload.warehouseId, payload.amount]
    )

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.json(mapPosition(result.rows[0]))
  }))

  router.delete('/positions/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)

    const result = await db.query('DELETE FROM positions WHERE id = $1', [req.params.id])

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.status(204).send()
  }))

  return router
}
