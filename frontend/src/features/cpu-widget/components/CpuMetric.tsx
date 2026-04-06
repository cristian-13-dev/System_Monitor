import type {ElementType} from "react";
import {Thermometer, Zap} from "lucide-react";
import type {CpuMetrics} from '../types.ts'
import {COLOR} from "../constants.ts";
import {getTone} from "../utils/tone.ts";
import {fmtTemp, fmtFreq} from "../utils/metric.ts";

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

export const Metrics = ({cpu}: {cpu: CpuMetrics}) => {
  const tempTone = cpu.averageCpuTemperature != null
    ? getTone(cpu.averageCpuTemperature)
    : COLOR.track;

  const freqLabel = (cpu.maximumCpuFrequency != null && cpu.cpuFrequencyPerCore != null)
    ? `${fmtFreq(cpu.cpuFrequencyPerCore.reduce((acc, val) => acc + val, 0) / cpu.cpuFrequencyPerCore.length)} / ${fmtFreq(cpu.maximumCpuFrequency)}`
    : fmtFreq(cpu.averageCpuFrequency);

  return <div className="mb-4 flex items-center">
    <Metric icon={Zap} value={freqLabel} tone={COLOR.warn}/>
    <Metric
      icon={Thermometer}
      value={fmtTemp(cpu.averageCpuTemperature)}
      tone={tempTone}
      align="right"
    />
  </div>
}