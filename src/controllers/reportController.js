const db = require('../config/db');

exports.listExports = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM report_exports ORDER BY created_at DESC LIMIT 100');
    return res.json(rows);
  } catch (err) {
    console.error('List exports error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createExport = async (req, res) => {
  const payload = req.validatedData || req.body || {};
  const { export_type, date_from, date_to } = payload;
  try {
    const { rows } = await db.query('INSERT INTO report_exports(exported_by, export_type, date_from, date_to, created_at) VALUES($1,$2,$3,$4,NOW()) RETURNING *', [req.user ? req.user.id : null, export_type, date_from || null, date_to || null]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create export error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
