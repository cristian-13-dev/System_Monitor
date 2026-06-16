import {CpuHeader} from "../CpuHeader";
import {Metrics} from "../CpuMetric/CpuMetric";
import {CpuGauge} from "../CpuGauge/CpuGauge";
import {CpuHistoryBar} from "../HystoryBar/CpuHistoryBar";
import {CpuIndividualCore} from "../IndividualCoreSection/CpuIndividualCore";
import type {CpuMetrics, HashString} from "../../types.ts";

type CpuWidgetCardProps = {
  cpu: CpuMetrics;
  history: number[];
  color: HashString;
};

export function CpuWidgetCard({cpu, history, color}: CpuWidgetCardProps) {
  return (
    <section className="w-full max-w-130">
      <div className="overflow-hidden rounded-[18px] border border-white/6 bg-zinc-900 shadow-lg">
        <CpuHeader cpu={cpu} color={color}/>
        <div className="px-2 pt-4 pb-2 sm:px-4 sm:pb-5">
          <Metrics cpu={cpu}/>
          <div className="rounded-xl border border-white/6 bg-white/2.5 px-4 pb-4 pt-4">
            <CpuGauge cpu={cpu} color={color}/>
            <CpuHistoryBar history={history}/>
            <div className="my-4 border-t border-white/6"/>
            <CpuIndividualCore cpu={cpu}/>
          </div>
        </div>
      </div>
    </section>
  );
}