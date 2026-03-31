import si from 'systeminformation';
import fs from 'node:fs/promises';
import { formatToGb } from '../utils/formatToGb.js';

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

function clampBytes(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function buildMemorySection(totalBytes: number, availableBytes: number): MemorySection {
  const safeTotal = clampBytes(totalBytes);
  const safeAvailable = Math.min(clampBytes(availableBytes), safeTotal);
  const safeUsed = Math.max(0, safeTotal - safeAvailable);

  return {
    total: formatToGb(safeTotal),
    available: formatToGb(safeAvailable),
    used: formatToGb(safeUsed),
    usagePercentage: safeTotal > 0 ? Math.round((safeUsed / safeTotal) * 100) : null,
  };
}

async function getLinuxRawMemorySection(): Promise<MemorySection> {
  const meminfo = await fs.readFile('/proc/meminfo', 'utf8');

  const getKb = (key: string): number => {
    const match = meminfo.match(new RegExp(`^${key}:\\s+(\\d+)\\s+kB$`, 'm'));
    return match ? Number(match[1]) : 0;
  };

  const totalBytes = getKb('MemTotal') * 1024;
  const freeBytes = getKb('MemFree') * 1024;

  return buildMemorySection(totalBytes, freeBytes);
}

async function refreshMemoryMetrics(): Promise<void> {
  try {
    const mem = await si.mem();

    const raw =
      process.platform === 'linux'
        ? await getLinuxRawMemorySection()
        : buildMemorySection(mem.total, mem.available);

    const totalSwapMemory = clampBytes(mem.swaptotal);
    const availableSwapMemory = Math.min(clampBytes(mem.swapfree), totalSwapMemory);
    const usedSwapMemory = Math.min(clampBytes(mem.swapused), totalSwapMemory);

    memoryMetrics = {
      raw,
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