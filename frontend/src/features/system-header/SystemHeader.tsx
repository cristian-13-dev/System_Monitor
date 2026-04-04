import type {ElementType} from "react";
import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {Cpu, Thermometer, Zap} from "lucide-react";

const utilization = 45.2;
const currentFrequency = 2.71;
const maxFrequency = 4.8;
const temperature = 61;

const cpuManufacturer = "Intel";
const cpuModel = "Core i7-13700H";

const perCoreUsage = [84, 62, 28, 14, 10, 18, 51, 39];

const coreCount = perCoreUsage.length;
const processorName = `${cpuManufacturer} ${cpuModel} · ${coreCount} cores`;

const GOOD = "#3dd886";
const WARN = "#d8a23d";
const HOT = "#d83d3d";
const TRACK = "rgba(255,255,255,0.06)";

function getUsageTone(v: number) {
  if (v >= 75) return HOT;
  if (v >= 45) return WARN;
  return GOOD;
}

function getStatus(v: number) {
  if (v >= 75) return "High";
  if (v >= 45) return "Medium";
  return "Normal";
}

function getCoreTone(v: number) {
  if (v >= 75) return HOT;
  if (v >= 40) return WARN;
  if (v > 0) return GOOD;
  return TRACK;
}

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
  const tone = getUsageTone(utilization);
  const status = getStatus(utilization);

  const gaugeData = [
    {name: "usage", value: utilization},
    {name: "rest", value: 100 - utilization},
  ];

  return (
    <section className="w-full max-w-[520px]">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>

      <div
        className="overflow-hidden rounded-[18px] border border-white/[0.07] bg-zinc-900"
        style={{
          boxShadow: "0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/85 sm:h-11 sm:w-11">
              <Cpu size={21}/>
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-white/92">CPU Activity</h2>
              <p className="mt-0.5 text-xs text-white/46">{processorName}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
            style={{borderColor: `${tone}28`, background: `${tone}0f`}}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: tone,
                boxShadow: `0 0 6px ${tone}`,
                animation: "pulse 2.5s ease-in-out infinite",
              }}
            />
            <span className="text-[12px] font-medium" style={{color: tone}}>
              {status}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {/* Secondary metrics row */}
          <div className="mb-4 flex items-center">
            <Metric
              icon={Zap}
              value={`${currentFrequency.toFixed(2)} / ${maxFrequency.toFixed(2)} GHz`}
              tone={WARN}
            />
            <Metric
              icon={Thermometer}
              value={`${temperature}°C`}
              tone={HOT}
              align="right"
            />
          </div>

          <div
            className="rounded-xl border border-white/[0.06] px-4 pb-4 pt-4"
            style={{background: "rgba(255,255,255,0.02)"}}
          >
            {/* Gauge */}
            <div className="relative overflow-hidden" style={{height: 200}}>
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  width: "124%",
                  height: 250,
                  transform: "translate(-50%, -50%)",
                }}
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
                      <Cell fill={tone}/>
                      <Cell fill={TRACK}/>
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
                <div
                  className="text-[24px] font-semibold leading-none tracking-tight text-white/92"
                  style={{fontVariantNumeric: "tabular-nums"}}
                >
                  {utilization}
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

            <div className="my-4 border-t border-white/[0.06]"/>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/46">
                  Per-core
                </div>

                <div className="flex items-center gap-4">
                  {([["Normal", GOOD], ["Medium", WARN], ["High", HOT]] as const).map(
                    ([label, color]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-2.5 rounded-full"
                          style={{backgroundColor: color}}
                        />
                        <span className="text-[9px] uppercase tracking-[0.18em] text-white/46">
                          {label}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div
                className="grid gap-1.5"
                style={{gridTemplateColumns: `repeat(${coreCount / 2}, minmax(0, 1fr))`}}
              >
                {perCoreUsage.slice(0, coreCount / 2).map((v, i) => (
                  <div
                    key={i}
                    title={`Core ${i + 1}: ${v}%`}
                    className="h-[18px] rounded-[4px]"
                    style={{backgroundColor: getCoreTone(v), opacity: 0.88}}
                  />
                ))}
                {perCoreUsage.slice(coreCount / 2).map((v, i) => (
                  <div
                    key={i + coreCount / 2}
                    title={`Core ${i + coreCount / 2 + 1}: ${v}%`}
                    className="h-[18px] rounded-[4px]"
                    style={{backgroundColor: getCoreTone(v), opacity: 0.88}}
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