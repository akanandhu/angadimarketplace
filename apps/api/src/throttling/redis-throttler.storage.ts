import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';
import { REDIS } from '../redis/redis.module';

/** Atomic fixed-window counter with an optional block period. TTLs in milliseconds. */
const SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('PTTL', KEYS[1])
if hits > tonumber(ARGV[2]) and tonumber(ARGV[3]) > 0 then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3], 'NX')
end
local blockTtl = redis.call('PTTL', KEYS[2])
return { hits, ttl, blockTtl }
`;

/** Shares rate-limit counters across API instances (ECS tasks). */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const base = `throttle:${throttlerName}:${key}`;
    const [hits, ttlMs, blockMs] = (await this.redis.eval(
      SCRIPT,
      2,
      `${base}:hits`,
      `${base}:block`,
      ttl,
      limit,
      blockDuration,
    )) as [number, number, number];
    return {
      totalHits: hits,
      timeToExpire: Math.ceil(Math.max(ttlMs, 0) / 1000),
      isBlocked: blockMs > 0,
      timeToBlockExpire: Math.ceil(Math.max(blockMs, 0) / 1000),
    };
  }
}
