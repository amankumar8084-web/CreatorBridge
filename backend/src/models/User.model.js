const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  sessionId: {
  type: String,
  default: null
},

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },

  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  avatar: {
    type: String,
    default: function () {
      return `https://ui-avatars.com/api/?name=${this.name}&background=4F46E5&color=fff`;
    }
  },

  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },

  niche: {
    type: String,
    enum: ['Gaming', 'Cooking', 'Tech', 'Education', 'Vlogs', 'Music', 'Fitness', 'Art', 'Other'],
    default: 'Other',
    index: true
  },

   // Followers (users who follow this creator)
  followers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],

  // Following (users this creator follows)
  following: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],

  youtubeChannel: {
    channelId: { type: String, index: true },
    channelName: String,
    subscriberCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    lastSync: Date,
    thumbnailUrl: String
  },

  subscriptionTier: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },

  reputation: {
    type: Number,
    default: 0,
    min: 0
  },

  //  Security fields
  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: Date,

  passwordChangedAt: Date,

  //  Soft delete instead of isActive
  deletedAt: {
    type: Date,
    default: null,
    index: true
  },

  lastActive: {
    type: Date,
    default: Date.now
  },

  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  }

}, {
  timestamps: true,

  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  },

  toObject: { virtuals: true }
});


//  Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const saltRounds = process.env.BCRYPT_COST || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);

  // Set password changed timestamp
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});


// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


//  Check if password changed after token issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTime;
  }
  return false;
};


//  Check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};


const User = mongoose.model('User', userSchema);
module.exports = User;