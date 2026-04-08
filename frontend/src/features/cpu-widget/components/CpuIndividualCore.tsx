import type {CpuMetrics} from "../types.ts";
import {COLOR} from '../constants.ts'
import {getTone} from "../utils/tone.ts";

export const CpuIndividualCore = ({ cpu }: { cpu: CpuMetrics }) => {
  const perCore = cpu.cpuUtilizationPerCore ?? [];
  const coreCount = cpu.physicalCores ?? perCore.length;
  const coresPerRow = Math.ceil(coreCount / 2);
  const firstRow = perCore.slice(0, coresPerRow);
  const secondRow = perCore.slice(coresPerRow, coreCount);

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[9px] uppercase tracking-[0.22em] text-white/46">Per-core</div>
        <div className="flex items-center gap-4">
          {([["Normal", COLOR.good], ["Medium", COLOR.warn], ["High", COLOR.hot]] as const).map(
            ([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="h-1.5 w-2.5 rounded-xs" style={{ backgroundColor: color }} />
                <span className="text-[9px] uppercase tracking-[0.18em] text-white/46">{label}</span>
              </div>
            )
          )}
        </div>
      </div>

      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${coresPerRow || 1}, minmax(0, 1fr))` }}
      >
        {firstRow.map((v, i) => (
          <div
            key={i}
            title={`Core ${i + 1}: ${v}%`}
            className="h-4.5 rounded-sm"
            style={{ backgroundColor: getTone(v), opacity: 0.88 }}
          />
        ))}
        {secondRow.map((v, i) => (
          <div
            key={i + coresPerRow}
            title={`Core ${i + coresPerRow + 1}: ${v}%`}
            className="h-4.5 rounded-sm"
            style={{ backgroundColor: getTone(v), opacity: 0.88 }}
          />
        ))}
      </div>
    </div>
  );
};