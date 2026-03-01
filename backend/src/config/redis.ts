import logger from '@/utils/logger';

interface MockRedisClient {
  isOpen: boolean;
  connect(): Promise<void>;
  quit(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<'OK'>;
  setEx(key: string, seconds: number, value: string): Promise<'OK'>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  incr(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
}

const redisClient: MockRedisClient = {
  isOpen: false,

  async connect() {
    logger.info('Redis mock connected');
  },

  async quit() {
    logger.info('Redis mock disconnected');
  },

  async get() {
    return null;
  },

  async set() {
    return 'OK';
  },

  async setEx() {
    return 'OK';
  },

  async del() {
    return 1;
  },

  async exists() {
    return 0;
  },

  async expire() {
    return 1;
  },

  async incr() {
    return 1;
  },

  async ttl() {
    return -1;
  },
};

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection error:', error);
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redisClient.quit();
  } catch (error) {
    logger.error('Redis disconnection error:', error);
  }
}

export { redisClient };
