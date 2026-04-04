import si from 'systeminformation';
import { readFile } from "fs/promises";

export type CpuMetrics = {
  cpuManufacturer?: string | null;
  cpuBrand?: string | null;
  cpuUtilizationPerCore: number[];
  averageCpuUtilization: number;
  totalCpuCores?: number | null;
  physicalCores?: number | null;
  minimumCpuFrequency?: number | null;
  maximumCpuFrequency?: number | null;
  averageCpuFrequency: number | null;
  averageCpuTemperature: number | null;
  updatedAt: string;
};

let cpuMetrics: CpuMetrics = {
  cpuManufacturer: null,
  cpuBrand: null,
  totalCpuCores: null,
  physicalCores: null,
  cpuUtilizationPerCore: [],
  averageCpuUtilization: 0,
  averageCpuFrequency: null,
  minimumCpuFrequency: null,
  maximumCpuFrequency: null,
  averageCpuTemperature: null,
  updatedAt: new Date().toISOString(),
};

async function getCpuMaxFrequency(): Promise<number | null> {
  try {
    const raw = await readFile("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq", "utf-8");
    return parseFloat(raw.trim()) / 1_000_000;
  } catch {
    return null;
  }
}

async function getCpuMinFrequency(): Promise<number | null> {
  try {
    const raw = await readFile("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_min_freq", "utf-8");
    return parseFloat(raw.trim()) / 1_000_000;
  } catch {
    return null;
  }
}

async function refreshCpuMetrics(): Promise<void> {
  try {
    const [cpu, currentLoad, cpuTemperature, maxFreq, minFreq] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.cpuTemperature(),
      getCpuMaxFrequency(),
      getCpuMinFrequency(),
    ]);

    cpuMetrics = {
      cpuManufacturer: cpu.manufacturer,
      cpuBrand: cpu.brand,
      cpuUtilizationPerCore: currentLoad.cpus.map(cpu => Number(cpu.load.toFixed(2))),
      averageCpuUtilization: Math.round(Number(currentLoad.currentLoad.toFixed(2))),
      totalCpuCores: cpu.cores,
      physicalCores: cpu.physicalCores,
      minimumCpuFrequency: minFreq,
      maximumCpuFrequency: maxFreq,
      averageCpuFrequency: cpu.speed ?? null,
      averageCpuTemperature: cpuTemperature.main ?? null,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to refresh CPU metrics:', error);
  }
}

export async function startCpuMetricsPolling(): Promise<void> {
  await refreshCpuMetrics();
  setInterval(() => {
    void refreshCpuMetrics();
  }, 1000);
}

export function getCpuMetrics(): CpuMetrics {
  return cpuMetrics;
}