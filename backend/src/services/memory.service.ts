import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import si from 'systeminformation';
import { formatToGb } from '../utils/formatToGb.js';

const execFileAsync = promisify(execFile);

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

export type MemoryLayoutModule = {
  size: number;
  bank: string | null;
  type: string | null;
  clockSpeedMHz: number | null;
  formFactor: string | null;
  manufacturer: string | null;
  partNum: string | null;
  serialNum: string | null;
  ecc: boolean | null;
};

export type MemorySummary = {
  type: string | null;
  frequencyMHz: number | null;
};

export type MemoryMetrics = {
  raw: MemorySection;
  swap: SwapSection;
  layout: MemoryLayoutModule[];
  summary: MemorySummary;
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
  layout: [],
  summary: {
    type: null,
    frequencyMHz: null,
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

function buildMemorySummary(layout: MemoryLayoutModule[]): MemorySummary {
  const first = layout.find((module) => module.type || module.clockSpeedMHz);

  return {
    type: first?.type ?? null,
    frequencyMHz: first?.clockSpeedMHz ?? null,
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

async function getLinuxRamMeta(): Promise<{ type: string | null; clockSpeedMHz: number | null }> {
  try {
    const { stdout } = await execFileAsync('dmidecode', ['-t', 'memory']);
    const block = stdout.split(/\n\s*\n/).find((b) => /Memory Device/.test(b) && !/No Module Installed/i.test(b));
    if (!block) return { type: null, clockSpeedMHz: null };

    const type = block.match(/^\s*Type:\s*(.+)$/mi)?.[1]?.trim() || null;
    const speedText =
      block.match(/^\s*Configured Memory Speed:\s*(.+)$/mi)?.[1] ||
      block.match(/^\s*Speed:\s*(.+)$/mi)?.[1] ||
      null;

    const clockSpeedMHz = speedText ? Number(speedText.match(/\d+/)?.[0] ?? 0) || null : null;
    const inferredType =
      type && type !== 'Unknown'
        ? type
        : clockSpeedMHz
          ? clockSpeedMHz >= 4800 ? 'DDR5'
            : clockSpeedMHz >= 1600 ? 'DDR4'
              : clockSpeedMHz >= 800 ? 'DDR3'
                : null
          : null;

    return { type: inferredType, clockSpeedMHz };
  } catch {
    return { type: null, clockSpeedMHz: null };
  }
}

async function getMemoryLayout(): Promise<MemoryLayoutModule[]> {
  try {
    const layout = await si.memLayout();

    const mapped = layout.map((module) => ({
      size: formatToGb(clamp(module.size)),
      bank: module.bank || null,
      type: module.type || null,
      clockSpeedMHz:
        typeof module.clockSpeed === 'number' && module.clockSpeed > 0
          ? module.clockSpeed
          : null,
      formFactor: module.formFactor || null,
      manufacturer: module.manufacturer || null,
      partNum: module.partNum || null,
      serialNum: module.serialNum || null,
      ecc: typeof module.ecc === 'boolean' ? module.ecc : null,
    }));

    if (process.platform === 'linux' && mapped[0] && (!mapped[0].type || !mapped[0].clockSpeedMHz)) {
      const meta = await getLinuxRamMeta();
      mapped[0].clockSpeedMHz ??= meta.clockSpeedMHz;
      mapped[0].type ??= meta.type;
    }

    return mapped;
  } catch (error) {
    console.error('Failed to read memory layout:', error);
    return [];
  }
}

async function getLinuxMemoryMetrics(): Promise<MemoryMetrics> {
  const [meminfo, layout] = await Promise.all([
    readProcMeminfo(),
    getMemoryLayout(),
  ]);

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
  const summary = buildMemorySummary(layout);

  return {
    raw,
    swap,
    layout,
    summary,
    updatedAt: new Date().toISOString(),
  };
}

async function getFallbackMemoryMetrics(): Promise<MemoryMetrics> {
  const [mem, layout] = await Promise.all([si.mem(), getMemoryLayout()]);

  const raw = buildMemorySection({
    totalBytes: clamp(mem.total),
    availableBytes: clamp(mem.available),
    freeBytes: clamp(mem.free),
    cachedBytes: clamp(mem.buffcache),
  });

  const swap = buildSwapSection(clamp(mem.swaptotal), clamp(mem.swapfree));
  const summary = buildMemorySummary(layout);

  return {
    raw,
    swap,
    layout,
    summary,
    updatedAt: new Date().toISOString(),
  };
}

async function refreshMemoryMetrics(): Promise<void> {
  try {
    memoryMetrics =
      process.platform === 'linux'
        ? await getLinuxMemoryMetrics()
        : await getFallbackMemoryMetrics();
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