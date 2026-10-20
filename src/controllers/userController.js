const bcrypt = require('bcrypt');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { toPublicUser } = require('../utils/serializers');
const { SALT_ROUNDS } = require('../constants/auth');

const findUserById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

const getProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  return res.status(200).json(toPublicUser(user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { firstname = null, lastname = null } = req.body;
  await db.execute(
    'UPDATE users SET firstname = COALESCE(?, firstname), lastname = COALESCE(?, lastname) WHERE id = ?',
    [firstname, lastname, req.user.id]
  );

  const user = await findUserById(req.user.id);
  return res.status(200).json({ message: 'Profile updated.', user: toPublicUser(user) });
});

const updatePassword = asyncHandler(async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
  return res.status(200).json({ message: 'Password updated successfully.' });
});



const getAllUsers = asyncHandler(async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM users ORDER BY id');
  return res.status(200).json(rows.map(toPublicUser));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.status(200).json(toPublicUser(user));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const targetId = Number(req.params.id);

  if (targetId === req.user.id) {
    return res.status(400).json({ message: 'You cannot change your own active status.' });
  }

  const user = await findUserById(targetId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await db.execute('UPDATE users SET isActive = ? WHERE id = ?', [req.body.isActive, targetId]);
  const updated = await findUserById(targetId);
  return res.status(200).json({
    message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully.`,
    user: toPublicUser(updated),
  });
});

module.exports = {
  getProfile, updateProfile, updatePassword,
  getAllUsers, getUserById, updateUserStatus,
};
