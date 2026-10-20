const router = require('express').Router();
const controller = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const rejectProtectedFields = require('../middleware/rejectProtectedFields');
const ROLES = require('../constants/roles');
const {
  idParamRule, updateProfileRules, updatePasswordRules, updateStatusRules,
} = require('../validators/userValidators');

router.use(authenticate);


router.get('/profile', controller.getProfile);
router.put('/profile/update', rejectProtectedFields, updateProfileRules, validate, controller.updateProfile);
router.patch('/password', updatePasswordRules, validate, controller.updatePassword);

router.get('/', authorize(ROLES.ADMIN), controller.getAllUsers);
router.get('/:id', authorize(ROLES.ADMIN), idParamRule, validate, controller.getUserById);
router.patch('/:id/status', authorize(ROLES.ADMIN), updateStatusRules, validate, controller.updateUserStatus);

module.exports = router;
