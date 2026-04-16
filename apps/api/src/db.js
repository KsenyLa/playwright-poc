import './env.js'
import { Pool } from 'pg'

export const defaultPool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export const withTransaction = async (pool, work) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
