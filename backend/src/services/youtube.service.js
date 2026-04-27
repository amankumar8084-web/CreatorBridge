const axios = require('axios');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class YoutubeService {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  get apiKey() {
    return process.env.YOUTUBE_API_KEY;
  }

  async getChannelDetails(channelIdentifier, customApiKey = null) {
    try {
      const apiKey = customApiKey || this.apiKey;
      if (!apiKey) {
        throw new AppError('YouTube API key is not configured', 500);
      }

      let params = 'part=snippet,statistics';
      
      // Determine which parameter to use based on the identifier format
      if (channelIdentifier.startsWith('UC') && channelIdentifier.length === 24) {
        params += `&id=${channelIdentifier}`;
      } else if (channelIdentifier.startsWith('@')) {
        params += `&forHandle=${channelIdentifier}`;
      } else {
        // Fallback: try as ID first, if that fails we might need a more complex search
        // but for now let's try forHandle if it doesn't look like a standard ID
        params += `&forHandle=@${channelIdentifier.replace(/^@/, '')}`;
      }

      const response = await axios.get(`${this.baseUrl}/channels?${params}&key=${apiKey}`);

      if (!response.data.items || response.data.items.length === 0) {
        // If forHandle failed, try forUsername as a last resort
        if (params.includes('forHandle')) {
          const username = channelIdentifier.replace(/^@/, '');
          const secondTry = await axios.get(
            `${this.baseUrl}/channels?part=snippet,statistics&forUsername=${username}&key=${apiKey}`
          );
          if (secondTry.data.items && secondTry.data.items.length > 0) {
            return secondTry.data.items[0];
          }
        }
        throw new AppError('Channel not found. Please ensure you are providing a valid Channel ID, Handle, or URL.', 404);
      }

      return response.data.items[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      
      logger.error('YouTube API Error:', { status, message, identifier: channelIdentifier });
      
      if (status === 400) {
        throw new AppError(`Invalid YouTube request: ${message}`, 400);
      }
      if (status === 403) {
        throw new AppError('YouTube API quota exceeded or invalid API key', 403);
      }
      
      throw new AppError('Failed to fetch YouTube channel details', 500);
    }
  }

  async searchChannels(query, maxResults = 10) {
    try {
      if (!this.apiKey) {
        throw new AppError('YouTube API key is not configured', 500);
      }

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
      logger.error('YouTube API Error:', error.response?.data || error.message);
      throw new AppError('Failed to search YouTube channels', 500);
    }
  }

  extractChannelId(url) {
    if (!url) return null;
    
    // Support various formats:
    // youtube.com/channel/UC...
    // youtube.com/@handle
    // youtube.com/c/customName
    // youtube.com/user/username
    const patterns = [
      /(?:youtube\.com\/channel\/)(UC[a-zA-Z0-9_-]{22})/,
      /(?:youtube\.com\/@)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/c\/)([a-zA-Z0-9_-]+)/,
      /(?:youtube\.com\/user\/)([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        // If it's a handle match, prepend @ if it's not already there
        if (pattern.source.includes('@')) {
          return `@${match[1]}`;
        }
        return match[1];
      }
    }

    // Fallback for simple names in URLs like youtube.com/name
    const simpleMatch = url.match(/youtube\.com\/([^/?#]+)/);
    if (simpleMatch && !['watch', 'results', 'feed', 'playlist'].includes(simpleMatch[1])) {
      return `@${simpleMatch[1]}`;
    }

    return null;
  }
}

module.exports = new YoutubeService();
