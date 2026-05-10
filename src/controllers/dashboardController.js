const db = require('../config/db');

exports.getSummary = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM v_dashboard_kpis LIMIT 1');
    return res.json(rows[0] || {});
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const limit = Number(req.query.weeks) || 8;
    const { rows } = await db.query('SELECT week_start, defects FROM v_weekly_defect_trends ORDER BY week_start DESC LIMIT $1', [limit]);
    // return chronological order
    return res.json(rows.reverse());
  } catch (err) {
    console.error('Dashboard trends error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM v_defects_by_category');
    return res.json(rows);
  } catch (err) {
    console.error('Defects by category error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getTopRecurring = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const { rows } = await db.query('SELECT * FROM v_top_recurring_defects LIMIT $1', [limit]);
    return res.json(rows);
  } catch (err) {
    console.error('Top recurring defects error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
