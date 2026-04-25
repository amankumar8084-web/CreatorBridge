const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validatePost } = require('../middleware/validation.middleware');
const postController = require('../controllers/post.controller');

const router = express.Router();

router.route('/')
  .get(protect, postController.getAllPosts)
  .post(protect, validatePost, postController.createPost);

router.route('/:id')
  .get(protect, postController.getPost)
  .patch(protect, postController.updatePost)
  .delete(protect, postController.deletePost);

router.post('/:id/upvote', protect, postController.upvotePost);

module.exports = router;