const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { Pool } = require('pg');

const schemaPath = path.resolve(__dirname, '..', '..', 'db', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('schema.sql not found at', schemaPath);
  process.exit(1);
}
const sql = fs.readFileSync(schemaPath, 'utf8');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const client = await pool.connect();
  try {
    console.log('Applying schema...');
    await client.query(sql);
    console.log('Schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Failed to apply schema:', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    client.release();
  }
})();
