import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Создаем клиент Redis
const redis = new Redis(REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

// Хранилище для одноразовых auth токенов
export const tokenStore = {
  async set(token: string, data: { telegramId: number }, ttl: number = 300) {
    try {
      await redis.setex(`auth:${token}`, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error setting token in Redis:', error);
      return false;
    }
  },
  
  async get(token: string): Promise<{ telegramId: number } | null> {
    try {
      const data = await redis.get(`auth:${token}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting token from Redis:', error);
      return null;
    }
  },
  
  async delete(token: string): Promise<boolean> {
    try {
      await redis.del(`auth:${token}`);
      return true;
    } catch (error) {
      console.error('Error deleting token from Redis:', error);
      return false;
    }
  }
};

// Кэш для часто запрашиваемых данных
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(`cache:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },
  
  async set<T>(key: string, value: T, ttl: number = 300): Promise<boolean> {
    try {
      await redis.setex(`cache:${key}`, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  },
  
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(`cache:${key}`);
      return true;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  },
  
  async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Error invalidating cache pattern:', error);
      return false;
    }
  }
};

// Попытка подключения при старте
redis.connect().catch((err) => {
  console.warn('⚠️  Redis connection failed, running without Redis:', err.message);
});

export default redis;
