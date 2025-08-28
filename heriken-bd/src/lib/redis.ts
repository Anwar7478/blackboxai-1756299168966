import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Helper functions for common Redis operations
export const redisHelpers = {
  // OTP Management
  async setOTP(phone: string, code: string, expiryMinutes: number = 5) {
    const key = `otp:${phone}`
    await redis.setex(key, expiryMinutes * 60, code)
  },

  async getOTP(phone: string): Promise<string | null> {
    const key = `otp:${phone}`
    return await redis.get(key)
  },

  async deleteOTP(phone: string) {
    const key = `otp:${phone}`
    await redis.del(key)
  },

  // Rate Limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }
    return current <= limit
  },

  // Session Management
  async setSession(sessionId: string, data: any, expiryHours: number = 24) {
    const key = `session:${sessionId}`
    await redis.setex(key, expiryHours * 3600, JSON.stringify(data))
  },

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  },

  async deleteSession(sessionId: string) {
    const key = `session:${sessionId}`
    await redis.del(key)
  },

  // Cart Management (for guest users)
  async setCart(sessionId: string, cartData: any, expiryDays: number = 7) {
    const key = `cart:${sessionId}`
    await redis.setex(key, expiryDays * 24 * 3600, JSON.stringify(cartData))
  },

  async getCart(sessionId: string): Promise<any | null> {
    const key = `cart:${sessionId}`
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  },

  // Product View Tracking
  async incrementProductView(productId: string) {
    const key = `product:views:${productId}`
    await redis.incr(key)
  },

  async getProductViews(productId: string): Promise<number> {
    const key = `product:views:${productId}`
    const views = await redis.get(key)
    return views ? parseInt(views) : 0
  },

  // Cache Management
  async setCache(key: string, data: any, expirySeconds: number = 3600) {
    await redis.setex(`cache:${key}`, expirySeconds, JSON.stringify(data))
  },

  async getCache(key: string): Promise<any | null> {
    const data = await redis.get(`cache:${key}`)
    return data ? JSON.parse(data) : null
  },

  async deleteCache(key: string) {
    await redis.del(`cache:${key}`)
  },

  async deleteCachePattern(pattern: string) {
    const keys = await redis.keys(`cache:${pattern}`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
