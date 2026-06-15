import {Cpu} from "lucide-react";
import type {CpuMetrics, HashString} from '../types.ts'
import {WidgetHeader} from "../../../common-ui/WidgetHeader/WidgetHeader.tsx";
import {getLoadStatus} from "../utils/load.ts"

export const CpuHeader = ({cpu, color}: { cpu: CpuMetrics, color: HashString }) => {
  const processorName = [cpu.cpuManufacturer, cpu.cpuBrand].filter(Boolean).join(" ");
  const processorCores = cpu.cpuManufacturer !== 'AMD' && '(' + cpu.cpuCores + 'C / ' + cpu.cpuThreads + 'T)';

  return <WidgetHeader
    icon={Cpu}
    title="CPU Activity"
    label={`${processorName} ${processorCores}`}
    status={getLoadStatus(cpu.averageCpuUtilization)}
    color={color}/>
}