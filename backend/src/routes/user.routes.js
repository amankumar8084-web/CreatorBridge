const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();

router.get('/search', protect, userController.searchUsers);
router.get('/:id', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/avatar', protect, uploadAvatar.single('avatar'), userController.uploadAvatar);
router.delete('/avatar', protect, userController.removeAvatar);
router.post('/follow/:id', protect, userController.followUser);
router.get('/:id/followers', protect, userController.getFollowers);
router.get('/:id/following', protect, userController.getFollowing);

module.exports = router;