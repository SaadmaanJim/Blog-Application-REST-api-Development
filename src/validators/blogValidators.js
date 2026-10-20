const { body, param, query } = require('express-validator');

const blogBodyRules = [
  body('blogTitle').isString().trim().notEmpty().withMessage('Blog title is required.')
    .isLength({ max: 255 }).withMessage('Blog title must be at most 255 characters.'),
  body('blog').isString().trim().notEmpty().withMessage('Blog content is required.'),
  body('category').isString().trim().notEmpty().withMessage('Category is required.')
    .isLength({ max: 100 }).withMessage('Category must be at most 100 characters.'),
];

const blogIdRule = param('id').isInt({ min: 1 }).withMessage('Blog ID must be a positive integer.');

const searchRules = [
  query('title').optional().isString().withMessage('title must be a single string.').trim(),
  query('category').optional().isString().withMessage('category must be a single string.').trim(),
];

module.exports = { blogBodyRules, blogIdRule, searchRules };
