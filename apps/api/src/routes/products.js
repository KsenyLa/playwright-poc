import { Router } from 'express'
import { ApiError } from '../errors.js'
import { assertIdParam, validateProductInput } from '../validation.js'
import { makeId } from '../id.js'
import { mapProduct } from '../utils/mappers.js'
import { normalizeProductPayload } from '../utils/payloads.js'
import { wrap } from '../utils/http.js'

export const createProductRouter = ({ db }) => {
  const router = Router()

  router.get('/products', wrap(async (_req, res) => {
    const result = await db.query('SELECT id, name, price FROM products ORDER BY name ASC')
    res.json(result.rows.map(mapProduct))
  }))

  router.post('/products', wrap(async (req, res) => {
    validateProductInput(req.body)
    const payload = normalizeProductPayload(req.body)
    const id = makeId()

    const result = await db.query(
      'INSERT INTO products (id, name, price) VALUES ($1, $2, $3) RETURNING id, name, price',
      [id, payload.name, payload.price]
    )

    res.status(201).json(mapProduct(result.rows[0]))
  }))

  router.put('/products/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)
    validateProductInput(req.body)
    const payload = normalizeProductPayload(req.body)

    const result = await db.query(
      'UPDATE products SET name = $2, price = $3 WHERE id = $1 RETURNING id, name, price',
      [req.params.id, payload.name, payload.price]
    )

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.json(mapProduct(result.rows[0]))
  }))

  router.delete('/products/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)

    const result = await db.query('DELETE FROM products WHERE id = $1', [req.params.id])

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.status(204).send()
  }))

  return router
}
