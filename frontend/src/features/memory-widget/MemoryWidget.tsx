import { useEffect, useState } from "react";
import { MemoryStick, Database, ArrowLeftRight, RefreshCw } from "lucide-react";
import {apiUrl} from "../network-widget/constants.ts";

interface MemoryRaw {
  total: number;
  available: number;
  used: number;
  free: number;
  cached: number;
  pressurePercentage: number;
  availabilityPercentage: number;
}

interface MemorySwap {
  total: number;
  available: number;
  used: number;
  usagePercentage: number;
}

interface MemorySlot {
  size: number;
  bank: string;
  type: string;
  clockSpeedMHz: number;
  formFactor: string;
  manufacturer: string;
  partNum: string;
  serialNum: string;
  ecc: boolean;
}

interface MemorySummary {
  type: string;
  frequencyMHz: number;
}

interface MemoryData {
  raw: MemoryRaw;
  swap: MemorySwap;
  layout: MemorySlot[];
  summary: MemorySummary;
  updatedAt: string;
}

const API_URL = `${apiUrl}/memory`;
const POLL_MS = 2_000;
const BAR_COUNT = 12;

const COLOR = {
  good:  "#3dd886",
  warn:  "#d8a23d",
  hot:   "#d83d3d",
  swap:  "#7c6ef7",
  track: "rgba(255,255,255,0.06)",
} as const;

function getRealUsedPct(raw: MemoryRaw): number {
  return ((raw.total - raw.available) / raw.total) * 100;
}

function getRamAccent(usedPct: number): string {
  if (usedPct < 80) return COLOR.good;
  if (usedPct < 90) return COLOR.warn;
  return COLOR.hot;
}

function getPressureAccent(p: number): string {
  if (p < 70) return COLOR.good;
  if (p < 85) return COLOR.warn;
  return COLOR.hot;
}

function getPressureLabel(p: number): string {
  if (p < 70) return "Balanced";
  if (p < 85) return "Medium";
  return "High";
}

function PressureCard({ pressure, accent }: { pressure: number; accent: string }) {
  const activeBars = Math.round((pressure / 100) * BAR_COUNT);

  return (
    <section className="flex flex-col rounded-xl border border-white/6 bg-white/[0.025] p-4 min-h-[196px]">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/42">
        Pressure index
      </div>
      <div className="mt-1.5 flex items-end gap-1">
        <span className="text-[44px] leading-none font-semibold tracking-[-0.04em] text-white/96">
          {pressure}
        </span>
        <span className="mb-1 text-[18px] leading-none text-white/48">%</span>
      </div>
      <div className="flex-1" />
      <div className="flex gap-[5px] mt-4">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className="h-9 flex-1 rounded-[4px]"
            style={{ backgroundColor: i < activeBars ? accent : COLOR.track }}
          />
        ))}
      </div>
    </section>
  );
}

function RamCard({ raw }: { raw: MemoryRaw }) {
  const realUsedPct = getRealUsedPct(raw);
  const fillHeight  = Math.max(8, realUsedPct);
  const barColor    = getRamAccent(realUsedPct);
  const realUsedGB  = raw.total - raw.available;

  return (
    <section className="flex flex-col rounded-xl border border-white/6 bg-white/[0.025] p-4">
      <div className="flex items-center gap-1.5">
        <Database className="h-3.5 w-3.5 text-white/55" strokeWidth={1.8} />
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">RAM</span>
      </div>
      <div className="mt-3 flex items-end gap-3 flex-1">
        <div className="relative h-[100px] w-9 rounded-[14px] border border-white/6 bg-[#0b1114] overflow-hidden shrink-0">
          <div
            className="absolute inset-x-0 bottom-0 rounded-[10px] transition-all duration-700"
            style={{ height: `${fillHeight}%`, backgroundColor: barColor }}
          />
        </div>
        <div className="flex flex-col justify-end">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">Used</div>
          <div className="mt-0.5 text-[22px] leading-none font-semibold text-white/96">
            {realUsedGB.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-white/50">of {raw.total.toFixed(2)} GB</div>
        </div>
      </div>
      <div className="mt-3 pt-2.5 border-t border-white/6">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-white/50">Available</span>
          <span className="font-medium text-white/92">{raw.available.toFixed(2)} GB</span>
        </div>
      </div>
    </section>
  );
}

function SwapBar({ swap }: { swap: MemorySwap }) {
  const fillPct = Math.max(swap.usagePercentage, swap.used > 0 ? 0.5 : 0);

  return (
    <section className="rounded-xl border border-white/6 bg-white/[0.025] px-4 py-3.5">
      <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-3.5 w-3.5 text-white/50" strokeWidth={1.8} />
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Swap</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: COLOR.swap }} />
            <span className="text-[12px] text-white/50">Used</span>
            <span className="text-[12px] font-medium text-white/88">{swap.used.toFixed(2)} GB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-[2px] border border-white/12 bg-white/8" />
            <span className="text-[12px] text-white/50">Free</span>
            <span className="text-[12px] font-medium text-white/88">{swap.available.toFixed(2)} GB</span>
          </div>
          <span className="text-[12px] text-white/28">{swap.usagePercentage}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-white/6">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${fillPct}%`,
            minWidth: swap.used > 0 ? 4 : 0,
            backgroundColor: COLOR.swap,
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between">
        <span className="text-[10px] text-white/24">0</span>
        <span className="text-[10px] text-white/24">{swap.total.toFixed(2)} GB</span>
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="w-full sm:w-[460px] rounded-xl border border-white/6 bg-zinc-900 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-white/[0.025] shrink-0" />
        <div className="flex-1">
          <div className="h-4 w-36 rounded bg-white/8" />
          <div className="mt-2 h-3 w-28 rounded bg-white/5" />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-[1.5fr_1fr] gap-3">
          <div className="h-[196px] rounded-xl bg-white/[0.025]" />
          <div className="h-[196px] rounded-xl bg-white/[0.025]" />
        </div>
        <div className="h-[72px] rounded-xl bg-white/[0.025]" />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full sm:w-[460px] rounded-xl border border-white/6 bg-zinc-900 text-white px-5 py-8 flex flex-col items-center gap-3">
      <p className="text-sm text-white/50">Failed to load memory data</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} />
        Retry
      </button>
    </div>
  );
}

export function MemoryWidget() {
  const [data, setData]   = useState<MemoryData | null>(null);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: MemoryData = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_MS);
    return () => clearInterval(id);
  }, []);

  if (error) return <ErrorState onRetry={fetchData} />;
  if (!data)  return <Skeleton />;

  const { raw, swap, summary } = data;
  const pressure = raw.pressurePercentage;
  const accent   = getPressureAccent(pressure);
  const label    = getPressureLabel(pressure);

  return (
    <div className="w-full sm:w-[460px] rounded-xl border border-white/6 bg-zinc-900 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl border border-white/6 bg-white/[0.025] flex items-center justify-center shrink-0">
            <MemoryStick className="h-[18px] w-[18px] text-white/80" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-medium text-white/92 leading-none truncate">
              Memory activity
            </h2>
            <p className="mt-1 text-[12px] text-white/38 truncate">
              {summary.type} · {summary.frequencyMHz} MHz · {Math.floor(raw.total)} GB
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
          style={{borderColor: `${accent}28`, background: `${accent}0f`}}
        >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: accent,
          boxShadow: `0 0 6px ${accent}`,
          animation: "pulse 2.5s ease-in-out infinite"
        }}
      />
          <span className="text-[12px] font-medium" style={{color: accent}}>
        {label}
      </span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-[1.5fr_1fr] gap-3">
          <PressureCard pressure={pressure} accent={accent} />
          <RamCard raw={raw} />
        </div>
        <SwapBar swap={swap} />
      </div>
    </div>
  );
}