export type StageKey =
  | 'overview'
  | 'models'
  | 'fabric'
  | 'cutting'
  | 'sewing'
  | 'packing'
  | 'zavsklad'
  | 'dispatch';

export type UiVariant = 'classic' | 'floor';

export type MachineType = 'Түз тигүү' | 'Распошивалка' | 'Оверлок';

export interface GarmentModel {
  id: string;
  name: string;
  modelCode: string;
  color: string;
  sizeRange: string;
  fabricType: string;
  photoUrl: string;
  sewingNotes: string;
  createdAt: string;
}

export interface FabricRoll {
  id: string;
  name: string;
  color: string;
  rollsCount: number;
  initialKg: number;
  remainingKg: number;
  supplier: string;
  receivedAt: string;
}

export interface CuttingBatch {
  id: string;
  modelId?: string;
  modelName: string;
  modelPhoto?: string;
  fabricRollId: string;
  fabricName: string;
  color: string;
  kgUsed: number;
  cutPieces: number;
  status: 'cutting' | 'sewing' | 'ironing' | 'awaiting_zavsklad' | 'stocked';
  createdAt: string;
  note?: string;
}

export interface SewingBatch {
  id: string;
  batchId: string;
  modelName: string;
  color: string;
  seamstressName: string;
  machineType: MachineType;
  assignedPieces: number;
  sewnPieces: number;
  defectPieces: number;
  status: 'in_progress' | 'sent_to_packing';
  updatedAt: string;
}

export interface PackingBatch {
  id: string;
  batchId: string;
  modelName: string;
  color: string;
  incomingPieces: number;
  packedPieces: number;
  packedBy: string;
  status: 'packing' | 'awaiting_zavsklad' | 'accepted';
  updatedAt: string;
}

export interface ProductStock {
  id: string;
  modelId?: string;
  photoUrl?: string;
  name: string;
  modelCode: string;
  color: string;
  sizeRange: string;
  barcode: string;
  totalReceived: number;
  totalShipped: number;
  remaining: number;
  updatedAt: string;
}

export interface ClientDispatch {
  id: string;
  productId: string;
  productName: string;
  modelCode: string;
  barcode: string;
  clientName: string;
  containerInfo: string;
  quantity: number;
  balanceAfter: number;
  note?: string;
  dispatchedAt: string;
}

export interface WarehouseState {
  models: GarmentModel[];
  fabricRolls: FabricRoll[];
  cuttingBatches: CuttingBatch[];
  sewingBatches: SewingBatch[];
  packingBatches: PackingBatch[];
  products: ProductStock[];
  dispatches: ClientDispatch[];
}

export const SEAMSTRESSES = ['Асел эже', 'Гүлзат', 'Нургүл', 'Мээрим'] as const;

export const MACHINE_TYPES: MachineType[] = ['Түз тигүү', 'Распошивалка', 'Оверлок'];
