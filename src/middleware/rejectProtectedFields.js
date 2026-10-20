
const PROTECTED_USER_FIELDS = ['role', 'isActive'];

module.exports = (req, res, next) => {
  const attempted = PROTECTED_USER_FIELDS.filter((field) => field in (req.body || {}));
  if (attempted.length > 0) {
    return res.status(403).json({ message: `You are not allowed to update: ${attempted.join(', ')}.` });
  }
  return next();
};
