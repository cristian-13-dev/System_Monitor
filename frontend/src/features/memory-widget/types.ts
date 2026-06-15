export interface MemoryRaw {
  total: number;
  available: number;
  used: number;
  free: number;
  cached: number;
  pressurePercentage: number;
  availabilityPercentage: number;
}

export interface MemorySwap {
  total: number;
  available: number;
  used: number;
  usagePercentage: number;
}

export interface MemorySlot {
  size: number;
  bank: string;
  type: string;
  clockSpeedMHz: number;
  formFactor: string;
  manufacturer: string;
  partNum: string;
  serialNum: string;
  ecc: boolean;
}

export interface MemorySummary {
  type: string;
  frequencyMHz: number;
}

export interface MemoryData {
  raw: MemoryRaw;
  swap: MemorySwap;
  layout: MemorySlot[];
  summary: MemorySummary;
  updatedAt: string;
}