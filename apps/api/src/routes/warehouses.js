import { Router } from 'express'
import { ApiError } from '../errors.js'
import { assertIdParam, validateWarehouseInput } from '../validation.js'
import { makeId } from '../id.js'
import { mapWarehouse } from '../utils/mappers.js'
import { normalizeWarehousePayload } from '../utils/payloads.js'
import { wrap } from '../utils/http.js'

export const createWarehouseRouter = ({ db }) => {
  const router = Router()

  router.get('/warehouses', wrap(async (_req, res) => {
    const result = await db.query('SELECT id, name, description FROM warehouses ORDER BY name ASC')
    res.json(result.rows.map(mapWarehouse))
  }))

  router.post('/warehouses', wrap(async (req, res) => {
    validateWarehouseInput(req.body)
    const payload = normalizeWarehousePayload(req.body)
    const id = makeId()

    const result = await db.query(
      'INSERT INTO warehouses (id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description',
      [id, payload.name, payload.description]
    )

    res.status(201).json(mapWarehouse(result.rows[0]))
  }))

  router.put('/warehouses/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)
    validateWarehouseInput(req.body)
    const payload = normalizeWarehousePayload(req.body)

    const result = await db.query(
      'UPDATE warehouses SET name = $2, description = $3 WHERE id = $1 RETURNING id, name, description',
      [req.params.id, payload.name, payload.description]
    )

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.json(mapWarehouse(result.rows[0]))
  }))

  router.delete('/warehouses/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)

    const result = await db.query('DELETE FROM warehouses WHERE id = $1', [req.params.id])

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.status(204).send()
  }))

  return router
}
