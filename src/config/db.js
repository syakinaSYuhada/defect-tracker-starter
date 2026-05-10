const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://defecttracker:defecttracker@localhost:5432/defecttracker';
const pool = new Pool({ connectionString });

pool.on('connect', () => console.log('DB pool connected'));
pool.on('error', (err) => console.error('Unexpected DB error', err));

module.exports = { query: (text, params) => pool.query(text, params), pool };
