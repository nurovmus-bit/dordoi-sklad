import React, { useEffect, useRef, useState } from 'react';
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
} from 'lucide-react';
import {
  CuttingBatch,
  FabricRoll,
  GarmentModel,
  MachineType,
  PackingBatch,
  ProductStock,
  StageKey,
  UiVariant,
  WarehouseState,
} from './types/warehouse';
import { createId, INITIAL_WAREHOUSE_STATE } from './data/initialData';
import { Lang, TRANSLATIONS } from './i18n/translations';
import { PipelineOverview } from './components/PipelineOverview';
import { AdminModelsStage } from './components/AdminModelsStage';
import { FabricStage } from './components/FabricStage';
import { CuttingStage } from './components/CuttingStage';
import { SewingStage } from './components/SewingStage';
import { PackingStage } from './components/PackingStage';
import { ZavskladStage } from './components/ZavskladStage';
import { DispatchStage } from './components/DispatchStage';
import { QrCodeModal } from './components/QrCodeModal';
import { QrModelViewer } from './components/QrModelViewer';
import { ConfirmModal } from './components/ConfirmModal';

const STORAGE_KEY = 'dordoi_sklad_state_v2';
const VARIANT_KEY = 'dordoi_sklad_variant_v1';
const LANG_KEY = 'dordoi_sklad_lang_v1';

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

function readQrParams(): { modelId: string | null; batchId: string | null } {
  if (typeof window === 'undefined') return { modelId: null, batchId: null };
  const params = new URLSearchParams(window.location.search);
  return {
    modelId: params.get('model'),
    batchId: params.get('batch'),
  };
}

interface NavItem {
  key: StageKey;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'overview' | 'admin' | 'production' | 'warehouse';
}

export default function App() {
  const [state, setState] = useState<WarehouseState>(loadFallbackState);
  const [serverLoaded, setServerLoaded] = useState(false);
  const [variant, setVariant] = useState<UiVariant>(loadInitialVariant);
  const [lang, setLang] = useState<Lang>(loadInitialLang);
  const [activeStage, setActiveStage] = useState<StageKey>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preselectedDispatchProductId, setPreselectedDispatchProductId] = useState<
    string | null
  >(null);

  const t = TRANSLATIONS[lang];

  const initialQr = readQrParams();
  const [qrViewTarget, setQrViewTarget] = useState<{
    modelId: string;
    batchId?: string | null;
  } | null>(
    initialQr.modelId
      ? { modelId: initialQr.modelId, batchId: initialQr.batchId }
      : null
  );

  const [qrModalData, setQrModalData] = useState<{
    open: boolean;
    model: GarmentModel | null;
    batch?: CuttingBatch | null;
  }>({ open: false, model: null, batch: null });

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

  useEffect(() => {
    let active = true;
    fetch('/api/state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WarehouseState | null) => {
        if (!active || !data || !Array.isArray(data.models)) return;
        skipNextSaveRef.current = true;
        setState(data);
        setServerLoaded(true);
      })
      .catch(() => {
        if (active) setServerLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore
    }
    if (!serverLoaded) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => {
      // Offline fallback
    });
  }, [state, serverLoaded]);

  const navItems: NavItem[] = [
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

  const navigateTo = (stage: StageKey) => {
    setActiveStage(stage);
    setMobileMenuOpen(false);
  };

  const handleGoToDispatch = (productId?: string) => {
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
      seamstressName: 'Асель эже',
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
          seamstressName: payload.seamstressName,
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
      packedBy: 'Изат',
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
    setConfirmDialog({
      open: true,
      title: t.nav.resetDemoTitle,
      message: t.nav.resetDemoMsg,
      confirmLabel: t.nav.resetDemoBtn,
      tone: 'primary',
      onConfirm: () => {
        setState(INITIAL_WAREHOUSE_STATE);
        setConfirmDialog((c) => ({ ...c, open: false }));
      },
    });
  };

  if (qrViewTarget) {
    const foundModel = state.models.find((m) => m.id === qrViewTarget.modelId) ?? null;
    const foundBatch = qrViewTarget.batchId
      ? state.cuttingBatches.find((b) => b.id === qrViewTarget.batchId) ?? null
      : null;
    const relatedBatches = foundModel
      ? state.cuttingBatches.filter((b) => b.modelId === foundModel.id)
      : [];
    const relatedProducts = foundModel
      ? state.products.filter(
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

  const currentNav = navItems.find((n) => n.key === activeStage) ?? navItems[0];
  const awaitingZavskladBatches = state.packingBatches.filter(
    (b) => b.status === 'awaiting_zavsklad'
  );

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
          <button
            type="button"
            onClick={() => navigateTo('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            {t.brand}
          </button>
        </div>

        <div className="px-3 pt-3">
          <ControlsBlock />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label={t.brand}>
          <div className="space-y-1">
            {navItems
              .filter((i) => i.group === 'overview' || i.group === 'admin')
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeStage === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateTo(item.key)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
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
                  </button>
                );
              })}
          </div>

          <div>
            <div className="px-3 mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
              {t.nav.groupProduction}
            </div>
            <div className="space-y-1">
              {navItems
                .filter((i) => i.group === 'production')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeStage === item.key;
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
              {navItems
                .filter((i) => i.group === 'warehouse')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeStage === item.key;
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
                            isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
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
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <button
            type="button"
            onClick={handleResetDemo}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.nav.resetDemo}
          </button>
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
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeStage === item.key;
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
              <button
                type="button"
                onClick={() => navigateTo('overview')}
                className="hidden sm:inline text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                {t.brand}
              </button>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeStage !== 'models' && activeStage !== 'dispatch' ? (
              <button
                type="button"
                onClick={() => handleGoToDispatch()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Truck className="h-4 w-4" />
                {t.nav.topDispatchBtn}
              </button>
            ) : activeStage === 'models' ? (
              <button
                type="button"
                onClick={() => navigateTo('cutting')}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Scissors className="h-4 w-4" />
                {t.nav.topCuttingBtn}
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

        {/* Mobile Quick Stage Switcher */}
        <div className="lg:hidden border-b border-slate-200/90 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 py-2 overflow-x-auto flex items-center gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => navigateTo(item.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeStage === item.key
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeStage === 'overview' && (
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

          {activeStage === 'models' && (
            <AdminModelsStage
              models={state.models}
              t={t}
              onCreateModel={handleCreateModel}
              onDeleteModel={handleDeleteModel}
              onOpenQr={(model) => setQrModalData({ open: true, model, batch: null })}
              onPreviewMobile={(modelId) => handleOpenMobilePreview(modelId)}
            />
          )}

          {activeStage === 'fabric' && (
            <FabricStage
              rolls={state.fabricRolls}
              t={t}
              onAddRoll={handleAddRoll}
              onDeleteRoll={handleDeleteRoll}
              onGoToCutting={() => navigateTo('cutting')}
            />
          )}

          {activeStage === 'cutting' && (
            <CuttingStage
              models={state.models}
              rolls={state.fabricRolls}
              batches={state.cuttingBatches}
              t={t}
              onCreateCutting={handleCreateCutting}
              onOpenBatchQr={handleOpenBatchQr}
              onGoToModels={() => navigateTo('models')}
              onGoToSewing={() => navigateTo('sewing')}
            />
          )}

          {activeStage === 'sewing' && (
            <SewingStage
              batches={state.sewingBatches}
              t={t}
              onUpdateSewn={handleUpdateSewn}
              onAddTask={handleAddSewingTask}
              onSendToPacking={handleSendToPacking}
              onGoToPacking={() => navigateTo('packing')}
            />
          )}

          {activeStage === 'packing' && (
            <PackingStage
              batches={state.packingBatches}
              t={t}
              onUpdatePackedCount={handleUpdatePackedCount}
              onHandOverToZavsklad={handleHandOverToZavsklad}
              onAddManualPacking={handleAddManualPacking}
              onGoToZavsklad={() => navigateTo('zavsklad')}
            />
          )}

          {activeStage === 'zavsklad' && (
            <ZavskladStage
              models={state.models}
              products={state.products}
              awaitingBatches={awaitingZavskladBatches}
              t={t}
              onAcceptPackingBatch={handleAcceptPackingBatch}
              onAddDirectProduct={handleAddDirectProduct}
              onAddStockToExisting={handleAddStockToExisting}
              onDeleteProduct={handleDeleteProduct}
              onGoToDispatch={handleGoToDispatch}
            />
          )}

          {activeStage === 'dispatch' && (
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
