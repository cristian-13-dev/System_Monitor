import si from 'systeminformation';
import {formatToMbps} from '../utils/formatToMbps.js';

export type NetworkInterfaceMetrics = {
  networkInterface: string;
  ipAddress: string | null;
  speedMbps: number | null;
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

async function refreshNetworkMetrics(): Promise<void> {
  try {
    const [interfaces, stats, latency] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats(),
      si.inetLatency(),
    ]);

    const filtered = interfaces.filter(
      (i) =>
        i.operstate === 'up' &&
        i.ip4 &&
        i.ip4 !== '127.0.0.1'
    );

    const mapped: NetworkInterfaceMetrics[] = filtered.map((i) => {
      const stat = stats.find((s) => s.iface === i.iface);

      return {
        networkInterface: i.iface,
        ipAddress: i.ip4 ?? null,
        speedMbps: i.speed && i.speed > 0 ? i.speed : null,
        downloadMbps: stat?.rx_sec ? formatToMbps(stat.rx_sec) : 0,
        uploadMbps: stat?.tx_sec ? formatToMbps(stat.tx_sec) : 0,
        latencyMs: latency,
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