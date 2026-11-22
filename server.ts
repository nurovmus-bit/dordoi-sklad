import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_WAREHOUSE_STATE } from './src/data/initialData.ts';
import type {
  EmployeeStageKey,
  StaffMember,
  StaffSessionProfile,
  WarehouseState,
} from './src/types/warehouse.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'warehouse.json');
const STAFF_FILE = path.join(DATA_DIR, 'staff.json');

const ALLOWED_EMPLOYEE_STAGES: readonly EmployeeStageKey[] = [
  'fabric',
  'cutting',
  'sewing',
  'packing',
  'zavsklad',
  'dispatch',
];

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

interface StoredStaffMember {
  id: string;
  name: string;
  roleNote?: string;
  allowedStage: EmployeeStageKey;
  seamstressName?: string;
  inviteToken: string;
  active: boolean;
  connected: boolean;
  connectedAt: string | null;
  lastSeenAt: string | null;
  deviceInfo: string | null;
  createdAt: string;
}

interface StaffSession {
  staffId: string;
  createdAt: number;
  expiresAt: number;
}

const staffSessions = new Map<string, StaffSession>();
const lastSeenWriteMap = new Map<string, number>();

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function generateSecureToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

function hashSha256(input: string): Buffer {
  return crypto.createHash('sha256').update(input, 'utf8').digest();
}

function timingSafeStringMatch(a: string, b: string): boolean {
  const hashA = hashSha256(a);
  const hashB = hashSha256(b);
  return crypto.timingSafeEqual(hashA, hashB);
}

function createInitialStaffList(): StoredStaffMember[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'EMP-CUT01',
      name: 'Бакыт',
      roleNote: 'Бычмачы',
      allowedStage: 'cutting',
      inviteToken: generateSecureToken(24),
      active: true,
      connected: false,
      connectedAt: null,
      lastSeenAt: null,
      deviceInfo: null,
      createdAt: now,
    },
    {
      id: 'EMP-SEW01',
      name: 'Асел эже',
      roleNote: 'Тигүү бөлүмү',
      allowedStage: 'sewing',
      inviteToken: generateSecureToken(24),
      active: true,
      connected: false,
      connectedAt: null,
      lastSeenAt: null,
      deviceInfo: null,
      createdAt: now,
    },
    {
      id: 'EMP-PCK01',
      name: 'Изат',
      roleNote: 'Үтүк & Упаковка',
      allowedStage: 'packing',
      inviteToken: generateSecureToken(24),
      active: true,
      connected: false,
      connectedAt: null,
      lastSeenAt: null,
      deviceInfo: null,
      createdAt: now,
    },
    {
      id: 'EMP-ZAV01',
      name: 'Нурбек',
      roleNote: 'Завсклад',
      allowedStage: 'zavsklad',
      inviteToken: generateSecureToken(24),
      active: true,
      connected: false,
      connectedAt: null,
      lastSeenAt: null,
      deviceInfo: null,
      createdAt: now,
    },
  ];
}

function readStaffList(): StoredStaffMember[] {
  ensureDataDir();
  if (!fs.existsSync(STAFF_FILE)) {
    const seeded = createInitialStaffList();
    fs.writeFileSync(STAFF_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
  try {
    const raw = fs.readFileSync(STAFF_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeded = createInitialStaffList();
      fs.writeFileSync(STAFF_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
      return seeded;
    }
    return parsed.filter(
      (item): item is StoredStaffMember =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.inviteToken === 'string' &&
        ALLOWED_EMPLOYEE_STAGES.includes(item.allowedStage)
    );
  } catch {
    const seeded = createInitialStaffList();
    fs.writeFileSync(STAFF_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
}

function saveStaffList(list: StoredStaffMember[]): void {
  ensureDataDir();
  fs.writeFileSync(STAFF_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

function revokeStaffSessions(staffId: string): void {
  for (const [token, session] of staffSessions.entries()) {
    if (session.staffId === staffId) {
      staffSessions.delete(token);
    }
  }
}

function hasActiveStaffSession(staffId: string): boolean {
  const now = Date.now();
  for (const [token, session] of staffSessions.entries()) {
    if (session.expiresAt < now) {
      staffSessions.delete(token);
      continue;
    }
    if (session.staffId === staffId) return true;
  }
  return false;
}

function toStaffSessionProfile(member: StoredStaffMember): StaffSessionProfile {
  return {
    id: member.id,
    name: member.name,
    roleNote: member.roleNote,
    allowedStage: member.allowedStage,
    seamstressName: member.seamstressName,
  };
}

function toStaffListView(member: StoredStaffMember): StaffMember {
  return {
    id: member.id,
    name: member.name,
    roleNote: member.roleNote,
    allowedStage: member.allowedStage,
    seamstressName: member.seamstressName,
    inviteToken: member.inviteToken,
    active: member.active,
    connected: member.active && (member.connected || hasActiveStaffSession(member.id)),
    connectedAt: member.connectedAt,
    lastSeenAt: member.lastSeenAt,
    deviceInfo: member.deviceInfo,
    createdAt: member.createdAt,
  };
}

function extractBearerToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

type StaffAuthCheck =
  | { kind: 'none' }
  | { kind: 'revoked' }
  | { kind: 'staff'; token: string; staff: StoredStaffMember };

function resolveStaffBearer(req: express.Request): StaffAuthCheck {
  const token = extractBearerToken(req);
  if (!token) return { kind: 'none' };

  const now = Date.now();
  const session = staffSessions.get(token);
  if (!session) return { kind: 'revoked' };
  if (session.expiresAt < now) {
    staffSessions.delete(token);
    return { kind: 'revoked' };
  }

  const staffList = readStaffList();
  const member = staffList.find((m) => m.id === session.staffId);
  if (!member || !member.active) {
    staffSessions.delete(token);
    return { kind: 'revoked' };
  }

  const lastWrite = lastSeenWriteMap.get(member.id) ?? 0;
  if (now - lastWrite > 15000) {
    lastSeenWriteMap.set(member.id, now);
    member.lastSeenAt = new Date(now).toISOString();
    member.connected = true;
    saveStaffList(staffList);
  }

  return { kind: 'staff', token, staff: member };
}

function ensureDataFile(): WarehouseState {
  ensureDataDir();
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
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function scopeStateForStaff(state: WarehouseState, staff: StoredStaffMember): WarehouseState {
  switch (staff.allowedStage) {
    case 'fabric':
      return {
        models: [],
        fabricRolls: state.fabricRolls,
        cuttingBatches: [],
        sewingBatches: [],
        packingBatches: [],
        products: [],
        dispatches: [],
      };
    case 'cutting':
      return {
        models: state.models,
        fabricRolls: state.fabricRolls,
        cuttingBatches: state.cuttingBatches,
        sewingBatches: [],
        packingBatches: [],
        products: [],
        dispatches: [],
      };
    case 'sewing':
      return {
        models: state.models,
        fabricRolls: [],
        cuttingBatches: [],
        sewingBatches: staff.seamstressName
          ? state.sewingBatches.filter((b) => b.seamstressName === staff.seamstressName)
          : state.sewingBatches,
        packingBatches: [],
        products: [],
        dispatches: [],
      };
    case 'packing':
      return {
        models: [],
        fabricRolls: [],
        cuttingBatches: [],
        sewingBatches: [],
        packingBatches: state.packingBatches,
        products: [],
        dispatches: [],
      };
    case 'zavsklad':
      return {
        models: state.models,
        fabricRolls: [],
        cuttingBatches: [],
        sewingBatches: [],
        packingBatches: state.packingBatches.filter(
          (b) => b.status === 'awaiting_zavsklad' || b.status === 'accepted'
        ),
        products: state.products,
        dispatches: [],
      };
    case 'dispatch':
      return {
        models: [],
        fabricRolls: [],
        cuttingBatches: [],
        sewingBatches: [],
        packingBatches: [],
        products: state.products,
        dispatches: state.dispatches,
      };
  }
}

function mergeScopedStaffUpdate(
  current: WarehouseState,
  incoming: Partial<WarehouseState>,
  staff: StoredStaffMember
): WarehouseState {
  switch (staff.allowedStage) {
    case 'fabric':
      return {
        ...current,
        fabricRolls: Array.isArray(incoming.fabricRolls)
          ? incoming.fabricRolls
          : current.fabricRolls,
      };
    case 'cutting': {
      const incomingSewing = Array.isArray(incoming.sewingBatches) ? incoming.sewingBatches : [];
      const existingIds = new Set(current.sewingBatches.map((b) => b.id));
      const newlyAddedSewing = incomingSewing.filter((b) => !existingIds.has(b.id));
      return {
        ...current,
        fabricRolls: Array.isArray(incoming.fabricRolls)
          ? incoming.fabricRolls
          : current.fabricRolls,
        cuttingBatches: Array.isArray(incoming.cuttingBatches)
          ? incoming.cuttingBatches
          : current.cuttingBatches,
        sewingBatches: [...newlyAddedSewing, ...current.sewingBatches],
      };
    }
    case 'sewing': {
      const incomingSewing = Array.isArray(incoming.sewingBatches)
        ? incoming.sewingBatches
        : current.sewingBatches;
      const mergedSewing = staff.seamstressName
        ? [
            ...incomingSewing.filter((b) => b.seamstressName === staff.seamstressName),
            ...current.sewingBatches.filter((b) => b.seamstressName !== staff.seamstressName),
          ]
        : incomingSewing;

      const incomingPacking = Array.isArray(incoming.packingBatches)
        ? incoming.packingBatches
        : [];
      const existingPackingIds = new Set(current.packingBatches.map((p) => p.id));
      const newlySentPacking = incomingPacking.filter((p) => !existingPackingIds.has(p.id));

      const sentBatchIds = new Set(newlySentPacking.map((p) => p.batchId));
      const updatedCutting = current.cuttingBatches.map((c) =>
        sentBatchIds.has(c.id) ? { ...c, status: 'ironing' as const } : c
      );

      return {
        ...current,
        sewingBatches: mergedSewing,
        cuttingBatches: updatedCutting,
        packingBatches: [...newlySentPacking, ...current.packingBatches],
      };
    }
    case 'packing': {
      const nextPacking = Array.isArray(incoming.packingBatches)
        ? incoming.packingBatches
        : current.packingBatches;
      const awaitingBatchIds = new Set(
        nextPacking.filter((p) => p.status === 'awaiting_zavsklad').map((p) => p.batchId)
      );
      const updatedCutting = current.cuttingBatches.map((c) =>
        awaitingBatchIds.has(c.id) ? { ...c, status: 'awaiting_zavsklad' as const } : c
      );
      return {
        ...current,
        packingBatches: nextPacking,
        cuttingBatches: updatedCutting,
      };
    }
    case 'zavsklad': {
      const incomingPacking = Array.isArray(incoming.packingBatches)
        ? incoming.packingBatches
        : [];
      const acceptedIds = new Set(
        incomingPacking.filter((p) => p.status === 'accepted').map((p) => p.id)
      );
      const acceptedBatchIds = new Set<string>();
      const mergedPacking = current.packingBatches.map((p) => {
        if (acceptedIds.has(p.id)) {
          acceptedBatchIds.add(p.batchId);
          return { ...p, status: 'accepted' as const, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      const updatedCutting = current.cuttingBatches.map((c) =>
        acceptedBatchIds.has(c.id) ? { ...c, status: 'stocked' as const } : c
      );
      return {
        ...current,
        packingBatches: mergedPacking,
        cuttingBatches: updatedCutting,
        products: Array.isArray(incoming.products) ? incoming.products : current.products,
      };
    }
    case 'dispatch':
      return {
        ...current,
        products: Array.isArray(incoming.products) ? incoming.products : current.products,
        dispatches: Array.isArray(incoming.dispatches) ? incoming.dispatches : current.dispatches,
      };
  }
}

function sanitizeText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  ensureDataFile();
  readStaffList();

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Staff management routes (blocked for restricted staff sessions)
  app.get('/api/staff', (req, res) => {
    if (extractBearerToken(req)) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }
    const list = readStaffList().map(toStaffListView);
    res.json({ staff: list });
  });

  app.post('/api/staff', (req, res) => {
    if (extractBearerToken(req)) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }
    const name = sanitizeText(req.body?.name, 80);
    const roleNote = sanitizeText(req.body?.roleNote, 80);
    const allowedStage = req.body?.allowedStage as EmployeeStageKey;
    const seamstressName = sanitizeText(req.body?.seamstressName, 60);

    if (!name) {
      res.status(400).json({ error: 'NAME_REQUIRED' });
      return;
    }
    if (!ALLOWED_EMPLOYEE_STAGES.includes(allowedStage)) {
      res.status(400).json({ error: 'INVALID_STAGE' });
      return;
    }

    const list = readStaffList();
    const member: StoredStaffMember = {
      id: `EMP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      name,
      roleNote: roleNote || undefined,
      allowedStage,
      seamstressName: allowedStage === 'sewing' && seamstressName ? seamstressName : undefined,
      inviteToken: generateSecureToken(24),
      active: true,
      connected: false,
      connectedAt: null,
      lastSeenAt: null,
      deviceInfo: null,
      createdAt: new Date().toISOString(),
    };
    list.unshift(member);
    saveStaffList(list);
    res.status(201).json({ member: toStaffListView(member) });
  });

  app.patch('/api/staff/:id', (req, res) => {
    if (extractBearerToken(req)) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    const list = readStaffList();
    const target = list.find((m) => m.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }

    if (typeof req.body?.active === 'boolean') {
      target.active = req.body.active;
      if (!target.active) {
        target.connected = false;
        revokeStaffSessions(target.id);
      }
    }

    if (typeof req.body?.name === 'string') {
      const cleaned = sanitizeText(req.body.name, 80);
      if (cleaned) target.name = cleaned;
    }

    if (typeof req.body?.roleNote === 'string') {
      const cleaned = sanitizeText(req.body.roleNote, 80);
      target.roleNote = cleaned || undefined;
    }

    if (
      typeof req.body?.allowedStage === 'string' &&
      ALLOWED_EMPLOYEE_STAGES.includes(req.body.allowedStage as EmployeeStageKey)
    ) {
      target.allowedStage = req.body.allowedStage as EmployeeStageKey;
      if (target.allowedStage !== 'sewing') {
        target.seamstressName = undefined;
      }
    }

    if (typeof req.body?.seamstressName === 'string' && target.allowedStage === 'sewing') {
      const cleaned = sanitizeText(req.body.seamstressName, 60);
      target.seamstressName = cleaned || undefined;
    }

    if (req.body?.regenerateToken === true) {
      target.inviteToken = generateSecureToken(24);
      target.connected = false;
      revokeStaffSessions(target.id);
    }

    saveStaffList(list);
    res.json({ member: toStaffListView(target) });
  });

  app.delete('/api/staff/:id', (req, res) => {
    if (extractBearerToken(req)) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    const list = readStaffList();
    const index = list.findIndex((m) => m.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }

    const [removed] = list.splice(index, 1);
    revokeStaffSessions(removed.id);
    saveStaffList(list);
    res.json({ ok: true });
  });

  // Staff QR Connect
  app.post('/api/staff/connect', (req, res) => {
    const inviteToken = sanitizeText(req.body?.token, 128);
    if (!inviteToken) {
      res.status(400).json({ error: 'TOKEN_REQUIRED' });
      return;
    }

    const list = readStaffList();
    const member = list.find((m) => timingSafeStringMatch(m.inviteToken, inviteToken));
    if (!member) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    if (!member.active) {
      res.status(403).json({ error: 'DISABLED' });
      return;
    }

    const nowIso = new Date().toISOString();
    const deviceInfo = sanitizeText(req.body?.deviceInfo, 80) || 'Телефон';
    member.connected = true;
    member.connectedAt = nowIso;
    member.lastSeenAt = nowIso;
    member.deviceInfo = deviceInfo;
    saveStaffList(list);

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    staffSessions.set(sessionToken, {
      staffId: member.id,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    res.json({
      sessionToken,
      staff: toStaffSessionProfile(member),
    });
  });

  // Staff live session heartbeat / verification
  app.get('/api/staff/me', (req, res) => {
    const auth = resolveStaffBearer(req);
    if (auth.kind !== 'staff') {
      res.status(401).json({ error: 'REVOKED' });
      return;
    }
    res.json({
      ok: true,
      staff: toStaffSessionProfile(auth.staff),
    });
  });

  // Staff disconnect
  app.post('/api/staff/disconnect', (req, res) => {
    const auth = resolveStaffBearer(req);
    if (auth.kind === 'staff') {
      staffSessions.delete(auth.token);
      if (!hasActiveStaffSession(auth.staff.id)) {
        const list = readStaffList();
        const target = list.find((m) => m.id === auth.staff.id);
        if (target) {
          target.connected = false;
          saveStaffList(list);
        }
      }
    }
    res.json({ ok: true });
  });

  // Warehouse State (Full workspace when no staff token; strictly stage-scoped for staff tokens)
  app.get('/api/state', (req, res) => {
    const auth = resolveStaffBearer(req);
    if (auth.kind === 'revoked') {
      res.status(401).json({ error: 'REVOKED' });
      return;
    }
    const state = ensureDataFile();
    if (auth.kind === 'staff') {
      res.json(scopeStateForStaff(state, auth.staff));
      return;
    }
    res.json(state);
  });

  app.put('/api/state', (req, res) => {
    const auth = resolveStaffBearer(req);
    if (auth.kind === 'revoked') {
      res.status(401).json({ error: 'REVOKED' });
      return;
    }
    const body = req.body as Partial<WarehouseState> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'INVALID_BODY' });
      return;
    }

    if (auth.kind === 'staff') {
      const current = ensureDataFile();
      const merged = mergeScopedStaffUpdate(current, body, auth.staff);
      saveStateToFile(merged);
      res.json({ ok: true });
      return;
    }

    if (!Array.isArray(body.models) || !Array.isArray(body.products)) {
      res.status(400).json({ error: 'INVALID_BODY' });
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

  // Public read-only garment model QR lookup
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

  app.post('/api/reset', (req, res) => {
    if (extractBearerToken(req)) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }
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
