// Generic validate middleware for query params using zod
const validateQuery = (schema) => (req, res, next) => {
  try {
    req.validatedQuery = schema.parse(req.query);
    return next();
  } catch (err) {
    const errors = err && err.errors ? err.errors : [{ message: err.message }];
    return res.status(400).json({ success: false, errors });
  }
};

module.exports = validateQuery;
