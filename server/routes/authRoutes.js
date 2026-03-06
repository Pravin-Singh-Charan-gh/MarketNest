const express = require('express');
const router = express.Router();
const { signup, login, logout, refreshToken } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);  // must be logged in to log out
router.post('/refresh-token', refreshToken);

module.exports = router;