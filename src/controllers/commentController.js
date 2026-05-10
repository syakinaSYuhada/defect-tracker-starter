const db = require('../config/db');

exports.listByDefect = async (req, res) => {
  const defectId = Number(req.params.id);
  if (!defectId) return res.status(400).json({ error: 'Invalid defect id' });
  try {
    const { rows } = await db.query('SELECT c.*, u.email as user_email FROM comments c LEFT JOIN users u ON u.id = c.user_id WHERE c.defect_id=$1 ORDER BY c.created_at DESC', [defectId]);
    return res.json(rows);
  } catch (err) {
    console.error('List comments error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createForDefect = async (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
  const defectId = Number(req.params.id);
  const payload = req.validatedData || req.body || {};
  const { text } = payload;
  if (!defectId || !text || String(text).trim().length === 0) return res.status(400).json({ error: 'Invalid payload' });
  try {
    // Ensure defect exists
    const { rows: drows } = await db.query('SELECT id FROM defects WHERE id=$1', [defectId]);
    if (!drows.length) return res.status(404).json({ error: 'Defect not found' });

    const { rows } = await db.query('INSERT INTO comments(defect_id, user_id, text, created_at) VALUES($1,$2,$3,NOW()) RETURNING *', [defectId, req.user.id, text]);
    const comment = rows[0];
    // Attach user email
    const { rows: urows } = await db.query('SELECT email FROM users WHERE id=$1', [req.user.id]);
    comment.user_email = urows[0] && urows[0].email ? urows[0].email : null;
    return res.status(201).json(comment);
  } catch (err) {
    console.error('Create comment error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  try {
    const { rows } = await db.query('SELECT * FROM comments WHERE id=$1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Comment not found' });
    const comment = rows[0];
    if (Number(req.user.id) !== Number(comment.user_id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await db.query('DELETE FROM comments WHERE id=$1', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete comment error:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
};
