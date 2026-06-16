import {GaugeChart} from './GaugeChart';
import {GaugeLabel} from './GaugeLabel';
import type {CpuMetrics, HashString} from "../../types.ts";

type Props = {
  cpu: CpuMetrics;
  color: HashString;
};

export function CpuGauge({cpu, color}: Props) {
  const usage = cpu.averageCpuUtilization;

  const gaugeData = [
    {name: "usage", value: usage},
    {name: "rest", value: 100 - usage},
  ];

  return (
    <div className="relative h-50 overflow-hidden">
      <GaugeChart data={gaugeData} color={color}/>
      <GaugeLabel usage={usage}/>
    </div>
  );
}