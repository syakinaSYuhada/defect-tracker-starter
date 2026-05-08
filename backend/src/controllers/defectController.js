const db = require('../config/db');

exports.listDefects = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM defects ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDefect = async (req, res) => {
  const { production_line_id, defect_type_id, batch_number, description, severity } = req.body;
  // Server-side validation
  const errors = {};
  if (!description || String(description).trim().length < 5) errors.description = 'Description must be at least 5 characters';
  const allowedSeverities = ['low', 'medium', 'high'];
  if (severity && !allowedSeverities.includes(String(severity))) errors.severity = 'Invalid severity value';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  try {
    const { rows } = await db.query(
      'INSERT INTO defects(production_line_id, defect_type_id, batch_number, description, severity, created_at) VALUES($1,$2,$3,$4,$5,NOW()) RETURNING *',
      [production_line_id || null, defect_type_id || null, batch_number || '', description || '', severity || 'low']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
