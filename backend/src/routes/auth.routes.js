const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validateUser } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', validateUser, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;