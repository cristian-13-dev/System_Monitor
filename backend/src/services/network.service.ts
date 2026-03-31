import si from 'systeminformation';
import { formatToMbps } from '../utils/formatToMbps.js';

export type NetworkInterfaceMetrics = {
  networkInterface: string;
  ipAddress: string | null;
  speedMbps: number | null;
  currentThroughputMbps: number;
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number | null;
};

export type NetworkMetrics = {
  interfaces: NetworkInterfaceMetrics[];
  updatedAt: string;
};

let networkMetrics: NetworkMetrics = {
  interfaces: [],
  updatedAt: new Date().toISOString(),
};

function normalizeInterfaceSpeed(speed: number | null | undefined): number | null {
  if (!speed || speed <= 0) return null;

  // pentru dashboard-ul tău, orice peste 1000 pe setup-ul tău e suspect
  if (speed > 1000) return null;

  return Number(speed.toFixed(2));
}

async function refreshNetworkMetrics(): Promise<void> {
  try {
    const [interfaces, stats, latency] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats(),
      si.inetLatency(),
    ]);

    const filtered = interfaces.filter(
      (i) => i.operstate === 'up' && i.ip4 && i.ip4 !== '127.0.0.1'
    );

    const mapped: NetworkInterfaceMetrics[] = filtered.map((i) => {
      const stat = stats.find((s) => s.iface === i.iface);

      const downloadMbps = stat?.rx_sec ? formatToMbps(stat.rx_sec) : 0;
      const uploadMbps = stat?.tx_sec ? formatToMbps(stat.tx_sec) : 0;

      return {
        networkInterface: i.iface,
        ipAddress: i.ip4 ?? null,
        speedMbps: normalizeInterfaceSpeed(i.speed),
        currentThroughputMbps: Number((downloadMbps + uploadMbps).toFixed(2)),
        downloadMbps,
        uploadMbps,
        latencyMs: Number.isFinite(latency) ? Number(latency.toFixed(2)) : null,
      };
    });

    networkMetrics = {
      interfaces: mapped,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to refresh network metrics:', error);
  }
}

export async function startNetworkMetricsPolling(): Promise<void> {
  await refreshNetworkMetrics();

  setInterval(() => {
    void refreshNetworkMetrics();
  }, 1000);
}

export function getNetworkMetrics(): NetworkMetrics {
  return networkMetrics;
}