const db = require('../config/db');

exports.listActions = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM corrective_actions ORDER BY created_at DESC LIMIT 200');
    return res.json(rows);
  } catch (err) {
    console.error('List actions error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getAction = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  try {
    const { rows } = await db.query('SELECT * FROM corrective_actions WHERE id=$1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Get action error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createAction = async (req, res) => {
  const payload = req.validatedData || req.body || {};
  const { defect_id, assigned_to, description, due_date, status } = payload;
  try {
    const { rows } = await db.query(
      'INSERT INTO corrective_actions(defect_id, assigned_to, description, due_date, status, created_at) VALUES($1,$2,$3,$4,$5,NOW()) RETURNING *',
      [defect_id, assigned_to || null, description, due_date || null, status || 'New']
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create action error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateAction = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const payload = req.validatedData || req.body || {};
  const allowed = ['assigned_to','description','due_date','status','progress_percent','started_at','completed_at','deleted_at'];
  const sets = [];
  const vals = [];
  let idx = 1;
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, k)) {
      sets.push(`${k}=$${idx}`);
      vals.push(payload[k]);
      idx++;
    }
  }
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  vals.push(id);
  const sql = `UPDATE corrective_actions SET ${sets.join(', ')}, updated_at = NOW() WHERE id=$${idx} RETURNING *`;
  try {
    const { rows } = await db.query(sql, vals);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Update action error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
