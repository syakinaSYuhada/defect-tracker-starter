const { createClient } = require('@supabase/supabase-js');
const db = require('../config/db');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'uploads';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase not configured. Set SUPABASE_URL and SUPABASE_KEY to enable uploads.');
}

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Expects authenticated request (req.user set by auth middleware). Optional body fields: defect_id, action_id
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!supabase) return res.status(500).json({ error: 'Storage not configured' });
  if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });

  const file = req.file; // buffer
  const filename = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
  const defectId = req.body.defect_id ? Number(req.body.defect_id) : null;
  const actionId = req.body.action_id ? Number(req.body.action_id) : null;
  
    // Validate: require either defect_id or action_id to link attachment
    if (!defectId && !actionId) return res.status(400).json({ error: 'Must provide defect_id or action_id' });

  try {
    // Validate defect_id or action_id if provided
    if (defectId) {
      const { rows } = await db.query('SELECT id FROM defects WHERE id=$1', [defectId]);
      if (!rows.length) return res.status(400).json({ error: 'Invalid defect_id' });
    }
    if (actionId) {
      const { rows } = await db.query('SELECT id FROM corrective_actions WHERE id=$1', [actionId]);
      if (!rows.length) return res.status(400).json({ error: 'Invalid action_id' });
    }
    const { data, error } = await supabase.storage.from(BUCKET).upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });
    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Upload failed' });
    }

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;

    // Insert attachment record into DB
    const insertQuery = `INSERT INTO attachments(defect_id, action_id, filename, path, uploaded_by, uploaded_at)
      VALUES($1,$2,$3,$4,$5,NOW()) RETURNING *`;
    const values = [defectId, actionId, filename, data?.path || filename, req.user.id];
    const result = await db.query(insertQuery, values);
    const attachment = result.rows[0];

    return res.status(201).json({ attachment, url: publicUrl });
  } catch (err) {
      console.error('Upload controller error:', err && err.message ? err.message : err);
      // If it's a validation-like error, surface 400
      if (err && err.message && err.message.toLowerCase().includes('invalid')) return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: 'Server error' });
  }
};

  // List attachments for a given defect id
  exports.listByDefect = async (req, res) => {
    const defectId = Number(req.params.id);
    if (!defectId) return res.status(400).json({ error: 'Invalid defect id' });
    try {
      const { rows } = await db.query('SELECT a.*, u.email as uploaded_by_email FROM attachments a LEFT JOIN users u ON u.id = a.uploaded_by WHERE a.defect_id=$1 ORDER BY a.uploaded_at DESC', [defectId]);
      const items = rows.map(r => {
        const url = supabase ? supabase.storage.from(BUCKET).getPublicUrl(r.path).data.publicUrl : null;
        return Object.assign({}, r, { url });
      });
      return res.json(items);
    } catch (err) {
      console.error('List attachments error:', err && err.message ? err.message : err);
      return res.status(500).json({ error: 'Server error' });
    }
  };

  // Delete an attachment by id — only uploader or admin
  exports.deleteAttachment = async (req, res) => {
    if (!req.user || !req.user.id) return res.status(401).json({ error: 'Unauthorized' });
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid attachment id' });
    try {
      const { rows } = await db.query('SELECT * FROM attachments WHERE id=$1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Attachment not found' });
      const attachment = rows[0];
      if (Number(req.user.id) !== Number(attachment.uploaded_by) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (supabase) {
        const { error } = await supabase.storage.from(BUCKET).remove([attachment.path]);
        if (error) console.warn('Supabase remove warning:', error.message || error);
      }

      await db.query('DELETE FROM attachments WHERE id=$1', [id]);
      return res.json({ success: true });
    } catch (err) {
      console.error('Delete attachment error:', err && err.message ? err.message : err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
