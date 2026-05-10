const db = require('../config/db');

// Helper: build filters, values and pagination for defect listing
function buildDefectFilters(query) {
  const where = ['d.deleted_at IS NULL'];
  const values = [];
  let idx = 1;

  if (query.status_id) {
    where.push(`d.status_id = $${idx}`);
    values.push(Number(query.status_id));
    idx++;
  }
  if (query.severity_id) {
    where.push(`d.severity_id = $${idx}`);
    values.push(Number(query.severity_id));
    idx++;
  }
  if (query.product_id) {
    where.push(`d.product_id = $${idx}`);
    values.push(Number(query.product_id));
    idx++;
  }
  if (query.category_id) {
    where.push(`d.category_id = $${idx}`);
    values.push(Number(query.category_id));
    idx++;
  }
  if (query.batch_id) {
    where.push(`d.batch_id = $${idx}`);
    values.push(Number(query.batch_id));
    idx++;
  }

  if (query.q) {
    // Search across description, defect_number, batch_number and defect type name
    where.push(`(d.description ILIKE $${idx} OR d.defect_number ILIKE $${idx} OR d.batch_number ILIKE $${idx} OR dt.name ILIKE $${idx})`);
    values.push(`%${query.q}%`);
    idx++;
  }

  // Sorting
  const allowedSort = ['reported_at','created_at','severity','priority','defect_number'];
  let sort = 'd.reported_at';
  if (query.sort && allowedSort.includes(query.sort)) sort = `d.${query.sort}`;
  const order = (query.order && String(query.order).toLowerCase() === 'asc') ? 'ASC' : 'DESC';

  // Pagination
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Number(query.limit) || 20);
  const offset = (page - 1) * limit;

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return { whereClause, values, sort, order, limit, offset, page };
}

// Standard response helper
function success(res, data, pagination) {
  return res.json({ success: true, data, pagination: pagination || null });
}

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

exports.listDefects = async (req, res) => {
  try {
    const sourceQuery = req.validatedQuery || req.query || {};
    const { whereClause, values, sort, order, limit, offset, page } = buildDefectFilters(sourceQuery);

    // Count total
    const countSql = `SELECT COUNT(*)::int AS total FROM defects d LEFT JOIN defect_types dt ON dt.id = d.defect_type_id ${whereClause}`;
    const countResult = await db.query(countSql, values);
    const total = countResult.rows[0] ? countResult.rows[0].total : 0;

    // Main select with useful joins to avoid extra frontend calls
    const selSql = `
      SELECT d.*, p.name AS product_name, dt.name AS defect_type_name, c.name AS category_name,
             sl.name AS severity_name, s.name AS status_name, pl.name AS production_line_name, u.name AS reported_by_name
      FROM defects d
      LEFT JOIN products p ON p.id = d.product_id
      LEFT JOIN defect_types dt ON dt.id = d.defect_type_id
      LEFT JOIN defect_categories c ON c.id = d.category_id
      LEFT JOIN severity_levels sl ON sl.id = d.severity_id
      LEFT JOIN statuses s ON s.id = d.status_id
      LEFT JOIN production_lines pl ON pl.id = d.production_line_id
      LEFT JOIN users u ON u.id = d.reported_by
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const qvalues = values.concat([limit, offset]);
    const { rows } = await db.query(selSql, qvalues);

    const pages = Math.max(1, Math.ceil(total / limit));
    return success(res, rows, { page, limit, total, pages });
  } catch (err) {
    console.error('List defects error:', err);
    return fail(res, 500, 'Server error');
  }
};

exports.getDefect = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return fail(res, 400, 'Invalid id');
  try {
    const sql = `
      SELECT d.*, p.name AS product_name, dt.name AS defect_type_name, c.name AS category_name,
             sl.name AS severity_name, s.name AS status_name, pl.name AS production_line_name, u.name AS reported_by_name, u.email AS reported_by_email
      FROM defects d
      LEFT JOIN products p ON p.id = d.product_id
      LEFT JOIN defect_types dt ON dt.id = d.defect_type_id
      LEFT JOIN defect_categories c ON c.id = d.category_id
      LEFT JOIN severity_levels sl ON sl.id = d.severity_id
      LEFT JOIN statuses s ON s.id = d.status_id
      LEFT JOIN production_lines pl ON pl.id = d.production_line_id
      LEFT JOIN users u ON u.id = d.reported_by
      WHERE d.id=$1 AND d.deleted_at IS NULL
      LIMIT 1
    `;
    const { rows } = await db.query(sql, [id]);
    if (!rows.length) return fail(res, 404, 'Defect not found');
    const defect = rows[0];

    // Fetch related data in parallel
    const [attachmentsRes, commentsRes, timelineRes, actionsRes, rcaRes, statusHistRes] = await Promise.all([
      db.query('SELECT a.*, u.email as uploaded_by_email FROM attachments a LEFT JOIN users u ON u.id = a.uploaded_by WHERE a.defect_id=$1 AND a.deleted_at IS NULL ORDER BY a.uploaded_at DESC', [id]),
      db.query('SELECT c.*, u.email as user_email FROM comments c LEFT JOIN users u ON u.id = c.user_id WHERE c.defect_id=$1 AND c.deleted_at IS NULL ORDER BY c.created_at DESC', [id]),
      db.query('SELECT * FROM defect_timeline WHERE defect_id=$1 ORDER BY created_at ASC', [id]),
      db.query('SELECT ca.*, u.email as assigned_to_email FROM corrective_actions ca LEFT JOIN users u ON u.id = ca.assigned_to WHERE ca.defect_id=$1 AND ca.deleted_at IS NULL ORDER BY ca.due_date NULLS LAST', [id]),
      db.query('SELECT * FROM root_cause_analysis WHERE defect_id=$1 ORDER BY created_at DESC LIMIT 1', [id]),
      db.query('SELECT * FROM defect_status_history WHERE defect_id=$1 ORDER BY changed_at ASC', [id])
    ]);

    const payload = {
      defect,
      attachments: attachmentsRes.rows,
      comments: commentsRes.rows,
      timeline: timelineRes.rows,
      corrective_actions: actionsRes.rows,
      root_cause_analysis: rcaRes.rows[0] || null,
      status_history: statusHistRes.rows
    };
    return success(res, payload);
  } catch (err) {
    console.error('Get defect error:', err);
    return fail(res, 500, 'Server error');
  }
};

// Transaction-safe create (expects validated data in `req.validatedData`)
exports.createDefect = async (req, res) => {
  const payload = req.validatedData || req.body || {};

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const cols = [];
    const params = [];
    const placeholders = [];
    let idx = 1;

    const allowed = ['product_id','defect_type_id','category_id','batch_id','batch_number','production_date','production_line_id','reported_by','description','severity_id','status_id','reported_at','reported_source','defect_location','occurrence_count','title'];
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(payload, k) && payload[k] !== undefined) {
        cols.push(k);
        params.push(payload[k]);
        placeholders.push(`$${idx}`);
        idx++;
      }
    }

    // Always set created_at
    cols.push('created_at');
    placeholders.push(`$${idx}`);
    params.push(new Date());

    const insertSql = `INSERT INTO defects(${cols.join(',')}) VALUES(${placeholders.join(',')}) RETURNING *`;
    const { rows } = await client.query(insertSql, params);
    const defect = rows[0];

    // status name resolution
    let newStatusName = null;
    if (payload.status_id) {
      const sres = await client.query('SELECT name FROM statuses WHERE id=$1', [payload.status_id]);
      newStatusName = sres.rows[0] ? sres.rows[0].name : null;
    } else if (payload.status) newStatusName = payload.status;

    // timeline entry
    await client.query('INSERT INTO defect_timeline(defect_id, event_type, event_description, created_by, created_at) VALUES($1,$2,$3,$4,NOW())', [defect.id, 'Created', 'Defect created', (req.user && req.user.id) ? req.user.id : payload.reported_by || null]);

    // status history
    await client.query('INSERT INTO defect_status_history(defect_id, changed_by, old_status, new_status, remarks, changed_at) VALUES($1,$2,$3,$4,$5,NOW())', [defect.id, (req.user && req.user.id) ? req.user.id : payload.reported_by || null, null, newStatusName, payload.status_change_notes || null]);

    // activity log
    await client.query('INSERT INTO activity_logs(user_id, action, target_type, target_id, notes, timestamp) VALUES($1,$2,$3,$4,$5,NOW())', [(req.user && req.user.id) ? req.user.id : null, 'CREATE_DEFECT', 'defect', defect.id, null]);

    await client.query('COMMIT');
    return success(res, defect);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create defect transaction error:', err);
    return fail(res, 500, 'Server error');
  } finally {
    client.release();
  }
};

// Transaction-safe partial update (expects validated data in `req.validatedData`)
exports.updateDefect = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return fail(res, 400, 'Invalid id');
  const payload = req.validatedData || req.body || {};

  const allowed = ['product_id','defect_type_id','category_id','batch_id','batch_number','production_date','production_line_id','reported_by','description','severity_id','status_id','reported_at','reported_source','defect_location','occurrence_count','title','resolution_notes','closed_at','verified_by','verified_at','approval_status'];

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
  if (!sets.length) return fail(res, 400, 'No fields to update');

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get current status for history tracking
    const curRes = await client.query('SELECT status_id, status FROM defects WHERE id=$1 AND deleted_at IS NULL', [id]);
    if (!curRes.rows.length) { await client.query('ROLLBACK'); return fail(res, 404, 'Defect not found'); }
    const current = curRes.rows[0];

    // Build update
    vals.push(id);
    const sql = `UPDATE defects SET ${sets.join(', ')}, updated_at = NOW() WHERE id=$${idx} RETURNING *`;
    const { rows } = await client.query(sql, vals);
    const defect = rows[0];

    // If status changed, insert history + timeline
    if ((payload.status_id && payload.status_id !== current.status_id) || (payload.status && payload.status !== current.status)) {
      let newStatusName = payload.status || null;
      if (payload.status_id) {
        const sres = await client.query('SELECT name FROM statuses WHERE id=$1', [payload.status_id]);
        newStatusName = sres.rows[0] ? sres.rows[0].name : newStatusName;
      }
      await client.query('INSERT INTO defect_status_history(defect_id, changed_by, old_status, new_status, remarks, changed_at) VALUES($1,$2,$3,$4,$5,NOW())', [id, (req.user && req.user.id) ? req.user.id : null, current.status || null, newStatusName, payload.status_change_notes || null]);
      await client.query('INSERT INTO defect_timeline(defect_id, event_type, event_description, created_by, created_at) VALUES($1,$2,$3,$4,NOW())', [id, 'StatusChanged', `Status changed to ${newStatusName}`, (req.user && req.user.id) ? req.user.id : null]);
    }

    // activity log
    await client.query('INSERT INTO activity_logs(user_id, action, target_type, target_id, notes, timestamp) VALUES($1,$2,$3,$4,$5,NOW())', [(req.user && req.user.id) ? req.user.id : null, 'UPDATE_DEFECT', 'defect', id, null]);

    await client.query('COMMIT');
    return success(res, defect);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update defect transaction error:', err);
    return fail(res, 500, 'Server error');
  } finally {
    client.release();
  }
};

// Soft-delete defect
exports.deleteDefect = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return fail(res, 400, 'Invalid id');
  try {
    const { rows } = await db.query('SELECT id FROM defects WHERE id=$1 AND deleted_at IS NULL', [id]);
    if (!rows.length) return fail(res, 404, 'Not found');
    await db.query('UPDATE defects SET deleted_at = NOW() WHERE id=$1', [id]);
    await db.query('INSERT INTO activity_logs(user_id, action, target_type, target_id, notes, timestamp) VALUES($1,$2,$3,$4,$5,NOW())', [(req.user && req.user.id) ? req.user.id : null, 'DELETE_DEFECT', 'defect', id, null]);
    return success(res, { id });
  } catch (err) {
    console.error('Delete defect error:', err);
    return fail(res, 500, 'Server error');
  }
};
