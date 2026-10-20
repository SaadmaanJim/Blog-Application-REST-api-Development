const { body } = require('express-validator');
const { PASSWORD_MIN_LENGTH } = require('../constants/auth');

const passwordRule = (field = 'password') =>
  body(field)
    .isString().withMessage('Password is required.')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);

const emailRule = () =>
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Email format is invalid.')
    .toLowerCase();

const nameRule = (field, label) =>
  body(field)
    .trim()
    .notEmpty().withMessage(`${label} is required.`)
    .isLength({ max: 50 }).withMessage(`${label} must be at most 50 characters.`);

const registerRules = [
  nameRule('firstname', 'Firstname'),
  nameRule('lastname', 'Lastname'),
  emailRule(),
  passwordRule(),
];

const loginRules = [
  emailRule(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
];

module.exports = { registerRules, loginRules, passwordRule };
