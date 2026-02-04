import {CachePort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(CachePort)
export class CacheFakeAdapter extends CachePort {
  private readonly storage = new Map<string, {value: string; expiresAt: number | null}>();

  async ping(): Promise<void> {
    return;
  }
  async connect(): Promise<void> {
    return;
  }
  async close(): Promise<void> {
    this.storage.clear();
  }

  async acquire(key: string, ttl: number): Promise<void> {
    const now = Date.now();
    const item = this.storage.get(key);

    if (item && (item.expiresAt === null || item.expiresAt > now)) {
      throw new TypeError(`Could not acquire lock for key: ${key}`);
    }

    await this.set(key, '1', ttl);
  }

  async release(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async set<TType = any>(key: string, value: TType, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    this.storage.set(key, {value: JSON.stringify(value), expiresAt});
  }

  async get<TType = any>(key: string): Promise<{key: string; value: TType | null}> {
    const item = this.storage.get(key);

    if (!item) {
      return {key, value: null};
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.storage.delete(key);
      return {key, value: null};
    }

    return JSON.parse(item.value);
  }

  async delete(...keys: string[]): Promise<void> {
    keys.forEach(k => this.storage.delete(k));
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async expire(key: string, ttl: number): Promise<void> {
    const item = this.storage.get(key);
    if (item) {
      item.expiresAt = Date.now() + ttl * 1000;
    }
  }

  async increment(key: string): Promise<number> {
    const val = await this.get(key);
    const next = (Number(val) || 0) + 1;
    await this.set(key, String(next));
    return next;
  }

  async decrement(key: string): Promise<number> {
    const val = await this.get(key);
    const next = (Number(val) || 0) - 1;
    await this.set(key, String(next));
    return next;
  }
}
