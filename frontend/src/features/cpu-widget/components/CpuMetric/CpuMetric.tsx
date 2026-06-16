import {Thermometer, Zap} from "lucide-react";
import type {CpuMetrics} from '../../types.ts'
import {COLOR} from "../../constants.ts";
import {getTone} from "../../utils/tone.ts";
import {fmtFreq, fmtTemp} from "../../utils/metric.ts";
import {Metric} from "./Metric";

export const Metrics = ({cpu}: { cpu: CpuMetrics }) => {
  const tempColor = cpu.averageCpuTemperature != null
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
      tone={tempColor}
      align="right"
    />
  </div>
}