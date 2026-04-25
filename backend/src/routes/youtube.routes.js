const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const youtubeController = require('../controllers/youtube.controller');

const router = express.Router();

router.post('/verify', protect, youtubeController.verifyChannel);
router.get('/stats/:userId', protect, youtubeController.getChannelStats);
router.get('/search', protect, youtubeController.searchChannels);

module.exports = router;