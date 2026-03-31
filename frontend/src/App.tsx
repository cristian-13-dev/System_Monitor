import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Network,
  RefreshCw,
  Server,
  Wifi,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricsResponse = {
  system: {
    manufacturer: string;
    model: string;
    hostname: string;
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    architecture: string;
    timezone: string;
    uptime: number;
    updatedAt: string;
  };
  cpu: {
    cpuUtilizationPerCore: number[];
    averageCpuUtilization: number;
    averageCpuFrequency: number;
    averageCpuTemperature: number | null;
    updatedAt: string;
  };
  memory: {
    raw: {
      total: number;
      available: number;
      used: number;
      free: number;
      cached: number;
      usagePercentage?: number | null;
      pressurePercentage: number;
      availabilityPercentage: number;
    };
    swap: {
      total: number;
      available: number;
      used: number;
      usagePercentage: number | null;
    };
    updatedAt: string;
  };
  storage: {
    storageModel: string;
    storageType: string;
    totalStorageSize: number;
    usedStorageSize: number;
    availableStorageSize: number;
    updatedAt: string;
  };
  network: {
    interfaces: {
      networkInterface: string;
      ipAddress: string;
      speedMbps: number | null;
      currentThroughputMbps?: number;
      downloadMbps: number;
      uploadMbps: number;
      latencyMs: number;
    }[];
    updatedAt: string;
  };
};

type HistoryPoint = {
  time: string;
  cpu: number;
  availableRam: number;
  pressure: number;
  throughput: number;
};

const API_URL = "http://192.168.18.205:3001/api/metrics";
const HISTORY_LIMIT = 60;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("ro-RO", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function nowLabel() {
  return new Date().toLocaleTimeString("ro-RO", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function getTone(value: number, mode: "load" | "available" = "load") {
  if (mode === "available") {
    if (value <= 10) {
      return {
        label: "critical",
        bg: "bg-[#ff5c5c]",
        text: "text-[#ff5c5c]",
        soft: "bg-[#ffebe9]",
        border: "border-black",
      };
    }
    if (value <= 25) {
      return {
        label: "watch",
        bg: "bg-[#ffd84d]",
        text: "text-[#8a6200]",
        soft: "bg-[#fff6cf]",
        border: "border-black",
      };
    }
    return {
      label: "healthy",
      bg: "bg-[#4ade80]",
      text: "text-[#166534]",
      soft: "bg-[#dcfce7]",
      border: "border-black",
    };
  }

  if (value >= 85) {
    return {
      label: "critical",
      bg: "bg-[#ff5c5c]",
      text: "text-[#ff5c5c]",
      soft: "bg-[#ffebe9]",
      border: "border-black",
    };
  }
  if (value >= 65) {
    return {
      label: "watch",
      bg: "bg-[#ffd84d]",
      text: "text-[#8a6200]",
      soft: "bg-[#fff6cf]",
      border: "border-black",
    };
  }
  return {
    label: "stable",
    bg: "bg-[#5b8cff]",
    text: "text-[#2143a6]",
    soft: "bg-[#e8efff]",
    border: "border-black",
  };
}

function BrutBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border-[3px] border-black bg-white shadow-[8px_8px_0px_#000]",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex border-2 border-black bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white">
      {children}
    </span>
  );
}

function ProgressRail({
                        value,
                        mode = "load",
                      }: {
  value: number;
  mode?: "load" | "available";
}) {
  const tone = getTone(value, mode);

  return (
    <div className="h-4 w-full border-2 border-black bg-white">
      <div
        className={cn("h-full transition-[width] duration-300", tone.bg)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-black/15 py-3 last:border-b-0">
      <span className="text-sm font-medium uppercase tracking-wide text-black/55">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-bold text-black">{value}</span>
    </div>
  );
}

function MetricStrip({
                       title,
                       value,
                       subtitle,
                       meterValue,
                       mode = "load",
                       icon,
                       accentClass,
                       aside,
                     }: {
  title: string;
  value: string;
  subtitle: string;
  meterValue: number;
  mode?: "load" | "available";
  icon: React.ReactNode;
  accentClass: string;
  aside?: React.ReactNode;
}) {
  const tone = getTone(meterValue, mode);

  return (
    <div className="border-b-[3px] border-black last:border-b-0">
      <div className="grid grid-cols-1 gap-5 px-5 py-5 lg:grid-cols-[1.3fr_0.7fr] lg:px-6">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-black", accentClass)}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black uppercase tracking-tight text-black">{title}</h2>
              <span className={cn("text-xs font-black uppercase tracking-[0.18em]", tone.text)}>
                {tone.label}
              </span>
            </div>
            <p className="text-5xl font-black leading-none tracking-tight text-black">{value}</p>
            <p className="mt-2 text-sm font-medium text-black/60">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3">{aside}</div>
      </div>
      <div className="px-5 pb-5 lg:px-6">
        <ProgressRail value={meterValue} mode={mode} />
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border-[3px] border-black bg-white px-3 py-2 shadow-[6px_6px_0px_#000]">
      <p className="mb-2 text-xs font-black uppercase tracking-wide text-black/60">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 border border-black" style={{ backgroundColor: entry.color }} />
            <span className="font-medium text-black/60">{entry.name}</span>
            <span className="font-black text-black">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uptimeDisplay, setUptimeDisplay] = useState(0);
  const inFlightRef = useRef(false);

  const fetchMetrics = useCallback(async (showLoader = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      if (showLoader) setLoading(true);

      const response = await fetch(API_URL, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result: MetricsResponse = await response.json();
      setData(result);
      setUptimeDisplay(result.system.uptime);
      setError(null);

      const primary = result.network.interfaces[0];
      const throughput =
        primary?.currentThroughputMbps ??
        Number(((primary?.downloadMbps ?? 0) + (primary?.uploadMbps ?? 0)).toFixed(2));

      setHistory((prev) => [
        ...prev.slice(-(HISTORY_LIMIT - 1)),
        {
          time: nowLabel(),
          cpu: Number(result.cpu.averageCpuUtilization ?? 0),
          availableRam: Number(result.memory.raw.availabilityPercentage ?? 0),
          pressure: Number(result.memory.raw.pressurePercentage ?? 0),
          throughput,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (showLoader) setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchMetrics(true);
    const id = window.setInterval(() => fetchMetrics(false), 2000);
    return () => window.clearInterval(id);
  }, [fetchMetrics]);

  useEffect(() => {
    if (!data) return;
    setUptimeDisplay(data.system.uptime);

    const id = window.setInterval(() => {
      setUptimeDisplay((prev) => prev + 60);
    }, 60000);

    return () => window.clearInterval(id);
  }, [data?.system.updatedAt]);

  const primaryInterface = data?.network.interfaces[0];

  const throughput = useMemo(() => {
    if (!primaryInterface) return 0;
    return (
      primaryInterface.currentThroughputMbps ??
      Number(((primaryInterface.downloadMbps ?? 0) + (primaryInterface.uploadMbps ?? 0)).toFixed(2))
    );
  }, [primaryInterface]);

  const storageUsage = useMemo(() => {
    if (!data || data.storage.totalStorageSize <= 0) return 0;
    return Number(
      ((data.storage.usedStorageSize / data.storage.totalStorageSize) * 100).toFixed(0)
    );
  }, [data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#f2efe8] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1700px] space-y-4 animate-pulse">
          <div className="h-28 border-[3px] border-black bg-[#fff8dc]" />
          <div className="h-[720px] border-[3px] border-black bg-white" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f2efe8] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl border-[3px] border-black bg-[#ffebe9] p-6 shadow-[8px_8px_0px_#000]">
          <p className="text-base font-bold text-black">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const cpuTone = getTone(data.cpu.averageCpuUtilization);
  const memoryAvailableTone = getTone(data.memory.raw.availabilityPercentage, "available");
  const memoryPressureTone = getTone(data.memory.raw.pressurePercentage, "load");
  const storageTone = getTone(storageUsage);

  return (
    <div className="min-h-screen bg-[#f2efe8] bg-[radial-gradient(circle_at_top_left,#fff7c8_0%,transparent_28%),radial-gradient(circle_at_top_right,#dbeafe_0%,transparent_24%)] px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-[1700px] space-y-5">
        <BrutBox className="overflow-hidden">
          <div className="border-b-[3px] border-black bg-[#ffe16a] px-5 py-5 lg:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center border-[3px] border-black bg-white text-black">
                    <Activity size={22} />
                  </div>
                  <div>
                    <SectionTag>server monitor</SectionTag>
                    <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-black sm:text-5xl">
                      Brutalist runtime board
                    </h1>
                  </div>
                </div>
                <p className="max-w-3xl text-sm font-medium text-black/70">
                  A semi-minimalist neobrutalist dashboard focused on signal clarity, system pressure and live behavior.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[760px]">
                <div className="border-[3px] border-black bg-white px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/55">uptime</p>
                  <p className="mt-2 text-lg font-black text-black">{formatUptime(uptimeDisplay)}</p>
                </div>
                <div className="border-[3px] border-black bg-white px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/55">latency</p>
                  <p className="mt-2 text-lg font-black text-black">{formatNumber(primaryInterface?.latencyMs ?? 0, 1)} ms</p>
                </div>
                <div className="border-[3px] border-black bg-white px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/55">updated</p>
                  <p className="mt-2 text-lg font-black text-black">{formatTime(data.system.updatedAt)}</p>
                </div>
                <button
                  onClick={() => fetchMetrics(false)}
                  className="flex items-center justify-center gap-2 border-[3px] border-black bg-black px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0px_#000]"
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b-[3px] border-black bg-[#ffebe9] px-5 py-3 text-sm font-bold text-black lg:px-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1.12fr_0.88fr]">
            <section className="border-r-[3px] border-black">
              <MetricStrip
                title="CPU"
                value={`${formatNumber(data.cpu.averageCpuUtilization, 1)}%`}
                subtitle={`Average load · ${formatNumber(data.cpu.averageCpuFrequency, 1)} GHz`}
                meterValue={data.cpu.averageCpuUtilization}
                icon={<Cpu size={20} />}
                accentClass="bg-[#dbeafe] text-black"
                aside={
                  <div className="space-y-3 border-[3px] border-black bg-white p-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">status</p>
                      <p className={cn("mt-2 text-sm font-black uppercase", cpuTone.text)}>{cpuTone.label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">temperature</p>
                      <p className="mt-2 text-sm font-black text-black">
                        {data.cpu.averageCpuTemperature !== null ? `${data.cpu.averageCpuTemperature}°C` : "N/A"}
                      </p>
                    </div>
                  </div>
                }
              />

              <MetricStrip
                title="MEMORY"
                value={`${formatNumber(data.memory.raw.pressurePercentage, 0)}%`}
                subtitle={`${formatNumber(data.memory.raw.used, 2)} GB in pressure · ${formatNumber(data.memory.raw.available, 2)} GB still available`}
                meterValue={data.memory.raw.pressurePercentage}
                icon={<MemoryStick size={20} />}
                accentClass="bg-[#dcfce7] text-black"
                aside={
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-[3px] border-black bg-[#fff6cf] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">memory pressure</p>
                      <p className={cn("mt-2 text-2xl font-black", memoryPressureTone.text)}>
                        {data.memory.raw.pressurePercentage}%
                      </p>
                      <p className="mt-1 text-xs font-bold text-black/65">how full RAM effectively feels</p>
                    </div>
                    <div className="border-[3px] border-black bg-[#dcfce7] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">available RAM</p>
                      <p className={cn("mt-2 text-2xl font-black", memoryAvailableTone.text)}>
                        {data.memory.raw.availabilityPercentage}%
                      </p>
                      <p className="mt-1 text-xs font-bold text-black/65">usable headroom before stress</p>
                    </div>
                  </div>
                }
              />

              <MetricStrip
                title="STORAGE"
                value={`${storageUsage}%`}
                subtitle={`${formatNumber(data.storage.usedStorageSize, 2)} GB used of ${formatNumber(data.storage.totalStorageSize, 2)} GB`}
                meterValue={storageUsage}
                icon={<HardDrive size={20} />}
                accentClass="bg-[#f3e8ff] text-black"
                aside={
                  <div className="space-y-3 border-[3px] border-black bg-white p-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">type</p>
                      <p className="mt-2 text-sm font-black text-black">{data.storage.storageType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">status</p>
                      <p className={cn("mt-2 text-sm font-black uppercase", storageTone.text)}>{storageTone.label}</p>
                    </div>
                  </div>
                }
              />

              <MetricStrip
                title="NETWORK"
                value={`${formatNumber(throughput, 2)} Mbps`}
                subtitle="Live throughput across the primary interface"
                meterValue={Math.min(100, throughput)}
                icon={<Wifi size={20} />}
                accentClass="bg-[#ffe4e6] text-black"
                aside={
                  <div className="space-y-3 border-[3px] border-black bg-white p-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">interface</p>
                      <p className="mt-2 text-sm font-black text-black">{primaryInterface?.networkInterface ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/55">link</p>
                      <p className="mt-2 text-sm font-black text-black">
                        {primaryInterface?.speedMbps ? `${formatNumber(primaryInterface.speedMbps, 0)} Mbps` : "N/A"}
                      </p>
                    </div>
                  </div>
                }
              />

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="border-t-[3px] border-r-[0px] border-black p-5 lg:border-r-[3px] lg:p-6">
                  <SectionTag>system</SectionTag>
                  <div className="mt-4 space-y-2 text-sm font-bold text-black">
                    <p><span className="text-black/50">Manufacturer</span> · {data.system.manufacturer}</p>
                    <p><span className="text-black/50">Model</span> · {data.system.model}</p>
                    <p><span className="text-black/50">Release</span> · {data.system.release}</p>
                    <p><span className="text-black/50">Kernel</span> · {data.system.kernel}</p>
                    <p><span className="text-black/50">Timezone</span> · {data.system.timezone}</p>
                  </div>
                </div>

                <div className="border-t-[3px] border-black p-5 lg:p-6">
                  <SectionTag>network route</SectionTag>
                  <div className="mt-4 space-y-2 text-sm font-bold text-black">
                    <p><span className="text-black/50">Interface</span> · {primaryInterface?.networkInterface ?? "N/A"}</p>
                    <p><span className="text-black/50">IP</span> · {primaryInterface?.ipAddress ?? "N/A"}</p>
                    <p><span className="text-black/50">Download</span> · {formatNumber(primaryInterface?.downloadMbps ?? 0, 2)} Mbps</p>
                    <p><span className="text-black/50">Upload</span> · {formatNumber(primaryInterface?.uploadMbps ?? 0, 2)} Mbps</p>
                    <p><span className="text-black/50">Latency</span> · {formatNumber(primaryInterface?.latencyMs ?? 0, 1)} ms</p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="grid grid-cols-1 bg-[#f8f5ee]">
              <div className="border-b-[3px] border-black p-5 lg:p-6">
                <SectionTag>history</SectionTag>
                <div className="mt-5 space-y-5">
                  <BrutBox className="p-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span className="uppercase text-black/60">CPU load</span>
                      <span className="text-black">{formatNumber(data.cpu.averageCpuUtilization, 1)}%</span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#11111122" />
                          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#444" }} minTickGap={24} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#444" }} width={30} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area type="monotone" dataKey="cpu" stroke="#5b8cff" fill="#dbeafe" strokeWidth={3} isAnimationActive={false} name="CPU %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </BrutBox>

                  <BrutBox className="p-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span className="uppercase text-black/60">RAM pressure</span>
                      <span className="text-black">{data.memory.raw.pressurePercentage}%</span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#11111122" />
                          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#444" }} minTickGap={24} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#444" }} width={30} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area type="monotone" dataKey="pressure" stroke="#ff5c5c" fill="#ffebe9" strokeWidth={3} isAnimationActive={false} name="Pressure %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </BrutBox>

                  <BrutBox className="p-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span className="uppercase text-black/60">RAM available</span>
                      <span className="text-black">{data.memory.raw.availabilityPercentage}%</span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#11111122" />
                          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#444" }} minTickGap={24} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#444" }} width={30} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area type="monotone" dataKey="availableRam" stroke="#4ade80" fill="#dcfce7" strokeWidth={3} isAnimationActive={false} name="Available %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </BrutBox>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="border-b-[3px] border-r-[0px] border-black p-5 md:border-r-[3px] md:p-6">
                  <SectionTag>memory ledger</SectionTag>
                  <div className="mt-4 border-[3px] border-black bg-white p-4">
                    <StatLine label="Available" value={`${formatNumber(data.memory.raw.available, 2)} GB`} />
                    <StatLine label="Used" value={`${formatNumber(data.memory.raw.used, 2)} GB`} />
                    <StatLine label="Cached" value={`${formatNumber(data.memory.raw.cached, 2)} GB`} />
                    <StatLine label="Free" value={`${formatNumber(data.memory.raw.free, 2)} GB`} />
                    <StatLine label="Swap used" value={`${formatNumber(data.memory.swap.used, 2)} GB`} />
                  </div>
                </div>

                <div className="border-b-[3px] border-black p-5 md:p-6">
                  <SectionTag>core grid</SectionTag>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {data.cpu.cpuUtilizationPerCore.map((core, index) => {
                      const tone = getTone(core);
                      return (
                        <div key={index} className="border-[3px] border-black bg-white p-2.5">
                          <div className="mb-2 flex items-center justify-between text-xs font-black uppercase">
                            <span className="text-black/45">C{index + 1}</span>
                            <span className={tone.text}>{formatNumber(core, 0)}%</span>
                          </div>
                          <ProgressRail value={core} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </BrutBox>
      </div>
    </div>
  );
}
