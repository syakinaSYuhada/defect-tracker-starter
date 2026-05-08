-- Run this on your Postgres database (psql -d defecttracker -f schema.sql)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Production lines
CREATE TABLE IF NOT EXISTS production_lines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Defect types (optional taxonomy)
CREATE TABLE IF NOT EXISTS defect_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  severity_level TEXT DEFAULT 'low'
);

-- Defects
CREATE TABLE IF NOT EXISTS defects (
  id SERIAL PRIMARY KEY,
  production_line_id INTEGER REFERENCES production_lines(id) ON DELETE SET NULL,
  defect_type_id INTEGER REFERENCES defect_types(id) ON DELETE SET NULL,
  batch_number TEXT,
  reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  severity TEXT DEFAULT 'low',
  status TEXT DEFAULT 'open', -- open, in_progress, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Corrective actions
CREATE TABLE IF NOT EXISTS corrective_actions (
  id SERIAL PRIMARY KEY,
  defect_id INTEGER REFERENCES defects(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'new', -- new, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Attachments (photos, reports)
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  defect_id INTEGER REFERENCES defects(id) ON DELETE CASCADE,
  action_id INTEGER REFERENCES corrective_actions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_defects_created_at ON defects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actions_due_date ON corrective_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_attachments_defect_id ON attachments(defect_id);

-- Sample admin insertion is handled by scripts/create_admin.js
