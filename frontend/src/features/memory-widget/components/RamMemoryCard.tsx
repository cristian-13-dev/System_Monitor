import {Database} from 'lucide-react';

import type {MemoryRaw} from '../types.ts';

import {getRealUsedPct} from '../utils/usage.ts'
import {getRamAccent} from '../utils/status.ts'

interface RamMemoryCardProps {
  raw: MemoryRaw
}

export const RamMemoryCard = ({raw}: RamMemoryCardProps) => {
  const realUsedPct = getRealUsedPct(raw);
  const fillHeight = Math.max(8, realUsedPct);
  const barColor = getRamAccent(realUsedPct);
  const realUsedGB = raw.total - raw.available;

  return (
    <section className="flex flex-col rounded-xl border border-white/6 bg-white/2.5 p-4">
      <div className="flex items-center gap-1.5">
        <Database className="h-3.5 w-3.5 text-white/55" strokeWidth={1.8}/>
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">RAM</span>
      </div>
      <div className="mt-3 flex flex-1 items-end gap-3">
        <div
          className="relative h-25 w-9 shrink-0 overflow-hidden rounded-xl border border-white/6 bg-zinc-900">
          <div
            className="absolute inset-x-0 bottom-0 rounded-[10px] transition-all duration-700"
            style={{height: `${fillHeight}%`, backgroundColor: barColor}}
          />
        </div>
        <div className="flex flex-col justify-end">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">Used</div>
          <div className="mt-0.5 text-[22px] leading-none font-semibold text-white/96">
            {realUsedGB.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-white/50">of {raw.total.toFixed(2)} GB</div>
        </div>
      </div>
      <div className="mt-3 border-t border-white/6 pt-2.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-white/50">Available</span>
          <span className="font-medium text-white/92">{raw.available.toFixed(2)} GB</span>
        </div>
      </div>
    </section>
  );
}