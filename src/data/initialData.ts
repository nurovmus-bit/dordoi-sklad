import type { WarehouseState } from '../types/warehouse.ts';

export function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export function generateBarcode(prefix = 'DRD'): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${num}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} · ${hours}:${mins}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${d.getFullYear()}`;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

export const INITIAL_WAREHOUSE_STATE: WarehouseState = {
  models: [
    {
      id: 'MOD-M204',
      name: 'Оверсайз футболка',
      modelCode: 'M-204',
      color: 'Ак',
      sizeRange: 'S–XL (линейка 4 шт)',
      fabricType: 'Кулирка 100% пахта',
      photoUrl: '/src/assets/images/sample_white_tshirt_1795327487493.jpg',
      sewingNotes: 'Жакасы рибана, этеги жана жеңи распошивалка менен тигилет.',
      createdAt: hoursAgo(48),
    },
    {
      id: 'MOD-K108',
      name: 'Спорт костюм',
      modelCode: 'K-108',
      color: 'Кара',
      sizeRange: '46–52 (линейка 4 шт)',
      fabricType: 'Футер 2-нитка (пенье)',
      photoUrl: '/src/assets/images/sample_black_tracksuit_1795327487573.jpg',
      sewingNotes: 'Шымынын белине резинка 4 см, чөнтөгү түз тигүү менен бекитилет.',
      createdAt: hoursAgo(30),
    },
    {
      id: 'MOD-X305',
      name: 'Худи базовый',
      modelCode: 'X-305',
      color: 'Боз меланж',
      sizeRange: 'M–XXL (линейка 4 шт)',
      fabricType: 'Футер 3-нитка (начес)',
      photoUrl: '/src/assets/images/sample_grey_hoodie_1795327488924.jpg',
      sewingNotes: 'Капюшон эки кабат, манжети кашкорсе, кенгуру чөнтөгү бар.',
      createdAt: hoursAgo(22),
    },
  ],
  fabricRolls: [
    {
      id: 'FAB-101',
      name: 'Футер 2-нитка (пенье)',
      color: 'Кара',
      rollsCount: 6,
      initialKg: 144.0,
      remainingKg: 82.5,
      supplier: 'Мадина — №14 павильон',
      receivedAt: hoursAgo(72),
    },
    {
      id: 'FAB-102',
      name: 'Кулирка 100% пахта',
      color: 'Ак',
      rollsCount: 5,
      initialKg: 110.0,
      remainingKg: 64.0,
      supplier: 'Мадина — Түркия кездеме',
      receivedAt: hoursAgo(48),
    },
    {
      id: 'FAB-103',
      name: 'Футер 3-нитка (начес)',
      color: 'Боз меланж',
      rollsCount: 4,
      initialKg: 102.0,
      remainingKg: 48.0,
      supplier: 'Мадина — Кытай оптом',
      receivedAt: hoursAgo(28),
    },
    {
      id: 'FAB-104',
      name: 'Кашкорсе (манжет)',
      color: 'Кара',
      rollsCount: 2,
      initialKg: 36.0,
      remainingKg: 29.0,
      supplier: 'Мадина — №14 павильон',
      receivedAt: hoursAgo(20),
    },
  ],
  cuttingBatches: [
    {
      id: 'CUT-201',
      modelId: 'MOD-M204',
      modelName: 'Оверсайз футболка M-204',
      modelPhoto: '/src/assets/images/sample_white_tshirt_1795327487493.jpg',
      fabricRollId: 'FAB-102',
      fabricName: 'Кулирка 100% пахта',
      color: 'Ак',
      kgUsed: 46.0,
      cutPieces: 210,
      status: 'stocked',
      createdAt: hoursAgo(40),
      note: 'S–XL размерлер',
    },
    {
      id: 'CUT-202',
      modelId: 'MOD-K108',
      modelName: 'Спорт костюм K-108',
      modelPhoto: '/src/assets/images/sample_black_tracksuit_1795327487573.jpg',
      fabricRollId: 'FAB-101',
      fabricName: 'Футер 2-нитка (пенье)',
      color: 'Кара',
      kgUsed: 61.5,
      cutPieces: 120,
      status: 'sewing',
      createdAt: hoursAgo(14),
      note: '46–52 размер',
    },
    {
      id: 'CUT-203',
      modelId: 'MOD-X305',
      modelName: 'Худи базовый X-305',
      modelPhoto: '/src/assets/images/sample_grey_hoodie_1795327488924.jpg',
      fabricRollId: 'FAB-103',
      fabricName: 'Футер 3-нитка (начес)',
      color: 'Боз меланж',
      kgUsed: 54.0,
      cutPieces: 95,
      status: 'ironing',
      createdAt: hoursAgo(10),
      note: 'M–XXL',
    },
  ],
  sewingBatches: [
    {
      id: 'SEW-301',
      batchId: 'CUT-202',
      modelName: 'Спорт костюм K-108',
      color: 'Кара',
      seamstressName: 'Асел эже',
      machineType: 'Түз тигүү',
      assignedPieces: 60,
      sewnPieces: 48,
      defectPieces: 0,
      status: 'in_progress',
      updatedAt: hoursAgo(4),
    },
    {
      id: 'SEW-302',
      batchId: 'CUT-202',
      modelName: 'Спорт костюм K-108',
      color: 'Кара',
      seamstressName: 'Гүлзат',
      machineType: 'Распошивалка',
      assignedPieces: 60,
      sewnPieces: 52,
      defectPieces: 1,
      status: 'in_progress',
      updatedAt: hoursAgo(3),
    },
    {
      id: 'SEW-303',
      batchId: 'CUT-203',
      modelName: 'Худи базовый X-305',
      color: 'Боз меланж',
      seamstressName: 'Нургүл',
      machineType: 'Оверлок',
      assignedPieces: 95,
      sewnPieces: 95,
      defectPieces: 0,
      status: 'sent_to_packing',
      updatedAt: hoursAgo(6),
    },
  ],
  packingBatches: [
    {
      id: 'PCK-401',
      batchId: 'CUT-203',
      modelName: 'Худи базовый X-305',
      color: 'Боз меланж',
      incomingPieces: 95,
      packedPieces: 95,
      packedBy: 'Изат',
      status: 'awaiting_zavsklad',
      updatedAt: hoursAgo(2),
    },
  ],
  products: [
    {
      id: 'PRD-501',
      modelId: 'MOD-M204',
      photoUrl: '/src/assets/images/sample_white_tshirt_1795327487493.jpg',
      name: 'Оверсайз футболка',
      modelCode: 'M-204',
      color: 'Ак',
      sizeRange: 'S–XL (линейка 4 шт)',
      barcode: 'DRD-204118',
      totalReceived: 210,
      totalShipped: 85,
      remaining: 125,
      updatedAt: hoursAgo(5),
    },
    {
      id: 'PRD-502',
      modelId: 'MOD-K108',
      photoUrl: '/src/assets/images/sample_black_tracksuit_1795327487573.jpg',
      name: 'Спорт костюм',
      modelCode: 'K-108',
      color: 'Кара',
      sizeRange: '46–52 (линейка 4 шт)',
      barcode: 'DRD-108409',
      totalReceived: 180,
      totalShipped: 140,
      remaining: 40,
      updatedAt: hoursAgo(12),
    },
    {
      id: 'PRD-503',
      modelId: 'MOD-X305',
      photoUrl: '/src/assets/images/sample_grey_hoodie_1795327488924.jpg',
      name: 'Худи базовый',
      modelCode: 'X-305',
      color: 'Боз меланж',
      sizeRange: 'M–XXL (линейка 4 шт)',
      barcode: 'DRD-305774',
      totalReceived: 150,
      totalShipped: 45,
      remaining: 105,
      updatedAt: hoursAgo(18),
    },
  ],
  dispatches: [
    {
      id: 'DSP-601',
      productId: 'PRD-501',
      productName: 'Оверсайз футболка',
      modelCode: 'M-204',
      barcode: 'DRD-204118',
      clientName: 'Айгүл эже',
      containerInfo: 'Дордой · 7-проход, 24-контейнер',
      quantity: 50,
      balanceAfter: 160,
      note: 'Накладка №12, 1 кап',
      dispatchedAt: hoursAgo(9),
    },
    {
      id: 'DSP-602',
      productId: 'PRD-501',
      productName: 'Оверсайз футболка',
      modelCode: 'M-204',
      barcode: 'DRD-204118',
      clientName: 'Талант байке',
      containerInfo: 'Дордой · Алканов 3-катар, 8-конт',
      quantity: 35,
      balanceAfter: 125,
      note: 'Толук линейка',
      dispatchedAt: hoursAgo(4),
    },
    {
      id: 'DSP-603',
      productId: 'PRD-502',
      productName: 'Спорт костюм',
      modelCode: 'K-108',
      barcode: 'DRD-108409',
      clientName: 'Рысбек (Ош карго)',
      containerInfo: 'Дордой · Оберон 11-конт',
      quantity: 140,
      balanceAfter: 40,
      note: '2 баштык жөнөтүлдү',
      dispatchedAt: hoursAgo(11),
    },
  ],
};
