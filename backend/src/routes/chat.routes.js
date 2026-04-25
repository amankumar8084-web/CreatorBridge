const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

router.get('/messages', protect, chatController.getMessages);
router.get('/rooms', protect, chatController.getChatRooms);
router.post('/dm-room', protect, chatController.createDMRoom);
router.post('/mark-read', protect, chatController.markMessagesAsRead);

module.exports = router;