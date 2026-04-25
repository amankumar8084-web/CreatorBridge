const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validateComment } = require('../middleware/validation.middleware');
const commentController = require('../controllers/comment.controller');

const router = express.Router();

router.get('/post/:postId', protect, commentController.getCommentsByPost);
router.post('/', protect, validateComment, commentController.createComment);
router.delete('/:id', protect, commentController.deleteComment);
router.post('/:id/best-answer', protect, commentController.markAsBestAnswer);

module.exports = router;