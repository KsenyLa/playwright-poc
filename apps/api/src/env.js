import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const rootEnvPath = resolve(__dirname, '../../../.env')
const apiEnvPath = resolve(__dirname, '../.env')

// Load root .env first, then let apps/api/.env override it when present.
config({ path: rootEnvPath })
config({ path: apiEnvPath, override: true })
