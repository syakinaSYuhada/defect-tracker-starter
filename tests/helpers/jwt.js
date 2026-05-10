const jwt = require('jsonwebtoken');

function genTestToken({ sub = 'test-user', role = 'admin', expiresIn = '1h' } = {}) {
  const secret = process.env.JWT_SECRET || 'change_me';
  return jwt.sign({ role }, secret, { subject: sub, expiresIn });
}

module.exports = { genTestToken };
