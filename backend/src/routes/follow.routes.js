const express = require('express');
const router = express.Router();

const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/follow.controller');

const { protect } = require('../middlewares/auth.middleware');


// Protected routes
router.post('/follow/:userId', protect, followUser);
router.delete('/unfollow/:userId', protect, unfollowUser);

// Public or protected (your choice)
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

module.exports = router;