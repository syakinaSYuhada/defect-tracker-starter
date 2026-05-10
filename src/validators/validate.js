// Generic validate middleware for zod schemas
const validate = (schema) => (req, res, next) => {
  try {
    // Parse body and attach validatedData
    req.validatedData = schema.parse(req.body);
    return next();
  } catch (err) {
    const errors = err && err.errors ? err.errors : [{ message: err.message }];
    return res.status(400).json({ success: false, errors });
  }
};

module.exports = validate;
