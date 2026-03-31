import "./App.css";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Wifi,
  Monitor,
  Server,
  Microchip,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
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
  download: number;
  upload: number;
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
      border: "border-rose-200",
    };
  }

  if (value >= 65) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-500",
      soft: "bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      label: "Medium",
      border: "border-amber-200",
    };
  }

  return {
    text: "text-sky-600",
    bg: "bg-sky-500",
    soft: "bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
    label: "Good",
    border: "border-sky-200",
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
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
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
        "rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]",
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
                                                  action,
                                                }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">{icon}</div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
        </div>
      </div>
      {action}
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
                                          heightClass = "h-2",
                                        }: {
  value: number;
  colorClass: string;
  heightClass?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-full bg-slate-100", heightClass)}>
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
          <div className={cn("rounded-xl p-3", tone.soft, tone.text)}>{icon}</div>
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
                                            action,
                                          }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <Surface className={cn("p-4 sm:p-5", className)}>
      <SectionTitle icon={icon} title={title} action={action} />
      {children}
    </Surface>
  );
});

export default function App() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uptimeDisplay, setUptimeDisplay] = useState(0);
  const [storageUsageDisplay, setStorageUsageDisplay] = useState(0);

  const inFlightRef = useRef(false);

  const getSpecs = useCallback(async (showLoader = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      if (showLoader) setLoading(true);

      const response = await fetch("http://localhost:3001/api/metrics", {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result: MetricsResponse = await response.json();

      setData(result);
      setError(null);
      setUptimeDisplay(result.system.uptime);

      const storageUsage =
        result.storage.totalStorageSize > 0
          ? Number(
            (
              (result.storage.usedStorageSize / result.storage.totalStorageSize) *
              100
            ).toFixed(2)
          )
          : 0;

      setStorageUsageDisplay(storageUsage);

      const point: HistoryPoint = {
        time: formatNow24(),
        cpu: Number(result.cpu.averageCpuUtilization ?? 0),
        memory: Number(result.memory.raw.usagePercentage ?? 0),
        download: Number(result.network.interfaces[0]?.downloadMbps ?? 0),
        upload: Number(result.network.interfaces[0]?.uploadMbps ?? 0),
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

  useEffect(() => {
    if (!data) return;

    setUptimeDisplay(data.system.uptime);

    const id = window.setInterval(() => {
      setUptimeDisplay((prev) => prev + 60);
    }, 60000);

    return () => window.clearInterval(id);
  }, [data?.system.updatedAt, data]);

  useEffect(() => {
    if (!data) return;

    const storageUsage =
      data.storage.totalStorageSize > 0
        ? Number(
          (
            (data.storage.usedStorageSize / data.storage.totalStorageSize) *
            100
          ).toFixed(2)
        )
        : 0;

    setStorageUsageDisplay(storageUsage);

    const id = window.setInterval(() => {
      setStorageUsageDisplay(
        data.storage.totalStorageSize > 0
          ? Number(
            (
              (data.storage.usedStorageSize / data.storage.totalStorageSize) *
              100
            ).toFixed(2)
          )
          : 0
      );
    }, 60000);

    return () => window.clearInterval(id);
  }, [
    data?.storage.updatedAt,
    data?.storage.totalStorageSize,
    data?.storage.usedStorageSize,
    data,
  ]);

  const networkPrimary = data?.network.interfaces[0];

  const cpuUsage = useMemo(() => data?.cpu.averageCpuUtilization ?? 0, [data]);
  const memoryUsage = useMemo(() => data?.memory.raw.usagePercentage ?? 0, [data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-400">
          <div className="mb-6 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <h1 className="text-2xl font-bold text-slate-900">Loading dashboard...</h1>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white"
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
        <div className="mx-auto max-w-4xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-400 space-y-6">
        <Surface className="overflow-hidden">
          <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-sm">
                    <Activity size={22} />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      System Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Device health and live performance overview
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
                  <span className="text-slate-300">•</span>
                  <span>{data.system.distro}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Last update
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(data.system.updatedAt)}
                  </p>
                </div>

                <button
                  onClick={() => getSpecs(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Monitor size={14} />
                System
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Manufacturer:</span>{" "}
                {data.system.manufacturer}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Model:</span> {data.system.model}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Release:</span>{" "}
                {data.system.release}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Server size={14} />
                OS / Kernel
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">OS:</span> {data.system.distro}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Kernel:</span>{" "}
                {data.system.kernel}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Timezone:</span>{" "}
                {data.system.timezone}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Microchip size={14} />
                Runtime
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Hostname:</span>{" "}
                {data.system.hostname}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Uptime:</span>{" "}
                {formatUptime(uptimeDisplay)}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Updated:</span>{" "}
                {formatTime24(data.system.updatedAt)}
              </p>
            </div>
          </div>
        </Surface>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
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
            value={`${storageUsageDisplay.toFixed(0)}%`}
            sublabel="Disk occupancy"
            usage={storageUsageDisplay}
          />

          <Surface className="relative p-4 sm:p-5">
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                {networkPrimary?.latencyMs ?? 0} ms
              </span>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <Wifi size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Network</p>
                <p className="text-xs text-slate-400">Transfer and interface status</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {networkPrimary?.speedMbps ?? 0} Mbps
              </p>
              <p className="text-sm text-slate-500">Interface speed</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-slate-500">
                  <ArrowDown size={14} />
                  <span className="text-xs">Download</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {networkPrimary?.downloadMbps ?? 0} Mbps
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
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
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={34} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#0f172a"
                    fill="#cbd5e1"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    name="CPU %"
                  />
                </AreaChart>
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
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={24} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} width={42} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="download"
                    stroke="#0f172a"
                    fill="#cbd5e1"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    name="Download"
                  />
                  <Area
                    type="monotone"
                    dataKey="upload"
                    stroke="#0ea5e9"
                    fill="#bae6fd"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    name="Upload"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
          <Surface className="p-4 sm:p-5 2xl:col-span-6">
            <SectionTitle
              icon={<Cpu size={18} />}
              title="CPU Details"
              subtitle="Compact per-core live utilization"
            />

            <div className="mt-4 divide-y divide-slate-100">
              <StatRow label="Average Frequency" value={`${data.cpu.averageCpuFrequency} GHz`} />
              <StatRow
                label="Average Temperature"
                value={
                  data.cpu.averageCpuTemperature !== null
                    ? `${data.cpu.averageCpuTemperature}°C`
                    : "N/A"
                }
              />
              <StatRow label="Updated" value={formatTime24(data.cpu.updatedAt)} />
            </div>
          </Surface>

          <Surface className="p-4 sm:p-5 2xl:col-span-3">
            <SectionTitle
              icon={<MemoryStick size={18} />}
              title="Memory"
              subtitle="RAM and swap utilization"
            />

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">RAM</h3>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      getTone(data.memory.raw.usagePercentage).badge
                    )}
                  >
                    {getTone(data.memory.raw.usagePercentage).label}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-3xl font-bold tracking-tight text-slate-950">
                    {data.memory.raw.usagePercentage}%
                  </p>
                  <p className="text-sm text-slate-500">Current memory usage</p>
                </div>

                <Progress
                  value={data.memory.raw.usagePercentage}
                  colorClass={getTone(data.memory.raw.usagePercentage).bg}
                />

                <div className="mt-4 divide-y divide-slate-100">
                  <StatRow label="Total RAM" value={`${data.memory.raw.total} GB`} />
                  <StatRow label="Used RAM" value={`${data.memory.raw.used} GB`} />
                  <StatRow label="Available RAM" value={`${data.memory.raw.available} GB`} />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Swap</h3>
                <div className="divide-y divide-slate-100">
                  <StatRow label="Total Swap" value={`${data.memory.swap.total} GB`} />
                  <StatRow label="Used Swap" value={`${data.memory.swap.used} GB`} />
                  <StatRow label="Available Swap" value={`${data.memory.swap.available} GB`} />
                  <StatRow label="Usage" value={`${data.memory.swap.usagePercentage}%`} />
                  <StatRow label="Updated" value={formatTime24(data.memory.updatedAt)} />
                </div>
              </div>
            </div>
          </Surface>

          <Surface className="p-4 sm:p-5 2xl:col-span-3">
            <SectionTitle
              icon={<HardDrive size={18} />}
              title="Storage"
              subtitle="Disk capacity and availability"
            />

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {data.storage.storageType || "Storage"}
                </h3>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    getTone(storageUsageDisplay).badge
                  )}
                >
                  {getTone(storageUsageDisplay).label}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-3xl font-bold tracking-tight text-slate-950">
                  {storageUsageDisplay.toFixed(0)}%
                </p>
                <p className="text-sm text-slate-500">Current disk usage</p>
              </div>

              <Progress
                value={storageUsageDisplay}
                colorClass={getTone(storageUsageDisplay).bg}
                heightClass="h-3"
              />

              <div className="mt-4 divide-y divide-slate-100">
                <StatRow label="Type" value={data.storage.storageType} />
                <StatRow label="Model" value={data.storage.storageModel || "N/A"} />
                <StatRow label="Total" value={`${data.storage.totalStorageSize} GB`} />
                <StatRow label="Used" value={`${data.storage.usedStorageSize} GB`} />
                <StatRow label="Available" value={`${data.storage.availableStorageSize} GB`} />
                <StatRow label="Updated" value={formatTime24(data.storage.updatedAt)} />
              </div>
            </div>
          </Surface>
        </section>
      </div>
    </div>
  );
}