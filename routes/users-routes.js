const express = require('express');

const router = express.Router();

const userRoutes = require('../controllers/users-controller')

router.get('/', userRoutes.getAllUsers )
router.get('/all', userRoutes.allUsersInSystem)
router.get('/:userId', userRoutes.getUserById);
router.post('/signup', userRoutes.signUp)
router.post('/login',userRoutes.logIn)

module.exports = router
