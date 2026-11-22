import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { INITIAL_WAREHOUSE_STATE } from '../src/data/initialData.js';
import type { WarehouseState } from '../src/types/warehouse.js';

const REDIS_KEY = 'dordoi-sklad:state';

// Upstash (Vercel Marketplace) env vars: KV_REST_API_* or UPSTASH_REDIS_REST_*.
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Local fallback (development): JSON file in ./data
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'warehouse.json');

export const storageKind = redis ? 'redis' : 'file';

export function normalizeState(parsed: Partial<WarehouseState> | null | undefined): WarehouseState {
  const p = parsed ?? {};
  const pick = <K extends keyof WarehouseState>(key: K): WarehouseState[K] =>
    (Array.isArray(p[key]) ? p[key] : INITIAL_WAREHOUSE_STATE[key]) as WarehouseState[K];
  return {
    models: pick('models'),
    fabricRolls: pick('fabricRolls'),
    cuttingBatches: pick('cuttingBatches'),
    sewingBatches: pick('sewingBatches'),
    packingBatches: pick('packingBatches'),
    products: pick('products'),
    dispatches: pick('dispatches'),
  };
}

function writeFile(state: WarehouseState): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function loadState(): Promise<WarehouseState> {
  if (redis) {
    const stored = await redis.get<WarehouseState>(REDIS_KEY);
    if (!stored) {
      await redis.set(REDIS_KEY, INITIAL_WAREHOUSE_STATE);
      return INITIAL_WAREHOUSE_STATE;
    }
    return normalizeState(stored);
  }
  if (!fs.existsSync(DATA_FILE)) {
    writeFile(INITIAL_WAREHOUSE_STATE);
    return INITIAL_WAREHOUSE_STATE;
  }
  try {
    return normalizeState(JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')));
  } catch {
    writeFile(INITIAL_WAREHOUSE_STATE);
    return INITIAL_WAREHOUSE_STATE;
  }
}

export async function saveState(state: WarehouseState): Promise<void> {
  if (redis) {
    await redis.set(REDIS_KEY, state);
    return;
  }
  writeFile(state);
}
