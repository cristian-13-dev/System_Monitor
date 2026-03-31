import fs from 'node:fs/promises';
import si from 'systeminformation';
import { formatToGb } from '../utils/formatToGb.js';

export type MemorySection = {
  total: number;
  available: number;
  used: number;
  free: number;
  cached: number;
  pressurePercentage: number | null;
  availabilityPercentage: number | null;
};

export type SwapSection = {
  total: number;
  available: number;
  used: number;
  usagePercentage: number | null;
};

export type MemoryMetrics = {
  raw: MemorySection;
  swap: SwapSection;
  updatedAt: string;
};

let memoryMetrics: MemoryMetrics = {
  raw: {
    total: 0,
    available: 0,
    used: 0,
    free: 0,
    cached: 0,
    pressurePercentage: null,
    availabilityPercentage: null,
  },
  swap: {
    total: 0,
    available: 0,
    used: 0,
    usagePercentage: null,
  },
  updatedAt: new Date().toISOString(),
};

function clamp(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function buildMemorySection(params: {
  totalBytes: number;
  availableBytes: number;
  freeBytes: number;
  cachedBytes: number;
}): MemorySection {
  const total = clamp(params.totalBytes);
  const available = Math.min(clamp(params.availableBytes), total);
  const used = Math.max(0, total - available);
  const free = Math.min(clamp(params.freeBytes), total);
  const cached = Math.min(clamp(params.cachedBytes), total);

  return {
    total: formatToGb(total),
    available: formatToGb(available),
    used: formatToGb(used),
    free: formatToGb(free),
    cached: formatToGb(cached),
    pressurePercentage: total > 0 ? Math.round((used / total) * 100) : null,
    availabilityPercentage: total > 0 ? Math.round((available / total) * 100) : null,
  };
}

function buildSwapSection(totalBytes: number, freeBytes: number): SwapSection {
  const total = clamp(totalBytes);
  const available = Math.min(clamp(freeBytes), total);
  const used = Math.max(0, total - available);

  return {
    total: formatToGb(total),
    available: formatToGb(available),
    used: formatToGb(used),
    usagePercentage: total > 0 ? Math.round((used / total) * 100) : null,
  };
}

async function readProcMeminfo(): Promise<Record<string, number>> {
  const content = await fs.readFile('/proc/meminfo', 'utf8');
  const result: Record<string, number> = {};

  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Za-z_()]+):\s+(\d+)\s+kB$/);
    if (!match) continue;

    const [, key, value] = match;
    result[key] = Number(value) * 1024;
  }

  return result;
}

async function getLinuxMemoryMetrics(): Promise<MemoryMetrics> {
  const meminfo = await readProcMeminfo();

  const memTotal = clamp(meminfo.MemTotal);
  const memAvailable = clamp(meminfo.MemAvailable);
  const memFree = clamp(meminfo.MemFree);
  const cached = clamp(meminfo.Cached);
  const sReclaimable = clamp(meminfo.SReclaimable);

  const swapTotal = clamp(meminfo.SwapTotal);
  const swapFree = clamp(meminfo.SwapFree);

  const raw = buildMemorySection({
    totalBytes: memTotal,
    availableBytes: memAvailable,
    freeBytes: memFree,
    cachedBytes: cached + sReclaimable,
  });

  const swap = buildSwapSection(swapTotal, swapFree);

  console.log('[memory][linux][/proc/meminfo]', {
    MemTotal: meminfo.MemTotal,
    MemAvailable: meminfo.MemAvailable,
    MemFree: meminfo.MemFree,
    Cached: meminfo.Cached,
    SReclaimable: meminfo.SReclaimable,
    SwapTotal: meminfo.SwapTotal,
    SwapFree: meminfo.SwapFree,
  });

  console.log('[memory][linux][computed]', {
    raw,
    swap,
    interpreted: {
      usedBytes: memTotal - memAvailable,
      availableBytes: memAvailable,
      freeBytes: memFree,
      cachedBytes: cached + sReclaimable,
    },
  });

  return {
    raw,
    swap,
    updatedAt: new Date().toISOString(),
  };
}

async function getFallbackMemoryMetrics(): Promise<MemoryMetrics> {
  const mem = await si.mem();

  const raw = buildMemorySection({
    totalBytes: clamp(mem.total),
    availableBytes: clamp(mem.available),
    freeBytes: clamp(mem.free),
    cachedBytes: clamp(mem.buffcache),
  });

  const swap = buildSwapSection(clamp(mem.swaptotal), clamp(mem.swapfree));

  console.warn(
    `[memory] Non-Linux platform detected (${process.platform}). Using fallback memory metrics.`
  );

  console.log('[memory][fallback][systeminformation]', {
    total: mem.total,
    available: mem.available,
    free: mem.free,
    buffcache: mem.buffcache,
    swaptotal: mem.swaptotal,
    swapfree: mem.swapfree,
    swapused: mem.swapused,
  });

  return {
    raw,
    swap,
    updatedAt: new Date().toISOString(),
  };
}

async function refreshMemoryMetrics(): Promise<void> {
  try {
    memoryMetrics =
      process.platform === 'linux'
        ? await getLinuxMemoryMetrics()
        : await getFallbackMemoryMetrics();

    console.log('[memory][final]', JSON.stringify(memoryMetrics, null, 2));
  } catch (error) {
    console.error('Failed to refresh memory metrics:', error);
  }
}

export async function startMemoryMetricsPolling(): Promise<void> {
  console.log(`[memory] starting polling on platform=${process.platform}`);
  await refreshMemoryMetrics();

  setInterval(() => {
    void refreshMemoryMetrics();
  }, 1000);
}

export function getMemoryMetrics(): MemoryMetrics {
  return memoryMetrics;
}