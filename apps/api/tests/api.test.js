import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { Pool } from 'pg'
import { createApp } from '../src/app.js'

const dbUrl = process.env.DATABASE_URL

if (!dbUrl) {
  test('api tests skipped without DATABASE_URL', { skip: true }, () => {})
} else {
  process.env.ALLOW_TEST_RESET = 'true'

  const db = new Pool({ connectionString: dbUrl })
  const app = createApp({ db })

  test.after(async () => {
    await db.end()
  })

  test.beforeEach(async () => {
    await request(app).delete('/test/reset')
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

  test('import-local is idempotent by id', async () => {
    const payload = {
      warehouses: [{ id: 'w1', name: 'Warehouse 1', description: '' }],
      products: [{ id: 'p1', name: 'Product 1', price: 11.5 }],
      positions: [{ id: 'pos1', productId: 'p1', warehouseId: 'w1', amount: 5 }]
    }

    const first = await request(app).post('/migration/import-local').send(payload)
    assert.equal(first.status, 200)

    const second = await request(app).post('/migration/import-local').send(payload)
    assert.equal(second.status, 200)

    const positions = await request(app).get('/positions')
    assert.equal(positions.body.length, 1)
  })
}
