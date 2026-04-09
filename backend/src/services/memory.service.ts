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

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.toLowerCase() === 'unknown') return null;
  return normalized;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
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

function normalizeLayoutModule(module: any): MemoryLayoutModule {
  return {
    size: formatToGb(clamp(module?.size)),
    bank: asNullableString(module?.bank),
    type: asNullableString(module?.type),
    clockSpeedMHz: asNullableNumber(module?.clockSpeed),
    formFactor: asNullableString(module?.formFactor),
    manufacturer: asNullableString(module?.manufacturer),
    partNum: asNullableString(module?.partNum),
    serialNum: asNullableString(module?.serialNum),
    ecc: typeof module?.ecc === 'boolean' ? module.ecc : null,
  };
}

async function getMemoryLayoutFromSystemInformation(): Promise<MemoryLayoutModule[]> {
  try {
    const layout = await si.memLayout();
    return Array.isArray(layout) ? layout.map(normalizeLayoutModule) : [];
  } catch (error) {
    console.error('Failed to read memory layout via systeminformation:', error);
    return [];
  }
}

function parseDmidecodeMemory(stdout: string): MemoryLayoutModule[] {
  const devices = stdout
    .split(/\n\s*\n/g)
    .filter((block) => block.includes('Memory Device'));

  const parsed: MemoryLayoutModule[] = [];

  for (const block of devices) {
    const getField = (label: string): string | null => {
      const regex = new RegExp(`^\\s*${label}:\\s*(.+)$`, 'mi');
      const match = block.match(regex);
      if (!match) return null;

      const value = match[1].trim();
      if (
        !value ||
        value === 'Unknown' ||
        value === 'Not Provided' ||
        value === 'Not Installed' ||
        value === 'None'
      ) {
        return null;
      }

      return value;
    };

    const sizeText = getField('Size');
    if (!sizeText || /No Module Installed/i.test(sizeText)) continue;

    let sizeBytes = 0;
    const sizeMatch = sizeText.match(/^(\d+)\s*(MB|GB|TB)$/i);
    if (sizeMatch) {
      const value = Number(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();

      if (unit === 'MB') sizeBytes = value * 1024 ** 2;
      else if (unit === 'GB') sizeBytes = value * 1024 ** 3;
      else if (unit === 'TB') sizeBytes = value * 1024 ** 4;
    }

    const speedText =
      getField('Configured Memory Speed') ||
      getField('Speed') ||
      getField('Configured Clock Speed');

    let clockSpeedMHz: number | null = null;
    if (speedText) {
      const speedMatch = speedText.match(/(\d+)\s*MT\/s|(\d+)\s*MHz/i);
      const value = speedMatch?.[1] || speedMatch?.[2];
      clockSpeedMHz = value ? Number(value) : null;
    }

    const module: MemoryLayoutModule = {
      size: formatToGb(clamp(sizeBytes)),
      bank: getField('Bank Locator') || getField('Locator'),
      type: getField('Type'),
      clockSpeedMHz,
      formFactor: getField('Form Factor'),
      manufacturer: getField('Manufacturer'),
      partNum: getField('Part Number'),
      serialNum: getField('Serial Number'),
      ecc: (() => {
        const totalWidth = getField('Total Width');
        const dataWidth = getField('Data Width');
        if (!totalWidth || !dataWidth) return null;

        const totalBits = Number(totalWidth.match(/\d+/)?.[0]);
        const dataBits = Number(dataWidth.match(/\d+/)?.[0]);

        if (!Number.isFinite(totalBits) || !Number.isFinite(dataBits)) return null;
        return totalBits > dataBits;
      })(),
    };

    parsed.push(module);
  }

  return parsed;
}

async function getMemoryLayoutFromDmidecode(): Promise<MemoryLayoutModule[]> {
  if (process.platform !== 'linux') return [];

  try {
    const { stdout } = await execFileAsync('dmidecode', ['-t', 'memory']);
    return parseDmidecodeMemory(stdout);
  } catch (error) {
    return [];
  }
}

function mergeLayouts(
  primary: MemoryLayoutModule[],
  fallback: MemoryLayoutModule[],
): MemoryLayoutModule[] {
  if (!primary.length) return fallback;
  if (!fallback.length) return primary;

  const max = Math.max(primary.length, fallback.length);
  const merged: MemoryLayoutModule[] = [];

  for (let i = 0; i < max; i += 1) {
    const a = primary[i];
    const b = fallback[i];

    if (!a && b) {
      merged.push(b);
      continue;
    }

    if (a && !b) {
      merged.push(a);
      continue;
    }

    merged.push({
      size: a?.size || b?.size || 0,
      bank: a?.bank ?? b?.bank ?? null,
      type: a?.type ?? b?.type ?? null,
      clockSpeedMHz: a?.clockSpeedMHz ?? b?.clockSpeedMHz ?? null,
      formFactor: a?.formFactor ?? b?.formFactor ?? null,
      manufacturer: a?.manufacturer ?? b?.manufacturer ?? null,
      partNum: a?.partNum ?? b?.partNum ?? null,
      serialNum: a?.serialNum ?? b?.serialNum ?? null,
      ecc: a?.ecc ?? b?.ecc ?? null,
    });
  }

  return merged;
}

async function getMemoryLayout(): Promise<MemoryLayoutModule[]> {
  const primary = await getMemoryLayoutFromSystemInformation();

  const hasUsablePrimary = primary.some(
    (module) => module.type !== null || module.clockSpeedMHz !== null,
  );

  if (hasUsablePrimary || process.platform !== 'linux') {
    return primary;
  }

  const fallback = await getMemoryLayoutFromDmidecode();
  return mergeLayouts(primary, fallback);
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