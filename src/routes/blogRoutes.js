const router = require('express').Router();
const controller = require('../controllers/blogController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { blogBodyRules, blogIdRule, searchRules } = require('../validators/blogValidators');
//--------------------------------------------------------------------------------------------
router.get('/', searchRules, validate, controller.getAllBlogs);
router.get('/:id', blogIdRule, validate, controller.getBlogById);
//--------------------------------------------------------------------------------------------
router.post('/create', authenticate, blogBodyRules, validate, controller.createBlog);
router.put('/update/:id', authenticate, blogIdRule, blogBodyRules, validate, controller.updateBlog);
router.delete('/delete/:id', authenticate, blogIdRule, validate, controller.deleteBlog);
router.delete('/:id', authenticate, blogIdRule, validate, controller.deleteBlog);
module.exports = router;
