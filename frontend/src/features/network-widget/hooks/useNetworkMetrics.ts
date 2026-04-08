import { useEffect, useState } from "react";
import { MAX_POINTS, POLLING_INTERVAL_MS } from "../constants";
import { getMetric } from "../utils/metric";
import type { NetworkPoint } from "../types";
import {apiUrl} from "../constants";

export function useNetworkMetrics() {
  const [points, setPoints] = useState<NetworkPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${apiUrl}/network`);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const payload = await response.json();
        const metric = getMetric(payload);

        if (!mounted) return;

        setPoints((prev) => [...prev, metric].slice(-MAX_POINTS));
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      }
    };

    fetchMetrics();
    const interval = window.setInterval(fetchMetrics, POLLING_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return { points, error };
}