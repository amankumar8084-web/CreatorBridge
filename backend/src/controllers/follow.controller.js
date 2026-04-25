const Follow = require('../models/Follow.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');


//  Follow a user
exports.followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    //  Cannot follow yourself
    if (req.user._id.toString() === userId) {
      return next(new AppError('You cannot follow yourself', 400));
    }

    //  Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.deletedAt) {
      return next(new AppError('User not found', 404));
    }

    //  Prevent duplicate follow
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: userId
    });

    if (existingFollow) {
      return next(new AppError('You already follow this user', 400));
    }

    //  Create follow
    const follow = await Follow.create({
      follower: req.user._id,
      following: userId
    });

    res.status(201).json({
      status: 'success',
      data: follow
    });

  } catch (error) {
    next(error);
  }
};


// 🔹 Unfollow a user
exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: userId
    });

    if (!follow) {
      return next(new AppError('You are not following this user', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Unfollowed successfully'
    });

  } catch (error) {
    next(error);
  }
};


// 🔹 Get followers of a user
exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'name avatar niche')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: followers.length,
      data: followers
    });

  } catch (error) {
    next(error);
  }
};


// 🔹 Get users that a user is following
exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'name avatar niche')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: following.length,
      data: following
    });

  } catch (error) {
    next(error);
  }
};