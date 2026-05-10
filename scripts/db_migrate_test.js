const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

async function run() {
  try {
    // Drop all tables first (cascade to handle foreign keys)
    const dropSql = `
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS defect_status_history CASCADE;
      DROP TABLE IF EXISTS defect_timeline CASCADE;
      DROP TABLE IF EXISTS attachments CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS defects CASCADE;
      DROP TABLE IF EXISTS severity_levels CASCADE;
      DROP TABLE IF EXISTS statuses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    console.log('Dropping existing tables...');
    await db.pool.query(dropSql);
    console.log('Tables dropped');

    // Now create fresh schema
    const sqlPath = path.join(__dirname, '..', 'db', 'schema-test.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running test schema SQL...');
    await db.pool.query(sql);
    console.log('Test schema applied');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
