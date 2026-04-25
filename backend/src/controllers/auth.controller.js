const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Follow = require('../models/Follow.model'); 
const AppError = require('../utils/AppError');


//  Generate token
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};


//  Register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const user = await User.create({
      email,
      password,
      name
    });

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || '',
        niche: user.niche,
        avatar: user.avatar
      }
    });

  } catch (error) {
    next(error);
  }
};


//  Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
       name: user.name || '',
        niche: user.niche,
        avatar: user.avatar
      }
    });

  } catch (error) {
    next(error);
  }
};


//  Get current user (FIXED)
exports.getMe = async (req, res, next) => {
  try {
    //  Get user from DB
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    //  Optimized parallel queries
    const [followerCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: user._id }),
      Follow.countDocuments({ follower: user._id })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toObject(),
          id: user._id
        },
        followerCount,
        followingCount
      }
    });

  } catch (error) {
    next(error);
  }
};