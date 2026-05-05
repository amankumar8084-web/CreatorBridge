const User = require('../models/User.model');
const AppError = require('../utils/AppError');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name avatar niche')
      .populate('following', 'name avatar niche');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, niche, avatar } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (bio) updates.bio = bio;
    if (niche) updates.niche = niche;
    if (avatar) updates.avatar = avatar;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return next(new AppError('User not found', 404));
    }
    
    if (req.user._id.toString() === req.params.id) {
      return next(new AppError('You cannot follow yourself', 400));
    }
    
    const isFollowing = req.user.following.includes(userToFollow._id);
    
    if (isFollowing) {
      // Unfollow
      req.user.following = req.user.following.filter(id => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
      await req.user.save();
      await userToFollow.save();
      res.status(200).json({ status: 'success', message: 'Unfollowed' });
    } else {
      // Follow
      req.user.following.push(userToFollow._id);
      userToFollow.followers.push(req.user._id);
      await req.user.save();
      await userToFollow.save();
      res.status(200).json({ status: 'success', message: 'Followed' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name avatar niche youtubeChannel')
      .select('followers');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      results: user.followers.length,
      data: user.followers
    });
  } catch (error) {
    next(error);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name avatar niche youtubeChannel')
      .select('following');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      results: user.following.length,
      data: user.following
    });
  } catch (error) {
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { q, niche, limit = 20 } = req.query;
    const query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (niche && niche !== 'all') {
      query.niche = niche;
    }
    
    const users = await User.find(query)
      .select('name avatar niche youtubeChannel followers')
      .limit(parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }

    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found', 404));
    
    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    console.error('Upload Avatar Error:', error);
    next(error);
  }
};

exports.removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found', 404));
    
    // Explicitly set to a default avatar URL
    user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    console.error('Remove Avatar Error:', error);
    next(error);
  }
};