const db = require('../../src/config/db');

async function query(sql, params) {
  const res = await db.query(sql, params);
  return res;
}

async function resetDatabase() {
  // Truncate in order to avoid FK issues
  const tables = ['activity_logs', 'defect_status_history', 'defect_timeline', 'attachments', 'comments', 'defects', 'severity_levels', 'statuses', 'users'];
  for (const t of tables) {
    try {
      await db.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE`);
    } catch (err) {
      // ignore errors for missing tables
    }
  }
}

async function seedBase() {
  // deterministic small seed
  await db.query("INSERT INTO users(id, email, role) VALUES (1, 'test-user@example.com', 'admin') ON CONFLICT (email) DO NOTHING");
  await db.query("INSERT INTO users(id, email, role) VALUES (2, 'operator1@example.com', 'operator') ON CONFLICT (email) DO NOTHING");
  await db.query("INSERT INTO statuses(id, name) VALUES (1, 'open') ON CONFLICT (name) DO NOTHING");
  await db.query("INSERT INTO statuses(id, name) VALUES (2, 'closed') ON CONFLICT (name) DO NOTHING");
  await db.query("INSERT INTO severity_levels(id, name) VALUES (1, 'low') ON CONFLICT (name) DO NOTHING");
  await db.query("INSERT INTO severity_levels(id, name) VALUES (2, 'high') ON CONFLICT (name) DO NOTHING");
}

module.exports = { query, resetDatabase, seedBase };
