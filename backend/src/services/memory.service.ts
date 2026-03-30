import si from 'systeminformation';
import { formatToGb } from '../utils/formatToGb.js'

export type MemoryMetrics = {
  totalMemorySize: number;
  availableMemorySize: number;
  usedMemorySize: number;
  usagePercentage: number | null;
  updatedAt: string
}

let memoryMetrics: MemoryMetrics = {
  totalMemorySize: 0,
  availableMemorySize: 0,
  usedMemorySize: 0,
  usagePercentage: null,
  updatedAt: new Date().toISOString(),
}

async function refreshMemoryMetrics(): Promise<void> {
  try {
    const {total: totalMemory, free: freeMemory, used: usedMemory} = await si.mem();

    memoryMetrics = {
      totalMemorySize: formatToGb(totalMemory),
      availableMemorySize: formatToGb(freeMemory),
      usedMemorySize: formatToGb(usedMemory),
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