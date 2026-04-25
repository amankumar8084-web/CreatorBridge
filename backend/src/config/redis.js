const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 0) {
            return new Error('Redis connection failed');
          }
          return 10;
        }
      }
    });
    
    // Only log errors after initial connection attempt
    let isInitialConnection = true;
    redisClient.on('error', (err) => {
      if (!isInitialConnection) {
        logger.error('Redis error:', err);
      }
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });
    
    await redisClient.connect();
    isInitialConnection = false;
    return redisClient;
  } catch (error) {
    isInitialConnection = false;
    logger.warn('Redis connection failed, using in-memory fallback');
    // In-memory fallback
    const memoryCache = new Map();
    redisClient = {
      get: async (key) => memoryCache.get(key),
      set: async (key, value, options) => {
        memoryCache.set(key, value);
        if (options?.EX) {
          setTimeout(() => memoryCache.delete(key), options.EX * 1000);
        }
        return 'OK';
      },
      del: async (key) => memoryCache.delete(key),
      quit: async () => {},
      on: () => {},
      connect: async () => {}
    };
    return redisClient;
  }
};

const getRedisClient = () => redisClient;

module.exports = { initRedis, getRedisClient };