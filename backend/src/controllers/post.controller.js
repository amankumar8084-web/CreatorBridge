const Post = require('../models/Post.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

exports.getAllPosts = async (req, res, next) => {
  try {
    const { niche, tag, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = {};
    
    if (niche && niche !== 'all') query.niche = niche;
    if (tag) query.tags = tag;
    
    const posts = await Post.find(query)
      .populate('author', 'name avatar niche subscriberCount')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts, total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar niche subscriberCount followers')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name avatar' }
      });
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    // Increment view count atomically
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, tags, niche } = req.body;
    
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      tags: tags || [],
      niche: niche || req.user.niche
    });
    
    await post.populate('author', 'name avatar niche');
    
    // Increase user reputation
    req.user.reputation += 5;
    await req.user.save();
    
    res.status(201).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You can only edit your own posts', 403));
    }
    
    const { title, content, tags } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    
    await post.save();
    
    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You can only delete your own posts', 403));
    }
    
    await post.deleteOne();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.upvotePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return next(new AppError('Post not found', 404));
    }
    
    const upvoteIndex = post.upvotes.indexOf(req.user.id);
    const downvoteIndex = post.downvotes.indexOf(req.user.id);
    
    if (upvoteIndex === -1) {
      post.upvotes.push(req.user.id);
      if (downvoteIndex !== -1) post.downvotes.splice(downvoteIndex, 1);
    } else {
      post.upvotes.splice(upvoteIndex, 1);
    }
    
    await post.save();
    
    res.status(200).json({
      status: 'success',
      data: { upvotes: post.upvotes.length, downvotes: post.downvotes.length }
    });
  } catch (error) {
    next(error);
  }
};