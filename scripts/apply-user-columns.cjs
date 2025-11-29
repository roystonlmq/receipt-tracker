const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function applyUserColumns() {
  try {
    await client.connect();
    
    console.log('Adding columns to users table...');
    
    // Add google_id column
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id text;
    `);
    console.log('✓ Added google_id column');
    
    // Add picture column
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS picture text;
    `);
    console.log('✓ Added picture column');
    
    // Add updated_at column
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL;
    `);
    console.log('✓ Added updated_at column');
    
    // Add unique constraint on google_id
    try {
      await client.query(`
        ALTER TABLE users ADD CONSTRAINT users_google_id_unique UNIQUE(google_id);
      `);
      console.log('✓ Added unique constraint on google_id');
    } catch (err) {
      if (err.code === '42P07') {
        console.log('✓ Unique constraint already exists');
      } else {
        throw err;
      }
    }
    
    // Add index on google_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS users_google_id_idx ON users USING btree (google_id);
    `);
    console.log('✓ Added index on google_id');
    
    console.log('\n✅ All user table updates applied successfully!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

applyUserColumns();
