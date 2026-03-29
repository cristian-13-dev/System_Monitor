import si from 'systeminformation';

export type CpuMetrics = {
  cpuUtilizationPerCore: number[];
  averageCpuUtilization: number;
  averageCpuFrequency: number | null;
  averageCpuTemperature: number | null;
  updatedAt: string;
};

let cpuMetrics: CpuMetrics = {
  cpuUtilizationPerCore: [],
  averageCpuUtilization: 0,
  averageCpuFrequency: null,
  averageCpuTemperature: null,
  updatedAt: new Date().toISOString(),
};

async function refreshCpuMetrics(): Promise<void> {
  try {
    const [currentLoad, cpuSpeed, cpuTemperature] = await Promise.all([
      si.currentLoad(),
      si.cpuCurrentSpeed(),
      si.cpuTemperature(),
    ]);

    cpuMetrics = {
      cpuUtilizationPerCore: currentLoad.cpus.map(cpu => Number(cpu.load.toFixed(2))),
      averageCpuUtilization: Number(currentLoad.currentLoad.toFixed(2)),
      averageCpuFrequency: cpuSpeed.avg ?? null,
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