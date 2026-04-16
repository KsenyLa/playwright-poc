import { createApp } from './app.js'
import { defaultPool } from './db.js'

const port = Number(process.env.PORT || 3001)
const app = createApp({ db: defaultPool })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Configure .env or apps/api/.env before starting the API.')
  process.exit(1)
}

try {
  await defaultPool.query('SELECT 1')
} catch (error) {
  console.error('Failed to connect to Postgres. Check DATABASE_URL and database availability.')
  console.error(error.message)
  process.exit(1)
}

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})

const shutdown = async () => {
  server.close(async () => {
    await defaultPool.end()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
