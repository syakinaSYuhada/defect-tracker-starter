// Generic validate middleware for query params using zod
const validateQuery = (schema) => (req, res, next) => {
  try {
    // Coerce numeric query values to strings so simple Zod shims accept them
    const raw = req.query || {};
    const coerced = {};
    for (const k of Object.keys(raw)) {
      const v = raw[k];
      coerced[k] = (typeof v === 'number') ? String(v) : v;
    }
    req.validatedQuery = schema.parse(coerced);
    return next();
  } catch (err) {
    const errors = err && err.errors ? err.errors : [{ message: err.message }];
    return res.status(400).json({ success: false, errors });
  }
};

module.exports = validateQuery;
