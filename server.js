require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// Test DB connection (non-fatal)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.warn('Warning: DB connection failed at startup:', err.message);
  } else {
    console.log('Database connected, time:', res.rows[0].now);
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  server.close(() => {
    pool.end(() => process.exit(0));
  });
});
