import "./App.css";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Router,
  Timer,
  Wifi,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
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
      usagePercentage: number;
    };
    swap: {
      total: number;
      available: number;
      used: number;
      usagePercentage: number;
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
      speedMbps: number;
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
  memory: number;
  storage: number;
  download: number;
  upload: number;
  latency: number;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("ro-RO", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatTime24(date: string) {
  return new Date(date).toLocaleTimeString("ro-RO", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatNow24() {
  return new Date().toLocaleTimeString("ro-RO", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  return `${hrs}h ${mins}m`;
}

function getTone(value: number) {
  if (value >= 85) {
    return {
      text: "text-rose-600",
      bg: "bg-rose-500",
      soft: "bg-rose-50",
      badge: "bg-rose-100 text-rose-700",
      label: "High",
    };
  }

  if (value >= 65) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-500",
      soft: "bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      label: "Medium",
    };
  }

  return {
    text: "text-sky-600",
    bg: "bg-sky-500",
    soft: "bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
    label: "Good",
  };
}

const CustomTooltip = memo(function CustomTooltip({
                                                    active,
                                                    payload,
                                                    label,
                                                  }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color ?? "#334155" }}
            />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-semibold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const Surface = memo(function Surface({
                                        children,
                                        className,
                                      }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
});

const SectionTitle = memo(function SectionTitle({
                                                  icon,
                                                  title,
                                                  subtitle,
                                                }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700">{icon}</div>
      <div>
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
});

const StatRow = memo(function StatRow({
                                        label,
                                        value,
                                      }: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] break-all text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
});

const Progress = memo(function Progress({
                                          value,
                                          colorClass,
                                        }: {
  value: number;
  colorClass: string;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", colorClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
});

const HeroMetricCard = memo(function HeroMetricCard({
                                                      title,
                                                      icon,
                                                      value,
                                                      sublabel,
                                                      usage,
                                                    }: {
  title: string;
  icon: React.ReactNode;
  value: string;
  sublabel: string;
  usage: number;
}) {
  const tone = getTone(usage);

  return (
    <Surface className="p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-2xl p-3", tone.soft, tone.text)}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-xs text-slate-400">{sublabel}</p>
          </div>
        </div>

        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", tone.badge)}>
          {tone.label}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{value}</p>
      </div>

      <Progress value={usage} colorClass={tone.bg} />
    </Surface>
  );
});

const ChartCard = memo(function ChartCard({
                                            title,
                                            icon,
                                            children,
                                            className,
                                          }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Surface className={cn("p-4 sm:p-5", className)}>
      <SectionTitle icon={icon} title={title} />
      {children}
    </Surface>
  );
});

export default function App() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const inFlightRef = useRef(false);

  const getSpecs = useCallback(async (showLoader = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      if (showLoader) setLoading(true);

      const response = await fetch("http://192.168.18.205:3001/api/metrics", {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result: MetricsResponse = await response.json();

      setData(result);
      setError(null);

      const storageUsage =
        result.storage.totalStorageSize > 0
          ? Number(
            (
              (result.storage.usedStorageSize / result.storage.totalStorageSize) *
              100
            ).toFixed(2)
          )
          : 0;

      const point: HistoryPoint = {
        time: formatNow24(),
        cpu: Number(result.cpu.averageCpuUtilization ?? 0),
        memory: Number(result.memory.raw.usagePercentage ?? 0),
        storage: storageUsage,
        download: Number(result.network.interfaces[0]?.downloadMbps ?? 0),
        upload: Number(result.network.interfaces[0]?.uploadMbps ?? 0),
        latency: Number(result.network.interfaces[0]?.latencyMs ?? 0),
      };

      setHistory((prev) => [...prev.slice(-39), point]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (showLoader) setLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    getSpecs(true);
    const id = window.setInterval(() => getSpecs(false), 1000);
    return () => window.clearInterval(id);
  }, [getSpecs]);

  const networkPrimary = data?.network.interfaces[0];

  const cpuUsage = useMemo(() => data?.cpu.averageCpuUtilization ?? 0, [data]);
  const memoryUsage = useMemo(() => data?.memory.raw.usagePercentage ?? 0, [data]);
  const storageUsage = useMemo(() => {
    if (!data || data.storage.totalStorageSize === 0) return 0;
    return Number(
      ((data.storage.usedStorageSize / data.storage.totalStorageSize) * 100).toFixed(2)
    );
  }, [data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-6 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <h1 className="text-2xl font-bold text-slate-900">Loading dashboard...</h1>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Surface className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-3xl bg-slate-950 p-3 text-white shadow-sm">
                  <Activity size={22} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    System Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Device health and performance overview
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>{data.system.hostname}</span>
                <span className="text-slate-300">•</span>
                <span>{data.system.platform}</span>
                <span className="text-slate-300">•</span>
                <span>{data.system.architecture}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Last update
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(data.system.updatedAt)}
                </p>
              </div>

              <button
                onClick={() => getSpecs(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </Surface>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <HeroMetricCard
            title="CPU"
            icon={<Cpu size={20} />}
            value={`${cpuUsage.toFixed(1)}%`}
            sublabel="Average utilization"
            usage={cpuUsage}
          />

          <HeroMetricCard
            title="Memory"
            icon={<MemoryStick size={20} />}
            value={`${memoryUsage.toFixed(0)}%`}
            sublabel="RAM consumption"
            usage={memoryUsage}
          />

          <HeroMetricCard
            title="Storage"
            icon={<HardDrive size={20} />}
            value={`${storageUsage.toFixed(0)}%`}
            sublabel="Disk occupancy"
            usage={storageUsage}
          />

          <Surface className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Wifi size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Network</p>
                <p className="text-xs text-slate-400">Latency and transfer</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {networkPrimary?.latencyMs ?? 0} ms
              </p>
              <p className="text-sm text-slate-500">Current latency</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-slate-500">
                  <ArrowDown size={14} />
                  <span className="text-xs">Download</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {networkPrimary?.downloadMbps ?? 0} Mbps
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-slate-500">
                  <ArrowUp size={14} />
                  <span className="text-xs">Upload</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {networkPrimary?.uploadMbps ?? 0} Mbps
                </p>
              </div>
            </div>
          </Surface>
        </section>

        <section className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
          <ChartCard
            title="CPU Trend"
            icon={<Cpu size={18} />}
            className="2xl:col-span-4"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={34} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                    name="CPU %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Memory Trend"
            icon={<MemoryStick size={18} />}
            className="2xl:col-span-4"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={34} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#0284c7"
                    fill="#bae6fd"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    name="Memory %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Network Traffic"
            icon={<Network size={18} />}
            className="2xl:col-span-4"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} width={42} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="download"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                    name="Download"
                  />
                  <Line
                    type="monotone"
                    dataKey="upload"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                    name="Upload"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
          <ChartCard
            title="Storage Trend"
            icon={<HardDrive size={18} />}
            className="2xl:col-span-6"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={34} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="storage"
                    fill="#0f172a"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={false}
                    name="Storage %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Latency Trend"
            icon={<Router size={18} />}
            className="2xl:col-span-6"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} width={34} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                    name="Latency ms"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
          <Surface className="p-4 sm:p-5">
            <SectionTitle
              icon={<Monitor size={18} />}
              title="System Details"
              subtitle="Device and operating system"
            />
            <div className="divide-y divide-slate-100">
              <StatRow label="Manufacturer" value={data.system.manufacturer} />
              <StatRow label="Model" value={data.system.model} />
              <StatRow label="Hostname" value={data.system.hostname} />
              <StatRow label="Platform" value={data.system.platform} />
              <StatRow label="OS" value={data.system.distro} />
              <StatRow label="Release" value={data.system.release} />
              <StatRow label="Kernel" value={data.system.kernel} />
              <StatRow label="Architecture" value={data.system.architecture} />
              <StatRow label="Timezone" value={data.system.timezone} />
              <StatRow
                label="Uptime"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Timer size={14} />
                    {formatUptime(data.system.uptime)}
                  </span>
                }
              />
              <StatRow label="Updated" value={formatTime24(data.system.updatedAt)} />
            </div>
          </Surface>

          <Surface className="p-4 sm:p-5">
            <SectionTitle
              icon={<Cpu size={18} />}
              title="CPU Details"
              subtitle="Per-core live utilization"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.cpu.cpuUtilizationPerCore.map((core, index) => {
                const tone = getTone(core);
                return (
                  <div key={index} className="rounded-2xl bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">Core {index + 1}</span>
                      <span className={tone.text}>{core}%</span>
                    </div>
                    <Progress value={core} colorClass={tone.bg} />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              <StatRow label="Average Frequency" value={`${data.cpu.averageCpuFrequency} GHz`} />
              <StatRow label="Average Temperature" value={data.cpu.averageCpuTemperature ?? "N/A"} />
              <StatRow label="Updated" value={formatTime24(data.cpu.updatedAt)} />
            </div>
          </Surface>

          <Surface className="p-4 sm:p-5">
            <SectionTitle
              icon={<HardDrive size={18} />}
              title="Memory & Storage"
              subtitle="Capacity and availability"
            />

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Memory</h3>
                <div className="divide-y divide-slate-100">
                  <StatRow label="Total RAM" value={`${data.memory.raw.total} GB`} />
                  <StatRow label="Used RAM" value={`${data.memory.raw.used} GB`} />
                  <StatRow label="Available RAM" value={`${data.memory.raw.available} GB`} />
                  <StatRow label="Usage" value={`${data.memory.raw.usagePercentage}%`} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Swap</h3>
                <div className="divide-y divide-slate-100">
                  <StatRow label="Total Swap" value={`${data.memory.swap.total} GB`} />
                  <StatRow label="Used Swap" value={`${data.memory.swap.used} GB`} />
                  <StatRow label="Available Swap" value={`${data.memory.swap.available} GB`} />
                  <StatRow label="Usage" value={`${data.memory.swap.usagePercentage}%`} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Storage</h3>
                <div className="divide-y divide-slate-100">
                  <StatRow label="Type" value={data.storage.storageType} />
                  <StatRow label="Model" value={data.storage.storageModel || "N/A"} />
                  <StatRow label="Total" value={`${data.storage.totalStorageSize} GB`} />
                  <StatRow label="Used" value={`${data.storage.usedStorageSize} GB`} />
                  <StatRow label="Available" value={`${data.storage.availableStorageSize} GB`} />
                  <StatRow label="Updated" value={formatTime24(data.storage.updatedAt)} />
                </div>
              </div>
            </div>
          </Surface>
        </section>
      </div>
    </div>
  );
}