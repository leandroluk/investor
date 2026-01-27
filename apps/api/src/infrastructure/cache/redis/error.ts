// infrastructure/cache/redis/error.ts

export class CacheRedisError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CacheRedisError';
  }
}
