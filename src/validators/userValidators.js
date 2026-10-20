const { body, param } = require('express-validator');
const { passwordRule } = require('./authValidators');

const idParamRule = param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer.');

const updateProfileRules = [
  body('firstname').optional().trim().notEmpty().withMessage('Firstname cannot be empty.')
    .isLength({ max: 50 }).withMessage('Firstname must be at most 50 characters.'),
  body('lastname').optional().trim().notEmpty().withMessage('Lastname cannot be empty.')
    .isLength({ max: 50 }).withMessage('Lastname must be at most 50 characters.'),
  body().custom((value) => {
    if (value.firstname === undefined && value.lastname === undefined) {
      throw new Error('Provide at least one of: firstname, lastname.');
    }
    return true;
  }),
];

const updatePasswordRules = [passwordRule()];

const updateStatusRules = [
  idParamRule,
  body('isActive').isBoolean({ strict: true }).withMessage('isActive must be a boolean (true or false).'),
];

module.exports = { idParamRule, updateProfileRules, updatePasswordRules, updateStatusRules };
