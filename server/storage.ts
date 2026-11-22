import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

// Small key-value store:
//  - Vercel / production: Upstash Redis (KV_REST_API_* or UPSTASH_REDIS_REST_* env vars)
//  - Local development: in-memory map persisted to data/local-kv.json
// Everything (warehouse state, staff list, admin auth, sessions) goes through here,
// so that serverless instances share the same data and sessions.

const PREFIX = 'dordoi-sklad:';

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export const storageKind = redis ? 'redis' : 'file';

// ---------- local file fallback ----------
interface LocalEntry {
  value: unknown;
  expiresAt?: number;
}
const LOCAL_FILE = path.resolve(process.cwd(), 'data', 'local-kv.json');
let localCache: Record<string, LocalEntry> | null = null;

function local(): Record<string, LocalEntry> {
  if (localCache) return localCache;
  try {
    localCache = JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8'));
  } catch {
    localCache = {};
  }
  return localCache!;
}

function persistLocal(): void {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(localCache ?? {}, null, 2), 'utf-8');
}

function localGet(key: string): unknown {
  const entry = local()[key];
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    delete local()[key];
    persistLocal();
    return null;
  }
  return entry.value;
}

// ---------- public API ----------
export async function kvGet<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(PREFIX + key)) ?? null;
  return (localGet(key) as T) ?? null;
}

export async function kvSet(key: string, value: unknown, ttlMs?: number): Promise<void> {
  if (redis) {
    if (ttlMs) await redis.set(PREFIX + key, value, { px: ttlMs });
    else await redis.set(PREFIX + key, value);
    return;
  }
  local()[key] = { value, expiresAt: ttlMs ? Date.now() + ttlMs : undefined };
  persistLocal();
}

/** Set only if the key does not exist yet. Returns true when the value was written. */
export async function kvSetIfAbsent(key: string, value: unknown): Promise<boolean> {
  if (redis) return (await redis.set(PREFIX + key, value, { nx: true })) === 'OK';
  if (localGet(key) !== null) return false;
  await kvSet(key, value);
  return true;
}

export async function kvDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  if (redis) {
    await redis.del(...keys.map((k) => PREFIX + k));
    return;
  }
  for (const k of keys) delete local()[k];
  persistLocal();
}

export async function kvSetAdd(key: string, member: string): Promise<void> {
  if (redis) {
    await redis.sadd(PREFIX + key, member);
    return;
  }
  const cur = (localGet(key) as string[] | null) ?? [];
  if (!cur.includes(member)) await kvSet(key, [...cur, member]);
}

export async function kvSetRemove(key: string, member: string): Promise<void> {
  if (redis) {
    await redis.srem(PREFIX + key, member);
    return;
  }
  const cur = (localGet(key) as string[] | null) ?? [];
  await kvSet(
    key,
    cur.filter((m) => m !== member)
  );
}

export async function kvSetMembers(key: string): Promise<string[]> {
  if (redis) return await redis.smembers(PREFIX + key);
  return ((localGet(key) as string[] | null) ?? []).slice();
}
