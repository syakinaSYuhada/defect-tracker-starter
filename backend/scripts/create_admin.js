require('dotenv').config();
const db = require('../src/config/db');
const bcrypt = require('bcrypt');

async function run() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'adminpass';
  const name = process.env.ADMIN_NAME || 'Admin';
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password_hash TEXT, role TEXT, created_at TIMESTAMP DEFAULT NOW())`);
    const { rows } = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (rows.length) return console.log('Admin already exists');
    await db.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4)', [name, email, hash, 'admin']);
    console.log('Admin created:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
