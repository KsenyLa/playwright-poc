import express from 'express'
import cors from 'cors'
import { ApiError, sendError } from './errors.js'
import { defaultPool, withTransaction } from './db.js'
import { makeId } from './id.js'
import {
  assertIdParam,
  validatePositionInput,
  validateProductInput,
  validateWarehouseInput
} from './validation.js'

const mapWarehouse = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || ''
})

const mapProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price)
})

const mapPosition = (row) => ({
  id: row.id,
  productId: row.product_id,
  warehouseId: row.warehouse_id,
  amount: row.amount
})

const getCorsOrigins = () => {
  const envValue = process.env.CORS_ORIGIN
  if (!envValue) {
    return ['http://localhost:5173', 'http://127.0.0.1:5173']
  }
  return envValue.split(',').map((item) => item.trim()).filter(Boolean)
}

const wrap = (handler) => async (req, res, next) => {
  try {
    await handler(req, res)
  } catch (error) {
    next(error)
  }
}

const normalizeWarehousePayload = (payload) => ({
  name: payload.name.trim(),
  description: payload.description ? payload.description.trim() : ''
})

const normalizeProductPayload = (payload) => ({
  name: payload.name.trim(),
  price: Number(payload.price)
})

const normalizePositionPayload = (payload) => ({
  productId: payload.productId,
  warehouseId: payload.warehouseId,
  amount: Number(payload.amount)
})

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

const mapDbError = (error, fallbackMessage = 'Database operation failed') => {
  if (error instanceof ApiError) {
    return error
  }

  if (['ECONNREFUSED', 'ENOTFOUND'].includes(error?.code)) {
    return new ApiError(503, 'DB_UNAVAILABLE', 'Database is unreachable. Check API DATABASE_URL and DB status.')
  }

  if (['3D000', '28P01'].includes(error?.code)) {
    return new ApiError(503, 'DB_CONFIGURATION_ERROR', 'Database configuration is invalid. Check DATABASE_URL.')
  }

  if (error?.code === '23503') {
    return new ApiError(409, 'RESOURCE_IN_USE', 'Resource is referenced by positions and cannot be deleted')
  }

  return new ApiError(500, 'INTERNAL_ERROR', fallbackMessage)
}

export const createApp = ({ db = defaultPool } = {}) => {
  const app = express()

  app.use(cors({ origin: getCorsOrigins() }))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/warehouses', wrap(async (_req, res) => {
    const result = await db.query('SELECT id, name, description FROM warehouses ORDER BY name ASC')
    res.json(result.rows.map(mapWarehouse))
  }))

  app.post('/warehouses', wrap(async (req, res) => {
    validateWarehouseInput(req.body)
    const payload = normalizeWarehousePayload(req.body)
    const id = makeId()

    const result = await db.query(
      'INSERT INTO warehouses (id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description',
      [id, payload.name, payload.description]
    )

    res.status(201).json(mapWarehouse(result.rows[0]))
  }))

  app.put('/warehouses/:id', wrap(async (req, res) => {
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

  app.delete('/warehouses/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)

    const result = await db.query('DELETE FROM warehouses WHERE id = $1', [req.params.id])

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.status(204).send()
  }))

  app.get('/products', wrap(async (_req, res) => {
    const result = await db.query('SELECT id, name, price FROM products ORDER BY name ASC')
    res.json(result.rows.map(mapProduct))
  }))

  app.post('/products', wrap(async (req, res) => {
    validateProductInput(req.body)
    const payload = normalizeProductPayload(req.body)
    const id = makeId()

    const result = await db.query(
      'INSERT INTO products (id, name, price) VALUES ($1, $2, $3) RETURNING id, name, price',
      [id, payload.name, payload.price]
    )

    res.status(201).json(mapProduct(result.rows[0]))
  }))

  app.put('/products/:id', wrap(async (req, res) => {
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

  app.delete('/products/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)

    const result = await db.query('DELETE FROM products WHERE id = $1', [req.params.id])

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.status(204).send()
  }))

  app.get('/positions', wrap(async (_req, res) => {
    const result = await db.query('SELECT id, product_id, warehouse_id, amount FROM positions ORDER BY id ASC')
    res.json(result.rows.map(mapPosition))
  }))

  app.post('/positions', wrap(async (req, res) => {
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

  app.put('/positions/:id', wrap(async (req, res) => {
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

  app.delete('/positions/:id', wrap(async (req, res) => {
    assertIdParam(req.params.id)

    const result = await db.query('DELETE FROM positions WHERE id = $1', [req.params.id])

    if (result.rowCount === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Resource not found')
    }

    res.status(204).send()
  }))


  app.use((error, _req, res, _next) => {
    sendError(res, mapDbError(error))
  })

  return app
}

export { defaultPool }
