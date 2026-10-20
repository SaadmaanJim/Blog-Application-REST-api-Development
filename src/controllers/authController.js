const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { toPublicUser } = require('../utils/serializers');
const { SALT_ROUNDS, DEFAULT_TOKEN_EXPIRY } = require('../constants/auth');


const register = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ message: 'Email is already registered.' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await db.execute(
    'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
    [firstname, lastname, email, hashedPassword]
  );

  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
  return res.status(201).json({
    message: 'User registered successfully.',
    user: toPublicUser(rows[0]),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

 
  const passwordMatches = user && (await bcrypt.compare(password, user.password));
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated.' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_TOKEN_EXPIRY,
  });

  return res.status(200).json({
    message: 'Login successful.',
    token,
    user: toPublicUser(user),
  });
});

module.exports = { register, login };
