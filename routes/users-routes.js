const express = require('express');

const { check } = require('express-validator')

const router = express.Router();

const userRoutes = require('../controllers/users-controller')

router.get('/', userRoutes.getAllUsers )
router.get('/all', userRoutes.allUsersInSystem)
router.get('/:userId', userRoutes.getUserById);
router.post('/signup', [check('username').not().isEmpty(), check('email').normalizeEmail().isEmail(), check('password').isLength({min:6})] ,userRoutes.signUp)
router.post('/login',userRoutes.logIn)

module.exports = router
