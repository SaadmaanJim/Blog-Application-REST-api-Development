const jwt = require('jsonwebtoken');
const db = require('../config/db');

const BEARER_PREFIX = 'Bearer ';

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(BEARER_PREFIX.length), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  try {
    
    const [rows] = await db.execute(
      'SELECT id, role, isActive FROM users WHERE id = ?',
      [payload.id]
    );

    if (rows.length === 0 || !rows[0].isActive) {
      return res.status(401).json({ message: 'Account not found or deactivated.' });
    }

    req.user = { id: rows[0].id, role: rows[0].role };
    return next();
  } catch (err) {
    return next(err);
  }
};
