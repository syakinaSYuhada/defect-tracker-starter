require('dotenv').config();
const db = require('../src/config/db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const password = process.env.ADMIN_PASSWORD || 'adminpass';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const hash = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, email]);
    console.log('Password reset for', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
