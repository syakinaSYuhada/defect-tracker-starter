-- Minimal test schema for CI integration tests
-- Keep it small and deterministic to speed up CI

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS defects (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  product_id INTEGER,
  defect_type_id INTEGER,
  category_id INTEGER,
  batch_id INTEGER,
  batch_number TEXT,
  production_date TEXT,
  production_line_id INTEGER,
  quantity_affected INTEGER,
  reported_by INTEGER REFERENCES users(id),
  severity_id INTEGER,
  status_id INTEGER REFERENCES statuses(id),
  reported_at TEXT,
  reported_source TEXT,
  defect_location TEXT,
  occurrence_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  defect_id INTEGER REFERENCES defects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  defect_id INTEGER REFERENCES defects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional tables for integration tests
CREATE TABLE IF NOT EXISTS severity_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS defect_timeline (
  id SERIAL PRIMARY KEY,
  defect_id INTEGER REFERENCES defects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS defect_status_history (
  id SERIAL PRIMARY KEY,
  defect_id INTEGER REFERENCES defects(id) ON DELETE CASCADE,
  changed_by INTEGER REFERENCES users(id),
  old_status TEXT,
  new_status TEXT,
  remarks TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Minimal dashboard view expected by tests
CREATE VIEW IF NOT EXISTS v_dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM defects WHERE deleted_at IS NULL) AS total_defects,
  (SELECT COUNT(*) FROM defects WHERE deleted_at IS NULL AND status_id IS NOT NULL) AS active_defects,
  NOW()::date AS snapshot_date;

