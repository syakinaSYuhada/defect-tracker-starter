const db = require('../src/config/db');

async function seed() {
  try {
    // deterministic users
    await db.query("INSERT INTO users(id, email, role) VALUES (1, 'test-user@example.com', 'admin') ON CONFLICT (email) DO NOTHING");
    await db.query("INSERT INTO users(id, email, role) VALUES (2, 'tester@example.com', 'operator') ON CONFLICT (email) DO NOTHING");

    // statuses
    await db.query("INSERT INTO statuses(id, name) VALUES (1, 'open') ON CONFLICT (name) DO NOTHING");
    await db.query("INSERT INTO statuses(id, name) VALUES (2, 'in_progress') ON CONFLICT (name) DO NOTHING");
    await db.query("INSERT INTO statuses(id, name) VALUES (3, 'closed') ON CONFLICT (name) DO NOTHING");

    // severity levels
    await db.query("INSERT INTO severity_levels(id, name) VALUES (1, 'low') ON CONFLICT (name) DO NOTHING");
    await db.query("INSERT INTO severity_levels(id, name) VALUES (2, 'high') ON CONFLICT (name) DO NOTHING");

    // defects deterministic
    await db.query("INSERT INTO defects(id, title, description, product_id, severity_id, status_id, reported_by, created_at) VALUES (1, 'TEST-DEFECT-001', 'Seed defect for tests', 1, 1, 1, 1, NOW()) ON CONFLICT (id) DO NOTHING");

    // timeline
    await db.query("INSERT INTO defect_timeline(id, defect_id, event_type, event_description, created_by) VALUES (1, 1, 'Created', 'Seed created', 1) ON CONFLICT (id) DO NOTHING");

    // status history
    await db.query("INSERT INTO defect_status_history(id, defect_id, changed_by, old_status, new_status) VALUES (1, 1, 1, NULL, 'open') ON CONFLICT (id) DO NOTHING");

    // comments
    await db.query("INSERT INTO comments(id, defect_id, user_id, text) VALUES (1, 1, 2, 'Initial comment') ON CONFLICT (id) DO NOTHING");

    // attachments
    await db.query("INSERT INTO attachments(id, defect_id, filename, path, uploaded_by) VALUES (1, 1, 'test.jpg', 'test.jpg', 1) ON CONFLICT (id) DO NOTHING");

    // activity logs
    await db.query("INSERT INTO activity_logs(id, user_id, action, target_type, target_id) VALUES (1, 1, 'CREATE_DEFECT', 'defect', 1) ON CONFLICT (id) DO NOTHING");

    console.log('Seed data inserted');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

seed();
