import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";
import {COLOR} from '../constants.ts'
import type {CpuMetrics, HashString} from "../types.ts";

export const CpuGuage = ({cpu, loadTone}: { cpu: CpuMetrics, loadTone: HashString }) => {
  const gaugeData = [
    {name: "usage", value: cpu.averageCpuUtilization},
    {name: "rest", value: 100 - cpu.averageCpuUtilization},
  ];

  return <div className="relative overflow-hidden h-50">
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
          className=" inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium text-white/55 align-middle">%</span>
      </div>
      <div className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-white/46">
        CPU Load
      </div>
    </div>
  </div>
}