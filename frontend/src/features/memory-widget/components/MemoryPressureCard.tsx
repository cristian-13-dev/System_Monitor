import {BAR_COUNT, COLOR} from "../constants.ts";

interface MemoryPressureCardProps {
  pressure: number;
  color: string
}

export const MemoryPressureCard = ({pressure, color}: MemoryPressureCardProps) => {
  const activeBars = Math.round((pressure / 100) * BAR_COUNT);

  return (
    <section className="flex flex-col rounded-xl border border-white/6 bg-white/2.5 p-4 min-h-49">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/42">
        Pressure index
      </div>
      <div className="mt-1.5 flex items-end gap-1">
        <span className="text-[44px] leading-none font-semibold tracking-[-0.04em] text-white/96">
          {pressure}
        </span>
        <span className="mb-1 text-[18px] leading-none text-white/48">%</span>
      </div>
      <div className="flex-1"/>
      <div className="mt-4 flex gap-1.25">
        {Array.from({length: BAR_COUNT}).map((_, i) => (
          <div
            key={i}
            className="h-9 flex-1 rounded-sm"
            style={{backgroundColor: i < activeBars ? color : COLOR.track}}
          />
        ))}
      </div>
    </section>
  );
}