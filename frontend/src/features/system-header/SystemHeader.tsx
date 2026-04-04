// SystemHeader.tsx

import { useState, useEffect } from "react";
import type { ElementType } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Cpu, Thermometer, Zap } from "lucide-react";

const COLOR = {
  good: "#3dd886",
  warn: "#d8a23d",
  hot: "#d83d3d",
  track: "rgba(255,255,255,0.06)",
} as const;

const LOAD_WARN = 75;
const LOAD_HOT = 85;
const TEMP_WARN = 75;
const TEMP_HOT = 85;
const HISTORY_SIZE = 20;

function getTone(value: number, warn: number, hot: number): string {
  if (value >= hot) return COLOR.hot;
  if (value >= warn) return COLOR.warn;
  return COLOR.good;
}

function getLoadStatus(v: number): string {
  if (v >= LOAD_HOT) return "High";
  if (v >= LOAD_WARN) return "Medium";
  return "Normal";
}

function fmtFreq(value: number | null | undefined): string {
  if (value == null) return "N/A";
  if (value < 1) return `${(value * 1000).toFixed(0)} MHz`;
  return `${value.toFixed(2)} GHz`;
}

function fmtTemp(value: number | null | undefined): string {
  if (value == null) return "N/A";
  return `${value.toFixed(0)}°C`;
}

type CpuMetrics = {
  cpuManufacturer?: string | null;
  cpuBrand?: string | null;
  cpuUtilizationPerCore: number[];
  cpuFrequencyPerCore: number[];
  averageCpuUtilization: number;
  totalCpuCores?: number | null;
  physicalCores?: number | null;
  minimumCpuFrequency?: number | null;
  maximumCpuFrequency?: number | null;
  averageCpuFrequency: number | null;
  averageCpuTemperature: number | null;
  updatedAt: string;
};

function Metric({
                  icon: Icon,
                  value,
                  tone,
                  align = "left",
                }: {
  icon: ElementType;
  value: string;
  tone?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "ml-auto" : ""}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" style={{color: tone ?? "#52525b"}}/>
      <span className="tabular-nums text-[13px] font-medium text-zinc-300">{value}</span>
    </div>
  );
}

export default function SystemHeader() {
  const [cpu, setCpu] = useState<CpuMetrics | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://100.93.206.41:3001/api/cpu")
        .then((res) => res.json())
        .then((data: CpuMetrics) => {
          setHistory((prev) => [...prev, data.averageCpuUtilization].slice(-HISTORY_SIZE));
          setCpu(data);
        })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!cpu) {
    return (
      <section className="w-full max-w-130">
        <div className="overflow-hidden rounded-[18px] border border-white/6 bg-zinc-900 px-5 py-8 text-center text-sm text-white/40">
          Loading CPU metrics…
        </div>
      </section>
    );
  }

  const processorName = [cpu.cpuManufacturer, cpu.cpuBrand].filter(Boolean).join(" ");
  const loadTone = getTone(cpu.averageCpuUtilization, LOAD_WARN, LOAD_HOT);
  const tempTone = cpu.averageCpuTemperature != null
    ? getTone(cpu.averageCpuTemperature, TEMP_WARN, TEMP_HOT)
    : COLOR.track;

  const freqLabel = (cpu.maximumCpuFrequency != null && cpu.cpuFrequencyPerCore != null)
    ? `${fmtFreq(cpu.cpuFrequencyPerCore.reduce((acc, val) => acc + val, 0) / cpu.cpuFrequencyPerCore.length)} / ${fmtFreq(cpu.maximumCpuFrequency)}`
    : fmtFreq(cpu.averageCpuFrequency);

  const coreCount = cpu.physicalCores ?? cpu.cpuUtilizationPerCore.length;
  const coresPerRow = Math.ceil(coreCount / 2);
  const firstRow = cpu.cpuUtilizationPerCore.slice(0, coresPerRow);
  const secondRow = cpu.cpuUtilizationPerCore.slice(coresPerRow, coreCount);

  const gaugeData = [
    {name: "usage", value: cpu.averageCpuUtilization},
    {name: "rest", value: 100 - cpu.averageCpuUtilization},
  ];

  const paddedHistory = [
    ...Array(HISTORY_SIZE - history.length).fill(null),
    ...history,
  ] as (number | null)[];

  return (
    <section className="w-full max-w-130">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      <div
        className="overflow-hidden rounded-[18px] border border-white/6 bg-zinc-900"
        style={{boxShadow: "0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"}}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/85">
              <Cpu size={21}/>
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-white/92">CPU Activity</h2>
              <p
                className="mt-0.5 text-xs text-white/46">{processorName} {cpu.cpuManufacturer !== 'AMD' && '(' + cpu.totalCpuCores + '-Core Processor)'}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
            style={{borderColor: `${loadTone}28`, background: `${loadTone}0f`}}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: loadTone,
                boxShadow: `0 0 6px ${loadTone}`,
                animation: "pulse 2.5s ease-in-out infinite"
              }}
            />
            <span className="text-[12px] font-medium" style={{color: loadTone}}>
              {getLoadStatus(cpu.averageCpuUtilization)}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 pb-5 pt-4">
          <div className="mb-4 flex items-center">
            <Metric icon={Zap} value={freqLabel} tone={COLOR.warn}/>
            <Metric
              icon={Thermometer}
              value={fmtTemp(cpu.averageCpuTemperature)}
              tone={tempTone}
              align="right"
            />
          </div>

          <div className="rounded-xl border border-white/6 px-4 pb-4 pt-4 bg-white/2.5">
            {/* Gauge */}
            <div className="relative overflow-hidden" style={{height: 200}}>
              <div
                className="absolute left-1/2 top-1/2"
                style={{width: "124%", height: 250, transform: "translate(-50%, -50%)"}}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{top: 0, right: 0, bottom: 0, left: 0}}>
                    <Pie
                      data={gaugeData}
                      dataKey="value"
                      startAngle={180}
                      endAngle={0}
                      cx="50%"
                      cy="71%"
                      innerRadius="72%"
                      outerRadius="96%"
                      cornerRadius={8}
                      paddingAngle={0}
                      stroke="none"
                      animationBegin={100}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      <Cell fill={loadTone}/>
                      <Cell fill={COLOR.track}/>
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
                <div
                  className="text-[24px] font-semibold leading-none tracking-tight text-white/92"
                  style={{fontVariantNumeric: "tabular-nums"}}
                >
                  {cpu.averageCpuUtilization}
                  <span
                    className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium text-white/55 align-middle">
                    %
                  </span>
                </div>
                <div className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-white/46">
                  CPU Load
                </div>
              </div>
            </div>

            {/* ── History bar ── */}
            <div className="mt-3 flex items-center gap-1">
              {paddedHistory.map((v, i) => (
                <div
                  key={i}
                  title={v != null ? `${v}%` : undefined}
                  className="h-3 flex-1 rounded-[3px] transition-colors duration-500"
                  style={{
                    backgroundColor: v != null ? getTone(v, LOAD_WARN, LOAD_HOT) : COLOR.track,
                    opacity: v != null ? 0.85 : 0.3,
                  }}
                />
              ))}
            </div>

            <div className="my-4 border-t border-white/6"/>

            {/* Per-core */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/46">Per-core</div>
                <div className="flex items-center gap-4">
                  {([["Normal", COLOR.good], ["Medium", COLOR.warn], ["High", COLOR.hot]] as const).map(
                    ([label, color]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="h-1.5 w-2.5 rounded-xs" style={{backgroundColor: color}}/>
                        <span className="text-[9px] uppercase tracking-[0.18em] text-white/46">{label}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div
                className="grid gap-1.5"
                style={{gridTemplateColumns: `repeat(${coresPerRow}, minmax(0, 1fr))`}}
              >
                {firstRow.map((v, i) => (
                  <div
                    key={i}
                    title={`Core ${i + 1}: ${v}%`}
                    className="h-4.5 rounded-sm"
                    style={{backgroundColor: getTone(v, LOAD_WARN, LOAD_HOT), opacity: 0.88}}
                  />
                ))}
                {secondRow.map((v, i) => (
                  <div
                    key={i + coresPerRow}
                    title={`Core ${i + coresPerRow + 1}: ${v}%`}
                    className="h-4.5 rounded-sm"
                    style={{backgroundColor: getTone(v, LOAD_WARN, LOAD_HOT), opacity: 0.88}}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}