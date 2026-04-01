import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle?: string;
};

export function StatCard({ icon, label, value, subtitle }: Props) {
  return (
    <div className="rounded-2xl border border-white/7 bg-white/2.5 px-2.5 py-2 sm:px-3 sm:py-2.5">
      <div className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>

        <div className="text-[13px] font-semibold normal-case tracking-normal text-white/94">
          {value}
        </div>
      </div>

      {subtitle ? <div className="mt-1 hidden text-[12px] text-white/42 sm:block">{subtitle}</div> : null}
    </div>
  );
}