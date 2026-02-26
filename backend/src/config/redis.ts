import { createClient } from 'redis';
import logger from '@/utils/logger';

// Redis client type
type RedisClient = ReturnType<typeof createClient>;

// Create Redis client
const redisClient: RedisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis: Max reconnection attempts reached');
        return new Error('Redis: Max reconnection attempts reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Error handling
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

redisClient.on('ready', () => {
  logger.info('Redis Client Ready');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis Client Reconnecting');
});

// Connect to Redis
const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('Redis connection established');
    }
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Don't throw error - allow app to run without Redis
  }
};

// Graceful shutdown
const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

export { redisClient, connectRedis, disconnectRedis };
