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

  useEffect(() => {
    const tick = () =>
      fetchCpuData()
        .then((data) => {
          setHistory((prev) => [...prev, data.averageCpuUtilization].slice(-HISTORY_SIZE));
          setCpu(data);
        })
        .catch(console.error);

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return {cpu, history};
}