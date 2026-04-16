import express from 'express'
import cors from 'cors'
import { sendError } from './errors.js'
import { defaultPool } from './db.js'
import { createProductRouter } from './routes/products.js'
import { createWarehouseRouter } from './routes/warehouses.js'
import { createPositionRouter } from './routes/positions.js'
import { createSystemRouter } from './routes/system.js'
import { mapDbError } from './utils/db-errors.js'
import { getCorsOrigins } from './utils/cors.js'

export const createApp = ({ db = defaultPool } = {}) => {
  const app = express()

  app.use(cors({ origin: getCorsOrigins() }))
  app.use(express.json())
  app.use(createSystemRouter({ db }))
  app.use(createWarehouseRouter({ db }))
  app.use(createProductRouter({ db }))
  app.use(createPositionRouter({ db }))

  app.use((error, _req, res, _next) => {
    sendError(res, mapDbError(error))
  })

  return app
}
