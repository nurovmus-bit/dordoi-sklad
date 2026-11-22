import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutGrid,
  QrCode,
  Layers,
  Scissors,
  Users,
  PackageCheck,
  Barcode,
  Truck,
  Menu,
  X,
  RotateCcw,
  Sun,
  Moon,
  Languages,
  UserCheck,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import {
  CuttingBatch,
  EmployeeStageKey,
  FabricRoll,
  GarmentModel,
  MachineType,
  PackingBatch,
  ProductStock,
  StaffMember,
  StaffSessionProfile,
  StageKey,
  UiVariant,
  WarehouseState,
} from './types/warehouse';
import { createId, INITIAL_WAREHOUSE_STATE } from './data/initialData';
import { Lang, TRANSLATIONS } from './i18n/translations';
import { PipelineOverview } from './components/PipelineOverview';
import { AdminModelsStage } from './components/AdminModelsStage';
import { AdminStaffStage } from './components/AdminStaffStage';
import { FabricStage } from './components/FabricStage';
import { CuttingStage } from './components/CuttingStage';
import { SewingStage } from './components/SewingStage';
import { PackingStage } from './components/PackingStage';
import { ZavskladStage } from './components/ZavskladStage';
import { DispatchStage } from './components/DispatchStage';
import { QrCodeModal } from './components/QrCodeModal';
import { StaffQrModal } from './components/StaffQrModal';
import { QrModelViewer } from './components/QrModelViewer';
import { ConfirmModal } from './components/ConfirmModal';
import { StaffStatusScreen } from './components/StaffStatusScreen';

const STORAGE_KEY = 'dordoi_sklad_state_v2';
const VARIANT_KEY = 'dordoi_sklad_variant_v1';
const LANG_KEY = 'dordoi_sklad_lang_v1';

const EMPTY_STATE: WarehouseState = {
  models: [],
  fabricRolls: [],
  cuttingBatches: [],
  sewingBatches: [],
  packingBatches: [],
  products: [],
  dispatches: [],
};

function loadFallbackState(): WarehouseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_WAREHOUSE_STATE;
    const parsed = JSON.parse(raw) as Partial<WarehouseState>;
    return {
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
  } catch {
    return INITIAL_WAREHOUSE_STATE;
  }
}

function loadInitialVariant(): UiVariant {
  try {
    const saved = localStorage.getItem(VARIANT_KEY);
    return saved === 'floor' ? 'floor' : 'classic';
  } catch {
    return 'classic';
  }
}

function loadInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'ru' ? 'ru' : 'ky';
  } catch {
    return 'ky';
  }
}

function readInitialUrlParams(): {
  modelId: string | null;
  batchId: string | null;
  staffToken: string | null;
} {
  if (typeof window === 'undefined') {
    return { modelId: null, batchId: null, staffToken: null };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    modelId: params.get('model'),
    batchId: params.get('batch'),
    staffToken: params.get('staff'),
  };
}

function detectDeviceLabel(): string {
  if (typeof navigator === 'undefined') return 'Телефон';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad/i.test(ua)) return 'iPhone · Mobile';
  if (/Android/i.test(ua)) return 'Android · Mobile';
  if (/Mobile/i.test(ua)) return 'Mobile';
  return 'Компьютер / Браузер';
}

type StaffScreenPhase = 'none' | 'connecting' | 'revoked' | 'invalid_qr' | 'disabled_qr';

interface NavItem {
  key: StageKey;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'overview' | 'admin' | 'production' | 'warehouse';
}

export default function App() {
  const initialParamsRef = useRef(readInitialUrlParams());
  const isInitialStaffScan = Boolean(initialParamsRef.current.staffToken);

  const [state, setState] = useState<WarehouseState>(() =>
    isInitialStaffScan ? EMPTY_STATE : loadFallbackState()
  );
  const [serverLoaded, setServerLoaded] = useState(false);
  const [variant, setVariant] = useState<UiVariant>(loadInitialVariant);
  const [lang, setLang] = useState<Lang>(loadInitialLang);
  const [activeStage, setActiveStage] = useState<StageKey>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preselectedDispatchProductId, setPreselectedDispatchProductId] = useState<string | null>(
    null
  );

  // Staff QR session (kept strictly in React memory — never in localStorage)
  const [staffToken, setStaffToken] = useState<string | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffSessionProfile | null>(null);
  const [staffScreenPhase, setStaffScreenPhase] = useState<StaffScreenPhase>(
    isInitialStaffScan ? 'connecting' : 'none'
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Staff list management
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffQrModalMember, setStaffQrModalMember] = useState<StaffMember | null>(null);

  // Garment QR model viewer
  const [qrViewTarget, setQrViewTarget] = useState<{
    modelId: string;
    batchId?: string | null;
  } | null>(
    initialParamsRef.current.modelId
      ? { modelId: initialParamsRef.current.modelId, batchId: initialParamsRef.current.batchId }
      : null
  );
  const [publicQrPayload, setPublicQrPayload] = useState<{
    model: GarmentModel | null;
    batches: CuttingBatch[];
    products: ProductStock[];
  } | null>(null);

  const [qrModalData, setQrModalData] = useState<{
    open: boolean;
    model: GarmentModel | null;
    batch?: CuttingBatch | null;
  }>({ open: false, model: null, batch: null });

  const t = TRANSLATIONS[lang];

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    tone: 'danger' | 'primary';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    confirmLabel: t.common.confirm,
    tone: 'danger',
    onConfirm: () => {},
  });

  const skipNextSaveRef = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    if (variant === 'floor') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(VARIANT_KEY, variant);
    } catch {
      // Ignore
    }
  }, [variant]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Ignore
    }
  }, [lang]);

  // Fetch public garment model QR details if opened via ?model=...
  useEffect(() => {
    if (!qrViewTarget) {
      setPublicQrPayload(null);
      return;
    }
    let active = true;
    fetch(`/api/models/${encodeURIComponent(qrViewTarget.modelId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            model: GarmentModel;
            batches: CuttingBatch[];
            products: ProductStock[];
          } | null
        ) => {
          if (!active) return;
          setPublicQrPayload(data ?? { model: null, batches: [], products: [] });
        }
      )
      .catch(() => {
        if (active) setPublicQrPayload({ model: null, batches: [], products: [] });
      });
    return () => {
      active = false;
    };
  }, [qrViewTarget]);

  const fetchWarehouseState = useCallback(async (token: string | null) => {
    try {
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const res = await fetch('/api/state', { headers });
      if (res.status === 401) {
        return 'revoked' as const;
      }
      if (!res.ok) return 'error' as const;
      const data = (await res.json()) as WarehouseState;
      skipNextSaveRef.current = true;
      setState(data);
      setServerLoaded(true);
      return 'ok' as const;
    } catch {
      if (!token) setServerLoaded(true);
      return 'error' as const;
    }
  }, []);

  const fetchStaffList = useCallback(async () => {
    setStaffLoading(true);
    try {
      const res = await fetch('/api/staff');
      if (!res.ok) return;
      const data = (await res.json()) as { staff: StaffMember[] };
      if (Array.isArray(data.staff)) {
        setStaffList(data.staff);
        setStaffQrModalMember((prev) =>
          prev ? data.staff.find((m) => m.id === prev.id) ?? null : null
        );
      }
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const connectWithStaffQrToken = useCallback(
    async (inviteToken: string, preview: boolean) => {
      setStaffScreenPhase('connecting');
      try {
        const res = await fetch('/api/staff/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: inviteToken,
            deviceInfo: preview ? 'Текшерүү режими' : detectDeviceLabel(),
          }),
        });
        const data = (await res.json().catch(() => null)) as {
          sessionToken?: string;
          staff?: StaffSessionProfile;
          error?: string;
        } | null;

        if (!res.ok || !data?.sessionToken || !data?.staff) {
          if (data?.error === 'DISABLED') {
            setStaffScreenPhase('disabled_qr');
          } else {
            setStaffScreenPhase('invalid_qr');
          }
          return false;
        }

        setStaffToken(data.sessionToken);
        setStaffProfile(data.staff);
        setActiveStage(data.staff.allowedStage);
        setIsPreviewMode(preview);
        setServerLoaded(false);

        const stateRes = await fetchWarehouseState(data.sessionToken);
        if (stateRes === 'revoked') {
          setStaffToken(null);
          setStaffProfile(null);
          setStaffScreenPhase('revoked');
          return false;
        }

        setStaffScreenPhase('none');
        return true;
      } catch {
        setStaffScreenPhase('invalid_qr');
        return false;
      }
    },
    [fetchWarehouseState]
  );

  // Initial load: if ?staff=... connect employee, else load full workspace directly!
  useEffect(() => {
    const qrStaffToken = initialParamsRef.current.staffToken;
    if (qrStaffToken) {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }
      connectWithStaffQrToken(qrStaffToken, false);
      return;
    }

    fetchWarehouseState(null);
    fetchStaffList();
  }, [connectWithStaffQrToken, fetchWarehouseState, fetchStaffList]);

  // Sync state changes to server
  useEffect(() => {
    if (!staffProfile) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore
      }
    }
    if (!serverLoaded) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (staffToken) {
      headers.Authorization = `Bearer ${staffToken}`;
    }
    fetch('/api/state', {
      method: 'PUT',
      headers,
      body: JSON.stringify(state),
    })
      .then((res) => {
        if (res.status === 401 && staffToken) {
          setStaffToken(null);
          setStaffProfile(null);
          setState(EMPTY_STATE);
          setServerLoaded(false);
          setStaffScreenPhase('revoked');
        }
      })
      .catch(() => {
        // Offline fallback
      });
  }, [state, serverLoaded, staffToken, staffProfile]);

  // Live heartbeat for connected staff — enforces instant revocation!
  useEffect(() => {
    if (!staffToken || !staffProfile) return;

    const timer = window.setInterval(async () => {
      try {
        const res = await fetch('/api/staff/me', {
          headers: { Authorization: `Bearer ${staffToken}` },
        });
        if (res.status === 401) {
          setStaffToken(null);
          setStaffProfile(null);
          setState(EMPTY_STATE);
          setServerLoaded(false);
          setStaffScreenPhase('revoked');
          return;
        }
        if (res.ok) {
          const data = (await res.json()) as { staff?: StaffSessionProfile };
          if (data.staff) {
            setStaffProfile(data.staff);
            setActiveStage(data.staff.allowedStage);
          }
        }
      } catch {
        // Ignore transient offline errors
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [staffToken, staffProfile]);

  // Auto-refresh staff connection status while viewing Staff tab
  useEffect(() => {
    if (staffProfile || activeStage !== 'staff') return;
    fetchStaffList();
    const timer = window.setInterval(() => {
      fetchStaffList();
    }, 6000);
    return () => window.clearInterval(timer);
  }, [staffProfile, activeStage, fetchStaffList]);

  // Employee self-disconnect
  const handleStaffDisconnect = async () => {
    if (staffToken) {
      await fetch('/api/staff/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${staffToken}` },
      }).catch(() => {});
    }
    setStaffToken(null);
    setStaffProfile(null);
    setState(EMPTY_STATE);
    setServerLoaded(false);
    setStaffScreenPhase('revoked');
  };

  // Previewing an employee's exact single-stage screen
  const handlePreviewAsStaff = async (member: StaffMember) => {
    if (!member.inviteToken) return;
    setStaffQrModalMember(null);
    await connectWithStaffQrToken(member.inviteToken, true);
  };

  // Exit preview back to full workspace
  const handleExitPreview = async () => {
    if (staffToken) {
      await fetch('/api/staff/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${staffToken}` },
      }).catch(() => {});
    }
    setStaffToken(null);
    setStaffProfile(null);
    setIsPreviewMode(false);
    setStaffScreenPhase('none');
    setActiveStage('staff');
    await Promise.all([fetchWarehouseState(null), fetchStaffList()]);
  };

  // Staff CRUD handlers
  const handleCreateStaff = async (payload: {
    name: string;
    roleNote?: string;
    allowedStage: EmployeeStageKey;
    seamstressName?: string;
  }): Promise<StaffMember | null> => {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { member?: StaffMember };
    if (!data.member) return null;
    setStaffList((prev) => [data.member!, ...prev]);
    return data.member;
  };

  const handleToggleStaffActive = async (member: StaffMember) => {
    const res = await fetch(`/api/staff/${encodeURIComponent(member.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !member.active }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { member?: StaffMember };
    if (data.member) {
      setStaffList((prev) => prev.map((m) => (m.id === member.id ? data.member! : m)));
      if (staffQrModalMember?.id === member.id && !data.member.active) {
        setStaffQrModalMember(null);
      }
    }
  };

  const handleRegenerateStaffQr = (member: StaffMember) => {
    setConfirmDialog({
      open: true,
      title: t.staff.qrRegenerateConfirmTitle,
      message: t.staff.qrRegenerateConfirmMsg(member.name),
      confirmLabel: t.staff.qrRegenerateConfirmBtn,
      tone: 'primary',
      onConfirm: async () => {
        setConfirmDialog((c) => ({ ...c, open: false }));
        const res = await fetch(`/api/staff/${encodeURIComponent(member.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regenerateToken: true }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { member?: StaffMember };
        if (data.member) {
          setStaffList((prev) => prev.map((m) => (m.id === member.id ? data.member! : m)));
          setStaffQrModalMember(data.member);
        }
      },
    });
  };

  const handleDeleteStaff = (member: StaffMember) => {
    setConfirmDialog({
      open: true,
      title: t.staff.deleteTitle,
      message: t.staff.deleteMsg(member.name),
      confirmLabel: t.common.delete,
      tone: 'danger',
      onConfirm: async () => {
        setConfirmDialog((c) => ({ ...c, open: false }));
        const res = await fetch(`/api/staff/${encodeURIComponent(member.id)}`, {
          method: 'DELETE',
        });
        if (!res.ok) return;
        setStaffList((prev) => prev.filter((m) => m.id !== member.id));
        if (staffQrModalMember?.id === member.id) {
          setStaffQrModalMember(null);
        }
      },
    });
  };

  const isStaffRestricted = Boolean(staffProfile);
  const effectiveStage: StageKey = isStaffRestricted
    ? staffProfile!.allowedStage
    : activeStage;

  const allNavItems: NavItem[] = [
    {
      key: 'overview',
      label: t.nav.overview,
      shortDesc: t.nav.overviewDesc,
      icon: LayoutGrid,
      group: 'overview',
    },
    {
      key: 'models',
      label: t.nav.models,
      shortDesc: t.nav.modelsDesc,
      icon: QrCode,
      group: 'admin',
    },
    {
      key: 'staff',
      label: t.nav.staff,
      shortDesc: t.nav.staffDesc,
      icon: UserCheck,
      group: 'admin',
    },
    {
      key: 'fabric',
      label: t.nav.fabric,
      shortDesc: t.nav.fabricDesc,
      icon: Layers,
      group: 'production',
    },
    {
      key: 'cutting',
      label: t.nav.cutting,
      shortDesc: t.nav.cuttingDesc,
      icon: Scissors,
      group: 'production',
    },
    {
      key: 'sewing',
      label: t.nav.sewing,
      shortDesc: t.nav.sewingDesc,
      icon: Users,
      group: 'production',
    },
    {
      key: 'packing',
      label: t.nav.packing,
      shortDesc: t.nav.packingDesc,
      icon: PackageCheck,
      group: 'production',
    },
    {
      key: 'zavsklad',
      label: t.nav.zavsklad,
      shortDesc: t.nav.zavskladDesc,
      icon: Barcode,
      group: 'warehouse',
    },
    {
      key: 'dispatch',
      label: t.nav.dispatch,
      shortDesc: t.nav.dispatchDesc,
      icon: Truck,
      group: 'warehouse',
    },
  ];

  const visibleNavItems = isStaffRestricted
    ? allNavItems.filter((item) => item.key === staffProfile!.allowedStage)
    : allNavItems;

  const navigateTo = (stage: StageKey) => {
    if (isStaffRestricted && stage !== staffProfile!.allowedStage) {
      return;
    }
    setActiveStage(stage);
    setMobileMenuOpen(false);
  };

  const handleGoToDispatch = (productId?: string) => {
    if (isStaffRestricted && staffProfile!.allowedStage !== 'dispatch') return;
    setPreselectedDispatchProductId(productId ?? null);
    navigateTo('dispatch');
  };

  const handleOpenMobilePreview = (modelId: string, batchId?: string) => {
    setQrModalData({ open: false, model: null, batch: null });
    setQrViewTarget({ modelId, batchId });
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      params.set('model', modelId);
      if (batchId) params.set('batch', batchId);
      window.history.replaceState(null, '', `/?${params.toString()}`);
    }
  };

  const handleExitQrView = () => {
    setQrViewTarget(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
    }
  };

  // Warehouse domain handlers
  const handleCreateModel = (payload: {
    name: string;
    modelCode: string;
    color: string;
    sizeRange: string;
    fabricType: string;
    photoUrl: string;
    sewingNotes: string;
  }): GarmentModel => {
    const newModel: GarmentModel = {
      id: createId('MOD'),
      name: payload.name,
      modelCode: payload.modelCode,
      color: payload.color,
      sizeRange: payload.sizeRange,
      fabricType: payload.fabricType,
      photoUrl: payload.photoUrl,
      sewingNotes: payload.sewingNotes,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      models: [newModel, ...prev.models],
    }));
    return newModel;
  };

  const handleDeleteModel = (id: string) => {
    const target = state.models.find((m) => m.id === id);
    if (!target) return;
    setConfirmDialog({
      open: true,
      title: t.models.deleteTitle,
      message: t.models.deleteMsg(target.name, target.modelCode),
      confirmLabel: t.common.delete,
      tone: 'danger',
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          models: prev.models.filter((m) => m.id !== id),
        }));
        setConfirmDialog((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleAddRoll = (roll: {
    name: string;
    color: string;
    rollsCount: number;
    initialKg: number;
    supplier: string;
  }) => {
    const newRoll: FabricRoll = {
      id: createId('FAB'),
      name: roll.name,
      color: roll.color,
      rollsCount: roll.rollsCount,
      initialKg: roll.initialKg,
      remainingKg: roll.initialKg,
      supplier: roll.supplier,
      receivedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      fabricRolls: [newRoll, ...prev.fabricRolls],
    }));
  };

  const handleDeleteRoll = (id: string) => {
    const target = state.fabricRolls.find((r) => r.id === id);
    if (!target) return;
    setConfirmDialog({
      open: true,
      title: t.fabric.deleteTitle,
      message: t.fabric.deleteMsg(target.name, target.color),
      confirmLabel: t.common.delete,
      tone: 'danger',
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          fabricRolls: prev.fabricRolls.filter((r) => r.id !== id),
        }));
        setConfirmDialog((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleCreateCutting = (payload: {
    modelId?: string;
    modelName: string;
    modelPhoto?: string;
    fabricRollId: string;
    kgUsed: number;
    cutPieces: number;
    note?: string;
  }): { ok: boolean; error?: string; batch?: CuttingBatch } => {
    const roll = state.fabricRolls.find((r) => r.id === payload.fabricRollId);
    if (!roll) {
      return { ok: false, error: t.cutting.errNotFound };
    }
    if (payload.kgUsed > roll.remainingKg + 0.001) {
      return {
        ok: false,
        error: t.cutting.errInsufficient(roll.remainingKg.toFixed(1)),
      };
    }

    const nowIso = new Date().toISOString();
    const cuttingId = createId('CUT');
    const newCutting: CuttingBatch = {
      id: cuttingId,
      modelId: payload.modelId,
      modelName: payload.modelName,
      modelPhoto: payload.modelPhoto,
      fabricRollId: roll.id,
      fabricName: roll.name,
      color: roll.color,
      kgUsed: payload.kgUsed,
      cutPieces: payload.cutPieces,
      status: 'sewing',
      createdAt: nowIso,
      note: payload.note,
    };

    const newSewing = {
      id: createId('SEW'),
      batchId: cuttingId,
      modelName: payload.modelName,
      color: roll.color,
      seamstressName: 'Асел эже',
      machineType: 'Түз тигүү' as MachineType,
      assignedPieces: payload.cutPieces,
      sewnPieces: 0,
      defectPieces: 0,
      status: 'in_progress' as const,
      updatedAt: nowIso,
    };

    setState((prev) => ({
      ...prev,
      fabricRolls: prev.fabricRolls.map((r) =>
        r.id === roll.id
          ? {
              ...r,
              remainingKg: Math.max(0, Number((r.remainingKg - payload.kgUsed).toFixed(2))),
            }
          : r
      ),
      cuttingBatches: [newCutting, ...prev.cuttingBatches],
      sewingBatches: [newSewing, ...prev.sewingBatches],
    }));

    return { ok: true, batch: newCutting };
  };

  const handleOpenBatchQr = (batch: CuttingBatch) => {
    const matchedModel =
      state.models.find((m) => m.id === batch.modelId) ??
      state.models.find((m) =>
        batch.modelName.toLowerCase().includes(m.modelCode.toLowerCase())
      ) ?? {
        id: batch.modelId || batch.id,
        name: batch.modelName,
        modelCode: batch.id,
        color: batch.color,
        sizeRange: batch.note || 'Стандарт',
        fabricType: batch.fabricName,
        photoUrl: batch.modelPhoto || '',
        sewingNotes: '',
        createdAt: batch.createdAt,
      };
    setQrModalData({ open: true, model: matchedModel, batch });
  };

  const handleUpdateSewn = (id: string, sewnPieces: number, defectPieces: number) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      sewingBatches: prev.sewingBatches.map((b) =>
        b.id === id ? { ...b, sewnPieces, defectPieces, updatedAt: nowIso } : b
      ),
    }));
  };

  const handleAddSewingTask = (payload: {
    modelName: string;
    color: string;
    seamstressName: string;
    machineType: MachineType;
    assignedPieces: number;
  }) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      sewingBatches: [
        {
          id: createId('SEW'),
          batchId: createId('MANUAL'),
          modelName: payload.modelName,
          color: payload.color,
          seamstressName: staffProfile?.seamstressName || payload.seamstressName,
          machineType: payload.machineType,
          assignedPieces: payload.assignedPieces,
          sewnPieces: 0,
          defectPieces: 0,
          status: 'in_progress',
          updatedAt: nowIso,
        },
        ...prev.sewingBatches,
      ],
    }));
  };

  const handleSendToPacking = (sewingId: string) => {
    const sewing = state.sewingBatches.find((b) => b.id === sewingId);
    if (!sewing || sewing.sewnPieces <= 0) return;

    const nowIso = new Date().toISOString();
    const newPacking: PackingBatch = {
      id: createId('PCK'),
      batchId: sewing.batchId,
      modelName: sewing.modelName,
      color: sewing.color,
      incomingPieces: sewing.sewnPieces,
      packedPieces: sewing.sewnPieces,
      packedBy: 'Изат',
      status: 'packing',
      updatedAt: nowIso,
    };

    setState((prev) => ({
      ...prev,
      sewingBatches: prev.sewingBatches.map((b) =>
        b.id === sewingId ? { ...b, status: 'sent_to_packing', updatedAt: nowIso } : b
      ),
      cuttingBatches: prev.cuttingBatches.map((c) =>
        c.id === sewing.batchId ? { ...c, status: 'ironing' } : c
      ),
      packingBatches: [newPacking, ...prev.packingBatches],
    }));
  };

  const handleUpdatePackedCount = (id: string, packedPieces: number) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      packingBatches: prev.packingBatches.map((p) =>
        p.id === id ? { ...p, packedPieces, updatedAt: nowIso } : p
      ),
    }));
  };

  const handleHandOverToZavsklad = (id: string) => {
    const packing = state.packingBatches.find((p) => p.id === id);
    if (!packing) return;
    const nowIso = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      packingBatches: prev.packingBatches.map((p) =>
        p.id === id ? { ...p, status: 'awaiting_zavsklad', updatedAt: nowIso } : p
      ),
      cuttingBatches: prev.cuttingBatches.map((c) =>
        c.id === packing.batchId ? { ...c, status: 'awaiting_zavsklad' } : c
      ),
    }));
  };

  const handleAddManualPacking = (payload: {
    modelName: string;
    color: string;
    packedPieces: number;
  }) => {
    const nowIso = new Date().toISOString();
    const newPacking: PackingBatch = {
      id: createId('PCK'),
      batchId: createId('MANUAL'),
      modelName: payload.modelName,
      color: payload.color,
      incomingPieces: payload.packedPieces,
      packedPieces: payload.packedPieces,
      packedBy: staffProfile?.name || 'Изат',
      status: 'packing',
      updatedAt: nowIso,
    };
    setState((prev) => ({
      ...prev,
      packingBatches: [newPacking, ...prev.packingBatches],
    }));
  };

  const upsertProductStock = (
    products: ProductStock[],
    params: {
      modelId?: string;
      photoUrl?: string;
      name: string;
      modelCode: string;
      color: string;
      sizeRange: string;
      barcode: string;
      quantity: number;
    }
  ): ProductStock[] => {
    const nowIso = new Date().toISOString();
    const existing = products.find(
      (p) =>
        p.barcode.toUpperCase() === params.barcode.toUpperCase() ||
        (p.modelCode.toLowerCase() === params.modelCode.toLowerCase() &&
          p.color.toLowerCase() === params.color.toLowerCase())
    );

    if (existing) {
      return products.map((p) =>
        p.id === existing.id
          ? {
              ...p,
              photoUrl: params.photoUrl || p.photoUrl,
              modelId: params.modelId || p.modelId,
              totalReceived: p.totalReceived + params.quantity,
              remaining: p.remaining + params.quantity,
              updatedAt: nowIso,
            }
          : p
      );
    }

    const created: ProductStock = {
      id: createId('PRD'),
      modelId: params.modelId,
      photoUrl: params.photoUrl,
      name: params.name,
      modelCode: params.modelCode,
      color: params.color,
      sizeRange: params.sizeRange,
      barcode: params.barcode,
      totalReceived: params.quantity,
      totalShipped: 0,
      remaining: params.quantity,
      updatedAt: nowIso,
    };
    return [created, ...products];
  };

  const handleAcceptPackingBatch = (params: {
    packingId: string;
    modelId?: string;
    photoUrl?: string;
    name: string;
    modelCode: string;
    color: string;
    sizeRange: string;
    barcode: string;
    quantity: number;
  }) => {
    const packing = state.packingBatches.find((p) => p.id === params.packingId);
    const nowIso = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      packingBatches: prev.packingBatches.map((p) =>
        p.id === params.packingId ? { ...p, status: 'accepted', updatedAt: nowIso } : p
      ),
      cuttingBatches: packing
        ? prev.cuttingBatches.map((c) =>
            c.id === packing.batchId ? { ...c, status: 'stocked' } : c
          )
        : prev.cuttingBatches,
      products: upsertProductStock(prev.products, params),
    }));
  };

  const handleAddDirectProduct = (params: {
    modelId?: string;
    photoUrl?: string;
    name: string;
    modelCode: string;
    color: string;
    sizeRange: string;
    barcode: string;
    quantity: number;
  }) => {
    setState((prev) => ({
      ...prev,
      products: upsertProductStock(prev.products, params),
    }));
  };

  const handleAddStockToExisting = (productId: string, addQty: number) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              totalReceived: p.totalReceived + addQty,
              remaining: p.remaining + addQty,
              updatedAt: nowIso,
            }
          : p
      ),
    }));
  };

  const handleDeleteProduct = (productId: string) => {
    const target = state.products.find((p) => p.id === productId);
    if (!target) return;
    setConfirmDialog({
      open: true,
      title: t.zavsklad.deleteTitle,
      message: t.zavsklad.deleteMsg(target.name, target.modelCode),
      confirmLabel: t.common.delete,
      tone: 'danger',
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          products: prev.products.filter((p) => p.id !== productId),
        }));
        setConfirmDialog((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleDispatch = (payload: {
    productId: string;
    clientName: string;
    containerInfo: string;
    quantity: number;
    note?: string;
  }): { ok: boolean; error?: string } => {
    const product = state.products.find((p) => p.id === payload.productId);
    if (!product) {
      return { ok: false, error: t.dispatch.errNotFound };
    }
    if (payload.quantity > product.remaining) {
      return {
        ok: false,
        error: t.dispatch.errInsufficient(product.remaining, payload.quantity),
      };
    }

    const nowIso = new Date().toISOString();
    const newRemaining = product.remaining - payload.quantity;

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === product.id
          ? {
              ...p,
              totalShipped: p.totalShipped + payload.quantity,
              remaining: p.remaining - payload.quantity,
              updatedAt: nowIso,
            }
          : p
      ),
      dispatches: [
        {
          id: createId('DSP'),
          productId: product.id,
          productName: product.name,
          modelCode: product.modelCode,
          barcode: product.barcode,
          clientName: payload.clientName,
          containerInfo: payload.containerInfo,
          quantity: payload.quantity,
          balanceAfter: newRemaining,
          note: payload.note,
          dispatchedAt: nowIso,
        },
        ...prev.dispatches,
      ],
    }));

    return { ok: true };
  };

  const handleRevertDispatch = (dispatchId: string) => {
    const dispatch = state.dispatches.find((d) => d.id === dispatchId);
    if (!dispatch) return;

    setConfirmDialog({
      open: true,
      title: t.dispatch.revertTitle,
      message: t.dispatch.revertMsg(dispatch.clientName, dispatch.quantity, dispatch.productName),
      confirmLabel: t.dispatch.revertConfirmBtn,
      tone: 'primary',
      onConfirm: () => {
        const nowIso = new Date().toISOString();
        setState((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p.id === dispatch.productId
              ? {
                  ...p,
                  totalShipped: Math.max(0, p.totalShipped - dispatch.quantity),
                  remaining: p.remaining + dispatch.quantity,
                  updatedAt: nowIso,
                }
              : p
          ),
          dispatches: prev.dispatches.filter((d) => d.id !== dispatchId),
        }));
        setConfirmDialog((c) => ({ ...c, open: false }));
      },
    });
  };

  const handleResetDemo = () => {
    if (isStaffRestricted) return;
    setConfirmDialog({
      open: true,
      title: t.nav.resetDemoTitle,
      message: t.nav.resetDemoMsg,
      confirmLabel: t.nav.resetDemoBtn,
      tone: 'primary',
      onConfirm: async () => {
        setConfirmDialog((c) => ({ ...c, open: false }));
        const res = await fetch('/api/reset', { method: 'POST' });
        if (res.ok) {
          const resetData = (await res.json()) as WarehouseState;
          skipNextSaveRef.current = true;
          setState(resetData);
        } else {
          setState(INITIAL_WAREHOUSE_STATE);
        }
      },
    });
  };

  // 1. Garment Model QR Viewer (?model=...)
  if (qrViewTarget) {
    const foundModel =
      state.models.find((m) => m.id === qrViewTarget.modelId) ??
      publicQrPayload?.model ??
      null;
    const allBatches =
      state.cuttingBatches.length > 0 ? state.cuttingBatches : publicQrPayload?.batches ?? [];
    const allProducts =
      state.products.length > 0 ? state.products : publicQrPayload?.products ?? [];

    const foundBatch = qrViewTarget.batchId
      ? allBatches.find((b) => b.id === qrViewTarget.batchId) ?? null
      : null;
    const relatedBatches = foundModel
      ? allBatches.filter((b) => b.modelId === foundModel.id)
      : [];
    const relatedProducts = foundModel
      ? allProducts.filter(
          (p) =>
            p.modelId === foundModel.id ||
            p.modelCode.toLowerCase() === foundModel.modelCode.toLowerCase()
        )
      : [];

    return (
      <QrModelViewer
        model={foundModel}
        batch={foundBatch}
        relatedBatches={relatedBatches}
        relatedProducts={relatedProducts}
        t={t}
        lang={lang}
        onChangeLang={setLang}
        onBackToApp={handleExitQrView}
      />
    );
  }

  // 2. Staff QR connecting / revoked / disabled screen (never shown on normal root visits!)
  if (staffScreenPhase !== 'none') {
    return (
      <StaffStatusScreen
        mode={staffScreenPhase}
        t={t}
        lang={lang}
        variant={variant}
        onChangeLang={setLang}
        onChangeVariant={setVariant}
      />
    );
  }

  const currentNav = visibleNavItems.find((n) => n.key === effectiveStage) ?? visibleNavItems[0];
  const awaitingZavskladBatches = state.packingBatches.filter(
    (b) => b.status === 'awaiting_zavsklad'
  );
  const connectedStaffCount = staffList.filter((m) => m.active && m.connected).length;

  const ControlsBlock = () => (
    <div className="space-y-2">
      {/* 2 Languages Switcher */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/70 p-1 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setLang('ky')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            lang === 'ky'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Languages className="h-3.5 w-3.5" />
          Кыргызча
        </button>
        <button
          type="button"
          onClick={() => setLang('ru')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            lang === 'ru'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Русский
        </button>
      </div>

      {/* 2 UI Variants Switcher */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/70 p-1 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setVariant('classic')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            variant === 'classic'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          {t.nav.variant1}
        </button>
        <button
          type="button"
          onClick={() => setVariant('floor')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
            variant === 'floor'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
          {t.nav.variant2}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen flex transition-colors duration-200 ${
        variant === 'floor'
          ? 'bg-warehouse-dark text-slate-100'
          : 'bg-warehouse-light text-slate-900'
      }`}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200/90 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          {isStaffRestricted ? (
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
              {t.brand}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => navigateTo('overview')}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
            >
              {t.brand}
            </button>
          )}
        </div>

        {/* Connected Staff Profile Card (Employee mode only) */}
        {isStaffRestricted && staffProfile && (
          <div className="mx-3 mt-3 rounded-xl border border-emerald-200/90 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/35 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              {t.nav.connectedLive}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {staffProfile.name}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
              {t.staff.stageLabels[staffProfile.allowedStage]}
            </div>
          </div>
        )}

        <div className="px-3 pt-3">
          <ControlsBlock />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label={t.brand}>
          {isStaffRestricted ? (
            <div className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateTo(item.key)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left bg-slate-900 dark:bg-emerald-600 text-white"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      <div className="text-[11px] text-slate-300 dark:text-emerald-100 truncate">
                        {item.shortDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
              <p className="px-3 pt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {t.staff.onlyOwnSectionHint}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {visibleNavItems
                  .filter((i) => i.group === 'overview' || i.group === 'admin')
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = effectiveStage === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => navigateTo(item.key)}
                        className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{item.label}</div>
                            <div
                              className={`text-[11px] truncate ${
                                isActive
                                  ? 'text-slate-300 dark:text-emerald-100'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {item.shortDesc}
                            </div>
                          </div>
                        </div>
                        {item.key === 'staff' && connectedStaffCount > 0 && (
                          <span
                            className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                              isActive
                                ? 'text-emerald-300 dark:text-white'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {connectedStaffCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {t.nav.groupProduction}
                </div>
                <div className="space-y-1">
                  {visibleNavItems
                    .filter((i) => i.group === 'production')
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = effectiveStage === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => navigateTo(item.key)}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-950 dark:text-blue-200 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-sm truncate">{item.label}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {item.shortDesc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                  {t.nav.groupWarehouse}
                </div>
                <div className="space-y-1">
                  {visibleNavItems
                    .filter((i) => i.group === 'warehouse')
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = effectiveStage === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => navigateTo(item.key)}
                          className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-slate-400'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="text-sm truncate">{item.label}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {item.shortDesc}
                              </div>
                            </div>
                          </div>
                          {item.key === 'zavsklad' && awaitingZavskladBatches.length > 0 && (
                            <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0">
                              +{awaitingZavskladBatches.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          {!isStaffRestricted ? (
            <button
              type="button"
              onClick={handleResetDemo}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.nav.resetDemo}
            </button>
          ) : isPreviewMode ? (
            <button
              type="button"
              onClick={handleExitPreview}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.nav.backToAdminBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStaffDisconnect}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t.nav.logoutBtn}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {t.brand}
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={t.nav.closeMenu}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <ControlsBlock />
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = effectiveStage === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateTo(item.key)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      isActive
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      <div
                        className={`text-xs truncate ${
                          isActive ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.shortDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
            {isStaffRestricted && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                {isPreviewMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleExitPreview();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t.nav.backToAdminBtn}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleStaffDisconnect();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t.nav.logoutBtn}
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar: Strict 3-zone layout */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              aria-label={t.nav.openMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              {isStaffRestricted ? (
                <span className="hidden sm:inline text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {t.brand}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo('overview')}
                  className="hidden sm:inline text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
                >
                  {t.brand}
                </button>
              )}
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isStaffRestricted ? (
              isPreviewMode ? (
                <button
                  type="button"
                  onClick={handleExitPreview}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.nav.backToAdminBtn}
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {staffProfile?.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleStaffDisconnect}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t.nav.logoutBtn}
                  </button>
                </div>
              )
            ) : effectiveStage === 'staff' ? (
              <button
                type="button"
                onClick={() => navigateTo('models')}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <QrCode className="h-4 w-4" />
                {t.nav.models}
              </button>
            ) : effectiveStage === 'models' ? (
              <button
                type="button"
                onClick={() => navigateTo('staff')}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <UserCheck className="h-4 w-4" />
                {t.nav.topStaffBtn}
              </button>
            ) : effectiveStage !== 'dispatch' ? (
              <button
                type="button"
                onClick={() => handleGoToDispatch()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Truck className="h-4 w-4" />
                {t.nav.topDispatchBtn}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo('zavsklad')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                {t.nav.topZavskladBtn}
              </button>
            )}
          </div>
        </header>

        {/* Preview Mode Banner */}
        {isPreviewMode && staffProfile && (
          <div className="border-b border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/90 dark:bg-emerald-950/50 px-4 sm:px-6 lg:px-8 py-2 text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
            <span>{t.nav.previewBanner(staffProfile.name)}</span>
            <button
              type="button"
              onClick={handleExitPreview}
              className="underline font-semibold whitespace-nowrap shrink-0"
            >
              {t.nav.backToAdminBtn}
            </button>
          </div>
        )}

        {/* Mobile Quick Stage Switcher (Hidden in restricted employee mode) */}
        {!isStaffRestricted && (
          <div className="lg:hidden border-b border-slate-200/90 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 py-2 overflow-x-auto flex items-center gap-1.5">
            {visibleNavItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigateTo(item.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  effectiveStage === item.key
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!isStaffRestricted && effectiveStage === 'overview' && (
            <PipelineOverview
              state={state}
              variant={variant}
              t={t}
              onNavigate={navigateTo}
              onQuickDispatch={(id) => handleGoToDispatch(id)}
              onOpenModelQr={(model) => setQrModalData({ open: true, model, batch: null })}
              onPreviewMobile={(modelId) => handleOpenMobilePreview(modelId)}
            />
          )}

          {!isStaffRestricted && effectiveStage === 'models' && (
            <AdminModelsStage
              models={state.models}
              t={t}
              onCreateModel={handleCreateModel}
              onDeleteModel={handleDeleteModel}
              onOpenQr={(model) => setQrModalData({ open: true, model, batch: null })}
              onPreviewMobile={(modelId) => handleOpenMobilePreview(modelId)}
            />
          )}

          {!isStaffRestricted && effectiveStage === 'staff' && (
            <AdminStaffStage
              staffList={staffList}
              loading={staffLoading}
              t={t}
              onRefresh={fetchStaffList}
              onCreateStaff={handleCreateStaff}
              onToggleActive={handleToggleStaffActive}
              onDeleteStaff={handleDeleteStaff}
              onOpenStaffQr={(member) => setStaffQrModalMember(member)}
              onPreviewAsStaff={handlePreviewAsStaff}
            />
          )}

          {effectiveStage === 'fabric' && (
            <FabricStage
              rolls={state.fabricRolls}
              t={t}
              onAddRoll={handleAddRoll}
              onDeleteRoll={handleDeleteRoll}
              onGoToCutting={isStaffRestricted ? undefined : () => navigateTo('cutting')}
            />
          )}

          {effectiveStage === 'cutting' && (
            <CuttingStage
              models={state.models}
              rolls={state.fabricRolls}
              batches={state.cuttingBatches}
              t={t}
              onCreateCutting={handleCreateCutting}
              onOpenBatchQr={handleOpenBatchQr}
              onGoToModels={isStaffRestricted ? undefined : () => navigateTo('models')}
              onGoToSewing={isStaffRestricted ? undefined : () => navigateTo('sewing')}
            />
          )}

          {effectiveStage === 'sewing' && (
            <SewingStage
              batches={state.sewingBatches}
              t={t}
              lockedSeamstress={isStaffRestricted ? staffProfile?.seamstressName : undefined}
              onUpdateSewn={handleUpdateSewn}
              onAddTask={handleAddSewingTask}
              onSendToPacking={handleSendToPacking}
              onGoToPacking={isStaffRestricted ? undefined : () => navigateTo('packing')}
            />
          )}

          {effectiveStage === 'packing' && (
            <PackingStage
              batches={state.packingBatches}
              t={t}
              onUpdatePackedCount={handleUpdatePackedCount}
              onHandOverToZavsklad={handleHandOverToZavsklad}
              onAddManualPacking={handleAddManualPacking}
              onGoToZavsklad={isStaffRestricted ? undefined : () => navigateTo('zavsklad')}
            />
          )}

          {effectiveStage === 'zavsklad' && (
            <ZavskladStage
              models={state.models}
              products={state.products}
              awaitingBatches={awaitingZavskladBatches}
              t={t}
              onAcceptPackingBatch={handleAcceptPackingBatch}
              onAddDirectProduct={handleAddDirectProduct}
              onAddStockToExisting={handleAddStockToExisting}
              onDeleteProduct={handleDeleteProduct}
              onGoToDispatch={isStaffRestricted ? undefined : handleGoToDispatch}
            />
          )}

          {effectiveStage === 'dispatch' && (
            <DispatchStage
              products={state.products}
              dispatches={state.dispatches}
              preselectedProductId={preselectedDispatchProductId}
              t={t}
              onDispatch={handleDispatch}
              onRevertDispatch={handleRevertDispatch}
            />
          )}
        </main>
      </div>

      <QrCodeModal
        open={qrModalData.open}
        model={qrModalData.model}
        batch={qrModalData.batch}
        t={t}
        onClose={() => setQrModalData({ open: false, model: null, batch: null })}
        onPreviewMobile={handleOpenMobilePreview}
      />

      <StaffQrModal
        open={Boolean(staffQrModalMember)}
        member={staffQrModalMember}
        t={t}
        onClose={() => setStaffQrModalMember(null)}
        onRegenerateQr={handleRegenerateStaffQr}
        onPreviewAsStaff={handlePreviewAsStaff}
      />

      <ConfirmModal
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={t.common.cancel}
        closeAriaLabel={t.common.close}
        tone={confirmDialog.tone}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}
