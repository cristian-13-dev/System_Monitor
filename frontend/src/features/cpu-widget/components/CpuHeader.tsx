import {Cpu} from "lucide-react";
import {getLoadStatus} from "../utils/load.ts";
import type {CpuMetrics, HashString} from '../types.ts'

export const CpuHeader = ({cpu, loadTone}: Readonly<{ cpu: CpuMetrics, loadTone: HashString }>) => {
  const processorName = [cpu.cpuManufacturer, cpu.cpuBrand].filter(Boolean).join(" ");

  return <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5 sm:py-4">
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/85">
        <Cpu size={21}/>
      </div>
      <div>
        <h2 className="text-[15px] font-medium text-white/92">CPU Activity</h2>
        <p
          className="mt-0.5 text-xs text-white/46">{processorName} {cpu.cpuManufacturer !== 'AMD' && '(' + cpu.cpuCores + 'C / ' + cpu.cpuThreads + 'T)'}</p>
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
}