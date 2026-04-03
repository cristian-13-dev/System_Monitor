import type { ElementType } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Cpu, Thermometer, Zap } from "lucide-react";

const utilization = 45.2;
const currentFrequency = 2.71;
const maxFrequency = 4.8;
const temperature = 61;

const cpuManufacturer = "Intel";
const cpuModel = "Core i7-13700H";

const perCoreUsage = [84, 62, 28, 14, 10, 18, 51, 39];

const coreCount = perCoreUsage.length;
const processorName = `${cpuManufacturer} ${cpuModel} (${coreCount} core CPU)`;

const GOOD = "#3dd886";
const WARN = "#d8a23d";
const HOT = "#d83d3d";
const TRACK = "rgba(255,255,255,0.06)";

function getUsageTone(value: number) {
  if (value >= 75) return HOT;
  if (value >= 45) return WARN;
  return GOOD;
}

function getStatus(value: number) {
  if (value >= 75) return "high";
  if (value >= 45) return "medium";
  return "normal";
}

function getCoreTone(value: number) {
  if (value >= 75) return HOT;
  if (value >= 40) return WARN;
  if (value > 0) return GOOD;
  return TRACK;
}

function HeaderMetric({
                        icon: Icon,
                        label,
                        value,
                        tone,
                      }: {
  icon: ElementType;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0" style={{ color: tone ?? "#a1a1aa" }} />

      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </div>
        <div className="mt-1 whitespace-nowrap text-[14px] font-normal leading-none text-zinc-300">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function SystemHeader() {
  const usageTone = getUsageTone(utilization);
  const status = getStatus(utilization);

  const gaugeData = [
    { name: "usage", value: utilization },
    { name: "rest", value: 100 - utilization },
  ];

  return (
    <section className="w-full max-w-[620px]">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900 shadow-[0_18px_50px_rgba(0,0,0,0.34)]">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <Cpu className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0">
                <h2 className="text-[16px] font-semibold tracking-tight text-white">
                  CPU activity
                </h2>
                <p className="mt-1 truncate text-[13px] text-zinc-400">
                  {processorName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 sm:gap-6">
              <HeaderMetric
                icon={Zap}
                label="Clock"
                value={`${currentFrequency.toFixed(2)} / ${maxFrequency.toFixed(2)} GHz`}
                tone={WARN}
              />
              <HeaderMetric
                icon={Thermometer}
                label="Temp"
                value={`${temperature}°C`}
                tone={HOT}
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.025] px-4 py-4">
            <div className="relative h-[300px] sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={gaugeData}
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    cx="50%"
                    cy="86%"
                    innerRadius="72%"
                    outerRadius="104%"
                    cornerRadius={12}
                    paddingAngle={0}
                    stroke="none"
                  >
                    <Cell fill={usageTone} />
                    <Cell fill={TRACK} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-10">
                <div className="text-[38px] font-semibold leading-none tracking-tight text-white sm:text-[44px]">
                  {utilization}%
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.26em] text-zinc-500">
                  CPU load
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Status
                  </span>
                  <span
                    className="text-[14px] font-medium capitalize"
                    style={{ color: usageTone }}
                  >
                    {status}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    Per-core activity
                  </div>

                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateRows: "repeat(2, minmax(0, 1fr))",
                      gridAutoFlow: "column",
                    }}
                  >
                    {perCoreUsage.map((value, index) => (
                      <div
                        key={index}
                        title={`Core ${index + 1}: ${value}%`}
                        className="h-4 w-4 rounded-[4px] border border-white/10 sm:h-5 sm:w-5"
                        style={{
                          backgroundColor: getCoreTone(value),
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}