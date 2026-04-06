export type CpuMetrics = {
  cpuManufacturer?: string | null;
  cpuBrand?: string | null;
  cpuUtilizationPerCore: number[];
  cpuFrequencyPerCore: number[];
  averageCpuUtilization: number;
  cpuCores?: number | null;
  cpuThreads?: number | null;
  physicalCores?: number | null;
  minimumCpuFrequency?: number | null;
  maximumCpuFrequency?: number | null;
  averageCpuFrequency: number | null;
  averageCpuTemperature: number | null;
  updatedAt: string;
};

export type HashString = `#${string}`;