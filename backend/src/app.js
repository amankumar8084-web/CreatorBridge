const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const errorHandler = require('./middleware/errorHandler.middleware');
const { limiter } = require('./middleware/rateLimiter.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const chatRoutes = require('./routes/chat.routes');
const meetingRoutes = require('./routes/meeting.routes');
const youtubeRoutes = require('./routes/youtube.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://creatorbridge-iota.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Import Models for Stats
const User = require('./models/User.model');
const Post = require('./models/Post.model');
const MeetingRoom = require('./models/MeetingRoom.model');

// backend/server.js or your API route
app.get('/api/stats', async (req, res) => {
  try {
    // Fetch real counts from your database
    const activeCreators = await User.countDocuments({ deletedAt: null });
    const postsShared = await Post.countDocuments();
    const meetingsHosted = await MeetingRoom.countDocuments();
    const nichesCovered = (await User.distinct('niche')).length;
    
    res.json({
      activeCreators,
      postsShared,
      meetingsHosted,
      nichesCovered
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
// Error handling
app.use(errorHandler);

module.exports = app;