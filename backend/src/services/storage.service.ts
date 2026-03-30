import si from 'systeminformation'
import { formatToGb } from "../utils/formatToGb.js";

export type StorageMetrics = {
  totalStorageSize: number;
  availableStorageSize: number;
  usedStorageSize: number;
  storageType: string | null;
  storageModel: string | null;
  updatedAt: string | null;
}

let storageMetrics: StorageMetrics = {
  totalStorageSize: 0,
  availableStorageSize: 0,
  usedStorageSize: 0,
  storageType: null,
  storageModel: null,
  updatedAt: null,
}

async function refreshStorageMetrics() {
  try {
    const [blockDevices, fsSizes] = await Promise.all([
      si.blockDevices(),
      si.fsSize(),
    ]);

    const { physical: storageType, model: storageModel } = blockDevices[0] ?? {};
    const { size: totalStorageSize = 0, available: availableStorageSize, used: usedStorageSize = 0 } = fsSizes[0] ?? {};

    storageMetrics = {
      storageModel,
      storageType,
      totalStorageSize: formatToGb(totalStorageSize),
      usedStorageSize: formatToGb(usedStorageSize),
      availableStorageSize: formatToGb(availableStorageSize),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to refresh storage metrics', error);
  }
}

export async function startStorageMetricsPolling() {
  await refreshStorageMetrics();

  setInterval(() => {
    void refreshStorageMetrics();
  }, 60_000)
}

export function getStorageMetrics(): StorageMetrics {
  return storageMetrics;
}