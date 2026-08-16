import type { Request, Response } from "express";
import rateLimit, {
  MemoryStore,
  type ClientRateLimitInfo,
  type Options,
  type Store,
} from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { ERROR_CODES } from "../types";
import { fail } from "../utils/api-response";

const REDIS_PREFIX = "rl:";

/**
 * Uses Redis when connected; falls back to in-memory so a down Redis
 * never blocks or 500s the API (dev-friendly, production-safe).
 */
class RedisWithMemoryFallbackStore implements Store {
  prefix = REDIS_PREFIX;
  private readonly memoryStore = new MemoryStore();
  private redisStore: RedisStore | null = null;
  private limiterOptions: Options | null = null;
  private listening = false;

  init(options: Options) {
    this.limiterOptions = options;
    this.memoryStore.init(options);
    this.attachRedisListeners();
    this.tryAttachRedis();
  }

  private attachRedisListeners() {
    if (this.listening) return;
    this.listening = true;
    redis.on("ready", () => this.tryAttachRedis());
    redis.on("close", () => {
      this.redisStore = null;
    });
  }

  private tryAttachRedis() {
    if (redis.status !== "ready" || this.redisStore || !this.limiterOptions) return;
    const store = new RedisStore({
      prefix: REDIS_PREFIX,
      sendCommand: (command: string, ...args: string[]) =>
        redis.call(command, ...args) as Promise<RedisReply>,
    });
    store.init(this.limiterOptions);
    this.redisStore = store;
  }

  private async withFallback<T>(
    redisOp: (store: RedisStore) => Promise<T>,
    memoryOp: () => Promise<T>,
  ): Promise<T> {
    if (this.redisStore && redis.status === "ready") {
      try {
        return await redisOp(this.redisStore);
      } catch {
        this.redisStore = null;
      }
    }
    return memoryOp();
  }

  get(key: string): Promise<ClientRateLimitInfo | undefined> {
    return this.withFallback(
      (store) => store.get(key),
      () => this.memoryStore.get(key),
    );
  }

  increment(key: string): Promise<ClientRateLimitInfo> {
    return this.withFallback(
      (store) => store.increment(key),
      () => this.memoryStore.increment(key),
    );
  }

  decrement(key: string): Promise<void> {
    return this.withFallback(
      (store) => store.decrement(key),
      () => this.memoryStore.decrement(key),
    );
  }

  resetKey(key: string): Promise<void> {
    return this.withFallback(
      (store) => store.resetKey(key),
      () => this.memoryStore.resetKey(key),
    );
  }

  shutdown() {
    this.memoryStore.shutdown();
  }
}

export function createApiRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === "production" ? 300 : 2000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: new RedisWithMemoryFallbackStore(),
    passOnStoreError: true,
    handler: (_req: Request, res: Response) => {
      return fail(res, "Too many requests, please try again later.", ERROR_CODES.RATE_LIMITED, 429);
    },
  });
}
