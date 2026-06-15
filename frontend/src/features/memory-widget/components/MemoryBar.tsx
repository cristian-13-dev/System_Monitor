import type {LucideIcon} from 'lucide-react';

interface MemoryUsageBarProps {
  icon: LucideIcon;
  title: string;
  color: string;
  percentage: number;
  usedLabel: string;
  usedValue: number;
  freeLabel: string;
  freeValue: number;
  total: number;
}

export const MemoryUsageBar = ({
                                 icon: Icon,
                                 title,
                                 color,
                                 percentage,
                                 usedLabel,
                                 usedValue,
                                 freeLabel,
                                 freeValue,
                                 total,
                               }: MemoryUsageBarProps) => {
  const fillPct = Math.max(percentage, usedValue > 0 ? 0.5 : 0);
  const safePercentage = percentage ?? 0;


  return (
    <section className="rounded-xl border border-white/6 bg-white/2.5 px-4 py-2.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-white/50" strokeWidth={1.8}/>
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">{title}</span>
        </div>
        <span className="text-[12px] font-semibold" style={{color}}>
          {safePercentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/6">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${fillPct}%`,
            minWidth: usedValue > 0 ? 4 : 0,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between">
        <span className="text-[10px] text-white/24">0</span>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-white/50">{usedLabel}</span>
            <span className="text-[12px] font-medium text-white/88">{usedValue.toFixed(2)} GB</span>
            <div className="h-1.5 w-1.5 rounded-xs" style={{backgroundColor: color}}/>
          </div>
          <span className="text-[12px] text-white/28">|</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-xs border border-white/12 bg-white/8"/>
            <span className="text-[12px] text-white/50">{freeLabel}</span>
            <span className="text-[12px] font-medium text-white/88">{freeValue.toFixed(2)} GB</span>
          </div>
        </div>
        <span className="text-[10px] text-white/24">{total.toFixed(2)} GB</span>
      </div>
    </section>
  );
};