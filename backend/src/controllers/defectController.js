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
