import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_WAREHOUSE_STATE } from './src/data/initialData.ts';
import type { WarehouseState } from './src/types/warehouse.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'warehouse.json');

function ensureDataFile(): WarehouseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_WAREHOUSE_STATE, null, 2), 'utf-8');
    return INITIAL_WAREHOUSE_STATE;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<WarehouseState>;
    const merged: WarehouseState = {
      models: Array.isArray(parsed.models) ? parsed.models : INITIAL_WAREHOUSE_STATE.models,
      fabricRolls: Array.isArray(parsed.fabricRolls)
        ? parsed.fabricRolls
        : INITIAL_WAREHOUSE_STATE.fabricRolls,
      cuttingBatches: Array.isArray(parsed.cuttingBatches)
        ? parsed.cuttingBatches
        : INITIAL_WAREHOUSE_STATE.cuttingBatches,
      sewingBatches: Array.isArray(parsed.sewingBatches)
        ? parsed.sewingBatches
        : INITIAL_WAREHOUSE_STATE.sewingBatches,
      packingBatches: Array.isArray(parsed.packingBatches)
        ? parsed.packingBatches
        : INITIAL_WAREHOUSE_STATE.packingBatches,
      products: Array.isArray(parsed.products)
        ? parsed.products
        : INITIAL_WAREHOUSE_STATE.products,
      dispatches: Array.isArray(parsed.dispatches)
        ? parsed.dispatches
        : INITIAL_WAREHOUSE_STATE.dispatches,
    };
    return merged;
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_WAREHOUSE_STATE, null, 2), 'utf-8');
    return INITIAL_WAREHOUSE_STATE;
  }
}

function saveStateToFile(state: WarehouseState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/state', (_req, res) => {
    const state = ensureDataFile();
    res.json(state);
  });

  app.put('/api/state', (req, res) => {
    const body = req.body as Partial<WarehouseState> | undefined;
    if (!body || !Array.isArray(body.models) || !Array.isArray(body.products)) {
      res.status(400).json({ error: 'Маалымат форматы туура эмес.' });
      return;
    }
    const nextState: WarehouseState = {
      models: body.models,
      fabricRolls: Array.isArray(body.fabricRolls) ? body.fabricRolls : [],
      cuttingBatches: Array.isArray(body.cuttingBatches) ? body.cuttingBatches : [],
      sewingBatches: Array.isArray(body.sewingBatches) ? body.sewingBatches : [],
      packingBatches: Array.isArray(body.packingBatches) ? body.packingBatches : [],
      products: body.products,
      dispatches: Array.isArray(body.dispatches) ? body.dispatches : [],
    };
    saveStateToFile(nextState);
    res.json({ ok: true });
  });

  app.get('/api/models/:id', (req, res) => {
    const state = ensureDataFile();
    const model = state.models.find((m) => m.id === req.params.id);
    if (!model) {
      res.status(404).json({ error: 'Модель табылган жок.' });
      return;
    }
    const batches = state.cuttingBatches.filter((c) => c.modelId === model.id);
    const products = state.products.filter(
      (p) => p.modelId === model.id || p.modelCode.toLowerCase() === model.modelCode.toLowerCase()
    );
    res.json({ model, batches, products });
  });

  app.post('/api/reset', (_req, res) => {
    saveStateToFile(INITIAL_WAREHOUSE_STATE);
    res.json(INITIAL_WAREHOUSE_STATE);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
