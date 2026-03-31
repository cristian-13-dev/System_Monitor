import si from 'systeminformation';
import {formatToGb} from '../utils/formatToGb.js';

export type MemorySection = {
  total: number;
  available: number;
  used: number;
  usagePercentage: number | null;
};

export type MemoryMetrics = {
  raw: MemorySection;
  swap: MemorySection;
  updatedAt: string;
};

let memoryMetrics: MemoryMetrics = {
  raw: {
    total: 0,
    available: 0,
    used: 0,
    usagePercentage: null,
  },
  swap: {
    total: 0,
    available: 0,
    used: 0,
    usagePercentage: null,
  },
  updatedAt: new Date().toISOString(),
};

async function refreshMemoryMetrics(): Promise<void> {
  try {
    const {
      total: totalMemory,
      available: availableMemory,
      used: usedMemory,
      swaptotal: totalSwapMemory,
      swapfree: availableSwapMemory,
      swapused: usedSwapMemory,
    } = await si.mem();

    memoryMetrics = {
      raw: {
        total: formatToGb(totalMemory),
        available: formatToGb(availableMemory),
        used: formatToGb(usedMemory),
        usagePercentage:
          totalMemory > 0
            ? Math.round((usedMemory / totalMemory) * 100)
            : null,
      },
      swap: {
        total: formatToGb(totalSwapMemory),
        available: formatToGb(availableSwapMemory),
        used: formatToGb(usedSwapMemory),
        usagePercentage:
          totalSwapMemory > 0
            ? Math.round((usedSwapMemory / totalSwapMemory) * 100)
            : null,
      },
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to refresh memory metrics:', error);
  }
}

export async function startMemoryMetricsPolling(): Promise<void> {
  await refreshMemoryMetrics();

  setInterval(() => {
    void refreshMemoryMetrics();
  }, 1000);
}

export function getMemoryMetrics(): MemoryMetrics {
  return memoryMetrics;
}