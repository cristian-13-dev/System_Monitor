import si from 'systeminformation';

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

async function refreshCpuMetrics(): Promise<void> {
  try {
    const [cpu, currentLoad, cpuTemperature] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.cpuTemperature(),
    ]);

    cpuMetrics = {
      cpuManufacturer: cpu.manufacturer,
      cpuBrand: cpu.brand,
      cpuUtilizationPerCore: currentLoad.cpus.map(cpu => Number(cpu.load.toFixed(2))),
      averageCpuUtilization: Number(currentLoad.currentLoad.toFixed(2)),
      totalCpuCores: cpu.cores,
      physicalCores: cpu.physicalCores,
      minimumCpuFrequency: cpu.speedMin ?? null,
      maximumCpuFrequency: cpu.speedMax ?? null,
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