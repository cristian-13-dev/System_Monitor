import type { NetworkPoint } from "../types";

export function getMetric(payload: any): NetworkPoint {
  const network = payload?.network?.interfaces?.[0] ?? {};
  const timestamp = payload?.network?.updatedAt ?? payload?.system?.updatedAt ?? Date.now();

  return {
    timestamp: new Date(timestamp).getTime(),
    download: Number(network.downloadMbps ?? 0),
    upload: Number(network.uploadMbps ?? 0),
    delay: Number(network.latencyMs ?? 0),
  };
}