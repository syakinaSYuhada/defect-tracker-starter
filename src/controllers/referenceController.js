const db = require('../config/db');

exports.getSeverities = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM severity_levels WHERE coalesce(is_active, true) = true ORDER BY rank');
    return res.json(rows);
  } catch (err) {
    console.error('Get severities error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getStatuses = async (req, res) => {
  try {
    const moduleFilter = req.query.module;
    let rows;
    if (moduleFilter) {
      ({ rows } = await db.query('SELECT * FROM statuses WHERE module=$1 AND coalesce(is_active, true)=true ORDER BY id', [moduleFilter]));
    } else {
      ({ rows } = await db.query('SELECT * FROM statuses WHERE coalesce(is_active, true)=true ORDER BY module, id'));
    }
    return res.json(rows);
  } catch (err) {
    console.error('Get statuses error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getDefectTypes = async (req, res) => {
  try {
    const categoryId = req.query.category_id ? Number(req.query.category_id) : null;
    if (categoryId) {
      const { rows } = await db.query('SELECT * FROM defect_types WHERE coalesce(is_active,true)=true AND category_id=$1 ORDER BY name', [categoryId]);
      return res.json(rows);
    }
    const { rows } = await db.query('SELECT * FROM defect_types WHERE coalesce(is_active,true)=true ORDER BY name');
    return res.json(rows);
  } catch (err) {
    console.error('Get defect types error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, name, code FROM products WHERE coalesce(is_active,true)=true ORDER BY name');
    return res.json(rows);
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
