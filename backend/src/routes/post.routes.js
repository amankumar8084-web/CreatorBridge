const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validatePost } = require('../middleware/validation.middleware');
const postController = require('../controllers/post.controller');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(protect, postController.getAllPosts)
  .post(protect, upload.single('attachment'), validatePost, postController.createPost);

router.route('/:id')
  .get(protect, postController.getPost)
  .patch(protect, upload.single('attachment'), postController.updatePost)
  .delete(protect, postController.deletePost);

router.post('/:id/upvote', protect, postController.upvotePost);

module.exports = router;