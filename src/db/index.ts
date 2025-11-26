import { config } from 'dotenv'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema.ts'

// Load .env.local first, then .env
config({ path: '.env.local' })
config()

// Use a pool with proper configuration for local PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const db = drizzle(pool, { schema })
