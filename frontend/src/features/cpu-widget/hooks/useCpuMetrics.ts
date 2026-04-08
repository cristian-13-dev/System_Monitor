import { useState, useEffect } from "react";
import type { CpuMetrics } from "../types.ts";
import { HISTORY_SIZE } from "../constants.ts";

async function fetchCpuData(): Promise<CpuMetrics> {
  const url = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/cpu`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`CPU request failed\nURL: ${url}\nStatus: ${res.status}\nBody: ${body}`);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`CPU fetch failed\nURL: ${url}\nReason: ${err.message}`);
    }

    throw new Error(`CPU fetch failed\nURL: ${url}\nReason: ${String(err)}`);
  }
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