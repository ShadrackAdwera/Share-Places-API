const express = require('express');

const { check } = require('express-validator');

const router = express.Router();

const userRoutes = require('../controllers/users-controller');

const fileUpload = require('../middleware/file-upload');

router.get('/', userRoutes.getAllUsers);
router.get('/:userId', userRoutes.getUserById);
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  userRoutes.signUp
);
router.post('/login', userRoutes.logIn);

module.exports = router;
