import crypto from 'crypto';
import express from 'express';
import { INITIAL_WAREHOUSE_STATE } from '../src/data/initialData.js';
import type {
  EmployeeStageKey,
  StaffMember,
  StaffSessionProfile,
  WarehouseState,
} from '../src/types/warehouse.js';
import {
  kvDel,
  kvGet,
  kvSet,
  kvSetAdd,
  kvSetIfAbsent,
  kvSetMembers,
  kvSetRemove,
  storageKind,
} from './storage.js';

// Storage keys
const STATE_KEY = 'state';
const STAFF_KEY = 'staff';
const AUTH_KEY = 'auth';
const adminSessionKey = (token: string) => `sess:admin:${token}`;
const staffSessionKey = (token: string) => `sess:staff:${token}`;
const staffSessionIndexKey = (staffId: string) => `staffsess:${staffId}`;

const ALLOWED_EMPLOYEE_STAGES: readonly EmployeeStageKey[] = [
  'fabric',
  'cutting',
  'sewing',
  'packing',
  'zavsklad',
  'dispatch',
];

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

interface StoredAdminAuth {
  salt: string;
  hash: string;
  createdAt: string;
}

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

interface AdminSession {
  createdAt: number;
  expiresAt: number;
}

interface StaffSession {
  staffId: string;
  createdAt: number;
  expiresAt: number;
}

type CallerContext =
  | { role: 'admin'; token: string }
  | { role: 'staff'; token: string; staff: StoredStaffMember };

// Per-instance throttle for "last seen" writes (only reduces write volume)
const lastSeenWriteMap = new Map<string, number>();

// ---------- crypto helpers ----------
function generateSecureToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

function hashSha256(input: string): Buffer {
  return crypto.createHash('sha256').update(input, 'utf8').digest();
}

function timingSafeStringMatch(a: string, b: string): boolean {
  return crypto.timingSafeEqual(hashSha256(a), hashSha256(b));
}

function hashPasscodeScrypt(passcode: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, 64).toString('hex');
  return { salt, hash: derived };
}

function verifyPasscodeScrypt(passcode: string, salt: string, expectedHex: string): boolean {
  const derived = crypto.scryptSync(passcode, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

// ---------- admin auth ----------
function getEnvAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE || '').trim();
}

async function readStoredAdminAuth(): Promise<StoredAdminAuth | null> {
  const parsed = await kvGet<Partial<StoredAdminAuth>>(AUTH_KEY);
  if (parsed && typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
    return {
      salt: parsed.salt,
      hash: parsed.hash,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
    };
  }
  return null;
}

async function isAdminConfigured(): Promise<{ configured: boolean; usingEnvPasscode: boolean }> {
  if (getEnvAdminPasscode().length > 0) {
    return { configured: true, usingEnvPasscode: true };
  }
  return { configured: Boolean(await readStoredAdminAuth()), usingEnvPasscode: false };
}

async function createAdminSession(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: AdminSession = { createdAt: now, expiresAt: now + SESSION_TTL_MS };
  await kvSet(adminSessionKey(token), session, SESSION_TTL_MS);
  return token;
}

// ---------- staff ----------
function createInitialStaffList(): StoredStaffMember[] {
  const now = new Date().toISOString();
  const base = (id: string, name: string, roleNote: string, allowedStage: EmployeeStageKey) => ({
    id,
    name,
    roleNote,
    allowedStage,
    inviteToken: generateSecureToken(24),
    active: true,
    connected: false,
    connectedAt: null,
    lastSeenAt: null,
    deviceInfo: null,
    createdAt: now,
  });
  return [
    base('EMP-CUT01', 'Бакыт', 'Бычмачы', 'cutting'),
    base('EMP-SEW01', 'Асел эже', 'Тигүү бөлүмү', 'sewing'),
    base('EMP-PCK01', 'Изат', 'Үтүк & Упаковка', 'packing'),
    base('EMP-ZAV01', 'Нурбек', 'Завсклад', 'zavsklad'),
  ];
}

async function readStaffList(): Promise<StoredStaffMember[]> {
  const parsed = await kvGet<unknown>(STAFF_KEY);
  if (!Array.isArray(parsed)) {
    const seeded = createInitialStaffList();
    await kvSet(STAFF_KEY, seeded);
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
}

async function saveStaffList(list: StoredStaffMember[]): Promise<void> {
  await kvSet(STAFF_KEY, list);
}

async function revokeStaffSessions(staffId: string): Promise<void> {
  const tokens = await kvSetMembers(staffSessionIndexKey(staffId));
  await kvDel(...tokens.map(staffSessionKey), staffSessionIndexKey(staffId));
}

async function hasActiveStaffSession(staffId: string): Promise<boolean> {
  const tokens = await kvSetMembers(staffSessionIndexKey(staffId));
  let active = false;
  for (const token of tokens) {
    const session = await kvGet<StaffSession>(staffSessionKey(token));
    if (session && session.expiresAt >= Date.now()) {
      active = true;
    } else {
      await kvSetRemove(staffSessionIndexKey(staffId), token);
    }
  }
  return active;
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

async function toAdminStaffView(member: StoredStaffMember): Promise<StaffMember> {
  return {
    id: member.id,
    name: member.name,
    roleNote: member.roleNote,
    allowedStage: member.allowedStage,
    seamstressName: member.seamstressName,
    inviteToken: member.inviteToken,
    active: member.active,
    connected: member.active && (member.connected || (await hasActiveStaffSession(member.id))),
    connectedAt: member.connectedAt,
    lastSeenAt: member.lastSeenAt,
    deviceInfo: member.deviceInfo,
    createdAt: member.createdAt,
  };
}

// ---------- caller ----------
function extractBearerToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

async function getCaller(req: express.Request): Promise<CallerContext | null> {
  const token = extractBearerToken(req);
  if (!token) return null;
  const now = Date.now();

  const adminSession = await kvGet<AdminSession>(adminSessionKey(token));
  if (adminSession) {
    if (adminSession.expiresAt < now) {
      await kvDel(adminSessionKey(token));
      return null;
    }
    return { role: 'admin', token };
  }

  const staffSession = await kvGet<StaffSession>(staffSessionKey(token));
  if (staffSession) {
    if (staffSession.expiresAt < now) {
      await kvDel(staffSessionKey(token));
      return null;
    }
    const staffList = await readStaffList();
    const member = staffList.find((m) => m.id === staffSession.staffId);
    if (!member || !member.active) {
      await kvDel(staffSessionKey(token));
      return null;
    }

    const lastWrite = lastSeenWriteMap.get(member.id) ?? 0;
    if (now - lastWrite > 15000) {
      lastSeenWriteMap.set(member.id, now);
      member.lastSeenAt = new Date(now).toISOString();
      member.connected = true;
      await saveStaffList(staffList);
    }

    return { role: 'staff', token, staff: member };
  }

  return null;
}

// ---------- warehouse state ----------
function normalizeState(parsed: Partial<WarehouseState> | null | undefined): WarehouseState {
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

async function loadState(): Promise<WarehouseState> {
  const stored = await kvGet<Partial<WarehouseState>>(STATE_KEY);
  if (!stored) {
    await kvSet(STATE_KEY, INITIAL_WAREHOUSE_STATE);
    return INITIAL_WAREHOUSE_STATE;
  }
  return normalizeState(stored);
}

async function saveState(state: WarehouseState): Promise<void> {
  await kvSet(STATE_KEY, state);
}

function scopeStateForStaff(state: WarehouseState, staff: StoredStaffMember): WarehouseState {
  const empty: WarehouseState = {
    models: [],
    fabricRolls: [],
    cuttingBatches: [],
    sewingBatches: [],
    packingBatches: [],
    products: [],
    dispatches: [],
  };
  switch (staff.allowedStage) {
    case 'fabric':
      return { ...empty, fabricRolls: state.fabricRolls };
    case 'cutting':
      return {
        ...empty,
        models: state.models,
        fabricRolls: state.fabricRolls,
        cuttingBatches: state.cuttingBatches,
      };
    case 'sewing':
      return {
        ...empty,
        models: state.models,
        sewingBatches: staff.seamstressName
          ? state.sewingBatches.filter((b) => b.seamstressName === staff.seamstressName)
          : state.sewingBatches,
      };
    case 'packing':
      return { ...empty, packingBatches: state.packingBatches };
    case 'zavsklad':
      return {
        ...empty,
        models: state.models,
        packingBatches: state.packingBatches.filter(
          (b) => b.status === 'awaiting_zavsklad' || b.status === 'accepted'
        ),
        products: state.products,
      };
    case 'dispatch':
      return { ...empty, products: state.products, dispatches: state.dispatches };
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
        fabricRolls: Array.isArray(incoming.fabricRolls) ? incoming.fabricRolls : current.fabricRolls,
      };
    case 'cutting': {
      // Cutting deducts fabric kg, adds cutting batch, and appends new sewing batches
      const incomingSewing = Array.isArray(incoming.sewingBatches) ? incoming.sewingBatches : [];
      const existingIds = new Set(current.sewingBatches.map((b) => b.id));
      const newlyAddedSewing = incomingSewing.filter((b) => !existingIds.has(b.id));
      return {
        ...current,
        fabricRolls: Array.isArray(incoming.fabricRolls) ? incoming.fabricRolls : current.fabricRolls,
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

      const incomingPacking = Array.isArray(incoming.packingBatches) ? incoming.packingBatches : [];
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
      return { ...current, packingBatches: nextPacking, cuttingBatches: updatedCutting };
    }
    case 'zavsklad': {
      const incomingPacking = Array.isArray(incoming.packingBatches) ? incoming.packingBatches : [];
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

// ---------- app ----------
type Handler = (req: express.Request, res: express.Response) => Promise<void>;

const wrap =
  (fn: Handler): express.RequestHandler =>
  (req, res) => {
    fn(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: 'SERVER_ERROR' });
    });
  };

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storage: storageKind });
  });

  // Auth status check
  app.get(
    '/api/auth/status',
    wrap(async (req, res) => {
      const { configured, usingEnvPasscode } = await isAdminConfigured();
      const caller = await getCaller(req);
      res.json({
        adminConfigured: configured,
        usingEnvPasscode,
        role: caller ? caller.role : null,
        staff: caller && caller.role === 'staff' ? toStaffSessionProfile(caller.staff) : null,
      });
    })
  );

  // One-time Admin passcode claim (only when ADMIN_PASSCODE env is unset and no hash exists)
  app.post(
    '/api/admin/claim',
    wrap(async (req, res) => {
      const { configured } = await isAdminConfigured();
      if (configured) {
        res.status(409).json({ error: 'ALREADY_CONFIGURED' });
        return;
      }
      const passcode = sanitizeText(req.body?.passcode, 128);
      if (passcode.length < 4) {
        res.status(400).json({ error: 'PASSCODE_TOO_SHORT' });
        return;
      }
      const { salt, hash } = hashPasscodeScrypt(passcode);
      // Atomic: only the first claim wins, even with concurrent requests
      const written = await kvSetIfAbsent(AUTH_KEY, {
        salt,
        hash,
        createdAt: new Date().toISOString(),
      });
      if (!written) {
        res.status(409).json({ error: 'ALREADY_CONFIGURED' });
        return;
      }
      res.json({ token: await createAdminSession(), role: 'admin' });
    })
  );

  // Admin login
  app.post(
    '/api/admin/login',
    wrap(async (req, res) => {
      const passcode = sanitizeText(req.body?.passcode, 128);
      if (!passcode) {
        res.status(400).json({ error: 'INVALID_PASSCODE' });
        return;
      }

      const envPass = getEnvAdminPasscode();
      let verified = false;
      if (envPass.length > 0) {
        verified = timingSafeStringMatch(passcode, envPass);
      } else {
        const stored = await readStoredAdminAuth();
        if (!stored) {
          res.status(409).json({ error: 'NOT_CONFIGURED' });
          return;
        }
        verified = verifyPasscodeScrypt(passcode, stored.salt, stored.hash);
      }

      if (!verified) {
        res.status(401).json({ error: 'INVALID_PASSCODE' });
        return;
      }
      res.json({ token: await createAdminSession(), role: 'admin' });
    })
  );

  // Admin logout
  app.post(
    '/api/admin/logout',
    wrap(async (req, res) => {
      const token = extractBearerToken(req);
      if (token) await kvDel(adminSessionKey(token));
      res.json({ ok: true });
    })
  );

  // Admin Staff Management (strictly Admin-only)
  app.get(
    '/api/admin/staff',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller || caller.role !== 'admin') {
        res.status(403).json({ error: 'ADMIN_ONLY' });
        return;
      }
      const list = await readStaffList();
      res.json({ staff: await Promise.all(list.map(toAdminStaffView)) });
    })
  );

  app.post(
    '/api/admin/staff',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller || caller.role !== 'admin') {
        res.status(403).json({ error: 'ADMIN_ONLY' });
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

      const list = await readStaffList();
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
      await saveStaffList(list);
      res.status(201).json({ member: await toAdminStaffView(member) });
    })
  );

  app.patch(
    '/api/admin/staff/:id',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller || caller.role !== 'admin') {
        res.status(403).json({ error: 'ADMIN_ONLY' });
        return;
      }

      const list = await readStaffList();
      const target = list.find((m) => m.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'NOT_FOUND' });
        return;
      }

      if (typeof req.body?.active === 'boolean') {
        target.active = req.body.active;
        if (!target.active) {
          target.connected = false;
          await revokeStaffSessions(target.id);
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
        if (target.allowedStage !== 'sewing') target.seamstressName = undefined;
      }

      if (typeof req.body?.seamstressName === 'string' && target.allowedStage === 'sewing') {
        const cleaned = sanitizeText(req.body.seamstressName, 60);
        target.seamstressName = cleaned || undefined;
      }

      if (req.body?.regenerateToken === true) {
        target.inviteToken = generateSecureToken(24);
        target.connected = false;
        await revokeStaffSessions(target.id);
      }

      await saveStaffList(list);
      res.json({ member: await toAdminStaffView(target) });
    })
  );

  app.delete(
    '/api/admin/staff/:id',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller || caller.role !== 'admin') {
        res.status(403).json({ error: 'ADMIN_ONLY' });
        return;
      }

      const list = await readStaffList();
      const index = list.findIndex((m) => m.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ error: 'NOT_FOUND' });
        return;
      }

      const [removed] = list.splice(index, 1);
      await revokeStaffSessions(removed.id);
      await saveStaffList(list);
      res.json({ ok: true });
    })
  );

  // Staff QR Connect
  app.post(
    '/api/staff/connect',
    wrap(async (req, res) => {
      const inviteToken = sanitizeText(req.body?.token, 128);
      if (!inviteToken) {
        res.status(400).json({ error: 'TOKEN_REQUIRED' });
        return;
      }

      const list = await readStaffList();
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
      member.connected = true;
      member.connectedAt = nowIso;
      member.lastSeenAt = nowIso;
      member.deviceInfo = sanitizeText(req.body?.deviceInfo, 80) || 'Телефон';
      await saveStaffList(list);

      const sessionToken = crypto.randomBytes(32).toString('hex');
      const now = Date.now();
      const session: StaffSession = {
        staffId: member.id,
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS,
      };
      await kvSet(staffSessionKey(sessionToken), session, SESSION_TTL_MS);
      await kvSetAdd(staffSessionIndexKey(member.id), sessionToken);

      res.json({ sessionToken, staff: toStaffSessionProfile(member) });
    })
  );

  // Staff live session heartbeat / verification
  app.get(
    '/api/staff/me',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller || caller.role !== 'staff') {
        res.status(401).json({ error: 'REVOKED' });
        return;
      }
      res.json({ ok: true, staff: toStaffSessionProfile(caller.staff) });
    })
  );

  // Staff self disconnect
  app.post(
    '/api/staff/disconnect',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (caller && caller.role === 'staff') {
        await kvDel(staffSessionKey(caller.token));
        await kvSetRemove(staffSessionIndexKey(caller.staff.id), caller.token);
        if (!(await hasActiveStaffSession(caller.staff.id))) {
          const list = await readStaffList();
          const target = list.find((m) => m.id === caller.staff.id);
          if (target) {
            target.connected = false;
            await saveStaffList(list);
          }
        }
      }
      res.json({ ok: true });
    })
  );

  // Protected Warehouse State (Admin gets all, Staff gets ONLY their stage's data)
  app.get(
    '/api/state',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller) {
        res.status(401).json({ error: 'UNAUTHORIZED' });
        return;
      }
      const state = await loadState();
      res.json(caller.role === 'admin' ? state : scopeStateForStaff(state, caller.staff));
    })
  );

  app.put(
    '/api/state',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller) {
        res.status(401).json({ error: 'UNAUTHORIZED' });
        return;
      }
      const body = req.body as Partial<WarehouseState> | undefined;
      if (!body || typeof body !== 'object') {
        res.status(400).json({ error: 'INVALID_BODY' });
        return;
      }

      if (caller.role === 'admin') {
        if (!Array.isArray(body.models) || !Array.isArray(body.products)) {
          res.status(400).json({ error: 'INVALID_BODY' });
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
        return;
      }

      const current = await loadState();
      await saveState(mergeScopedStaffUpdate(current, body, caller.staff));
      res.json({ ok: true });
    })
  );

  // Public read-only garment model QR lookup (no PII, for scanning fabric/cutting QR stickers)
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

  // Reset demo data (strictly Admin-only)
  app.post(
    '/api/reset',
    wrap(async (req, res) => {
      const caller = await getCaller(req);
      if (!caller || caller.role !== 'admin') {
        res.status(403).json({ error: 'ADMIN_ONLY' });
        return;
      }
      await saveState(INITIAL_WAREHOUSE_STATE);
      res.json(INITIAL_WAREHOUSE_STATE);
    })
  );

  return app;
}
