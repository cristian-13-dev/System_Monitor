import {useCpuMetrics} from "../hooks/useCpuMetrics.ts";

import {CpuHeader} from "./CpuHeader.tsx";
import {Metrics} from './CpuMetric.tsx'
import {CpuGuage} from './CpuGuage.tsx'
import {getTone} from "../utils/tone.ts";
import {CpuHistoryBar} from "./CpuHistoryBar.tsx";
import {CpuIndividualCore} from "./CpuIndividualCore.tsx";

import "@/App.css"

export default function CpuWidget() {
  const {cpu, history} = useCpuMetrics();

  if (!cpu) {
    return (
      <section className="w-full max-w-130">
        <div
          className="overflow-hidden rounded-[18px] border border-white/6 bg-zinc-900 px-5 py-8 text-center text-sm text-white/40">
          Loading CPU metrics…
        </div>
      </section>
    );
  }

  const loadTone = getTone(cpu.averageCpuUtilization);

  return (
    <section className="w-full max-w-130">
      <div className="overflow-hidden rounded-[18px] border border-white/6 bg-zinc-900 shadow-lg">
        <CpuHeader cpu={cpu} loadTone={loadTone}/>

        <div className="px-2 sm:px-4 pb-2 sm:pb-5 pt-4">
          <Metrics cpu={cpu}/>

          <div className="rounded-xl border border-white/6 px-4 pb-4 pt-4 bg-white/2.5">
            <CpuGuage cpu={cpu} loadTone={loadTone}/>
            <CpuHistoryBar history={history}/>

            <div className="my-4 border-t border-white/6">
              <CpuIndividualCore cpu={cpu}/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}