const User = require('../models/User.model');
const youtubeService = require('../services/youtube.service');
const AppError = require('../utils/AppError');

exports.verifyChannel = async (req, res, next) => {
  try {
    const { channelId, channelUrl } = req.body;
    
    let channelIdentifier = channelId || channelUrl;
    
    if (channelIdentifier && (channelIdentifier.includes('youtube.com') || channelIdentifier.includes('youtu.be'))) {
      channelIdentifier = youtubeService.extractChannelId(channelIdentifier) || channelIdentifier;
    }
    
    if (!channelIdentifier) {
      return next(new AppError('Invalid channel ID or URL', 400));
    }
    
    const channel = await youtubeService.getChannelDetails(channelIdentifier);
    const subscriberCount = parseInt(channel.statistics.subscriberCount);
    
    const channelData = {
      channelId: channel.id,
      channelName: channel.snippet.title,
      subscriberCount,
      verified: true,
      lastSync: new Date(),
      thumbnailUrl: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url
    };

    // Update or add to youtubeChannels array
    if (!req.user.youtubeChannels) req.user.youtubeChannels = [];
    const existingIndex = req.user.youtubeChannels.findIndex(c => c.channelId === channel.id);
    
    if (existingIndex !== -1) {
      req.user.youtubeChannels[existingIndex] = channelData;
    } else {
      req.user.youtubeChannels.push(channelData);
    }
    
    // Maintain backward compatibility with youtubeChannel (primary)
    req.user.youtubeChannel = channelData;
    
    await req.user.save();
    
    res.status(200).json({
      status: 'success',
      data: req.user.youtubeChannels
    });
  } catch (error) {
    next(error);
  }
};

exports.removeChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    
    if (!req.user.youtubeChannels || req.user.youtubeChannels.length === 0) {
      return next(new AppError('No channels found', 404));
    }
    
    req.user.youtubeChannels = req.user.youtubeChannels.filter(c => c.channelId !== channelId);
    
    // If we removed the primary channel, update it to the next one or null
    if (req.user.youtubeChannel?.channelId === channelId) {
      req.user.youtubeChannel = req.user.youtubeChannels.length > 0 ? req.user.youtubeChannels[0] : null;
    }
    
    await req.user.save();
    
    res.status(200).json({
      status: 'success',
      data: req.user.youtubeChannels
    });
  } catch (error) {
    next(error);
  }
};

exports.getChannelStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.youtubeChannel.verified) {
      return next(new AppError('Channel not found or not verified', 404));
    }
    
    const channel = await youtubeService.getChannelDetails(user.youtubeChannel.channelId);
    
    user.youtubeChannel.subscriberCount = parseInt(channel.statistics.subscriberCount);
    user.youtubeChannel.lastSync = new Date();
    await user.save();
    
    res.status(200).json({
      status: 'success',
      data: user.youtubeChannel
    });
  } catch (error) {
    next(error);
  }
};

exports.searchChannels = async (req, res, next) => {
  try {
    const { query, maxResults = 10 } = req.query;
    if (!query) {
      return next(new AppError('Search query is required', 400));
    }
    
    const channels = await youtubeService.searchChannels(query, maxResults);
    
    res.status(200).json({
      status: 'success',
      data: channels
    });
  } catch (error) {
    next(error);
  }
};