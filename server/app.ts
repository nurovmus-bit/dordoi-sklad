import express from 'express';
import { INITIAL_WAREHOUSE_STATE } from '../src/data/initialData.js';
import type { WarehouseState } from '../src/types/warehouse.js';
import { loadState, saveState, storageKind } from './storage.js';

type Handler = (req: express.Request, res: express.Response) => Promise<void>;

const wrap =
  (fn: Handler): express.RequestHandler =>
  (req, res) => {
    fn(req, res).catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Сервер катасы.' });
    });
  };

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storage: storageKind });
  });

  app.get(
    '/api/state',
    wrap(async (_req, res) => {
      res.json(await loadState());
    })
  );

  app.put(
    '/api/state',
    wrap(async (req, res) => {
      const body = req.body as Partial<WarehouseState> | undefined;
      if (!body || !Array.isArray(body.models) || !Array.isArray(body.products)) {
        res.status(400).json({ error: 'Маалымат форматы туура эмес.' });
        return;
      }
      await saveState({
        models: body.models,
        fabricRolls: Array.isArray(body.fabricRolls) ? body.fabricRolls : [],
        cuttingBatches: Array.isArray(body.cuttingBatches) ? body.cuttingBatches : [],
        sewingBatches: Array.isArray(body.sewingBatches) ? body.sewingBatches : [],
        packingBatches: Array.isArray(body.packingBatches) ? body.packingBatches : [],
        products: body.products,
        dispatches: Array.isArray(body.dispatches) ? body.dispatches : [],
      });
      res.json({ ok: true });
    })
  );

  app.get(
    '/api/models/:id',
    wrap(async (req, res) => {
      const state = await loadState();
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
    })
  );

  app.post(
    '/api/reset',
    wrap(async (_req, res) => {
      await saveState(INITIAL_WAREHOUSE_STATE);
      res.json(INITIAL_WAREHOUSE_STATE);
    })
  );

  return app;
}
