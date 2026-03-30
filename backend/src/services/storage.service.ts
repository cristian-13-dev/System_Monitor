import si from 'systeminformation'

export type StorageMetrics = {
  totalStorageSize: number;
  usedStorageSize: number;
  storageType: string;
  storageModel: string;
}

let storageMetrics: StorageMetrics = {
  totalStorageSize: 0,
  usedStorageSize: 0,
  storageType: '',
  storageModel: '',
}

async function refreshStorageMetrics() {
  try {
    const [blockDevices, fsSizes] = await Promise.all([
      si.blockDevices(),
      si.fsSize(),
    ]);

    const { physical: storageType = '', model: storageModel = '' } = blockDevices[0] ?? {};
    const { size: totalStorageSize = 0, used: usedStorageSize = 0 } = fsSizes[0] ?? {};

    storageMetrics = {
      storageModel,
      storageType,
      totalStorageSize: Number((totalStorageSize / 1024 / 1024 / 1000).toFixed(2)),
      usedStorageSize: Number((usedStorageSize / 1024 / 1024 / 1000).toFixed(2)),
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