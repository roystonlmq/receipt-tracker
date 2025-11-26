import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load .env.local first, then .env
config({ path: '.env.local' })
config()

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
