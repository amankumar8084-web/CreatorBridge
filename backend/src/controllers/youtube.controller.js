const User = require('../models/User.model');
const youtubeService = require('../services/youtube.service');
const AppError = require('../utils/AppError');

exports.verifyChannel = async (req, res, next) => {
  try {
    const { channelId, channelUrl } = req.body;
    
    let channelIdentifier = channelId;
    if (channelUrl) {
      channelIdentifier = youtubeService.extractChannelId(channelUrl) || channelIdentifier;
    }
    
    if (!channelIdentifier) {
      return next(new AppError('Invalid channel ID or URL', 400));
    }
    
    const channel = await youtubeService.getChannelDetails(channelIdentifier);
    const subscriberCount = parseInt(channel.statistics.subscriberCount);
    
    req.user.youtubeChannel = {
      channelId: channel.id,
      channelName: channel.snippet.title,
      subscriberCount,
      verified: true,
      lastSync: new Date(),
      thumbnailUrl: channel.snippet.thumbnails.default.url
    };
    
    await req.user.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        channelId: channel.id,
        channelName: channel.snippet.title,
        subscriberCount,
        thumbnailUrl: channel.snippet.thumbnails.default.url
      }
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