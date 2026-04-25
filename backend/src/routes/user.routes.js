const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/search', protect, userController.searchUsers);
router.get('/:id', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/follow/:id', protect, userController.followUser);
router.get('/:id/followers', protect, userController.getFollowers);
router.get('/:id/following', protect, userController.getFollowing);

module.exports = router;