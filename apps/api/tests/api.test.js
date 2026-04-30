import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { Pool } from 'pg'
import { createApp } from '../src/app.js'

const dbUrl = process.env.DATABASE_URL

if (!dbUrl) {
  test('api tests skipped without DATABASE_URL', { skip: true }, () => {})
} else {
  const db = new Pool({ connectionString: dbUrl })
  const app = createApp({ db })

  const resetTables = async () => {
    await db.query('BEGIN')
    try {
      await db.query('DELETE FROM positions')
      await db.query('DELETE FROM products')
      await db.query('DELETE FROM warehouses')
      await db.query('COMMIT')
    } catch (error) {
      await db.query('ROLLBACK')
      throw error
    }
  }

  test.after(async () => {
    await db.end()
  })

  test.beforeEach(async () => {
    await resetTables()
  })

  test('GET /health', async () => {
    const response = await request(app).get('/health')
    assert.equal(response.status, 200)
    assert.equal(response.body.status, 'ok')
  })

  test('warehouse CRUD lifecycle', async () => {
    const create = await request(app)
      .post('/warehouses')
      .send({ name: 'Main', description: 'Primary warehouse' })

    assert.equal(create.status, 201)
    assert.ok(create.body.id)

    const update = await request(app)
      .put(`/warehouses/${create.body.id}`)
      .send({ name: 'Main Updated', description: 'Updated' })

    assert.equal(update.status, 200)
    assert.equal(update.body.name, 'Main Updated')

    const list = await request(app).get('/warehouses')
    assert.equal(list.status, 200)
    assert.equal(list.body.length, 1)

    const deleted = await request(app).delete(`/warehouses/${create.body.id}`)
    assert.equal(deleted.status, 204)
  })

  test('validation errors return 422 with error shape', async () => {
    const response = await request(app)
      .post('/products')
      .send({ name: 'Invalid Product', price: -1 })

    assert.equal(response.status, 422)
    assert.equal(response.body.error.code, 'VALIDATION_ERROR')
    assert.ok(response.body.error.message)
  })

  test('deleting referenced product returns 409', async () => {
    const warehouse = await request(app)
      .post('/warehouses')
      .send({ name: 'W1', description: '' })

    const product = await request(app)
      .post('/products')
      .send({ name: 'P1', price: 10 })

    await request(app)
      .post('/positions')
      .send({ productId: product.body.id, warehouseId: warehouse.body.id, amount: 2 })

    const response = await request(app).delete(`/products/${product.body.id}`)
    assert.equal(response.status, 409)
    assert.equal(response.body.error.code, 'RESOURCE_IN_USE')
  })
}
