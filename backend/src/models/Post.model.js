const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    enum: ['SEO', 'thumbnails', 'monetization', 'editing', 'analytics', 'growth', 'collab', 'general']
  }],
  niche: {
    type: String,
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  attachment: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual for vote score
postSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Index for search
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ niche: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;