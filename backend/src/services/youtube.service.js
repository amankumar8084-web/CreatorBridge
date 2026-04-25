const axios = require('axios');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class YoutubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  async getChannelDetails(channelIdentifier) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels?part=snippet,statistics&id=${channelIdentifier}&key=${this.apiKey}`
      );

      if (!response.data.items || response.data.items.length === 0) {
        throw new AppError('Channel not found', 404);
      }

      return response.data.items[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('YouTube API Error:', error);
      throw new AppError('Failed to fetch YouTube channel details', 500);
    }
  }

  async searchChannels(query, maxResults = 10) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      return response.data.items.map(item => ({
        channelId: item.id.channelId,
        channelName: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.default.url
      }));
    } catch (error) {
      logger.error('YouTube API Error:', error);
      throw new AppError('Failed to search YouTube channels', 500);
    }
  }

  extractChannelId(url) {
    const match = url.match(/(?:youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/@)([^\/?]+)/);
    return match ? match[1] : null;
  }
}

module.exports = new YoutubeService();
