import si from 'systeminformation';

export type MemoryMetrics = {
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  usagePercentage: number | null;
  updatedAt: string
}

let memoryMetrics: MemoryMetrics = {
  totalMemory: 0,
  freeMemory: 0,
  usedMemory: 0,
  usagePercentage: null,
  updatedAt: new Date().toISOString(),
}

async function refreshMemoryMetrics(): Promise<void> {
  try {
    const {total: totalMemory, free: freeMemory, used: usedMemory} = await si.mem();

    memoryMetrics = {
      totalMemory: Number((totalMemory / 1024 / 1024).toFixed(2)),
      freeMemory: Number((freeMemory / 1024 / 1024).toFixed(2)),
      usedMemory: Number((usedMemory / 1024 / 1024).toFixed(2)),
      usagePercentage: Math.round((usedMemory / totalMemory) * 100),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to refresh CPU metrics:', error);
  }
}

export async function startMemoryMetricsPolling(): Promise<void> {
  await refreshMemoryMetrics()

  setInterval(() => {
    void refreshMemoryMetrics();
  }, 1000)
}

export function getMemoryMetrics(): MemoryMetrics {
  return memoryMetrics;
}