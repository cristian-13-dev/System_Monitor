import si from 'systeminformation';

export type SystemMetrics = {
  manufacturer: string | null;
  model: string | null;
  hostname: string | null;
  platform: string | null;
  distro: string | null;
  release: string | null;
  kernel: string | null;
  architecture: string | null;
  uptime: number | null;
  timezone: string | null;
  updatedAt: string;
};

let systemMetrics: SystemMetrics = {
  manufacturer: null,
  model: null,
  hostname: null,
  platform: null,
  distro: null,
  release: null,
  kernel: null,
  architecture: null,
  uptime: null,
  timezone: null,
  updatedAt: new Date().toISOString(),
};

async function refreshSystemMetrics(): Promise<void> {
  try {
    const [system, osInfo] = await Promise.all([
      si.system(),
      si.osInfo(),
    ]);

    const { timezone } = si.time();

    systemMetrics = {
      manufacturer: system.manufacturer,
      model: system.model,
      hostname: osInfo.hostname,
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      kernel: osInfo.kernel,
      architecture: osInfo.arch,
      timezone,
      uptime: si.time().uptime,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to refresh system metrics:', error);
  }
}

function refreshUptime(): void {
  systemMetrics.uptime = Math.round(si.time().uptime);
}

export function startSystemMetricsPolling(): void {
  refreshUptime();

  setInterval(() => {
    refreshUptime();
  }, 1000);
}

export async function initializeSystemMetrics(): Promise<void> {
  await refreshSystemMetrics();
}

export function getSystemMetrics(): SystemMetrics {
  return systemMetrics;
}