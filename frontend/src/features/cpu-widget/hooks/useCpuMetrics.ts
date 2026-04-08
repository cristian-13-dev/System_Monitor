import {useState, useEffect} from "react";
import type {CpuMetrics} from "../types.ts";
import {HISTORY_SIZE} from "../constants.ts";

async function fetchCpuData(): Promise<CpuMetrics> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE ?? "http://localhost:3001"}/api/cpu`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useCpuMetrics() {
  const [cpu, setCpu] = useState<CpuMetrics | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const tick = async () => {
      try {
        const data = await fetchCpuData();
        setError(null);
        setHistory((prev) =>
          [...prev, data.averageCpuUtilization].slice(-HISTORY_SIZE)
        );
        setCpu(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { cpu, history, error };
}