const db = require('../src/config/db');

// Close DB pool after all tests to avoid Jest open handle warnings
afterAll(async () => {
  try {
    if (db && db.pool && typeof db.pool.end === 'function') {
      await db.pool.end();
    }
  } catch (err) {
    // ignore
  }
});
