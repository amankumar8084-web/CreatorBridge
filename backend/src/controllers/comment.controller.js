const Comment = require('../models/Comment.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

exports.getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name avatar reputation')
      .sort({ isBestAnswer: -1, createdAt: 1 });
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const { content, postId } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: postId
    });
    
    await post.updateOne({ $inc: { commentCount: 1 } });
    await comment.populate('author', 'name avatar');
    
    // Increase user reputation for commenting
    req.user.reputation += 2;
    await req.user.save();
    
    res.status(201).json({
      status: 'success',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    if (comment.author.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only delete your own comments', 403));
    }
    
    await comment.deleteOne();
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsBestAnswer = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    const post = await Post.findById(comment.post);
    if (post.author.toString() !== req.user._id.toString()) {
      return next(new AppError('Only post author can mark best answer', 403));
    }
    
    // Remove previous best answer
    await Comment.updateMany(
      { post: comment.post, isBestAnswer: true },
      { isBestAnswer: false }
    );
    
    comment.isBestAnswer = true;
    await comment.save();
    
    // Give reputation to the comment author
    const commentAuthor = await User.findById(comment.author);
    commentAuthor.reputation += 10;
    await commentAuthor.save();
    
    res.status(200).json({
      status: 'success',
      data: comment
    });
  } catch (error) {
    next(error);
  }
};